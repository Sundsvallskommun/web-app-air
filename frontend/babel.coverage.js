module.exports = function (api) {
  api.cache(true);

  const isJest = api.caller((caller) => caller?.name === 'babel-jest');
  return {
    presets: ['next/babel'],
    plugins: isJest ? [] : ['istanbul'],
  };
};
