import WidgetKit

struct TimerWidgetEntry: TimelineEntry {
    let date: Date
    let taskTitle: String?
    let phase: String?
    let status: String?
    let displayTime: String?
    let progress: Double
}