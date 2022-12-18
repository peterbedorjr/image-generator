const hash = require('./hash.js');

module.exports = (payload) => {
  // Obfuscating the purpose of this key for any nosey people who happen to
  // decode and inspect the url
  const secretTest = hash.sha256(`${payload.id}_${process.env.SECRET_PHRASE}`).substring(0, 10);

  return secretTest !== payload.cache_key;
};
