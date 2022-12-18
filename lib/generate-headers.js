const oneYearFromNow = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toUTCString();
const oneYearInSeconds = 31557600;

module.exports = () => ({
  'Status': 200,
  'Content-Type': 'image/png',
  'Expires': oneYearFromNow,
  'Cache-Control': `public, max-age=${oneYearInSeconds}`,
});
