const crypto = require('crypto');

module.exports = {
  md5(content) {
    return crypto.createHash('md5')
      .update(content)
      .digest('hex');
  },

  sha256(content) {
    return crypto.createHmac('sha256', process.env.HASH_KEY)
      .update(content)
      .digest('hex');
  },
};
