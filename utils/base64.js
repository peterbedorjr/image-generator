module.exports = {
  decode(content) {
    return Buffer.from(content, 'base64').toString('utf8');
  },
};
