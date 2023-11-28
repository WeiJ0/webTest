
/**
 * @description 輸出 h1 - h5 的數量及其文字
 * @date 2023/11/28 - 下午9:33:47
 * @author Aiden
 *
 * @async
 * @param {*} page puppeteer page
 * @returns {Array} [headerText, headerTextLength] 
 * headerText: { h1: 1, h2: 2, h3: 3, h4: 4, h5: 5 }
 * headerTextLength: { h1: ["h1 text"], h2: ["h2 text", "h2 text"], h3: ["h3 text", "h3 text", "h3 text"], h4: ["h4 text", "h4 text", "h4 text", "h4 text"], h5: ["h5 text", "h5 text", "h5 text", "h5 text", "h5 text"] }
 */
async function checkHeaderText(page) {
    const headerTextArr = await page.evaluate(() => {
        const headerText = {};
        const headerTextLength = {};
        const headerTags = ["h1", "h2", "h3", "h4", "h5"];
        headerTags.forEach((tag) => {
            headerText[tag] = document.querySelectorAll(tag).length;
            headerTextLength[tag] = [];
            document.querySelectorAll(tag).forEach((el) => {
                headerTextLength[tag].push(el.innerText);
            });
            if(headerTextLength[tag].length === 0) delete(headerTextLength[tag]);
        });
        return [headerText, headerTextLength];
    });

    return headerTextArr;
}

module.exports = { checkHeaderText };
