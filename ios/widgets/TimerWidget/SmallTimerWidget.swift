import SwiftUI
import WidgetKit

struct SmallTimerWidgetView: View {
    let entry: TimerWidgetEntry

    var body: some View {
        if let title = entry.taskTitle, let time = entry.displayTime {
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.system(size: 13, weight: .semibold))
                    .lineLimit(1)
                    .foregroundColor(.primary)

                Spacer()

                Text(time)
                    .font(.system(size: 28, weight: .bold, design: .rounded))
                    .foregroundColor(.accentColor)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(12)
        } else {
            VStack(spacing: 6) {
                Image(systemName: "timer")
                    .font(.system(size: 24))
                    .foregroundColor(.secondary)
                Text("Start a focus session")
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }
            .padding(12)
        }
    }
}

struct SmallTimerWidget: Widget {
    let kind = "SmallTimerWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: TimerWidgetProvider()) { entry in
            SmallTimerWidgetView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Timer")
        .description("Shows your active focus timer.")
        .supportedFamilies([.systemSmall])
    }
}