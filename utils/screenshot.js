const ProgressBar = require("progress");


/**
 * @description 進行網站的截圖
 * @date 2023/11/26 - 上午2:07:51
 * @author Aiden
 *
 * @async
 * @param {*} page puppeteer page
 * @param {Array} sizes 截圖的尺寸
 * @returns {*}
 */
async function takeScreenshots(page, sizes) {
  const screenshotBar = new ProgressBar(":bar :current/:total", {
    total: sizes.length,
  });

  // 避免第一個尺寸的截圖，因為淡入特出還沒結束，導致截圖不完整
  // 所以再多截一次
  let alreadyShot = 0;
  sizes.push(sizes[0]);
  
  for (const size of sizes) {
    const [width, height] = size.split("x");
    await page.setViewport({
      width: parseInt(width, 10),
      height: parseInt(height, 10),
    });
    await page.waitForTimeout(2000);
    const screenshotPath = `screenshot_${size}.png`;

    if(alreadyShot > 0){
      await page.screenshot({ path: screenshotPath, fullPage: true });
      screenshotBar.tick();
    }

    alreadyShot++;
  }
}

module.exports = { takeScreenshots };