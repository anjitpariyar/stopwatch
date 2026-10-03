package expo.modules.unlockcounter

import android.app.AppOpsManager
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.os.Build
import android.os.Process
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * Source of truth for unlock counts.
 *
 * Android keeps a short rolling log of KEYGUARD_HIDDEN events (one per unlock).
 * Every sync reads the events since the last sync, buckets them by local day and
 * folds them into a permanent per-day history in SharedPreferences, so history
 * outlives the system log.
 *
 * The app screen and the headless widget task run in the same process, so the
 * lock on [sync] is enough to stop them double-counting the same events.
 */
object UnlockStore {
  private const val PREFS = "unlock_counter"
  private const val KEY_DAYS = "days"
  private const val KEY_LAST_SYNC = "lastSync"

  // How far back to look on the very first sync. The system log rarely holds more.
  private const val BACKFILL_MS = 10L * 24 * 60 * 60 * 1000

  // A screen shown over the keyguard (camera, call) can produce back-to-back
  // events for one physical unlock; collapse anything closer than this.
  private const val DEDUPE_MS = 1500L

  fun isSupported(): Boolean = Build.VERSION.SDK_INT >= Build.VERSION_CODES.P

  fun hasUsageAccess(context: Context): Boolean {
    val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
    val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      appOps.unsafeCheckOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), context.packageName)
    } else {
      @Suppress("DEPRECATION")
      appOps.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), context.packageName)
    }
    return mode == AppOpsManager.MODE_ALLOWED
  }

  @Synchronized
  fun sync(context: Context): Map<String, Int> {
    val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    val days = readDays(prefs.getString(KEY_DAYS, null))

    if (!isSupported() || !hasUsageAccess(context)) return days

    val usm = context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
    val now = System.currentTimeMillis()
    val lastSync = prefs.getLong(KEY_LAST_SYNC, 0L)
    val from = if (lastSync > 0) lastSync else now - BACKFILL_MS

    // null while the user is still locked after boot (direct boot); try again later.
    val events = usm.queryEvents(from, now) ?: return days

    val fmt = SimpleDateFormat("yyyy-MM-dd", Locale.US)
    val event = UsageEvents.Event()
    var lastCounted = 0L
    while (events.hasNextEvent()) {
      events.getNextEvent(event)
      if (event.eventType != UsageEvents.Event.KEYGUARD_HIDDEN) continue
      if (event.timeStamp - lastCounted < DEDUPE_MS) continue
      lastCounted = event.timeStamp
      val key = fmt.format(Date(event.timeStamp))
      days[key] = (days[key] ?: 0) + 1
    }

    prefs.edit()
      .putString(KEY_DAYS, JSONObject(days as Map<*, *>).toString())
      .putLong(KEY_LAST_SYNC, now)
      .apply()
    return days
  }

  private fun readDays(raw: String?): MutableMap<String, Int> {
    val out = mutableMapOf<String, Int>()
    if (raw == null) return out
    try {
      val json = JSONObject(raw)
      for (key in json.keys()) out[key] = json.getInt(key)
    } catch (_: Exception) {
      // corrupt prefs: start fresh rather than crash the widget
    }
    return out
  }
}
