
/**
 * @description 處理 alert 視窗
 * @date 2023/11/26 - 上午2:06:00
 * @author Aiden
 *
 * @async
 * @param {*} page puppeteer page
 * @returns {*}
 */
async function handleDialog(page) {
  page.on("dialog", async (dialog) => {
    console.log("出現 alert 視窗，內容：" + dialog.message());
    await dialog.accept();    
  });
}


/**
 * @description 處理 response，如果進到驗證頁面，就自動點擊第一個選項，後已改用 cookie 避免驗證
 * @date 2023/11/26 - 上午2:06:18
 * @author Aiden
 *
 * @async
 * @param {*} page puppeteer page
 * @returns {*}
 */
async function handleResponse(page) {
  page.on("response", async (response) => {
    const redirectUrl = response.headers().location;
    if (redirectUrl && redirectUrl.includes("secure")) {
      console.log("進入驗證頁進行驗證");
      await page.waitForSelector("#ansList > div:nth-child(1)");
      await page.click("#ansList > div:nth-child(1)");
    }
  });
}


/**
 * @description 處理 console log，若有 log 就 push 到 consoleLog
 * @date 2023/11/26 - 上午2:06:59
 * @author Aiden
 *
 * @async
 * @param {*} page puppeteer page
 * @param {Array} consoleLog 儲存 console log 的陣列
 * @returns {*}
 */
async function handleConsole(page, consoleLog) {
  page.on("console", (msg) => {
    if (msg.type() === "log") consoleLog.push(msg.text());
  });
}

module.exports = { handleDialog, handleResponse, handleConsole };