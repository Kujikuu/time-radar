import { I18n } from 'i18n-js';

import type {
  AppLanguagePreference,
  FocusCategory,
  StatsRange,
  TimerPhase,
} from '../features/focus/types';

export type AppLocale = 'en' | 'ar';
export type AppTextDirection = 'ltr' | 'rtl';

type DeviceLocale = {
  languageCode?: string | null;
  languageTag?: string | null;
  textDirection?: string | null;
};

type TranslationValue = string | TranslationTree;
type TranslationTree = { [key: string]: TranslationValue };
type TranslationValues = Record<string, string | number>;

type TranslateOptions = {
  defaultValue?: string;
  values?: TranslationValues;
};

export const defaultLocale: AppLocale = 'en';
export const supportedLocales: AppLocale[] = ['en', 'ar'];

export const translations = {
  en: {
    fallbackOnly: {
      label: 'English fallback',
    },
    common: {
      allowNotifications: 'Allow notifications',
      notNow: 'Not now',
      next: 'Next',
      goBack: 'Go back',
      seeAll: 'See all',
      openSystemSettings: 'Open system settings',
    },
    units: {
      min: 'min',
      sec: 'sec',
      sessions: 'sessions',
      task: 'task',
      tasks: 'tasks',
      second: 'second',
      seconds: 'seconds',
      minute: 'minute',
      minutes: 'minutes',
    },
    categories: {
      Work: 'Work',
      Study: 'Study',
      Personal: 'Personal',
    },
    statsRanges: {
      Day: 'Day',
      Week: 'Week',
      Month: 'Month',
      Year: 'Year',
    },
    timer: {
      phase: {
        focus: 'Focus',
        short_break: 'Short Break',
        long_break: 'Long Break',
      },
      actions: {
        start: 'Start',
        startFocus: 'Start Focus',
        pause: 'Pause',
        resume: 'Resume',
        reset: 'Reset timer',
        complete: 'Complete current phase',
      },
    },
    metrics: {
      sessions: 'Sessions',
      focusTime: 'Focus Time',
      focusScore: 'Focus Score',
    },
    onboarding: {
      slides: {
        focusBody: 'Focus deeply.\nBuild consistently.\nSee progress clearly.',
        sessionsTitle: 'Shape every block',
        sessionsBody: 'Choose the task, set the rhythm, and keep breaks predictable.',
        progressTitle: 'Read your focus signal',
        progressBody: 'Track sessions, focus time, and distribution without clutter.',
      },
      start: "Let's Focus",
      skip: "I'll do this later",
      notificationTitle: 'Stay aware when the timer ends',
      notificationBody:
        'TimeRadar can send a local alert when focus or break time finishes, even if you leave the app.',
      pageA11y: 'Go to onboarding page %{page}',
      visual: {
        projectProposal: 'Project Proposal',
        today: 'Today',
      },
    },
    home: {
      title: 'Home',
      today: 'Today',
      progress: 'Your Progress',
      upNext: 'Up Next',
      openStats: 'Open full stats',
      noTasksTitle: 'No tasks yet',
      noTasksBody: 'Create your first focus task to start a session.',
      notificationTitle: 'Turn on timer alerts',
      notificationBody: 'Get a local notification when focus or break time finishes.',
    },
    tasks: {
      title: 'Tasks',
      createTask: 'Create task',
      queueTitle: "Today's focus queue",
      queueBody: '%{count} saved %{taskLabel} ready for focused work.',
      openTask: 'Open %{title} focus task, %{minutes} minutes',
    },
    stats: {
      title: 'Stats',
      focusTime: 'Focus Time',
      previous: 'vs previous',
      distribution: 'Focus Distribution',
      chartSummary: 'Focus chart, %{minutes} total minutes',
      distributionSummary: 'Focus distribution, %{summary}',
      totalMinutes: '%{value} total',
      zeroTotal: '0m total',
    },
    settings: {
      title: 'Settings',
      language: 'Language',
      languageHelper: 'Choose the app language or follow your device setting.',
      languagePreference: {
        system: 'Device language',
        en: 'English',
        ar: 'العربية',
      },
      switchToArabic: 'Switch to Arabic',
      switchToEnglish: 'Switch to English',
      timerDefaults: 'Timer Defaults',
      automation: 'Automation',
      notifications: 'Notifications',
      completionSound: 'Completion Sound',
      focus: 'Focus',
      focusHelper: 'Default length for new focus tasks.',
      shortBreak: 'Short Break',
      shortBreakHelper: 'The quick reset between focus sessions.',
      longBreak: 'Long Break',
      longBreakHelper: 'Recovery time after a full cycle.',
      longBreakAfter: 'Long Break After',
      longBreakAfterHelper: 'Number of focus sessions before a long break.',
      autoStartBreaks: 'Auto Start Breaks',
      autoStartBreaksHelper: 'Start break phases automatically after focus.',
      hapticFeedback: 'Haptic Feedback',
      hapticFeedbackHelper: 'Use subtle taps for timer start, pause, reset, and completion.',
      notificationsReady: 'Completion alerts are ready',
      notificationsEnable: 'Enable timer alerts',
      notificationsBlocked:
        'Notifications are blocked in system settings. TimeRadar cannot schedule alerts until they are allowed.',
      notificationsUnsupported: 'Local notifications are not available in the web preview.',
      notificationsAvailable: 'TimeRadar can alert you when a focus or break phase finishes.',
      allow: 'Allow',
      timerAlerts: 'Timer Alerts',
      timerAlertsHelper: 'Schedule a local alert for the active timer.',
      focusComplete: 'Focus Complete',
      focusCompleteHelper: 'Notify when a focus phase finishes.',
      breakComplete: 'Break Complete',
      breakCompleteHelper: 'Notify when short or long breaks finish.',
      focusWarning: 'Focus Warning',
      focusWarningHelper: 'Show a quiet reminder before focus ends.',
      warningTime: 'Warning Time',
      warningTimeHelper: 'How early the focus warning appears.',
      systemSound: 'System Sound',
      systemSoundHelper:
        'Use the device notification sound when a timer alert appears. Silent mode and Focus modes can still suppress it.',
      decrease: 'Decrease %{label}',
      increase: 'Increase %{label}',
      permissionStatus: {
        granted: 'Allowed',
        denied: 'Blocked',
        unsupported: 'Not available on web',
        undetermined: 'Not enabled',
      },
    },
    taskForm: {
      taskName: 'Task Name',
      taskNameA11y: 'Task name',
      category: 'Category',
      focusDuration: 'Focus Duration',
      shortBreak: 'Short Break',
      longBreak: 'Long Break',
      sessionsBeforeLongBreak: 'Sessions Before Long Break',
      autoStartBreaks: 'Auto Start Breaks',
      autoStartBreaksHelper: 'Start break phases automatically after focus.',
      createTask: 'Create Task',
      saveChanges: 'Save Changes',
    },
    session: {
      newTask: 'New Task',
      taskNotFound: 'Task not found',
      taskNotFoundBody: 'Go back and choose another focus task.',
      startSession: 'Start Session',
    },
    notificationContent: {
      focusAlmostDoneTitle: 'Focus almost done',
      focusAlmostDoneBody: '%{title} has %{time} left.',
      focusCompleteTitle: 'Focus complete',
      breakCompleteTitle: 'Break complete',
      longBreakCompleteTitle: 'Long break complete',
      focusCompleteBody: '%{title} is complete. Time for a break.',
      breakCompleteBody: '%{title} is ready for the next focus session.',
      channelName: 'Timer Completion',
      channelDescription: 'Focus and break completion alerts.',
    },
  },
  ar: {
    common: {
      allowNotifications: 'السماح بالتنبيهات',
      notNow: 'ليس الآن',
      next: 'التالي',
      goBack: 'رجوع',
      seeAll: 'عرض الكل',
      openSystemSettings: 'فتح إعدادات النظام',
    },
    units: {
      min: 'دقيقة',
      sec: 'ث',
      sessions: 'جلسات',
      task: 'مهمة',
      tasks: 'مهام',
      second: 'ثانية',
      seconds: 'ثوان',
      minute: 'دقيقة',
      minutes: 'دقائق',
    },
    categories: {
      Work: 'عمل',
      Study: 'دراسة',
      Personal: 'شخصي',
    },
    statsRanges: {
      Day: 'اليوم',
      Week: 'الأسبوع',
      Month: 'الشهر',
      Year: 'السنة',
    },
    timer: {
      phase: {
        focus: 'تركيز',
        short_break: 'استراحة قصيرة',
        long_break: 'استراحة طويلة',
      },
      actions: {
        start: 'ابدأ',
        startFocus: 'ابدأ التركيز',
        pause: 'إيقاف مؤقت',
        resume: 'استئناف',
        reset: 'إعادة ضبط المؤقت',
        complete: 'إنهاء المرحلة الحالية',
      },
    },
    metrics: {
      sessions: 'الجلسات',
      focusTime: 'وقت التركيز',
      focusScore: 'مؤشر التركيز',
    },
    onboarding: {
      slides: {
        focusBody: 'ركّز بعمق.\nابنِ عادة ثابتة.\nراقب تقدمك بوضوح.',
        sessionsTitle: 'صمّم كل جلسة',
        sessionsBody: 'اختر المهمة، اضبط الإيقاع، واجعل الاستراحات واضحة.',
        progressTitle: 'اقرأ إشارة تركيزك',
        progressBody: 'تابع الجلسات، وقت التركيز، والتوزيع بدون ازدحام.',
      },
      start: 'ابدأ التركيز',
      skip: 'سأفعل ذلك لاحقًا',
      notificationTitle: 'ابقَ منتبهًا عند انتهاء المؤقت',
      notificationBody:
        'يمكن لتايم رادار إرسال تنبيه محلي عند انتهاء التركيز أو الاستراحة، حتى لو خرجت من التطبيق.',
      pageA11y: 'الانتقال إلى صفحة التعريف %{page}',
      visual: {
        projectProposal: 'عرض المشروع',
        today: 'اليوم',
      },
    },
    home: {
      title: 'الرئيسية',
      today: 'اليوم',
      progress: 'تقدمك',
      upNext: 'التالي',
      openStats: 'فتح الإحصائيات الكاملة',
      noTasksTitle: 'لا توجد مهام بعد',
      noTasksBody: 'أنشئ أول مهمة تركيز لبدء جلسة.',
      notificationTitle: 'فعّل تنبيهات المؤقت',
      notificationBody: 'استلم تنبيهًا محليًا عند انتهاء وقت التركيز أو الاستراحة.',
    },
    tasks: {
      title: 'المهام',
      createTask: 'إنشاء مهمة',
      queueTitle: 'قائمة تركيز اليوم',
      queueBody: '%{count} %{taskLabel} محفوظة وجاهزة للعمل بتركيز.',
      openTask: 'فتح مهمة %{title}، %{minutes} دقيقة',
    },
    stats: {
      title: 'الإحصائيات',
      focusTime: 'وقت التركيز',
      previous: 'مقارنة بالسابق',
      distribution: 'توزيع التركيز',
      chartSummary: 'مخطط التركيز، إجمالي %{minutes} دقيقة',
      distributionSummary: 'توزيع التركيز، %{summary}',
      totalMinutes: 'إجمالي %{value}',
      zeroTotal: 'إجمالي 0د',
    },
    settings: {
      title: 'الإعدادات',
      language: 'اللغة',
      languageHelper: 'اختر لغة التطبيق أو اتبع لغة الجهاز.',
      languagePreference: {
        system: 'لغة الجهاز',
        en: 'English',
        ar: 'العربية',
      },
      switchToArabic: 'التبديل إلى العربية',
      switchToEnglish: 'التبديل إلى الإنجليزية',
      timerDefaults: 'افتراضيات المؤقت',
      automation: 'الأتمتة',
      notifications: 'التنبيهات',
      completionSound: 'صوت الانتهاء',
      focus: 'التركيز',
      focusHelper: 'المدة الافتراضية لمهام التركيز الجديدة.',
      shortBreak: 'استراحة قصيرة',
      shortBreakHelper: 'استراحة سريعة بين جلسات التركيز.',
      longBreak: 'استراحة طويلة',
      longBreakHelper: 'وقت تعافٍ بعد دورة كاملة.',
      longBreakAfter: 'استراحة طويلة بعد',
      longBreakAfterHelper: 'عدد جلسات التركيز قبل الاستراحة الطويلة.',
      autoStartBreaks: 'بدء الاستراحات تلقائيًا',
      autoStartBreaksHelper: 'بدء مراحل الاستراحة تلقائيًا بعد التركيز.',
      hapticFeedback: 'الاهتزازات الخفيفة',
      hapticFeedbackHelper: 'استخدم نقرات خفيفة لبدء المؤقت وإيقافه وإعادة ضبطه وإنهائه.',
      notificationsReady: 'تنبيهات الانتهاء جاهزة',
      notificationsEnable: 'فعّل تنبيهات المؤقت',
      notificationsBlocked:
        'التنبيهات محظورة من إعدادات النظام. لن يستطيع تايم رادار جدولة التنبيهات حتى يتم السماح بها.',
      notificationsUnsupported: 'التنبيهات المحلية غير متاحة في معاينة الويب.',
      notificationsAvailable: 'يمكن لتايم رادار تنبيهك عند انتهاء التركيز أو الاستراحة.',
      allow: 'السماح',
      timerAlerts: 'تنبيهات المؤقت',
      timerAlertsHelper: 'جدولة تنبيه محلي للمؤقت النشط.',
      focusComplete: 'انتهاء التركيز',
      focusCompleteHelper: 'إرسال تنبيه عند انتهاء مرحلة التركيز.',
      breakComplete: 'انتهاء الاستراحة',
      breakCompleteHelper: 'إرسال تنبيه عند انتهاء الاستراحات القصيرة أو الطويلة.',
      focusWarning: 'تنبيه قبل الانتهاء',
      focusWarningHelper: 'إظهار تذكير هادئ قبل انتهاء التركيز.',
      warningTime: 'وقت التنبيه',
      warningTimeHelper: 'كم يسبق التنبيه نهاية التركيز.',
      systemSound: 'صوت النظام',
      systemSoundHelper:
        'استخدم صوت تنبيهات الجهاز عند ظهور تنبيه المؤقت. قد يمنعه وضع الصامت أو أوضاع التركيز.',
      decrease: 'تقليل %{label}',
      increase: 'زيادة %{label}',
      permissionStatus: {
        granted: 'مسموح',
        denied: 'محظور',
        unsupported: 'غير متاح على الويب',
        undetermined: 'غير مفعّل',
      },
    },
    taskForm: {
      taskName: 'اسم المهمة',
      taskNameA11y: 'اسم المهمة',
      category: 'التصنيف',
      focusDuration: 'مدة التركيز',
      shortBreak: 'استراحة قصيرة',
      longBreak: 'استراحة طويلة',
      sessionsBeforeLongBreak: 'الجلسات قبل الاستراحة الطويلة',
      autoStartBreaks: 'بدء الاستراحات تلقائيًا',
      autoStartBreaksHelper: 'بدء مراحل الاستراحة تلقائيًا بعد التركيز.',
      createTask: 'إنشاء المهمة',
      saveChanges: 'حفظ التغييرات',
    },
    session: {
      newTask: 'مهمة جديدة',
      taskNotFound: 'المهمة غير موجودة',
      taskNotFoundBody: 'ارجع واختر مهمة تركيز أخرى.',
      startSession: 'بدء الجلسة',
    },
    notificationContent: {
      focusAlmostDoneTitle: 'التركيز قارب على الانتهاء',
      focusAlmostDoneBody: 'تبقى لـ %{title} %{time}.',
      focusCompleteTitle: 'انتهى التركيز',
      breakCompleteTitle: 'انتهت الاستراحة',
      longBreakCompleteTitle: 'انتهت الاستراحة الطويلة',
      focusCompleteBody: 'اكتملت %{title}. حان وقت الاستراحة.',
      breakCompleteBody: '%{title} جاهزة لجلسة التركيز التالية.',
      channelName: 'انتهاء المؤقت',
      channelDescription: 'تنبيهات انتهاء التركيز والاستراحة.',
    },
  },
} as const satisfies Record<AppLocale, TranslationTree>;

const i18n = new I18n(translations);
i18n.defaultLocale = defaultLocale;
i18n.enableFallback = true;

export function resolveAppLocale(
  locales: DeviceLocale[],
  preference: AppLanguagePreference = 'system'
): AppLocale {
  if (preference === 'en' || preference === 'ar') {
    return preference;
  }

  const primary = locales[0];
  const languageCode = primary?.languageCode?.toLowerCase();
  const languageTag = primary?.languageTag?.toLowerCase();

  if (languageCode === 'ar' || languageTag?.startsWith('ar-') || languageTag === 'ar') {
    return 'ar';
  }

  return defaultLocale;
}

export function isRTLLocale(locale: AppLocale) {
  return locale === 'ar';
}

export function textDirectionForLocale(locale: AppLocale): AppTextDirection {
  return isRTLLocale(locale) ? 'rtl' : 'ltr';
}

export function fontFamilyForLocale(locale: AppLocale) {
  return locale === 'ar' ? 'Thmanyah Sans' : 'Poppins';
}

export function textAlignForTextDirection(direction: AppTextDirection): 'left' | 'right' {
  return direction === 'rtl' ? 'right' : 'left';
}

export function translate(locale: AppLocale, key: string, options: TranslateOptions = {}) {
  i18n.locale = locale;

  const value = readTranslation(locale, key) ?? readTranslation(defaultLocale, key);

  if (typeof value === 'string') {
    return interpolate(value, options.values);
  }

  return options.defaultValue ?? key;
}

export function focusCategoryOptions(locale: AppLocale): { value: FocusCategory; label: string }[] {
  return (['Work', 'Study', 'Personal'] as FocusCategory[]).map((value) => ({
    value,
    label: translate(locale, `categories.${value}`),
  }));
}

export function statsRangeOptions(locale: AppLocale): { value: StatsRange; label: string }[] {
  return (['Day', 'Week', 'Month', 'Year'] as StatsRange[]).map((value) => ({
    value,
    label: translate(locale, `statsRanges.${value}`),
  }));
}

export function languagePreferenceOptions(
  locale: AppLocale
): { value: AppLanguagePreference; label: string }[] {
  return (['system', 'en', 'ar'] as AppLanguagePreference[]).map((value) => ({
    value,
    label: translate(locale, `settings.languagePreference.${value}`),
  }));
}

export function languageTogglePreferenceForLocale(locale: AppLocale): AppLanguagePreference {
  return locale === 'ar' ? 'en' : 'ar';
}

export function focusCategoryLabel(locale: AppLocale, category: FocusCategory) {
  return translate(locale, `categories.${category}`);
}

export function statsRangeLabel(locale: AppLocale, range: StatsRange) {
  return translate(locale, `statsRanges.${range}`);
}

export function timerPhaseLabel(locale: AppLocale, phase: TimerPhase) {
  return translate(locale, `timer.phase.${phase}`);
}

export function localeTagForIntl(locale: AppLocale) {
  return locale === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US';
}

export function formatAppDate(
  locale: AppLocale,
  date: Date,
  options: Intl.DateTimeFormatOptions
) {
  return new Intl.DateTimeFormat(localeTagForIntl(locale), options).format(date);
}

export function formatMinutesShort(locale: AppLocale, minutes: number) {
  if (locale === 'ar') {
    return `${minutes}د`;
  }

  return `${minutes}m`;
}

export function formatDuration(locale: AppLocale, minutes: number) {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (locale === 'ar') {
      return remainingMinutes ? `${hours}س ${remainingMinutes}د` : `${hours}س`;
    }

    return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }

  return formatMinutesShort(locale, minutes);
}

function readTranslation(locale: AppLocale, key: string): TranslationValue | undefined {
  return key.split('.').reduce<TranslationValue | undefined>((current, part) => {
    if (!current || typeof current === 'string') {
      return undefined;
    }

    return current[part];
  }, translations[locale]);
}

function interpolate(template: string, values: TranslationValues = {}) {
  return Object.entries(values).reduce(
    (message, [key, value]) => message.replaceAll(`%{${key}}`, String(value)),
    template
  );
}
