module.exports = [
  {
    context: '/api',
    target: '<change_this_placeholder_to_your_BE_url>',
    secure: false,
    changeOrigin: true,
    bypass: function (req) {
      req.headers['X-PRDL-BAAS'] = '<change_this_placeholder_to_required_prdl_header>';
    },
  },
  {
    context: '/auth',
    target: '<change_this_placeholder_to_your_identity_url>',
    secure: false,
    changeOrigin: true,
    bypass: function (req) {
      req.headers['X-PRDL-BAAS'] = '<change_this_placeholder_to_required_prdl_header>';
    },
  },
];
