const ProgressBar = require("progress");

async function takeScreenshots(page, sizes) {
  const screenshotBar = new ProgressBar(":bar :current/:total", {
    total: sizes.length,
  });

  let alreadyShot = 0;
  size.push(size[0]);
  
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