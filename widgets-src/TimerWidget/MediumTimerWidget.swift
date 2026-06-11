import SwiftUI
import WidgetKit

struct MediumTimerWidgetView: View {
    let entry: TimerWidgetEntry

    var body: some View {
        if let title = entry.taskTitle, let time = entry.displayTime, let phase = entry.phase {
            HStack(spacing: 12) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(phase)
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(.secondary)
                        .textCase(.uppercase)

                    Text(title)
                        .font(.system(size: 15, weight: .semibold))
                        .lineLimit(1)
                        .foregroundColor(.primary)

                    Spacer()

                    Text(time)
                        .font(.system(size: 32, weight: .bold, design: .rounded))
                        .foregroundColor(.accentColor)
                }

                Spacer()

                ZStack {
                    Circle()
                        .stroke(Color.secondary.opacity(0.2), lineWidth: 6)

                    Circle()
                        .trim(from: 0, to: entry.progress)
                        .stroke(Color.accentColor, style: StrokeStyle(lineWidth: 6, lineCap: .round))
                        .rotationEffect(.degrees(-90))

                    Image(systemName: entry.status == "paused" ? "pause.fill" : "play.fill")
                        .font(.system(size: 14))
                        .foregroundColor(.accentColor)
                }
                .frame(width: 48, height: 48)
            }
            .padding(14)
        } else {
            VStack(spacing: 8) {
                Image(systemName: "timer")
                    .font(.system(size: 28))
                    .foregroundColor(.secondary)

                Text("No active session")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(.secondary)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .padding(14)
        }
    }
}

struct MediumTimerWidget: Widget {
    let kind = "MediumTimerWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: TimerWidgetProvider()) { entry in
            MediumTimerWidgetView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Focus Timer")
        .description("Shows your active timer with progress.")
        .supportedFamilies([.systemMedium])
    }
}