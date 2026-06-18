const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
const projectNodeModules = path.resolve(projectRoot, "node_modules");
const keyboardControllerRoot = "D:/rnkc";

const config = getDefaultConfig(projectRoot);
config.watchFolders = Array.from(new Set([...(config.watchFolders || []), keyboardControllerRoot]));
config.resolver = config.resolver || {};
config.resolver.nodeModulesPaths = Array.from(
  new Set([...(config.resolver.nodeModulesPaths || []), projectNodeModules])
);
config.resolver.extraNodeModules = new Proxy(
  {
    ...(config.resolver.extraNodeModules || {}),
    "react-native-keyboard-controller": keyboardControllerRoot,
    buffer: path.join(projectRoot, "polyfills", "buffer"),
  },
  {
    get(target, name) {
      if (typeof name !== "string") {
        return target[name];
      }
      return target[name] || path.join(projectNodeModules, name);
    },
  }
);

module.exports = config;
