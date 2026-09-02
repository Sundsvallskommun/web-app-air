module.exports = function (api) {
  const isJest = api.caller((caller) => caller?.name === 'babel-jest');
  api.cache(true);
  return {
    presets: ['next/babel'],
    plugins: isJest ? [] : ['istanbul'],
  };
};
