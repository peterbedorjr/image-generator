module.exports = async (context, url) => {
  let page = null;

  if (!url) return 'Error: ' + url;

  return new Promise(async (resolve, reject) => {
    try {
      page = await context.newPage();

      await page.setViewportSize({
        width: 1200,
        height: 630,
      });

      await page.goto(url);

      page.on('response', async (response) => {
        if (response.url() === url && response.status() !== 200) {
          let errorMessage = `Share template endpoint responded with a ${response.status()} status code`

          if (response.status() === 404) {
            errorMessage += ` from URL ${url}`;
          }

          console.error(errorMessage);

          reject();
        }
      });

      // The default wait for network idle adds about ~500ms to the response,
      // This is a different heuristic we can provide based on when the images
      // and fonts load
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

      const screenshotBuffer = await page.screenshot();

      resolve(screenshotBuffer);
    } catch (e) {
      throw e;
    } finally {
      if (page) page.close();
      reject(); // TODO:
    }
  });
}
