import SwiftUI

@main
struct TimerWidgetBundle: WidgetBundle {
    var body: some Widget {
        SmallTimerWidget()
        MediumTimerWidget()
    }
}