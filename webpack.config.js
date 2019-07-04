const commonConfig = require('./webpack.config.common');

module.exports = {
  ...commonConfig,
  mode: 'production',
  watch: false
};
