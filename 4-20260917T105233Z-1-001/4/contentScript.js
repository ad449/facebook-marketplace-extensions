function clickFirstOptionByXPath() {
    const xpath = "/html/body/div[1]/div/div[1]/div/div[3]/div/div/div[2]/div/div/div[1]/div[1]/div/ul/li[1]/div/div[1]/div/div/div/div/div/div/div/div/div[2]/span";
    const element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

    if (element) {
        element.click();
        console.log("✅ Clicked first dropdown option:", element.innerText);
    } else {
        console.log("⏳ Waiting for dropdown option...");
    }
}

clickFirstOptionByXPath();
