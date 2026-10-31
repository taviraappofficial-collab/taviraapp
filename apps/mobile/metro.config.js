const path = require('node:path');

const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

// pnpm exposes the same package through several workspace symlinks. Metro can
// otherwise assign React more than one module identity in a production bundle,
// which breaks hooks at runtime. Always resolve the React runtime from the app.
const appRuntimeModules = new Set([
  'react',
  'react/jsx-dev-runtime',
  'react/jsx-runtime',
  'react-native',
]);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (appRuntimeModules.has(moduleName)) {
    return {
      type: 'sourceFile',
      filePath: require.resolve(moduleName, { paths: [projectRoot] }),
    };
  }

  return context.resolveRequest(context, moduleName, platform);
};

config.watchFolders = [path.resolve(projectRoot, '../..')];

module.exports = config;
