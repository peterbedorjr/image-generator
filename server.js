const express = require('express');
const { chromium } = require('playwright');
const app = express();
const port = 3000;

const generateScreenshot = require('./lib/generateScreenshot.js');

let context = null;

async function init (browser) {
  console.log('init');
  context = await browser.newContext();

  app.get('/generate', async (req, res) => {
    const { url } = req.query;

    // console.time(`Screen shot generated for ${url} in`);

    try {
      console.log(url);
      res.setHeader('Content-Type', 'image/png');
      res.end(await generateScreenshot(context, url));
    } catch (e) {
      console.log(e);
      res.send(e);
    } finally {
      // console.timeEnd(`Screen shot generated for ${url} in`);
    }
  });

  app.listen(port, async () => {
    console.log(`Example app listening on port ${port}`);
  });
};

chromium.launch().then(init);
