document.getElementById("saveData").addEventListener("click", function () {
    let title = document.getElementById("title").value.trim();
    let price = document.getElementById("price").value.trim();
    let description = document.getElementById("description").value.trim();
    let fileInput = document.getElementById("imageInput");

    let imageDataList = [];
    let processedCount = 0;

    if (fileInput.files.length > 0) {
        Array.from(fileInput.files).forEach((file, index) => {
            if (file.size < 4 * 1024 * 1024 && (file.type === "image/jpeg" || file.type === "image/png")) {
                let reader = new FileReader();
                reader.onload = function (event) {
                    imageDataList.push(event.target.result);
                    processedCount++;

                    if (processedCount === fileInput.files.length) {
                        saveData(title, price, description, imageDataList);
                    }
                };
                reader.readAsDataURL(file);
            } else {
                alert(`❌ Image ${file.name} is too large or not in JPG/PNG format.`);
            }
        });
    } else {
        saveData(title, price, description, imageDataList);
    }
});

function saveData(title, price, description, imageDataList) {
    chrome.storage.local.set(
        { "title": title, "price": price, "description": description, "imageDataList": imageDataList },
        function () {
            alert("✅ Data saved for autofill!");
            console.log("📝 Title:", title);
            console.log("💰 Price:", price);
            console.log("📝 Description:", description);
            console.log("🖼️ Images saved:", imageDataList.length);
        }
    );
}

document.getElementById("openTabs").addEventListener("click", function () {
    let tabCount = parseInt(document.getElementById("tabCount").value);
    let listingUrl = "https://www.facebook.com/marketplace/create/item";

    if (tabCount > 0) {
        for (let i = 0; i < tabCount; i++) {
            chrome.tabs.create({ url: listingUrl });
        }
        console.log(`🚀 Opened ${tabCount} listing tabs.`);
    } else {
        alert("❌ Please enter a valid number of tabs.");
    }
});
