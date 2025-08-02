document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('save').addEventListener('click', () => {
        const username = document.getElementById('username').value;
        const statusMessage = document.getElementById('status-message');

        if (username) {
            chrome.storage.local.get('userId', (result) => {
                let userId = result.userId;
                if (!userId) {
                    userId = 'id-' + Math.random().toString(36).substr(2, 16);
                }

                chrome.storage.local.set({ username: username, userId: userId }, () => {
                    if (chrome.runtime.lastError) {
                        console.error("Error storing username and userId:", chrome.runtime.lastError);
                        statusMessage.textContent = "Error storing username and userId.";
                        statusMessage.style.color = "red";
                    } else {
                        console.log("Username and userId stored:", username, userId);
                        chrome.runtime.sendMessage({ username: username, userId: userId }, (response) => {
                            if (response && response.success) {
                                statusMessage.textContent = "Username and userId saved successfully.";
                                statusMessage.style.color = "green";
                                setTimeout(() => {  
                                    window.close(); // Close the popup after a short delay
                                }, 1000);
                            } else {
                                statusMessage.textContent = "Failed to save username and userId.";
                                statusMessage.style.color = "red";
                            }
                        });
                    }
                });
            });
        } else {
            console.error("Username is empty");
            statusMessage.textContent = "Username cannot be empty.";
            statusMessage.style.color = "red";
        }
    });
});