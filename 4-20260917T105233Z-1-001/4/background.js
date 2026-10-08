chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "start_clicking") {
        chrome.tabs.query({url: ["<all_urls>"]}, function(tabs) {
            tabs.forEach(function(tab) {
                if (tab.id) {
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        files: ['contentScript.js']
                    });
                }
            });
        });
    }
});
