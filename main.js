const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const { createObjectCsvWriter } = require('csv-writer');

const app = express();
const port = 3000;

// Ensure the data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// Ensure the student_performance.csv file exists in the same directory as server.js
const studentFilePath = path.join(__dirname, 'student_performance.csv');
if (!fs.existsSync(studentFilePath)) {
    const csvWriter = createObjectCsvWriter({
        path: studentFilePath,
        header: [
            { id: 'Class', title: 'Class' },
            { id: 'Student', title: 'Student' },
            { id: 'SuccessRate', title: 'SuccessRate' },
            { id: 'ExamSubject', title: 'ExamSubject' },
            { id: 'ExamScore', title: 'ExamScore' },
            { id: 'id', title: 'id' },
            { id: 'username', title: 'username' },
            { id: 'timespent', title: 'timespent' },
            { id: 'warns', title: 'warns' },
            { id: 'search_out', title: 'search_out' },
            { id: 'blocks', title: 'blocks' }
        ]
    });
    csvWriter.writeRecords([]); // Write an empty file with headers
}

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, dataDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

// Function to merge rows based on id
function mergeData(studentData, idData) {
    const idMap = idData.reduce((map, row) => {
        map[row.id] = row;
        return map;
    }, {});

    return studentData.map(row => {
        if (idMap[row.id]) {
            return { ...row, ...idMap[row.id] };
        }
        return row;
    });
}

// Function to retry file operations
function retryOperation(operation, delay, retries) {
    return new Promise((resolve, reject) => {
        function attempt() {
            operation()
                .then(resolve)
                .catch((err) => {
                    if (retries === 0) {
                        reject(err);
                    } else {
                        setTimeout(() => {
                            retries--;
                            attempt();
                        }, delay);
                    }
                });
        }
        attempt();
    });
}

// Endpoint to handle CSV file upload
app.post('/upload', upload.single('csvfile'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const idFilePath = path.join(dataDir, req.file.originalname);
    const idData = [];
    const studentData = [];

    retryOperation(() => {
        return new Promise((resolve, reject) => {
            fs.createReadStream(idFilePath)
                .pipe(csv())
                .on('data', (data) => idData.push(data))
                .on('end', resolve)
                .on('error', reject);
        });
    }, 10000, 5) // 10 seconds delay, 5 retries
    .then(() => {
        return retryOperation(() => {
            return new Promise((resolve, reject) => {
                fs.createReadStream(studentFilePath)
                    .pipe(csv())
                    .on('data', (data) => studentData.push(data))
                    .on('end', resolve)
                    .on('error', reject);
            });
        }, 10000, 5); // 10 seconds delay, 5 retries
    })
    .then(() => {
        const mergedData = mergeData(studentData, idData);

        const csvWriter = createObjectCsvWriter({
            path: studentFilePath,
            header: Object.keys(mergedData[0]).map(key => ({ id: key, title: key }))
        });

        return csvWriter.writeRecords(mergedData);
    })
    .then(() => {
        res.send('File uploaded and merged successfully.');
    })
    .catch((err) => {
        console.error('Error processing files:', err);
        res.status(500).send('Error processing files.');
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});