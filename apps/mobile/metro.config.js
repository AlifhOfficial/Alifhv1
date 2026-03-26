const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Monorepo: watch the root node_modules so Metro can find hoisted packages
config.watchFolders = [workspaceRoot];

// Tell Metro to resolve from both the app and workspace root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Follow symlinks for bun-hoisted packages
config.resolver.unstable_enableSymlinks = true;

module.exports = withNativeWind(config, { input: './global.css' });

