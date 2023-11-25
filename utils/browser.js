const puppeteer = require("puppeteer");

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
