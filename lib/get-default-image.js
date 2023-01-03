const s3Client = require('./s3-client.js');
const streamToBuffer = require('./stream-to-buffer.js');

module.exports = async () => {
  const object = await s3Client.getObject(process.env.FALLBACK_OBJECT_KEY);

  console.log(object);

  return Buffer.from(
    await streamToBuffer(object.Body)
  ).toString('base64');
}
