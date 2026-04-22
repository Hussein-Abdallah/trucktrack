const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('node:fs');
const path = require('node:path');

/**
 * Writes per-locale InfoPlist.strings files into the iOS project so OS
 * permission dialogs (location, camera, etc.) appear in the user's
 * device language. Expo's app.config.ts only supports a single
 * NSLocationWhenInUseUsageDescription value via the expo-location
 * plugin — anything localized has to come through .lproj overrides
 * generated at prebuild time, which is what this plugin does.
 *
 * Pair with `ios.infoPlist.CFBundleLocalizations: ['en','fr']` (and a
 * matching `CFBundleDevelopmentRegion`) in app.config.ts so iOS knows
 * the app advertises both languages.
 *
 * @param {import('@expo/config-plugins').ConfigPlugin<{
 *   locales: Record<string, Record<string, string>>;
 * }>} config
 */
const withLocalizedInfoPlist = (config, { locales }) => {
  return withDangerousMod(config, [
    'ios',
    async (cfg) => {
      const projectRoot = cfg.modRequest.platformProjectRoot;
      const projectName = cfg.modRequest.projectName;
      if (!projectName) {
        throw new Error('withLocalizedInfoPlist: projectName missing from modRequest');
      }

      for (const [lang, strings] of Object.entries(locales)) {
        const lprojDir = path.join(projectRoot, projectName, `${lang}.lproj`);
        fs.mkdirSync(lprojDir, { recursive: true });

        // Format: `"KEY" = "value";` — one per line, double quotes
        // inside values escaped. UTF-8 is what Xcode expects (UTF-16
        // also works but UTF-8 is friendlier for source diffs).
        const content =
          Object.entries(strings)
            .map(([key, value]) => `"${key}" = "${value.replace(/"/g, '\\"')}";`)
            .join('\n') + '\n';

        fs.writeFileSync(path.join(lprojDir, 'InfoPlist.strings'), content, 'utf8');
      }

      return cfg;
    },
  ]);
};

module.exports = withLocalizedInfoPlist;
