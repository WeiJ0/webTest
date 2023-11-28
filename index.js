// module
const fs = require("fs");
const chalk = require("chalk");
const { launchBrowser } = require("./utils/browser");
const {
  handleDialog,
  handleResponse,
  handleConsole,
} = require("./utils/pageUtils");
const { takeScreenshots } = require("./utils/screenshot");
const { checkLinks } = require("./utils/linkChecker");
const { checkADBlocker } = require("./utils/adblockerChecker");
const { checkHeaderText } = require("./utils/headerTextChecker");

// 設定要執行的檢查項目
const url = "https://ibestpark2.ito.tw/croslene/";

const checkerRun = {
  headerText: true,
  adBlock: !true,
  errorLinks: !true,
  takeScreenshots: !true,
  consoleLog: !true,
  getCopy: !true,
};

const sizes = [
  "1920x1080",
  "1680x1050",
  "1536x864",
  "1440x900",
  "1366x768",
  "1024x768",
  "768x1024",
];

async function process(url, sizes) {
  const browser = await launchBrowser();
  const page = await browser.newPage();
  const testPage = await browser.newPage();

  await handleDialog(page);
  await handleResponse(page);

  let consoleLog ;
  if (checkerRun.consoleLog) {
    consoleLog = [];
    await handleConsole(page, consoleLog);
  }

  console.log("=====================================");
  console.log("任務開始，網址：", url);

  // 設定 cookie，避免驗證
  await page.setCookie({
    name: "temporaryVerifyCode",
    value: "ok",
    domain: url.replace(/^https?:\/\//i, "").split("/")[0], // 假設 URL 是格式正確的
  });

  // 前往網址
  console.log("第一次進入網站");
  await page.goto(url, { waitUntil: "networkidle0" });
  // 重新整理一次
  await page.goto(url, { waitUntil: "networkidle0" });
  console.log("已重新整理一次");

  // 檢查是否有可能被 adblocker 遮蔽的元素
  let adBlock;
  if (checkerRun.adBlock) adBlock = await checkADBlocker(page);

  // 檢查 h1 ~ h5 的數量
  let headerTextArr;
  if (checkerRun.headerText) headerTextArr = await checkHeaderText(page);

  // 檢查連結是否正確
  let errorLinks;
  if (checkerRun.errorLinks) {
    errorLinks = await checkLinks(page, testPage, url);
    await testPage.close();
  }

  await page.bringToFront();

  // 截圖
  if (checkerRun.takeScreenshots) {
    console.log("開始進行截圖");
    await takeScreenshots(page, sizes);
  }

  // 回傳執行 js getCopy() 的結果
  let copyResult;
  if (checkerRun.getCopy) {
    copyResult = await page.evaluate(() => {
      return getCopy ? getCopy() : "getCopy() not found";
    });
  }

  console.log("任務結束");
  console.log("=====================================");

  // 輸出 h1 ~ h5 檢查結果
  if (headerTextArr && headerTextArr.length > 0) {
    const lengthObj = headerTextArr[0];
    const textObj = headerTextArr[1];
    console.log("* h1 ~ h5 檢查結果：");
    console.table(lengthObj);

    Object.keys(textObj).forEach((tag) => {
      console.log(`* ${tag} 的文字：`);
      console.table(textObj[tag]);
    });
  }

  // 輸出 adblock 檢查結果
  if (Array.isArray(adBlock)) {
    if (adBlock.length > 0) {
      console.log(
        chalk.bgRed(
          `* adBlock 檢查結果： 共有 ${adBlock.length} 個可能被 adBlocker 遮蔽的元素`
        )
      );
      console.log("* 詳細資料：");
      console.log(adBlock.join("\n"));
    } else
      console.log(
        chalk.bgGreen("* adBlock 檢查結果： 沒有可能被 adBlocker 遮蔽的元素")
      );
  }

  // 輸出錯誤連結檢查結果
  if (Array.isArray(errorLinks)) {
    if (errorLinks && errorLinks.length > 0) {
      fs.writeFileSync("errorLinks.txt", errorLinks.join("\n"));
      console.log(
        chalk.bgRed(
          `* 錯誤連結檢查結果： 錯誤連結有 ${errorLinks.length} 個，並已寫入 errorLinks.txt`
        )
      );
    } else console.log(chalk.bgGreen("* 錯誤連結檢查結果： 沒有錯誤連結"));
  }
  // 輸出 console.log 檢查結果
  if (Array.isArray(consoleLog)) {
    if (consoleLog && consoleLog.length > 0)
      console.log(
        chalk.bgRed(
          `* console.log 檢查結果： 共有 ${consoleLog.length} 個 console.log`
        )
      );
    else
      console.log(chalk.bgGreen("* console.log 檢查結果： 沒有 console.log"));
  }

  // 輸出 getCopy() 檢查結果
  if (copyResult) console.log(`* getCopy() 檢查結果： ${copyResult}`);

  // 關閉瀏覽器
  await browser.close();
}


process(url, sizes);
