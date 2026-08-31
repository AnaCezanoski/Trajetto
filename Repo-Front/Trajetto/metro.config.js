const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  const { transformer, resolver } = config;

  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve("react-native-svg-transformer"),
  };
  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...resolver.sourceExts, "svg"],

    // O react-native-maps é uma biblioteca só de celular: no navegador ela quebra o
    // empacotamento do app inteiro, inclusive das telas que nem usam mapa. Na web ela é
    // trocada por um espaço reservado; no celular nada muda.
    resolveRequest: (context, moduleName, platform) => {
      if (platform === "web" && moduleName === "react-native-maps") {
        return {
          type: "sourceFile",
          filePath: path.resolve(__dirname, "stubs/react-native-maps.web.tsx"),
        };
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  };

  return config;
})();