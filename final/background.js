let userId = null;
banned = ["https://chatgpt.com/","https://gemini.google.com","https://www.phind.com/","https://www.blackbox.ai"];
warns=["https://www.youtube.com/","https://www.facebook.com/","https://www.instagram.com/","https://www.twitter.com/","https://www.linkedin.com/","https://www.whatsapp.com/","https://www.snapchat.com/","https://www.tiktok.com/","https://www.pinterest.com/","https://www.reddit.com/","https://www.quora.com/","https://www.discord.com/","https://www.telegram.com/","https://www.skype.com/","https://www.tumblr.com/","https://www.flickr.com/","https://www.viber.com/","https://www.wechat.com/","https://www.kik.com/","https://www.line.com/","https://www.hike.com/","https://www.slack.com/","https://www.zoom.com/","https://www.microsoftteams.com/","https://www.googlemeet.com/","https://www.webex.com/","https://www.jiochat.com/","https://www.zoho.com/","https://www.zendesk.com/","https://www.salesforce.com/","https://www.intercom.com/","https://www.zopim.com/","https://www.livechat.com/","https://www.olark.com/","https://www.tawk.com/","https://www.drift.com/","https://www.crisp.com/","https://www.helpscout.com/","https://www.freshdesk.com/","https://www.zendesk.com/","https://www.zoho.com/","https://www.salesforce.com/","https://www.intercom.com/","https://www.zopim.com/","https://www.livechat.com/","https://www.olark.com/","https://www.tawk.com/","https://www.drift.com/","https://www.crisp.com/","https://www.helpscout.com/","https://www.freshdesk.com/","https://www.zendesk.com/","https://www.zoho.com/","https://www.salesforce.com/","https://www.intercom.com/","https://www.zopim.com/","https://www.livechat.com/","https://www.olark.com/","https://www.tawk.com/","https://www.drift.com/","https://www.crisp.com/","https://www.helpscout.com/"];
blockcount = 0;
search_out = 0;
warncount = 0;

// Function to create an offscreen document if not already open
async function createOffscreenDocument() {
    let existingContexts = await chrome.runtime.getContexts({ contextTypes: ["OFFSCREEN_DOCUMENT"] });

    if (existingContexts.length === 0) {
        console.log("Creating offscreen document...");
        await chrome.offscreen.createDocument({
            url: "offscreen.html",
            reasons: ["BLOBS"], // Required for handling file-like objects
            justification: "Keep senddata.js running globally"
        });

        console.log("Offscreen document created successfully.");
    } else {
        console.log("Offscreen document already exists, skipping creation.");
    }
}

// Listen for extension startup or reload
chrome.runtime.onStartup.addListener(() => {
    console.log("Extension started, ensuring offscreen document is running...");
    createOffscreenDocument();

});

// Also check when the service worker starts
createOffscreenDocument();

// Add chrome.tabs.onUpdated listener
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith("https://www.olabs.edu.in/")) {
        console.log(tabId, "On olabs");
        chrome.runtime.sendMessage({ onOlabs: true });
    } else if (changeInfo.status === 'complete') {
        console.log("Not on olabs:", tab.url);
        search_out++;
        chrome.runtime.sendMessage({ search_out: search_out });
        chrome.runtime.sendMessage({ onOlabs: false });
        if (changeInfo.status === 'complete' && banned.some(url => tab.url.startsWith(url))) {
            blockcount++;
            console.log("Blocked", blockcount, "banned sites");
            chrome.tabs.remove(tabId);
            chrome.runtime.sendMessage({ blockcount: blockcount });
        }
        if (changeInfo.status === 'complete' && warns.some(url => tab.url.startsWith(url))) {
            warncount++;
            console.log("warned", warncount, "warns sites");
            // Create a new window with the warning message
            chrome.windows.create({
                url: "warning.html",
                type: "popup",
                width: 300,
                height: 200,
                focused: true
            });
            chrome.runtime.sendMessage({ warncount: warncount });
        }
    }
});

// Add chrome.tabs.onActivated listener
chrome.tabs.onActivated.addListener(activeInfo => {
    chrome.tabs.get(activeInfo.tabId, tab => {
        if (tab.url && tab.url.startsWith("https://www.olabs.edu.in/")) {
            console.log(activeInfo.tabId, "On olabs");
            chrome.runtime.sendMessage({ onOlabs: true });
        } else {
            console.log("Not on olabs");
            chrome.runtime.sendMessage({ onOlabs: false });
        }
    });
});

// Add chrome.windows.onFocusChanged listener
chrome.windows.onFocusChanged.addListener(windowId => {
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
        console.log("Chrome window is not active");
        chrome.runtime.sendMessage({ onOlabs: false });
    } else {
        chrome.windows.get(windowId, window => {
            if (window.focused) {
                chrome.tabs.query({ active: true, windowId: windowId }, tabs => {
                    if (tabs.length > 0 && tabs[0].url && tabs[0].url.startsWith("https://www.olabs.edu.in/")) {
                        console.log(tabs[0].id, "On olabs");
                        chrome.runtime.sendMessage({ onOlabs: true });
                    } else {
                        console.log("Not on olabs");
                        chrome.runtime.sendMessage({ onOlabs: false });
                    }
                });
            } else {
                console.log("Chrome window is not focused");
                chrome.runtime.sendMessage({ onOlabs: false });
            }
        });
    }
});



