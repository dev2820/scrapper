const {
  withAndroidManifest,
  withDangerousMod,
} = require("@expo/config-plugins");
const path = require("path");
const fs = require("fs");

/**
 * Add SEND intent filter to AndroidManifest.xml
 */
function addShareIntentFilter(androidManifest) {
  const { manifest } = androidManifest;

  if (!Array.isArray(manifest.application)) {
    console.warn("withShareTarget: No application array in manifest");
    return androidManifest;
  }

  const application = manifest.application[0];
  if (!Array.isArray(application.activity)) {
    console.warn("withShareTarget: No activity array in application");
    return androidManifest;
  }

  // Find MainActivity
  const mainActivity = application.activity.find(
    (activity) =>
      activity.$["android:name"] === ".MainActivity" ||
      activity.$["android:name"] === "com.dev2820.scrapper.MainActivity",
  );

  if (!mainActivity) {
    console.warn("withShareTarget: MainActivity not found");
    return androidManifest;
  }

  // Check if SEND intent filter already exists
  const hasShareIntent = mainActivity["intent-filter"]?.some((filter) => {
    return filter.action?.some(
      (action) => action.$["android:name"] === "android.intent.action.SEND",
    );
  });

  if (!hasShareIntent) {
    if (!Array.isArray(mainActivity["intent-filter"])) {
      mainActivity["intent-filter"] = [];
    }

    // Add SEND intent filter
    mainActivity["intent-filter"].push({
      action: [{ $: { "android:name": "android.intent.action.SEND" } }],
      category: [{ $: { "android:name": "android.intent.category.DEFAULT" } }],
      data: [{ $: { "android:mimeType": "text/plain" } }],
    });

    console.log("withShareTarget: Added SEND intent filter");
  }

  return androidManifest;
}

/**
 * Main plugin function
 */
const withShareTarget = (config) => {
  // Add intent filter to AndroidManifest
  config = withAndroidManifest(config, (config) => {
    config.modResults = addShareIntentFilter(config.modResults);
    return config;
  });

  // Add Kotlin files after android project is created
  config = withDangerousMod(config, [
    "android",
    async (config) => {
      // First create the Kotlin files
      const packageName = "com.dev2820.scrapper";
      const packagePath = packageName.replace(/\./g, "/");
      const targetDir = path.join(
        config.modRequest.platformProjectRoot,
        "app",
        "src",
        "main",
        "java",
        packagePath,
      );

      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // Create ShareTargetModule.kt
      const shareTargetModuleContent = `package ${packageName}

import android.content.Intent
import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.Arguments
import com.facebook.react.modules.core.DeviceEventManagerModule

class ShareTargetModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private var initialShareData: String? = null
    private var hasConsumedInitialShare = false

    init {
        // Register listener for new shares when app is running
        MainActivity.shareListener = { intent ->
            Log.d("ShareTargetModule", "shareListener - New share received")
            handleIntent(intent)
        }

        // Check for static shared intent from MainActivity
        MainActivity.sharedIntent?.let { intent ->
            Log.d("ShareTargetModule", "init - Found sharedIntent in MainActivity")
            handleIntent(intent)
            MainActivity.sharedIntent = null
        }
    }

    override fun getName(): String {
        return "ShareTargetModule"
    }

    @ReactMethod
    fun getInitialShare(promise: Promise) {
        try {
            // Check for new shared intent from MainActivity
            MainActivity.sharedIntent?.let { intent ->
                Log.d("ShareTargetModule", "getInitialShare - Found new sharedIntent")
                handleIntent(intent)
                MainActivity.sharedIntent = null
            }

            Log.d("ShareTargetModule", "getInitialShare - hasConsumed: \$hasConsumedInitialShare, data: \$initialShareData")
            if (hasConsumedInitialShare) {
                promise.resolve(null)
                return
            }

            if (initialShareData != null) {
                val result = Arguments.createMap()
                result.putString("data", initialShareData)
                result.putString("mimeType", "text/plain")
                hasConsumedInitialShare = true
                promise.resolve(result)
            } else {
                promise.resolve(null)
            }
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Required for RN event emitter
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Required for RN event emitter
    }

    fun handleIntent(intent: Intent?) {
        Log.d("ShareTargetModule", "handleIntent - intent: \$intent")
        if (intent?.action == Intent.ACTION_SEND) {
            if (intent.type == "text/plain") {
                val sharedText = intent.getStringExtra(Intent.EXTRA_TEXT)
                Log.d("ShareTargetModule", "handleIntent - sharedText: \$sharedText")
                if (sharedText != null) {
                    initialShareData = sharedText

                    // If React Native is already initialized, send event
                    if (reactApplicationContext.hasActiveReactInstance()) {
                        Log.d("ShareTargetModule", "handleIntent - Sending event")
                        sendShareEvent(sharedText)
                    } else {
                        Log.d("ShareTargetModule", "handleIntent - Storing for later")
                    }
                }
            }
        }
    }

    private fun sendShareEvent(text: String) {
        val params = Arguments.createMap()
        params.putString("data", text)
        params.putString("mimeType", "text/plain")

        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("ShareTargetEvent", params)
    }

    companion object {
        const val NAME = "ShareTargetModule"
    }
}
`;

      // Create ShareTargetPackage.kt
      const shareTargetPackageContent = `package ${packageName}

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class ShareTargetPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        return listOf(ShareTargetModule(reactContext))
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return emptyList()
    }
}
`;

      fs.writeFileSync(
        path.join(targetDir, "ShareTargetModule.kt"),
        shareTargetModuleContent,
      );
      fs.writeFileSync(
        path.join(targetDir, "ShareTargetPackage.kt"),
        shareTargetPackageContent,
      );

      console.log("✓ Created ShareTarget Kotlin files");

      // Now modify MainApplication.kt
      const mainApplicationPath = path.join(
        config.modRequest.platformProjectRoot,
        "app",
        "src",
        "main",
        "java",
        "com",
        "dev2820",
        "scrapper",
        "MainApplication.kt",
      );

      if (fs.existsSync(mainApplicationPath)) {
        let contents = fs.readFileSync(mainApplicationPath, "utf8");

        if (!contents.includes("ShareTargetPackage()")) {
          const packagesRegex =
            /(\/\/ Packages that cannot be autolinked yet can be added manually here[^\n]*\n[^\n]*\/\/ add\(MyReactNativePackage\(\)\))/;
          if (packagesRegex.test(contents)) {
            contents = contents.replace(
              packagesRegex,
              "$1\n              add(ShareTargetPackage())",
            );
            fs.writeFileSync(mainApplicationPath, contents);
            console.log("✓ Modified MainApplication.kt");
          }
        }
      }

      // Now modify MainActivity.kt
      const mainActivityPath = path.join(
        config.modRequest.platformProjectRoot,
        "app",
        "src",
        "main",
        "java",
        "com",
        "dev2820",
        "scrapper",
        "MainActivity.kt",
      );

      if (fs.existsSync(mainActivityPath)) {
        let contents = fs.readFileSync(mainActivityPath, "utf8");

        if (!contents.includes("handleShareIntent")) {
          // Add imports
          if (!contents.includes("import android.content.Intent")) {
            contents = contents.replace(
              /(import android\.os\.Bundle)/,
              "$1\nimport android.content.Intent",
            );
          }

          if (!contents.includes("import android.util.Log")) {
            contents = contents.replace(
              /(import android\.content\.Intent)/,
              "$1\nimport android.util.Log",
            );
          }

          if (
            !contents.includes("import com.facebook.react.bridge.ReactContext")
          ) {
            contents = contents.replace(
              /(import com\.facebook\.react\.defaults\.DefaultReactActivityDelegate)/,
              "$1\nimport com.facebook.react.bridge.ReactContext",
            );
          }

          // Add companion object and pendingIntent field after class declaration
          const classDeclaration = /class MainActivity : ReactActivity\(\) \{/;
          if (classDeclaration.test(contents)) {
            contents = contents.replace(
              classDeclaration,
              `class MainActivity : ReactActivity() {
  companion object {
    @Volatile
    var sharedIntent: Intent? = null
    @Volatile
    var shareListener: ((Intent) -> Unit)? = null
  }

  private var pendingIntent: Intent? = null
`,
            );
          }

          // Modify onCreate to store pending intent
          const onCreateEnd = /super\.onCreate\(null\)\s*\n/;
          if (onCreateEnd.test(contents)) {
            contents = contents.replace(
              onCreateEnd,
              `super.onCreate(null)

    // DEBUG: Log intent details
    Log.d("ShareTarget", "onCreate - Intent action: \${intent?.action}")
    Log.d("ShareTarget", "onCreate - Intent type: \${intent?.type}")
    if (intent?.action == Intent.ACTION_SEND) {
      val sharedText = intent.getStringExtra(Intent.EXTRA_TEXT)
      Log.d("ShareTarget", "onCreate - SEND intent received! Text: \$sharedText")
      sharedIntent = intent
      pendingIntent = intent
    }
  }

  override fun onResume() {
    super.onResume()
    Log.d("ShareTarget", "onResume - pendingIntent: \$pendingIntent")
    // Try to handle pending intent when activity resumes
    pendingIntent?.let { intent ->
      Log.d("ShareTarget", "onResume - Handling pending intent")
      handleShareIntent(intent)
      pendingIntent = null
    }
  }

  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    setIntent(intent)
    Log.d("ShareTarget", "onNewIntent - Intent action: \${intent.action}")
    if (intent.action == Intent.ACTION_SEND) {
      sharedIntent = intent
      // Notify listener if registered
      shareListener?.invoke(intent)
      Log.d("ShareTarget", "onNewIntent - Notified shareListener")
    }
    handleShareIntent(intent)
`,
            );
          }

          // Add handleShareIntent method
          const mainComponentRegex =
            /(\/\*\*\s*\n\s*\* Returns the name of the main component)/;
          if (mainComponentRegex.test(contents)) {
            contents = contents.replace(
              mainComponentRegex,
              `  private fun handleShareIntent(intent: Intent) {
    Log.d("ShareTarget", "handleShareIntent - Intent action: \${intent.action}")
    val reactInstanceManager = reactNativeHost.reactInstanceManager
    val reactContext = reactInstanceManager.currentReactContext

    Log.d("ShareTarget", "handleShareIntent - React context: \$reactContext")
    if (reactContext != null) {
      val shareTargetModule = reactContext.getNativeModule(ShareTargetModule::class.java)
      Log.d("ShareTarget", "handleShareIntent - ShareTargetModule: \$shareTargetModule")
      shareTargetModule?.handleIntent(intent)
    } else {
      Log.d("ShareTarget", "handleShareIntent - React context not ready, storing as pending")
      // If React context not ready, store as pending
      if (intent.action == Intent.ACTION_SEND) {
        pendingIntent = intent
      }
    }
  }

  $1`,
            );
          }

          fs.writeFileSync(mainActivityPath, contents);
          console.log("✓ Modified MainActivity.kt");
        }
      }

      return config;
    },
  ]);

  return config;
};

module.exports = withShareTarget;
