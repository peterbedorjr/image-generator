const crypto = require('crypto');

module.exports = {
    md5(content) {
        return crypto.createHash('md5')
          .update(content)
          .digest('hex');
    },

    sha256(content) {
        const key = process.env.KEY;

        return crypto.createHmac('sha256', key)
           .update(content)
           .digest('hex');
    },
};
