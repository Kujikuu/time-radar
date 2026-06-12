import { HStack, ProgressView, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import {
  background,
  containerBackground,
  font,
  foregroundStyle,
  frame,
  lineLimit,
  minimumScaleFactor,
  monospacedDigit,
  padding,
  progressViewStyle,
  tint,
  widgetURL,
} from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

import type { TimerWidgetData } from './types';

export const FOCUS_TIMER_WIDGET_NAME = 'FocusTimerWidget';

export const EMPTY_TIMER_WIDGET_DATA: TimerWidgetData = {
  taskTitle: 'Start a focus session',
  phase: 'Time Radar',
  status: 'paused',
  remainingSeconds: 0,
  plannedSeconds: 0,
  displayTime: '--:--',
  progress: 0,
  updatedAt: '',
};

function normalizeProgress(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(Math.max(value, 0), 1);
}

function statusLabel(status: TimerWidgetData['status']): string {
  return status === 'running' ? 'Running' : 'Paused';
}

function resolveTimerWidgetData(props: Partial<TimerWidgetData> | null | undefined): {
  data: TimerWidgetData;
  hasTimer: boolean;
} {
  const updatedAt = typeof props?.updatedAt === 'string' ? props.updatedAt : '';

  if (updatedAt.length === 0) {
    return { data: EMPTY_TIMER_WIDGET_DATA, hasTimer: false };
  }

  return {
    data: {
      taskTitle:
        typeof props?.taskTitle === 'string' && props.taskTitle.length > 0
          ? props.taskTitle
          : EMPTY_TIMER_WIDGET_DATA.taskTitle,
      phase:
        typeof props?.phase === 'string' && props.phase.length > 0
          ? props.phase
          : EMPTY_TIMER_WIDGET_DATA.phase,
      status: props?.status === 'running' ? 'running' : 'paused',
      remainingSeconds:
        typeof props?.remainingSeconds === 'number'
          ? props.remainingSeconds
          : EMPTY_TIMER_WIDGET_DATA.remainingSeconds,
      plannedSeconds:
        typeof props?.plannedSeconds === 'number'
          ? props.plannedSeconds
          : EMPTY_TIMER_WIDGET_DATA.plannedSeconds,
      displayTime:
        typeof props?.displayTime === 'string' && props.displayTime.length > 0
          ? props.displayTime
          : EMPTY_TIMER_WIDGET_DATA.displayTime,
      progress:
        typeof props?.progress === 'number' ? props.progress : EMPTY_TIMER_WIDGET_DATA.progress,
      updatedAt,
    },
    hasTimer: true,
  };
}

export function FocusTimerWidgetView(
  props: Partial<TimerWidgetData>,
  environment: WidgetEnvironment
) {
  'widget';

  const { data, hasTimer } = resolveTimerWidgetData(props);
  const isSmall = environment.widgetFamily === 'systemSmall';
  const progress = normalizeProgress(data.progress);
  const status = hasTimer ? statusLabel(data.status) : 'Ready';

  if (isSmall) {
    return (
      <VStack
        alignment="leading"
        spacing={8}
        modifiers={[
          background('#FCF8F4'),
          containerBackground('#FCF8F4', 'widget'),
          padding({ all: 14 }),
          widgetURL('timeradar://'),
        ]}
      >
        <Text
          modifiers={[
            foregroundStyle('#475569'),
            font({ size: 11, weight: 'semibold' }),
            lineLimit(1),
          ]}
        >
          {data.phase}
        </Text>
        <Text
          modifiers={[
            foregroundStyle('#111827'),
            font({ size: 13, weight: 'semibold' }),
            lineLimit(2),
            minimumScaleFactor(0.76),
          ]}
        >
          {data.taskTitle}
        </Text>
        <Spacer minLength={0} />
        <Text
          modifiers={[
            foregroundStyle('#111827'),
            font({ size: 28, weight: 'bold', design: 'rounded' }),
            monospacedDigit(),
            lineLimit(1),
            minimumScaleFactor(0.78),
          ]}
        >
          {data.displayTime}
        </Text>
        <ProgressView
          value={progress}
          modifiers={[
            progressViewStyle('linear'),
            tint(data.status === 'running' ? '#F47E61' : '#64748B'),
          ]}
        />
      </VStack>
    );
  }

  return (
    <HStack
      alignment="center"
      spacing={14}
      modifiers={[
        background('#FCF8F4'),
        containerBackground('#FCF8F4', 'widget'),
        padding({ all: 16 }),
        widgetURL('timeradar://'),
      ]}
    >
      <VStack alignment="leading" spacing={7} modifiers={[frame({ maxWidth: 180 })]}>
        <Text
          modifiers={[
            foregroundStyle('#475569'),
            font({ size: 12, weight: 'semibold' }),
            lineLimit(1),
          ]}
        >
          {data.phase}
        </Text>
        <Text
          modifiers={[
            foregroundStyle('#111827'),
            font({ size: 14, weight: 'semibold' }),
            lineLimit(2),
            minimumScaleFactor(0.78),
          ]}
        >
          {data.taskTitle}
        </Text>
        <Spacer minLength={0} />
        <Text
          modifiers={[
            foregroundStyle('#111827'),
            font({ size: 30, weight: 'bold', design: 'rounded' }),
            monospacedDigit(),
            lineLimit(1),
            minimumScaleFactor(0.82),
          ]}
        >
          {data.displayTime}
        </Text>
      </VStack>
      <VStack alignment="trailing" spacing={8} modifiers={[frame({ maxWidth: 110 })]}>
        <Text
          modifiers={[
            foregroundStyle(data.status === 'running' ? '#F47E61' : '#64748B'),
            font({ size: 12, weight: 'bold' }),
            lineLimit(1),
          ]}
        >
          {status}
        </Text>
        <ProgressView
          value={progress}
          modifiers={[
            frame({ width: 96 }),
            progressViewStyle('linear'),
            tint(data.status === 'running' ? '#F47E61' : '#64748B'),
          ]}
        />
      </VStack>
    </HStack>
  );
}

export const FocusTimerWidget = createWidget<TimerWidgetData>('FocusTimerWidget', FocusTimerWidgetView);

export default FocusTimerWidget;
