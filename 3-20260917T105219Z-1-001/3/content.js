function setLocation(index) {
    chrome.storage.local.get("locations", (data) => {
        if (!data.locations || !Array.isArray(data.locations) || data.locations.length === 0) {
            console.log("❌ No locations saved in storage!");
            return;
        }

        let location = data.locations[index] || data.locations[data.locations.length - 1]; // Assign last location if more tabs than locations
        console.log(`📍 Tab ${index + 1}: Setting location - ${location}`);

        let inputField = document.querySelector("input[aria-label='Location']");
        if (inputField) {
            inputField.focus();
            inputField.value = ""; // Fully clear the field before entering text
            inputField.dispatchEvent(new Event("input", { bubbles: true }));

            setTimeout(() => {
                inputField.value = location;
                inputField.dispatchEvent(new Event("input", { bubbles: true }));
                inputField.dispatchEvent(new Event("change", { bubbles: true }));

                // Simulate selecting from dropdown
                setTimeout(() => {
                    inputField.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
                    setTimeout(() => {
                        inputField.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
                        console.log("✅ Location selected!");
                    }, 500);
                }, 500);
            }, 500);
        } else {
            console.log("⚠️ Location input not found!");
        }
    });
}

// ✅ Ask background.js which tab this is
chrome.runtime.sendMessage({ action: "getTabIndex" }, (response) => {
    if (response && typeof response.index !== "undefined") {
        chrome.runtime.onMessage.addListener((message) => {
            if (message.action === "updateLocation") {
                setLocation(response.index);
            }
        });
    }
});
