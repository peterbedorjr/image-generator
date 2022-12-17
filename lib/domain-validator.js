const Url = require('url');
const { DOMAIN_WHITELIST } = process.env;

const whitelistedDomains = (DOMAIN_WHITELIST || '').split(',')
  .map((domain) => domain.trim());

module.exports = (url) => {
  const parsed = Url.parse(url, true);
  const { hostname, protocol } = parsed;

  // TODO
  // if (!['https:'].includes(protocol)) {
  //   return false;
  // }

  return whitelistedDomains.some(
    (allow) => new RegExp(`^${allow.split('*').join('.*')}$`).test(hostname)
  );
}
