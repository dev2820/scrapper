const {
  withEntitlementsPlist,
  withXcodeProject,
} = require("@expo/config-plugins");

const APP_GROUP_ID = "group.com.dev2820.scrapper";

/**
 * Modify Xcode project to add Share Extension target
 */
const withShareExtensionXcode = (config) => {
  return withXcodeProject(config, async (config) => {
    return config;
  });
};

/**
 * Add App Groups entitlement to main app
 */
const withAppGroupEntitlement = (config) => {
  return withEntitlementsPlist(config, (config) => {
    if (!config.modResults["com.apple.security.application-groups"]) {
      config.modResults["com.apple.security.application-groups"] = [
        APP_GROUP_ID,
      ];
    } else if (
      !config.modResults["com.apple.security.application-groups"].includes(
        APP_GROUP_ID,
      )
    ) {
      config.modResults["com.apple.security.application-groups"].push(
        APP_GROUP_ID,
      );
    }
    return config;
  });
};

/**
 * Main plugin function
 */
const withShareExtension = (config, options = {}) => {
  // Apply all modifications
  config = withAppGroupEntitlement(config);
  config = withShareExtensionXcode(config);

  return config;
};

module.exports = withShareExtension;
