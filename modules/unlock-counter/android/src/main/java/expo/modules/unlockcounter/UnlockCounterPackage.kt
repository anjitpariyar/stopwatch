package expo.modules.unlockcounter

import android.app.Application
import android.appwidget.AppWidgetManager
import android.content.BroadcastReceiver
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Handler
import android.os.Looper
import expo.modules.core.interfaces.ApplicationLifecycleListener
import expo.modules.core.interfaces.Package

class UnlockCounterPackage : Package {
  override fun createApplicationLifecycleListeners(context: Context): List<ApplicationLifecycleListener> {
    return listOf(UnlockLifecycleListener())
  }
}

/**
 * Best-effort live widget refresh, with no service and no notification.
 *
 * Android 8+ doesn't deliver USER_PRESENT to manifest receivers, so we register
 * at runtime whenever our process starts (app launch or a widget update). While
 * the process stays alive, each unlock nudges our widgets to re-sync. Once the
 * OS kills the process we fall back to the widgets' periodic update; the counts
 * stay exact either way because they come from the system log.
 */
class UnlockLifecycleListener : ApplicationLifecycleListener {
  override fun onCreate(application: Application) {
    val receiver = object : BroadcastReceiver() {
      override fun onReceive(context: Context, intent: Intent) {
        // Give the system a moment to write the KEYGUARD_HIDDEN event.
        Handler(Looper.getMainLooper()).postDelayed({ refreshWidgets(context) }, 1500)
      }
    }
    // USER_PRESENT is a protected system broadcast, so no export flag is needed.
    application.registerReceiver(receiver, IntentFilter(Intent.ACTION_USER_PRESENT))
  }

  private fun refreshWidgets(context: Context) {
    val manager = AppWidgetManager.getInstance(context)
    val providers = manager.getInstalledProviders().filter { it.provider.packageName == context.packageName }
    for (info in providers) {
      val component: ComponentName = info.provider
      val ids = manager.getAppWidgetIds(component)
      if (ids.isEmpty()) continue
      val intent = Intent(AppWidgetManager.ACTION_APPWIDGET_UPDATE)
        .setComponent(component)
        .putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids)
      context.sendBroadcast(intent)
    }
  }
}
