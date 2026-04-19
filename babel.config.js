module.exports = function (api) {
  // Cache key includes APP_VARIANT so toggling between consumer/operator
  // does not serve stale babel output (expo-router's require.context is
  // inlined at babel time and must reflect the current config).
  api.cache.using(() => process.env.APP_VARIANT ?? 'consumer');

  return {
    presets: [['babel-preset-expo'], 'nativewind/babel'],

    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],

          alias: {
            '@': './',
            'tailwind.config': './tailwind.config.js',
          },
        },
      ],
      'react-native-worklets/plugin',
    ],
  };
};
