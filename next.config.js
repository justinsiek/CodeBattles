const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.plugins.push(new MonacoWebpackPlugin({
        languages: ['javascript', 'python'],
        filename: 'static/[name].worker.js',
      }));
    }
    return config;
  },
};