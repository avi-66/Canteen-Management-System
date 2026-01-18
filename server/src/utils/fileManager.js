const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

const readJSON = (fileName) => {
    try {
        const filePath = path.join(DATA_DIR, fileName);
        if (!fs.existsSync(filePath)) {
            // Return empty array if file doesn't exist
            return [];
        }
        const data = fs.readFileSync(filePath, 'utf8');
        if (!data) return [];
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${fileName}:`, error);
        return [];
    }
};

const writeJSON = (fileName, data) => {
    try {
        const filePath = path.join(DATA_DIR, fileName);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error writing ${fileName}:`, error);
        return false;
    }
};

const appendToJSON = (fileName, item) => {
    try {
        const data = readJSON(fileName);
        data.push(item);
        return writeJSON(fileName, data);
    } catch (error) {
        console.error(`Error appending to ${fileName}:`, error);
        return false;
    }
};

const updateInJSON = (fileName, id, updates) => {
    try {
        const data = readJSON(fileName);
        const index = data.findIndex(item => item.id === id);
        if (index === -1) return null;

        data[index] = { ...data[index], ...updates };
        if (writeJSON(fileName, data)) {
            return data[index];
        }
        return null;
    } catch (error) {
        console.error(`Error updating in ${fileName}:`, error);
        return null;
    }
};

const deleteFromJSON = (fileName, id) => {
    try {
        const data = readJSON(fileName);
        const newData = data.filter(item => item.id !== id);
        if (data.length === newData.length) return false; // Nothing deleted
        return writeJSON(fileName, newData);
    } catch (error) {
        console.error(`Error deleting from ${fileName}:`, error);
        return false;
    }
};

module.exports = { readJSON, writeJSON, appendToJSON, updateInJSON, deleteFromJSON };
