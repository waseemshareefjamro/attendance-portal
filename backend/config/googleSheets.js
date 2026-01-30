const { google } = require('googleapis');
const path = require('path');
require('dotenv').config();

// Load Credentials
const KEYFILEPATH = path.join(__dirname, '../google_credentials.json');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

let auth;
if (process.env.GOOGLE_CREDENTIALS) {
    // Load from Environment Variable (Vercel/Production)
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    auth = new google.auth.GoogleAuth({
        credentials,
        scopes: SCOPES,
    });
} else {
    // Load from Local File
    auth = new google.auth.GoogleAuth({
        keyFile: KEYFILEPATH,
        scopes: SCOPES,
    });
}

// Singleton instance
let sheetsService = null;

const getSheetsService = async () => {
    if (!sheetsService) {
        const client = await auth.getClient();
        sheetsService = google.sheets({ version: 'v4', auth: client });
        console.log('Google Sheets API Authenticated');
    }
    return sheetsService;
};

// Spreadsheet ID from Env
// Spreadsheet ID (Hardcoded for Vercel stability)
const SPREADSHEET_ID = '12O8k1C8_0b4KLslo7DvLjS2vt963mEZH1LEbQgrbamc';
// const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

// Helper to get all rows from a sheet
const getSheetRows = async (tabName) => {
    const service = await getSheetsService();
    try {
        const response = await service.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: tabName, // e.g., 'Students' or 'Students!A:Z'
        });
        const rows = response.data.values;
        if (!rows || rows.length === 0) return [];

        // Assume first row is header
        const rawHeaders = rows[0];
        // Normalize headers to lowercase to avoid case-sensitivity issues (e.g. "Name" vs "name")
        const headers = rawHeaders.map(h => h.trim().toLowerCase()); // Trim and lowercase

        const data = rows.slice(1).map(row => {
            const obj = {};
            headers.forEach((header, index) => {
                // Map the value to the lowercase header
                // Note: The original Model code expects specific keys like 'name', 'password', 'studentID' or 'studentid'
                // By lowercasing here, we ensure 'Name' in sheet becomes 'name' in object.
                // WE MUST ENSURE MODELS EXPECT LOWERCASE KEYS OR WE MAP BACK.
                // Assuming Models use standard lowercase/camelCase and Sheet uses Capitalized.

                // MAPPING: 
                // Sheet "Student ID" or "studentID" -> code "studentID" or "studentid"? 
                // Let's standardise to camelCase if possible, or just keep strict lowercase.
                // The safest is to map strictly to the keys the frontend/backend expects.

                // For now, let's keep it simple: lowercase everything. 
                // Models need to read 'name', 'gender', 'password'.
                // If sheet has 'Name', 'Gender', then 'name', 'gender' matches.

                // Special handle for studentID which might be 'Student ID'
                let key = header;
                if (key === 'student id' || key === 'studentid') key = 'studentID';
                if (key === 'class') key = 'classId'; // Mapping commonly mismatched common names

                obj[header] = row[index] || ''; // Store properly with normalized header? 
                // actually, let's map index to normalized key
                obj[key] = row[index] || '';
            });
            return obj;
        });
        return data;
    } catch (error) {
        console.error(`Error reading sheet ${tabName}:`, error.message);
        // If sheet doesn't exist, return empty array (or create it - advanced)
        return [];
    }
};

// Helper to append a row
const appendRow = async (tabName, rowData) => {
    const service = await getSheetsService();

    // First, read headers to ensure order matches
    const metaResponse = await service.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${tabName}!1:1`,
    });

    let headers = metaResponse.data.values ? metaResponse.data.values[0] : [];

    if (headers.length === 0) {
        // Sheet empty? Write headers from keys
        headers = Object.keys(rowData);
        await service.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `${tabName}!A1`,
            valueInputOption: 'RAW',
            resource: { values: [headers] },
        });
    }

    // Map data to header order
    const values = headers.map(header => rowData[header] || '');

    try {
        await service.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: tabName,
            valueInputOption: 'USER_ENTERED',
            resource: { values: [values] },
        });
        return rowData;
    } catch (error) {
        console.error(`Error appending to ${tabName}:`, error.message);
        throw error;
    }
};

// Helper to update a row (Inefficient for large sheets, but fine for prototype)
// Requires a unique key to identify row (e.g. StudentID)
const updateRow = async (tabName, uniqueKeyField, uniqueKeyValue, newRowData) => {
    const service = await getSheetsService();

    // 1. Read all data to find index
    const response = await service.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: tabName,
    });

    const rows = response.data.values;
    if (!rows || rows.length < 2) return null; // No data

    const headers = rows[0];
    const keyIndex = headers.indexOf(uniqueKeyField);

    if (keyIndex === -1) throw new Error(`Key field ${uniqueKeyField} not found in headers`);

    // Find row index (1-based for A1 notation, but array is 0-based. Sheet rows start at 1.)
    // data row 0 is sheet row 2 (if header is row 1)
    const rowIndex = rows.findIndex((row, i) => i > 0 && row[keyIndex] === uniqueKeyValue);

    if (rowIndex === -1) return null; // Not found

    // Merge old data with new data
    const oldRowArray = rows[rowIndex];
    const oldRowObj = {};
    headers.forEach((h, i) => oldRowObj[h] = oldRowArray[i]);

    const mergedData = { ...oldRowObj, ...newRowData };
    const newValues = headers.map(h => mergedData[h]);

    // Update specific row
    const sheetRowNumber = rowIndex + 1; // Array index is 0-based relative to whole response

    await service.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${tabName}!A${sheetRowNumber}`,
        valueInputOption: 'USER_ENTERED',
        resource: { values: [newValues] },
    });

    return mergedData;
};

// Helper to delete a row
const deleteRow = async (tabName, uniqueKeyField, uniqueKeyValue) => {
    // Note: Deleting rows shifts everything up, which can be risky if multiple users edit.
    // Ideally use soft delete (status=deleted). Implementing explicit delete here using detailed API.
    const service = await getSheetsService();

    // Get Sheet ID (number) from tab name
    const sheetMeta = await service.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID
    });
    const sheet = sheetMeta.data.sheets.find(s => s.properties.title === tabName);
    if (!sheet) throw new Error(`Sheet ${tabName} not found`);
    const sheetId = sheet.properties.sheetId;

    // Find row index
    const response = await service.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: tabName,
    });
    const rows = response.data.values;
    const headers = rows[0];
    const keyIndex = headers.indexOf(uniqueKeyField);
    const rowIndex = rows.findIndex((row, i) => i > 0 && row[keyIndex] === uniqueKeyValue);

    if (rowIndex === -1) return false;

    // BatchUpdate to delete dimension
    await service.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        resource: {
            requests: [{
                deleteDimension: {
                    range: {
                        sheetId: sheetId,
                        dimension: "ROWS",
                        startIndex: rowIndex, // 0-based inclusive
                        endIndex: rowIndex + 1 // exclusive
                    }
                }
            }]
        }
    });

    return true;
};

// Helper to delete multiple rows matching a filter
const deleteMatchingRows = async (tabName, filterFn) => {
    const service = await getSheetsService();

    const sheetMeta = await service.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const sheet = sheetMeta.data.sheets.find(s => s.properties.title === tabName);
    if (!sheet) return 0;
    const sheetId = sheet.properties.sheetId;

    const response = await service.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: tabName,
    });

    const rows = response.data.values;
    if (!rows || rows.length < 2) return 0;

    const headers = rows[0];

    // Find indices to delete
    // We map rows to objects first to pass to filterFn
    const rowsToDelete = []; // Array of integer indices

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const obj = {};
        headers.forEach((h, index) => obj[h] = row[index]);

        if (filterFn(obj)) {
            rowsToDelete.push(i);
        }
    }

    if (rowsToDelete.length === 0) return 0;

    // Sort descending to delete from bottom up (avoids index shifting problems)
    rowsToDelete.sort((a, b) => b - a);

    const requests = rowsToDelete.map(rowIndex => ({
        deleteDimension: {
            range: {
                sheetId: sheetId,
                dimension: "ROWS",
                startIndex: rowIndex,
                endIndex: rowIndex + 1
            }
        }
    }));

    await service.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        resource: { requests }
    });

    return rowsToDelete.length;
};

// Helper to update multiple rows matching a filter
const updateMatchingRows = async (tabName, filterFn, updateObj) => {
    const service = await getSheetsService();

    // Read all
    const response = await service.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: tabName,
    });

    const rows = response.data.values;
    if (!rows || rows.length < 2) return 0;

    const headers = rows[0];
    const updates = [];

    // Identify rows
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const obj = {};
        headers.forEach((h, index) => obj[h] = row[index]);

        if (filterFn(obj)) {
            // Apply updates
            const newItem = { ...obj, ...updateObj };
            const newValues = headers.map(h => newItem[h]);

            updates.push({
                range: `${tabName}!A${i + 1}`, // 1-based index
                values: [newValues]
            });
        }
    }

    if (updates.length === 0) return 0;

    // Process in batch if possible or loop
    // Google Sheets API values.batchUpdate takes data array
    const data = updates.map(u => ({
        range: u.range,
        values: u.values
    }));

    await service.spreadsheets.values.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        resource: {
            valueInputOption: 'USER_ENTERED',
            data: data
        }
    });

    return updates.length;
};

module.exports = {
    getSheetRows,
    appendRow,
    updateRow,
    deleteRow,
    deleteMatchingRows,
    updateMatchingRows
};
