import * as XLSX from 'xlsx';

/**
 * Parses an Excel file and returns the data as JSON.
 * @param {File} file - The uploaded Excel file.
 * @returns {Promise<any[]>} - Array of objects from the first sheet.
 */
export const readExcelFile = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet);
                resolve(jsonData);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = (error) => reject(error);
        reader.readAsBinaryString(file);
    });
};

/**
 * Exports data to an Excel file and triggers download.
 * @param {any[]} data - Array of objects to export.
 * @param {string} fileName - Name of the file (without extension).
 * @param {string} sheetName - Name of the sheet.
 */
export const exportToExcel = (data, fileName = 'download', sheetName = 'Sheet1') => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

/**
 * Generates a template for adding students.
 */
export const downloadTemplate = () => {
    const templateData = [
        { StudentID: 'STU001', Name: 'John Doe', Class: 'Grade 10' },
        { StudentID: 'STU002', Name: 'Jane Smith', Class: 'Grade 10' },
    ];
    exportToExcel(templateData, 'student_template', 'Students');
};
