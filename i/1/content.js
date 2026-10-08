function autofillData() {
    chrome.storage.local.get(["title", "price", "description", "imageDataList"], (data) => {
        let attempts = 0;
        let maxAttempts = 10; // Maximum retries for autofill
        let interval = 2000; // Retry every 2 seconds
        let maxRetry = 3; // Maximum retries for Category and Condition
        let saveDraftAttempts = 6; // Maximum retries for Save Draft

        function tryFillFields() {
            attempts++;
            let allFilled = true;
            let categoryFilled = false;
            let conditionFilled = false;

            // Autofill Title
            let titleField = document.evaluate("//input[contains(@type, 'text')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            if (titleField && data.title) {
                titleField.value = data.title;
                titleField.dispatchEvent(new Event("input", { bubbles: true }));
            } else {
                allFilled = false;
            }

            // Autofill Price
            let priceField = document.evaluate("(//input[@type='text'])[2]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            if (priceField && data.price) {
                priceField.value = data.price;
                priceField.dispatchEvent(new Event("input", { bubbles: true }));
            } else {
                allFilled = false;
            }

            // Autofill Description (keep retrying until detected and filled)
            let descriptionField = document.evaluate("(//textarea[@class])[1]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            if (descriptionField && data.description) {
                descriptionField.value = data.description;
                descriptionField.dispatchEvent(new Event("input", { bubbles: true }));
            } else {
                allFilled = false;
                console.log("⏳ Waiting for description field...");
            }

            // Upload Single Image (only the first image if available)
            let uploadButton = document.querySelector("input[type='file']");
            if (uploadButton && data.imageDataList && data.imageDataList.length > 0) {
                let dt = new DataTransfer();
                fetch(data.imageDataList[0]) // Only first image
                    .then(res => res.blob())
                    .then(blob => {
                        let file = new File([blob], "listing_1.jpg", { type: "image/jpeg" });
                        dt.items.add(file);
                        uploadButton.files = dt.files;
                        uploadButton.dispatchEvent(new Event("change", { bubbles: true }));
                        console.log("✅ Single image uploaded!");
                    });
            }

            // After Price is filled, trigger Category selection (Household) with retry logic
            if (priceField && priceField.value.trim() !== "") {
                let categoryAttempts = 0;

                function tryCategory() {
                    categoryAttempts++;
                    let category = document.evaluate("//div[contains(@class, 'x1n2onr6')]//span[contains(text(), 'Category')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                    if (category) {
                        console.log("Category field found!");
                        category.click();  // Opens dropdown

                        setTimeout(() => {
                            let household = document.evaluate("//*[starts-with(text(), 'Household')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                            if (household) {
                                console.log("Household category found!");
                                household.click();  // Selects Household
                                categoryFilled = true;
                            } else {
                                console.log("Household category NOT found!");
                            }
                        }, 1500); // Increase timeout for better reliability
                    } else if (categoryAttempts < maxRetry) {
                        console.log("⏳ Category field not found! Retrying...");
                        setTimeout(tryCategory, interval);
                    }
                }

                tryCategory();
            }

            // After Category is selected, trigger Condition selection (New) with retry logic
            if (priceField && priceField.value.trim() !== "") {
                let conditionAttempts = 0;

                function tryCondition() {
                    conditionAttempts++;
                    let condition = document.evaluate("//div[contains(@class, 'x1n2onr6')]//span[contains(text(), 'Condition')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                    if (condition) {
                        console.log("Condition field found!");
                        condition.click();  // Opens dropdown

                        // Wait 2 seconds for dropdown to load and then click "New"
                        setTimeout(() => {
                            console.log("⏳ Waiting for 'New' condition to appear...");
                            let newCondition = document.evaluate("//span[contains(text(), 'New')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                            if (newCondition) {
                                console.log('"New" condition found!');
                                newCondition.click();  // Selects "New"
                                conditionFilled = true;
                            } else {
                                console.log('"New" condition NOT found!');
                            }
                        }, 2000); // Increase wait time for dropdown to load properly
                    } else if (conditionAttempts < maxRetry) {
                        console.log("⏳ Condition field not found! Retrying...");
                        setTimeout(tryCondition, interval); // Retry if condition field is not found
                    }
                }

                tryCondition();
            }

            // Ensure all fields are filled before saving draft with retry logic (6 retries)
            if (descriptionField && descriptionField.value.trim() !== "") {
                let saveDraftAttemptsLeft = saveDraftAttempts;

                function trySaveDraft() {
                    // Only attempt to save if all fields are filled, category and condition are selected
                    if (allFilled && categoryFilled && conditionFilled) {
                        saveDraftAttemptsLeft--;
                        let saveDraftButton = document.evaluate("//div[contains(@class, 'x1n2onr6')]//span[contains(text(), 'Save draft')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                        if (saveDraftButton) {
                            saveDraftButton.click();
                            console.log("✅ Save Draft button clicked!");
                        } else if (saveDraftAttemptsLeft > 0) {
                            console.log("⏳ Save Draft button not found! Retrying...");
                            setTimeout(trySaveDraft, interval);
                        }
                    } else if (saveDraftAttemptsLeft > 0) {
                        console.log("⏳ Fields not filled completely or category/condition not selected! Retrying save draft...");
                        setTimeout(trySaveDraft, interval);
                    }
                }

                trySaveDraft();
            } else if (attempts < maxAttempts) {
                console.log("⏳ Fields not filled completely! Retrying...");
                setTimeout(tryFillFields, interval);
            }
        }

        tryFillFields();
    });
}

// Run autofill when the page loads
autofillData();

// Sync across all tabs when data updates
chrome.storage.onChanged.addListener(() => {
    autofillData();
});
