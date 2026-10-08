document.getElementById("start").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "clickButtons" });
});
