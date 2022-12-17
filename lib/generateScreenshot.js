module.exports = async (context, url) => {
  console.log(url);
  let page = null;

  if (!url) return 'Error: ' + url;

  try {
    page = await context.newPage();

    await page.setViewportSize({
      width: 1200,
      height: 630,
    });

    await page.goto(url);

    await page.evaluate(async () => {
      const selectors = Array.from(document.querySelectorAll('img'));

      await Promise.all([
        document.fonts.ready,
        ...selectors.map((img) => {
          // Image has already finished loading, let’s see if it worked
          if (img.complete) {
            // Image loaded and has presence
            if (img.naturalHeight !== 0) return;
            // Image failed, so it has no height
            throw new Error('Image failed to load');
          }
          // Image hasn’t loaded yet, added an event listener to know when it does
          return new Promise((resolve, reject) => {
            img.addEventListener('load', resolve);
            img.addEventListener('error', reject);
          });
        }),
      ]);
    });

    return await page.screenshot();
  } catch (e) {
    throw e;
  } finally {
    if (page) page.close();
  }
}
