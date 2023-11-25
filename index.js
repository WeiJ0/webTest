// module
const fs = require("fs");
const chalk = require('chalk');
const { launchBrowser } = require("./utils/browser");
const { handleDialog, handleResponse, handleConsole } = require("./utils/pageUtils");
const { takeScreenshots } = require("./utils/screenshot");
const { checkLinks } = require("./utils/linkChecker");

async function process(url, sizes) {
  const browser = await launchBrowser();
  const page = await browser.newPage();
  const testPage = await browser.newPage();

  await handleDialog(page);
  await handleResponse(page);

  const consoleLog = [];
  await handleConsole(page, consoleLog);
  
  console.log("=====================================");
  console.log("任務開始，網址：", url);

  // 設定 cookie，避免驗證
  await page.setCookie({
    name: 'temporaryVerifyCode',
    value: 'ok',
    domain: url.replace(/^https?:\/\//i, "").split('/')[0] // 假設 URL 是格式正確的
  });

  // 前往網址
  console.log("第一次進入網站");
  await page.goto(url, { waitUntil: "networkidle0" });

  // 重新整理一次
  await page.goto(url, { waitUntil: "networkidle0" });
  console.log("已重新整理一次");

  // 檢查連結是否正確
  const errorLinks = await checkLinks(page, testPage, url);

  // 關閉測試頁面
  await testPage.close();
  // 切換回 page 
  await page.bringToFront();

  // 截圖
  console.log('開始進行截圖');
  await takeScreenshots(page, sizes);

  // 回傳執行 js getCopy() 的結果
  const copyResult = await page.evaluate(() => {
    return getCopy ? getCopy() : 'getCopy() not found';
  });

  console.log("任務結束");
  console.log("=====================================");

  if (errorLinks.length > 0) {
    fs.writeFileSync("errorLinks.txt", errorLinks.join("\n"));
    console.log(chalk.bgRed(`* 錯誤連結檢查結果： 錯誤連結有 ${errorLinks.length} 個，並已寫入 errorLinks.txt`));
  } else {
    console.log(chalk.bgGreen("* 錯誤連結檢查結果： 沒有錯誤連結"));
  }

  if(consoleLog.length > 0)
    console.log(chalk.bgRed(`* console.log 檢查結果： 共有 ${consoleLog.length} 個 console.log`));
  else
    console.log(chalk.bgGreen("* console.log 檢查結果： 沒有 console.log"));

  console.log(`* getCopy() 檢查結果： ${copyResult}`);

  // 關閉瀏覽器
  await browser.close();
}

const url = "https://ibestpark2.ito.tw/gia/";
const sizes = [
  "1920x1080",
  "1680x1050",
  "1536x864",
  "1440x900",
  "1366x768",
  "1024x768",
  "768x1024",
];

process(url, sizes);