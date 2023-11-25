const puppeteer = require("puppeteer");


/**
 * @description 執行一個瀏覽器, 並且設定瀏覽器的參數
 * @date 2023/11/26 - 上午2:04:17
 * @author Aiden
 *
 * @async
 * @returns puppeteer browser
 */
async function launchBrowser() {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
    args: [
      "--start-maximized",
      "--disable-notifications",
      "--disable-geolocation",
    ],
  });
  return browser;
}

module.exports = { launchBrowser };
