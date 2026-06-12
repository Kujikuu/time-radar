package package_name

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.view.View
import android.widget.RemoteViews
import kotlin.math.roundToInt
import org.json.JSONObject

class TimerRadarWidgetProvider : AppWidgetProvider() {
  override fun onUpdate(
    context: Context,
    appWidgetManager: AppWidgetManager,
    appWidgetIds: IntArray
  ) {
    appWidgetIds.forEach { appWidgetId ->
      updateAppWidget(context, appWidgetManager, appWidgetId)
    }
  }

  companion object {
    fun updateAppWidget(
      context: Context,
      appWidgetManager: AppWidgetManager,
      appWidgetId: Int
    ) {
      val views = RemoteViews(context.packageName, R.layout.timer_radar_widget)
      val entry = readEntry(context)
      val launchIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)

      if (launchIntent != null) {
        val pendingIntent = PendingIntent.getActivity(
          context,
          0,
          launchIntent,
          PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.widget_root, pendingIntent)
      }

      if (entry != null) {
        views.setTextViewText(R.id.widget_phase, entry.phase)
        views.setTextViewText(R.id.widget_title, entry.taskTitle)
        views.setTextViewText(R.id.widget_time, entry.displayTime)
        views.setTextViewText(R.id.widget_status, entry.status.uppercase())
        views.setViewVisibility(R.id.widget_progress, View.VISIBLE)
        views.setProgressBar(
          R.id.widget_progress,
          100,
          (entry.progress * 100).roundToInt().coerceIn(0, 100),
          false
        )
      } else {
        views.setTextViewText(R.id.widget_phase, "Time Radar")
        views.setTextViewText(R.id.widget_title, "Start a focus session")
        views.setTextViewText(R.id.widget_time, "--:--")
        views.setTextViewText(R.id.widget_status, "READY")
        views.setViewVisibility(R.id.widget_progress, View.GONE)
      }

      appWidgetManager.updateAppWidget(appWidgetId, views)
    }

    private fun readEntry(context: Context): TimerWidgetEntry? {
      val preferences = context.getSharedPreferences(
        context.packageName + ".widgetdata",
        Context.MODE_PRIVATE
      )
      val raw = preferences.getString("widgetdata", null) ?: return null

      return try {
        val json = JSONObject(raw)
        TimerWidgetEntry(
          taskTitle = json.optString("taskTitle").ifBlank { "Focus" },
          phase = json.optString("phase").ifBlank { "Focus" },
          status = json.optString("status").ifBlank { "running" },
          displayTime = json.optString("displayTime").ifBlank { "--:--" },
          progress = json.optDouble("progress", 0.0)
        )
      } catch (_: Exception) {
        null
      }
    }
  }
}

private data class TimerWidgetEntry(
  val taskTitle: String,
  val phase: String,
  val status: String,
  val displayTime: String,
  val progress: Double
)
