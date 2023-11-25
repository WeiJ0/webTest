const ProgressBar = require("progress");


/**
 * @description 檢查網站的連結是否正常
 * @date 2023/11/26 - 上午2:05:00
 * @author Aiden
 *
 * @async
 * @param {*} page puppeteer page
 * @param {*} page2 puppeteer page
 * @param {*} url 專案網址，用來排除網址
 * @returns {Array} 錯誤的連結
 */
async function checkLinks(page, page2, url) {
  // 取得非錨點以及連結的網址
  let links = await page.$$eval("a", (as) =>
    as
      .map((a) => a.href)
      .filter(
        (link) =>
          link &&
          !link.includes("javascript:") &&
          !link.includes("mailto:") &&
          !link.includes("tel:") &&
          !link.includes("#")
      )
  );
  // 移除專案網址
  links = links.filter((link) => link !== url);
  // 移除重複的連結
  const uniqueLinks = [...new Set(links)];

  console.log(
    `共有 ${links.length} 個連結，當中 ${uniqueLinks.length} 個不重複，進行檢查`
  );

  const checkLinkBar = new ProgressBar(":bar :current/:total", {
    total: uniqueLinks.length,
  });

  const errorLinks = [];

  for (const link of uniqueLinks) {
    let response;
    try {
      response = await page2.goto(link, {
        waitUntil: "networkidle0",
        timeout: 5000,
      });
    } catch (e) {
      //console.log(e);
    }

    if (!response) {
      errorLinks.push(link);
    }

    // const status = await page.evaluate(async (url) => {
    //   try {
    //     const response = await fetch(url);
    //     return response.status;
    //   } catch (error) {
    //     console.log(error);
    //     return 500;
    //   }
    // }, link);

    // if (
    //   (status &&
    //     (status.toString().startsWith("4") ||
    //       status.toString().startsWith("5"))) ||
    //   !status
    // )
    //   errorLinks.push(link);

    checkLinkBar.tick();
  } 

  return errorLinks;
}

module.exports = { checkLinks };
