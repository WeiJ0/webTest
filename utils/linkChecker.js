const ProgressBar = require("progress");

async function checkLinks(page, url) {
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

  links = links.filter((link) => link !== url);
  const uniqueLinks = [...new Set(links)];

  console.log(`共有 ${links.length} 個連結，當中 ${uniqueLinks.length} 個不重複，進行檢查`);

  const checkLinkBar = new ProgressBar(":bar :current/:total", {
    total: uniqueLinks.length,
  });

  const errorLinks = [];

  for (const link of uniqueLinks) {
    const status = await page.evaluate(async (url) => {
      try {
        const response = await fetch(url);
        return response.status;
      } catch (error) {
        return null;
      }
    }, link);

    if (status && status.toString().startsWith("4")) {
      errorLinks.push(link);
    }

    checkLinkBar.tick();
  }

  return errorLinks;
}

module.exports = { checkLinks };
