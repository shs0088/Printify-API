module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({
    ok: true,
    service: 'dtf-studio-printify-api',
    time: new Date().toISOString()
  });
};
