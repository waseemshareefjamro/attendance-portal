// Hardcoded for reliability during debugging
const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://attendance-portal-uvqj.vercel.app';

const getHeaders = () => ({
    'Content-Type': 'application/json',
});

const handleResponse = async (response) => {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'API Error');
    }
    return data;
};

export const api = {
    get: async (endpoint) => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'GET',
            headers: getHeaders(),
            credentials: 'include' // Important for CORS with credentials
        });
        return handleResponse(response);
    },

    post: async (endpoint, body) => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(body),
            credentials: 'include'
        });
        return handleResponse(response);
    },

    put: async (endpoint, body) => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(body),
            credentials: 'include'
        });
        return handleResponse(response);
    },

    delete: async (endpoint) => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
            headers: getHeaders(),
            credentials: 'include'
        });
        return handleResponse(response);
    }
};
