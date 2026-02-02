const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for Tamagui
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs'];

module.exports = config;
