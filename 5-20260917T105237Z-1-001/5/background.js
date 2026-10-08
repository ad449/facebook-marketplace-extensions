chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "clickButtons") {
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach((tab) => {
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    function: clickNextAndPublish
                });
            });
        });
    }
});

function clickNextAndPublish() {
    function clickButton(xpath) {
        let button = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if (button) button.click();
    }
    
    clickButton("//span[contains(text(), 'Next')]");
    setTimeout(() => clickButton("//span[contains(text(), 'Publish')]"), 3000);
}
