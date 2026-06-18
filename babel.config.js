module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Plugin do Contentsquare: habilita o autocapture (captura toques/telas
    // automaticamente). Necessário para o `enableRNAutocapture: true`.
    plugins: ['@contentsquare/react-native-bridge/babel'],
  };
};
