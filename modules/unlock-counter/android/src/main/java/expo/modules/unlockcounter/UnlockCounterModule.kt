package expo.modules.unlockcounter

import android.content.Intent
import android.provider.Settings
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class UnlockCounterModule : Module() {
  private val context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  override fun definition() = ModuleDefinition {
    Name("UnlockCounter")

    Function("isSupported") {
      UnlockStore.isSupported()
    }

    Function("hasUsageAccess") {
      UnlockStore.hasUsageAccess(context)
    }

    AsyncFunction("openUsageAccessSettings") {
      val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
      val activity = appContext.currentActivity
      if (activity != null) {
        activity.startActivity(intent)
      } else {
        context.startActivity(intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
      }
    }

    // Pulls new unlock events from the system log and returns the full
    // { "YYYY-MM-DD": count } history.
    AsyncFunction("sync") {
      UnlockStore.sync(context)
    }
  }
}
