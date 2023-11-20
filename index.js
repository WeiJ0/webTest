const puppeteer = require("puppeteer");
const fs = require("fs");

async function captureScreenshots(url, resolutions) {
  const browser = await puppeteer.launch();

  const page = await browser.newPage();

  page.on("dialog", async (dialog) => {
    await dialog.accept();
  });

  // 監聽響應事件，檢查轉跳的網址是否包含 "secure"
  page.on("response", async (response) => {
    const redirectUrl = response.headers().location;
    if (redirectUrl && redirectUrl.includes("secure")) {
      await page.waitForSelector("#ansList > div:nth-child(1)");
      await page.click("#ansList > div:nth-child(1)");
    }
  });

  await page.goto(url, { waitUntil: "networkidle0" });

  // 重新整理一次
  await page.reload({ waitUntil: "networkidle0" });

  // 取得所有 a link href 取篩選掉包含 # 及空的 href，並檢查是否為 response 404.
  const links = await page.$$eval("a", (as) =>
    as
      .map((a) => {
        return a.href;
      })
      .filter(
        (link) =>
          link != "" &&
          !link.includes("javascript") &&
          !link.includes("mailto:") &&
          !link.includes("tel:") &&
          !link.includes("#")
      )
  );

  // 去除重複的連結
  const newLinks = [...new Set(links)];

  const alreadyCheckLinks = [];
  const errorLinks = [];

  for (const link of newLinks) {
    if (alreadyCheckLinks.includes(link)) {
      continue;
    }

    const response = await page.goto(link, { waitUntil: "networkidle0" });
    if (response.status() === 404) {
      console.log(`❌404: ${link}`);
      errorLinks.push(link);
    }

    console.log(`✅200: ${link}`)
    alreadyCheckLinks.push(link);
  }

  // 將錯誤的連結寫入檔案
  fs.writeFileSync("errorLinks.txt", errorLinks.join("\n"));

  await page.goto(url, { waitUntil: "networkidle0" });

  // 滾動到最下方
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight, { behavior: "smooth" });
  });

  // 滾動到最上方
  await page.evaluate(() => {
    window.scrollTo(0, 0, { behavior: "smooth" });
  });

  await page.waitForTimeout(5000);

  for (const resolution of resolutions) {
    const [width, height] = resolution.split("x");
    await page.setViewport({
      width: parseInt(width, 10),
      height: parseInt(height, 10),
    });

    await page.waitForTimeout(2000);

    const screenshotPath = `screenshot_${resolution}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Screenshot captured for ${resolution} at ${screenshotPath}`);
  }

  await browser.close();
}

const url = "https://ibestpark2.ito.tw/poly_star/";
const resolutions = [
  "1920x1080",
  "1680x1050",
  "1536x864",
  "1440x900",
  "1366x768",
  "1024x768",
  "768x1024",
];

captureScreenshots(url, resolutions);
