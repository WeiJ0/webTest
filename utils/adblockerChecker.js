async function checkADBlocker(page) {
  const adElements = await page.$$eval("*", (elements) => {
    return elements
      .filter((element) => {
        const id = element.id.toLowerCase();
        // 確保 className 是一個字符串
        const className = (
          element.className instanceof SVGAnimatedString
            ? element.className.baseVal
            : element.className
        ).toLowerCase();
        const hasAd = id.includes("ad") || className.includes("ad");
        const isLoadRelated = id.includes("load") || className.includes("load");
        return hasAd && !isLoadRelated;
      })
      .map((element) => ({
        id: element.id,
        className: element.className,
      }));
  });

  return adElements;
}

module.exports = { checkADBlocker };
