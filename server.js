require('dotenv').config();

const express = require('express');
const { chromium } = require('playwright');

const generateScreenshot = require('./lib/generate-screenshot.js');
const domainValidator = require('./lib/domain-validator.js');
const base64 = require('./lib/base64.js');
const generateHeaders = require('./lib/generate-headers.js');
const secretIsNotValid = require('./lib/validate-secret.js');
const joinUrl = require('./lib/join-url.js');
const hash = require('./lib/hash.js');
const s3Client = require('./lib/s3-client.js');
const streamToBuffer = require('./lib/stream-to-buffer.js');
const getDefaultImageResponse = require('./lib/get-default-image-response.js')

const app = express();
const port = 3000;

let context = null;

async function init(browser) {
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

      console.time(`Screen shot generated/retrieved from S3 for ${url} in`);

      // if (secretIsNotValid(payload)) {
      //   throw new Error('Invalid secret.');
      // }

      // // If there is an override url provided, check against a whitelist
      // if (payload.env_url && !isValidDomain(payload.env_url)) {
      //   throw new Error('Invalid domain provided: ' + payload.env_url);
      // }

      console.log('Processing payload: ' + JSON.stringify(payload) + '. Decoded from: ' + path);

      let base64EncodedScreenshot = '';

      const objectKey = `${payload.type}/${hash.md5(payloadString)}.png`;
      const byPassS3 = 'bypass_s3' in query;

      // If we're not bypassing s3, skip the checking/retrieval of any
      // objects from S3
      if (!byPassS3 && await s3Client.objectExists(objectKey)) {
        const object = await s3Client.getObject(objectKey);

        base64EncodedScreenshot = Buffer.from(
          await streamToBuffer(object.Body)
        ).toString('base64');
      } else {
        console.log(`No existing image found, creating using constructed url: ${url}`);

        base64EncodedScreenshot = await generateScreenshot(context, url);

        if (!byPassS3) {
          try {
            await s3Client.putBase64EncodedImage(objectKey, base64EncodedScreenshot);
          } catch (e) {
            console.error(e);
          }
        }
      }

      res.set(generateHeaders());
      res.end(base64EncodedScreenshot);
    } catch (e) {
      console.log(e);
      res.end(e);
    } finally {
      console.timeEnd(`Screen shot generated/retrieved from S3 for ${url} in`);
    }
  });

  app.listen(port, async () => {
    console.log(`Example app listening on port ${port}`);
  });
};

chromium.launch().then(init);
