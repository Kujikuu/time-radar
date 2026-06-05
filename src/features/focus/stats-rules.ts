import type {
  BarPoint,
  DistributionItem,
  FocusCategory,
  FocusSession,
  StatsRange,
  StatsSummary,
} from './types';

export type FocusCategoryColors = Record<FocusCategory, string>;

type StatsSummaryInput = {
  range: StatsRange;
  sessions: FocusSession[];
  previousSessions: FocusSession[];
  categoryColors: FocusCategoryColors;
  now?: Date;
};

const focusCategories: FocusCategory[] = ['Work', 'Study', 'Personal'];

export function buildStatsSummary({
  range,
  sessions,
  previousSessions,
  categoryColors,
  now = new Date(),
}: StatsSummaryInput): StatsSummary {
  const focusSessions = sessions.filter((session) => session.phase === 'focus');
  const previousFocusSessions = previousSessions.filter((session) => session.phase === 'focus');
  const focusMinutes = sumSessions(focusSessions);
  const previousMinutes = sumSessions(previousFocusSessions);
  const trendPercent =
    previousMinutes === 0
      ? focusMinutes > 0
        ? 100
        : 0
      : Math.round(((focusMinutes - previousMinutes) / previousMinutes) * 100);

  return {
    range,
    label: rangeLabel(range, now),
    focusTime: formatMinutes(focusMinutes),
    focusMinutes,
    sessions: String(focusSessions.length),
    focusScore: `${Math.min(100, focusSessions.length * 25)}%`,
    trendPercent,
    hourlyFocus: buildBars(range, focusSessions),
    distribution: buildDistribution(focusSessions, categoryColors),
  };
}

export function emptyStats(
  range: StatsRange,
  categoryColors: FocusCategoryColors,
  now = new Date()
): StatsSummary {
  return {
    range,
    label: rangeLabel(range, now),
    focusTime: formatMinutes(0),
    focusMinutes: 0,
    sessions: '0',
    focusScore: '0%',
    trendPercent: 0,
    hourlyFocus: buildBars(range, []),
    distribution: buildDistribution([], categoryColors),
  };
}

export function rangeWindow(range: StatsRange, now = new Date()) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  if (range === 'Week') {
    const day = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - day);
  } else if (range === 'Month') {
    start.setDate(1);
  } else if (range === 'Year') {
    start.setMonth(0, 1);
  }

  const end = new Date(start);
  if (range === 'Day') {
    end.setDate(end.getDate() + 1);
  } else if (range === 'Week') {
    end.setDate(end.getDate() + 7);
  } else if (range === 'Month') {
    end.setMonth(end.getMonth() + 1);
  } else {
    end.setFullYear(end.getFullYear() + 1);
  }

  return { start, end };
}

export function previousRangeWindow(range: StatsRange, currentStart: Date) {
  const end = new Date(currentStart);
  const start = new Date(currentStart);

  if (range === 'Day') {
    start.setDate(start.getDate() - 1);
  } else if (range === 'Week') {
    start.setDate(start.getDate() - 7);
  } else if (range === 'Month') {
    start.setMonth(start.getMonth() - 1);
  } else {
    start.setFullYear(start.getFullYear() - 1);
  }

  return { start, end };
}

function formatMinutes(minutes: number) {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }

  return `${minutes}m`;
}

function buildBars(range: StatsRange, sessions: FocusSession[]): BarPoint[] {
  if (range === 'Day') {
    const buckets = [0, 3, 6, 9, 12, 15, 18, 21, 24];

    return buckets.map((hour) => ({
      label:
        hour === 0 || hour === 24
          ? '12 AM'
          : hour === 12
            ? '12 PM'
            : `${hour % 12} ${hour < 12 ? 'AM' : 'PM'}`,
      minutes: sumSessions(
        sessions.filter((session) => {
          const sessionHour = new Date(session.startedAt).getHours();
          return hour === 24 ? false : sessionHour >= hour && sessionHour < hour + 3;
        })
      ),
    }));
  }

  const labels =
    range === 'Week'
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : range === 'Year'
        ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        : ['1', '5', '10', '15', '20', '25', '30'];

  return labels.map((label, index) => ({
    label,
    minutes: sumSessions(
      sessions.filter((session) => {
        const date = new Date(session.startedAt);
        if (range === 'Week') {
          return (date.getDay() + 6) % 7 === index;
        }

        if (range === 'Year') {
          return date.getMonth() === index;
        }

        return Math.floor((date.getDate() - 1) / 5) === index;
      })
    ),
  }));
}

function buildDistribution(
  sessions: FocusSession[],
  categoryColors: FocusCategoryColors
): DistributionItem[] {
  return focusCategories.map((category) => ({
    label: category,
    minutes: sumSessions(sessions.filter((session) => session.category === category)),
    color: categoryColors[category],
  }));
}

function sumSessions(sessions: FocusSession[]) {
  return Math.round(sessions.reduce((sum, session) => sum + session.actualSeconds, 0) / 60);
}

function rangeLabel(range: StatsRange, now: Date) {
  if (range === 'Day') {
    return `Today, ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }

  return range;
}
