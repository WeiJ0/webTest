async function handleDialog(page) {
  page.on("dialog", async (dialog) => {
    console.log("出現 alert 視窗，內容：" + dialog.message());
    await dialog.accept();    
  });
}

async function handleResponse(page, url) {
  page.on("response", async (response) => {
    const redirectUrl = response.headers().location;
    if (redirectUrl && redirectUrl.includes("secure")) {
      console.log("進入驗證頁進行驗證");
      await page.waitForSelector("#ansList > div:nth-child(1)");
      await page.click("#ansList > div:nth-child(1)");
    }
  });
}

async function handleConsole(page, consoleLog) {
  page.on("console", (msg) => {
    if (msg.type() === "log") consoleLog.push(msg.text());
  });
}

module.exports = { handleDialog, handleResponse, handleConsole };