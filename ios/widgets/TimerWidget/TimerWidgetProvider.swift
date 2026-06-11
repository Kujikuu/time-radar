import WidgetKit

struct TimerWidgetProvider: TimelineProvider {
    let suiteName = "group.com.sniper.timeradar"

    func placeholder(in context: Context) -> TimerWidgetEntry {
        TimerWidgetEntry(
            date: Date(),
            taskTitle: "Project Proposal",
            phase: "Focus",
            status: "running",
            displayTime: "20:45",
            progress: 0.17
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (TimerWidgetEntry) -> Void) {
        completion(placeholder(in: context))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<TimerWidgetEntry>) -> Void) {
        let entry = readWidgetData()
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 5, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }

    private func readWidgetData() -> TimerWidgetEntry {
        guard let defaults = UserDefaults(suiteName: suiteName),
              let raw = defaults.string(forKey: "timer-widget-data"),
              let data = raw.data(using: .utf8),
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any]
        else {
            return TimerWidgetEntry(
                date: Date(),
                taskTitle: nil,
                phase: nil,
                status: nil,
                displayTime: nil,
                progress: 0
            )
        }

        return TimerWidgetEntry(
            date: Date(),
            taskTitle: data["taskTitle"] as? String,
            phase: data["phase"] as? String,
            status: data["status"] as? String,
            displayTime: data["displayTime"] as? String,
            progress: data["progress"] as? Double ?? 0
        )
    }
}