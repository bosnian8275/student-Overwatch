let onOlabs = false;
let timeSpent = 0;
let userId = null;
let username = null;
let blockcount = 0;
let warncount = 0;
let search_out = 0;

// Function to generate CSV content
function generateCSV() {
    const csvHeader = "id,username,timespent,warns,search_out,blocks,\n";
    const csvRows = [
        `${userId},${username},${timeSpent},${warncount},${search_out},${blockcount},`,
    ].join("\n");

    return csvHeader + csvRows;
}

// Function to create a temporary CSV file and upload it
function uploadCSV() {
    if (!userId) {
        console.log("User ID is null, not uploading CSV.");
        return;
    }

    console.log("Generating CSV file...");
    console.log("printing onOlabs", onOlabs);
    console.log("timeSpent:", timeSpent);

    // Generate CSV content
    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { type: "text/csv" });

    // Create FormData and append the CSV file
    const formData = new FormData();
    formData.append("csvfile", blob, userId + ".csv");

    // Send to server
    fetch("http://localhost:3000/upload", {
        method: "POST",
        body: formData
    })
    .then(data => console.log("CSV uploaded successfully:", data))
    .catch(error => console.error("Upload failed:", error));
}

// Run uploadCSV() every 10 seconds
setInterval(uploadCSV, 10000);
uploadCSV();

console.log("senddata.js is running...");

// Listen for messages from background.js and popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.onOlabs !== undefined) {
        onOlabs = message.onOlabs;
        console.log("onOlabs variable updated:", onOlabs);
    }
    if (message.userId !== undefined) {
        userId = message.userId;
        console.log("userId variable updated:", userId);
    }
    if (message.username !== undefined) {
        username = message.username;
        console.log("username variable updated:", username);
        sendResponse({ success: true });
    } else {
        sendResponse({ success: false });
    }
    if (message.blockcount !== undefined) {
        blockcount = message.blockcount;
        console.log("blockcount variable updated:", message.blockcount);
    }
    if (message.warncount !== undefined) {
        warncount = message.warncount;
        console.log("warncount variable updated:", message.warncount);
    }
    if (message.search_out !== undefined) {
        search_out = message.search_out;
        console.log("search_out variable updated:", message.search_out);
    }
});

// Increment timeSpent every second if onOlabs is true
setInterval(() => {
    if (onOlabs) {
        timeSpent++;
        console.log("timeSpent incremented:", timeSpent);
    }
}, 1000);
