const log = require('./log.js');

const { S3_BUCKET, S3_REGION } = process.env;

const {
  S3Client,
  HeadObjectCommand,
  PutObjectCommand,
  GetObjectCommand,
} = require('@aws-sdk/client-s3');
const s3Client = new S3Client({ region: S3_REGION });

module.exports = {
  async objectExists(objectKey) {
    log.info('Checking bucket for existing image with key ' + objectKey);

    let exists = false;

    try {
      const object = await s3Client.send(new HeadObjectCommand({
        Bucket: S3_BUCKET,
        Key: objectKey,
      }));

      exists = !!object;
    } catch (e) {
      // An error is thrown every time an image is not found, catching it
      // here and sending it to the void to avoid misleading logs
    } finally {
      log.info('Checking bucket for existing image with key ' + objectKey);
    }

    return exists;
  },

  async putBase64EncodedImage(objectKey, base64EncodedImage, type = 'png') {
    log.info('Uploading object to S3');

    try {
      const command = new PutObjectCommand({
        Body: Buffer.from(base64EncodedImage, 'base64'),
        Bucket: S3_BUCKET,
        Key: objectKey,
        ContentEncoding: 'base64',
        ContentType: `image/${type}`,
      });

      const response = await s3Client.send(command);

      log.info('Uploading object to S3');

      return response;
    } catch (e) {
      throw e
    }
  },

  async getObject(objectKey) {
    log.info('Retrieveing object from S3');

    try {
      const command = new GetObjectCommand({
        Bucket: S3_BUCKET,
        Key: objectKey,
        ContentEncoding: 'base64',
        ContentType: 'image/png',
      });

      const response = await s3Client.send(command);

      log.info('Retrieveing object from S3');

      return response;
    } catch (e) {
      throw e;
    } finally {
    }
  },
};
