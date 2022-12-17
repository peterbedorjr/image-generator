require('dotenv').config();

const express = require('express');
const { chromium } = require('playwright');

const log = require('./lib/log.js');
const generateScreenshot = require('./lib/generate-screenshot.js');
const isValidDomain = require('./lib/domain-validator.js');
const base64 = require('./lib/base64.js');
const generateHeaders = require('./lib/generate-headers.js');
const secretIsNotValid = require('./lib/validate-secret.js');
const joinUrl = require('./lib/join-url.js');
const hash = require('./lib/hash.js');
const s3Client = require('./lib/s3-client.js');
const streamToBuffer = require('./lib/stream-to-buffer.js');
const getDefaultImage = require('./lib/get-default-image.js')

const app = express();
const port = 3000;

let context = null;

async function initialize(browser) {
  context = await browser.newContext();

  app.get('/generate/:path', async (req, res) => {
    const { path } = req.params;
    const { query } = req;
    let payload = null;
    let url = null;

    try {
      const payloadString = base64.decode(path);

      try {
        payload = JSON.parse(payloadString);
      } catch (e) {
        throw new Error('Unable to process JSON payload: ' + payloadString);
      }

      url = joinUrl([
        (payload.env_url || process.env.BASE_URL),
        'share-image-generator',
        payload.type,
        `${payload.id}_${payload.content_hash}_${payload.cache_key}`,
      ]);

      if (secretIsNotValid(payload)) {
        throw new Error('Invalid secret.');
      }

      // If there is an override url provided, check against a whitelist
      if (payload.env_url && !isValidDomain(payload.env_url)) {
        throw new Error('Invalid domain provided: ' + payload.env_url);
      }

      log.info('Processing payload: ' + JSON.stringify(payload) + '. Decoded from: ' + path);

      let base64EncodedScreenshot = '';

      const objectKey = `${payload.type}/${hash.md5(payloadString)}.png`;
      const byPassS3 = 'bypass_s3' in query;

      if (byPassS3) log.info('Bypassing S3.');

      // If we're not bypassing s3, skip the checking/retrieval of any
      // objects from S3
      if (!byPassS3 && await s3Client.objectExists(objectKey)) {
        const object = await s3Client.getObject(objectKey);

        base64EncodedScreenshot = Buffer.from(
          await streamToBuffer(object.Body)
        ).toString('base64');
      } else {
        log.info(`No existing image found, creating using constructed url: ${url}`);

        base64EncodedScreenshot = await generateScreenshot(context, url);

        // Upload generated image to S3
        if (!byPassS3) {
          try {
            await s3Client.putBase64EncodedImage(objectKey, base64EncodedScreenshot);
          } catch (e) {
            log.error(e);
          }
        }
      }

      res.set(generateHeaders());
      res.end(base64EncodedScreenshot);
    } catch (e) {
      log.error(e);
      // res.set(generateHeaders());
      // res.end(getDefaultImage());
      res.end('Default image here :)');
    }
  });

  app.listen(port, async () => {
    console.log(`Share image generator listening on port ${port}`);
  });
};

chromium.launch().then(initialize);
