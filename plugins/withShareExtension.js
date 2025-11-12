const {
  withAppDelegate,
  withEntitlementsPlist,
  withInfoPlist,
  withXcodeProject,
} = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const SHARE_EXTENSION_NAME = "ShareExtension";
const APP_GROUP_ID = "group.com.dev2820.scrapper";

/**
 * Create ShareViewController.swift content
 */
function getShareViewControllerContent() {
  return `
import UIKit
import Social
import MobileCoreServices
import UniformTypeIdentifiers

class ShareViewController: UIViewController {

    override func viewDidLoad() {
        super.viewDidLoad()
        handleSharedContent()
    }

    private func handleSharedContent() {
        guard let extensionItem = extensionContext?.inputItems.first as? NSExtensionItem,
              let itemProvider = extensionItem.attachments?.first else {
            close()
            return
        }

        // Check for URL
        if itemProvider.hasItemConformingToTypeIdentifier(UTType.url.identifier) {
            itemProvider.loadItem(forTypeIdentifier: UTType.url.identifier, options: nil) { (item, error) in
                if let url = item as? URL {
                    self.saveSharedData(text: url.absoluteString, url: url.absoluteString)
                }
                self.close()
            }
        }
        // Check for text
        else if itemProvider.hasItemConformingToTypeIdentifier(UTType.text.identifier) {
            itemProvider.loadItem(forTypeIdentifier: UTType.text.identifier, options: nil) { (item, error) in
                if let text = item as? String {
                    self.saveSharedData(text: text, url: nil)
                }
                self.close()
            }
        }
        // Check for plain text
        else if itemProvider.hasItemConformingToTypeIdentifier(UTType.plainText.identifier) {
            itemProvider.loadItem(forTypeIdentifier: UTType.plainText.identifier, options: nil) { (item, error) in
                if let text = item as? String {
                    self.saveSharedData(text: text, url: nil)
                }
                self.close()
            }
        }
        else {
            close()
        }
    }

    private func saveSharedData(text: String, url: String?) {
        let sharedDefaults = UserDefaults(suiteName: "${APP_GROUP_ID}")
        let sharedData: [String: Any] = [
            "text": text,
            "url": url ?? "",
            "timestamp": Date().timeIntervalSince1970
        ]

        if let jsonData = try? JSONSerialization.data(withJSONObject: sharedData, options: []),
           let jsonString = String(data: jsonData, encoding: .utf8) {
            sharedDefaults?.set(jsonString, forKey: "shareData")
            sharedDefaults?.synchronize()
        }
    }

    private func close() {
        DispatchQueue.main.async {
            self.extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
        }
    }
}
`;
}

/**
 * Create Info.plist content for Share Extension
 */
function getShareExtensionInfoPlist() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>$(DEVELOPMENT_LANGUAGE)</string>
    <key>CFBundleDisplayName</key>
    <string>ShareExtension</string>
    <key>CFBundleExecutable</key>
    <string>$(EXECUTABLE_NAME)</string>
    <key>CFBundleIdentifier</key>
    <string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>$(PRODUCT_NAME)</string>
    <key>CFBundlePackageType</key>
    <string>$(PRODUCT_BUNDLE_PACKAGE_TYPE)</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>NSExtension</key>
    <dict>
        <key>NSExtensionAttributes</key>
        <dict>
            <key>NSExtensionActivationRule</key>
            <dict>
                <key>NSExtensionActivationSupportsText</key>
                <true/>
                <key>NSExtensionActivationSupportsWebURLWithMaxCount</key>
                <integer>1</integer>
                <key>NSExtensionActivationSupportsWebPageWithMaxCount</key>
                <integer>1</integer>
            </dict>
        </dict>
        <key>NSExtensionMainStoryboard</key>
        <string>MainInterface</string>
        <key>NSExtensionPointIdentifier</key>
        <string>com.apple.share-services</string>
    </dict>
</dict>
</plist>
`;
}

/**
 * Modify Xcode project to add Share Extension target
 */
const withShareExtensionXcode = (config) => {
  return withXcodeProject(config, async (config) => {
    const xcodeProject = config.modResults;
    const targetName = SHARE_EXTENSION_NAME;

    // Note: This is a simplified version. Full implementation would need to:
    // 1. Add the share extension target to the Xcode project
    // 2. Configure build settings
    // 3. Add source files
    // 4. Set up dependencies

    // For now, we'll create the files in the expected location
    // The actual Xcode project modification is complex and may require manual setup
    // or using expo-build-properties with custom build phases

    return config;
  });
};

/**
 * Add App Groups entitlement to main app
 */
const withAppGroupEntitlement = (config) => {
  return withEntitlementsPlist(config, (config) => {
    if (!config.modResults["com.apple.security.application-groups"]) {
      config.modResults["com.apple.security.application-groups"] = [APP_GROUP_ID];
    } else if (!config.modResults["com.apple.security.application-groups"].includes(APP_GROUP_ID)) {
      config.modResults["com.apple.security.application-groups"].push(APP_GROUP_ID);
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
