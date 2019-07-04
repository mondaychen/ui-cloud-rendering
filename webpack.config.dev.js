const commonConfig = require('./webpack.config.common');

module.exports = {
  ...commonConfig,
  mode: 'development',
  watch: true,
  watchOptions: {
    poll: true,
    ignored: /node_modules/
  }
};
