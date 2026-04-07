const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Expo/Metro may inject this legacy option in some versions; remove it to
// avoid noisy "Unknown option watcher.unstable_workerThreads" warnings.
if (config.watcher && 'unstable_workerThreads' in config.watcher) {
  delete config.watcher.unstable_workerThreads;
}

// Keep Expo defaults and only add workspace root if needed for monorepo packages
config.watchFolders = [...new Set([...(config.watchFolders || []), workspaceRoot])];

// Tell Metro to resolve from both the app and workspace root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

module.exports = config;
