package package_name

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class TimerRadarWidgetModule(
  private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {
  override fun getName(): String = "TimerRadarWidget"

  @ReactMethod
  fun setWidgetData(json: String, packageName: String?) {
    val targetPackageName = packageName ?: reactContext.packageName
    reactContext
      .getSharedPreferences("$targetPackageName.widgetdata", Context.MODE_PRIVATE)
      .edit()
      .putString("widgetdata", json)
      .apply()

    val widgetManager = AppWidgetManager.getInstance(reactContext)
    val updateIntent = Intent(AppWidgetManager.ACTION_APPWIDGET_UPDATE)
    val widgetProviders = reactContext.packageManager.queryBroadcastReceivers(
      Intent(AppWidgetManager.ACTION_APPWIDGET_UPDATE),
      PackageManager.GET_META_DATA
    )

    for (provider in widgetProviders) {
      if (provider.activityInfo.packageName == targetPackageName) {
        val providerComponent = ComponentName(
          provider.activityInfo.packageName,
          provider.activityInfo.name
        )
        val widgetIds = widgetManager.getAppWidgetIds(providerComponent)
        updateIntent.component = providerComponent
        updateIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, widgetIds)
        reactContext.sendBroadcast(updateIntent)
      }
    }
  }
}
