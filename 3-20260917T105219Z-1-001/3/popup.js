document.addEventListener("DOMContentLoaded", function () {
    let saveButton = document.getElementById("saveLocation");
    let locationInput = document.getElementById("location");

    // ✅ Load saved locations when popup opens
    chrome.storage.local.get(["locations"], (data) => {
        if (data.locations && Array.isArray(data.locations)) {
            locationInput.value = data.locations.join("\n"); // Show saved locations as a list
        }
    });

    saveButton.addEventListener("click", function () {
        let locations = locationInput.value
            .split("\n")
            .map(loc => loc.trim())
            .filter(loc => loc !== "");

        if (locations.length === 0) {
            alert("❌ Please enter at least one location!");
            return;
        }

        // ✅ Save locations in storage
        chrome.storage.local.set({ locations }, () => {
            alert("✅ Locations saved successfully!");
            console.log("📍 Locations saved:", locations);

            // ✅ Inject content script first, then send message
            chrome.tabs.query({ url: "*://www.facebook.com/marketplace/*" }, (tabs) => {
                tabs.forEach((tab, index) => {
                    chrome.scripting.executeScript(
                        {
                            target: { tabId: tab.id },
                            files: ["content.js"]
                        },
                        () => {
                            chrome.tabs.sendMessage(tab.id, { action: "updateLocation", index });
                        }
                    );
                });
            });
        });
    });
});
