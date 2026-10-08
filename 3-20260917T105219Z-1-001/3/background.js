chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "getTabIndex") {
        chrome.tabs.query({ url: "*://www.facebook.com/marketplace/*" }, (tabs) => {
            let index = tabs.findIndex(tab => tab.id === sender.tab.id);
            sendResponse({ index });
        });
        return true; // Keep async response open
    }
});
