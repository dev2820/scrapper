const profile = process.env.EAS_BUILD_PROFILE ?? "development";

module.exports = {
  expo: {
    name: profile === "development" ? "scrapper (dev)" : "scrapper",
    slug: "scrapper",
    version: "1.0.1",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "scrapper",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.dev2820.scrapper",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
      entitlements: {
        "com.apple.security.application-groups": ["group.com.dev2820.scrapper"],
      },
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.dev2820.scrapper",
      softwareKeyboardLayoutMode: "resize",
      intentFilters: [
        {
          action: "SEND",
          type: "text/plain",
          category: ["DEFAULT"],
        },
      ],
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
      bundler: "metro",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000",
          },
        },
      ],
      // "./plugins/withShareExtension",
      // "./plugins/withShareTarget.js",
      [
        "expo-share-intent",
        {
          iosActivationRules: {
            NSExtensionActivationSupportsText: true,
            NSExtensionActivationSupportsWebURLWithMaxCount: 1,
            NSExtensionActivationSupportsWebPageWithMaxCount: 1,
          },
          androidIntentFilters: ["text/*"],
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      eas: {
        projectId: "9f1a17e6-836b-430c-95f9-83625142f75a",
      },
    },
  },
};
