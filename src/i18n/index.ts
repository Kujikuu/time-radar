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

const translations = {
  en: {
    fallbackOnly: {
      label: 'English fallback',
    },
    common: {
      allowNotifications: 'Allow timer alerts',
      notNow: 'Not now',
      next: 'Next',
      goBack: 'Go back',
      seeAll: 'View stats',
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
        short_break: 'Short break',
        long_break: 'Long break',
      },
      actions: {
        start: 'Start',
        startFocus: 'Start focus',
        pause: 'Pause',
        resume: 'Resume',
        reset: 'Reset timer',
        complete: 'Finish this phase',
      },
    },
    metrics: {
      sessions: 'Focus blocks',
      focusTime: 'Focused time',
      focusScore: 'Focus score',
    },
    quickStart: {
      title: 'Quick Study Sprint',
    },
    onboarding: {
      slides: {
        focusBody: 'Know what needs your attention.\nStart with a clean timer.\nBuild a steadier work rhythm.',
        sessionsTitle: 'Set the work block',
        sessionsBody: 'Pick the task, choose the length, and let breaks keep the pace.',
        progressTitle: 'Notice the pattern',
        progressBody: 'See focused time, sessions, and where your energy went without extra noise.',
      },
      start: 'Start focusing',
      skip: 'Skip for now',
      notificationTitle: 'Want a quiet nudge when time is up?',
      notificationBody:
        'TimeRadar can send a local timer alert when a focus block or break ends, even if you step away from the app.',
      pageA11y: 'Go to onboarding page %{page}',
      visual: {
        projectProposal: 'Client proposal',
        today: 'Today',
      },
    },
    home: {
      title: 'Home',
      today: 'Today',
      studentPromise: 'Study focus, without the noise.',
      progress: "Today's focus",
      upNext: 'Next focus task',
      openStats: 'View detailed stats',
      noTasksTitle: 'No focus tasks yet',
      noTasksBody: 'Create one work block so your timer has a clear target.',
      noTasksAction: 'Create focus task',
      notificationTitle: 'Timer alerts can keep you moving',
      notificationBody: 'Get a quiet local alert when a focus block or break ends.',
    },
    radar: {
      title: 'Today’s radar signal',
      helper: 'Three focused study blocks make the signal strong.',
      progress: '%{percent}% charged',
      status: {
        idle: 'No signal yet',
        warming: 'Signal warming',
        steady: 'Steady signal',
        strong: 'Strong signal',
      },
    },
    pro: {
      title: 'TimeRadar Pro',
      eyebrow: 'Coming for serious study streaks',
      body: 'Keep the timer free. Upgrade when deeper history, custom study presets, and shareable weekly progress become useful.',
      action: 'Pro stays out of your first session',
    },
    tasks: {
      title: 'Focus tasks',
      createTask: 'Create focus task',
      queueTitle: 'Your focus queue',
      queueBody: {
        empty: 'No saved focus tasks yet. Add the first one when you know what needs attention.',
        one: '%{count} focus task is ready for your next work block.',
        many: '%{count} focus tasks are ready for focused work.',
      },
      emptyTitle: 'Start with one clear task',
      emptyBody: 'Name the work, set the timer, and TimeRadar will keep the rhythm simple.',
      emptyAction: 'Create focus task',
      openTask: 'Open %{title}, %{minutes} minute focus task',
    },
    stats: {
      title: 'Stats',
      focusTime: 'Focused time',
      previous: 'vs previous period',
      distribution: 'Where focus went',
      chartSummary: 'Focus chart, %{minutes} total minutes',
      distributionSummary: 'Focus distribution: %{summary}',
      totalMinutes: '%{value} total',
      zeroTotal: '0m total',
    },
    settings: {
      title: 'Settings',
      language: 'Language',
      languageHelper: 'Choose the app language or follow your device setting.',
      switchToArabic: 'Switch to Arabic',
      switchToEnglish: 'Switch to English',
      timerDefaults: 'Default rhythm',
      automation: 'Session flow',
      notifications: 'Timer alerts',
      completionSound: 'Alert sound',
      focus: 'Focus block',
      focusHelper: 'Default length for new focus tasks.',
      shortBreak: 'Short break',
      shortBreakHelper: 'A short pause between focus blocks.',
      longBreak: 'Long break',
      longBreakHelper: 'A longer reset after a full cycle.',
      longBreakAfter: 'Long break after',
      longBreakAfterHelper: 'Number of focus sessions before a long break.',
      autoStartBreaks: 'Start breaks automatically',
      autoStartBreaksHelper: 'Move into break time automatically when focus ends.',
      hapticFeedback: 'Gentle haptics',
      hapticFeedbackHelper: 'Use subtle taps when the timer starts, pauses, resets, or completes.',
      notificationsReady: 'Timer alerts are ready',
      notificationsEnable: 'Turn on timer alerts',
      notificationsBlocked:
        'Notifications are blocked in system settings. Allow them there so TimeRadar can alert you.',
      notificationsUnsupported: 'Local notifications are not available in the web preview.',
      notificationsAvailable: 'TimeRadar can alert you when a focus block or break ends.',
      allow: 'Allow alerts',
      timerAlerts: 'Active timer alerts',
      timerAlertsHelper: 'Schedule a local alert for the running timer.',
      focusComplete: 'Focus done',
      focusCompleteHelper: 'Alert me when a focus block ends.',
      breakComplete: 'Break done',
      breakCompleteHelper: 'Alert me when a short or long break ends.',
      focusWarning: 'Before-end reminder',
      focusWarningHelper: 'Show a quiet reminder before focus ends.',
      warningTime: 'Reminder lead time',
      warningTimeHelper: 'How early the reminder appears before focus ends.',
      systemSound: 'Use system sound',
      systemSoundHelper:
        'Play the device notification sound when a timer alert appears. Silent mode and Focus modes can still suppress it.',
      decrease: 'Decrease %{label}',
      increase: 'Increase %{label}',
      permissionStatus: {
        granted: 'Allowed',
        denied: 'Blocked',
        unsupported: 'Not available on web',
        undetermined: 'Off',
      },
    },
    taskForm: {
      taskName: 'Task name',
      taskNameA11y: 'Task name',
      taskNamePlaceholder: 'What are you focusing on?',
      taskNameRequired: 'Name this focus task before continuing.',
      category: 'Category',
      focusDuration: 'Focus block',
      shortBreak: 'Short break',
      longBreak: 'Long break',
      sessionsBeforeLongBreak: 'Focus blocks before a long break',
      autoStartBreaks: 'Start breaks automatically',
      autoStartBreaksHelper: 'Move into break time automatically when focus ends.',
      createTask: 'Create focus task',
      saveChanges: 'Save task',
    },
    session: {
      newTask: 'New focus task',
      taskNotFound: "We couldn't find this task",
      taskNotFoundBody: 'Go back and choose another focus task.',
      startSession: 'Start this focus block',
    },
    notificationContent: {
      focusAlmostDoneTitle: 'Focus is almost done',
      focusAlmostDoneBody: '%{title}: %{time} left.',
      focusCompleteTitle: 'Focus block complete',
      breakCompleteTitle: 'Break complete',
      longBreakCompleteTitle: 'Long break complete',
      focusCompleteBody: '%{title} is done. Take the break you planned.',
      breakCompleteBody: '%{title} is ready for the next focus block.',
      channelName: 'Timer alerts',
      channelDescription: 'Focus and break completion alerts.',
    },
  },
  ar: {
    common: {
      allowNotifications: 'السماح بتنبيهات المؤقت',
      notNow: 'ليس الآن',
      next: 'التالي',
      goBack: 'رجوع',
      seeAll: 'عرض الإحصائيات',
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
        complete: 'إنهاء هذه المرحلة',
      },
    },
    metrics: {
      sessions: 'جلسات التركيز',
      focusTime: 'وقت التركيز',
      focusScore: 'مؤشر التركيز',
    },
    quickStart: {
      title: 'جلسة دراسة سريعة',
    },
    onboarding: {
      slides: {
        focusBody: 'اعرف ما يحتاج انتباهك.\nابدأ بمؤقت واضح.\nوابنِ إيقاع عمل أكثر ثباتًا.',
        sessionsTitle: 'اضبط جلسة العمل',
        sessionsBody: 'اختر المهمة، حدّد المدة، واترك الاستراحات تحفظ الإيقاع.',
        progressTitle: 'لاحظ نمط تركيزك',
        progressBody: 'راجع وقت التركيز والجلسات وتوزيع الجهد بدون ازدحام.',
      },
      start: 'ابدأ التركيز',
      skip: 'تخطي الآن',
      notificationTitle: 'هل تريد تنبيهًا هادئًا عند انتهاء الوقت؟',
      notificationBody:
        'يمكن لتايم رادار إرسال تنبيه محلي عند انتهاء جلسة التركيز أو الاستراحة، حتى لو ابتعدت عن التطبيق.',
      pageA11y: 'الانتقال إلى صفحة التعريف %{page}',
      visual: {
        projectProposal: 'عرض العميل',
        today: 'اليوم',
      },
    },
    home: {
      title: 'الرئيسية',
      today: 'اليوم',
      studentPromise: 'تركيز دراسي بلا تشتيت.',
      progress: 'تركيز اليوم',
      upNext: 'مهمة التركيز التالية',
      openStats: 'عرض الإحصائيات المفصلة',
      noTasksTitle: 'لا توجد مهام تركيز بعد',
      noTasksBody: 'أنشئ جلسة عمل واضحة ليبدأ المؤقت على هدف محدد.',
      noTasksAction: 'إنشاء مهمة تركيز',
      notificationTitle: 'تنبيهات المؤقت تساعدك على المتابعة',
      notificationBody: 'استلم تنبيهًا محليًا هادئًا عند انتهاء جلسة التركيز أو الاستراحة.',
    },
    radar: {
      title: 'إشارة رادار اليوم',
      helper: 'ثلاث جلسات دراسة مركزة تجعل الإشارة قوية.',
      progress: 'مشحونة %{percent}%',
      status: {
        idle: 'لا توجد إشارة بعد',
        warming: 'الإشارة تبدأ',
        steady: 'إشارة ثابتة',
        strong: 'إشارة قوية',
      },
    },
    pro: {
      title: 'تايم رادار برو',
      eyebrow: 'قريبًا لسلاسل الدراسة الجادة',
      body: 'يبقى المؤقت مجانيًا. الترقية تكون عندما تحتاج سجلًا أعمق، وقوالب دراسة مخصصة، وبطاقة تقدم أسبوعية قابلة للمشاركة.',
      action: 'برو لا يعطّل جلستك الأولى',
    },
    tasks: {
      title: 'مهام التركيز',
      createTask: 'إنشاء مهمة تركيز',
      queueTitle: 'قائمة تركيزك',
      queueBody: {
        empty: 'لا توجد مهام تركيز محفوظة بعد. أضف المهمة الأولى عندما تعرف ما يحتاج انتباهك.',
        one: 'هناك مهمة تركيز واحدة جاهزة لجلسة العمل التالية.',
        many: 'لديك %{count} من مهام التركيز جاهزة للعمل بتركيز.',
      },
      emptyTitle: 'ابدأ بمهمة واضحة واحدة',
      emptyBody: 'سمّ العمل، اضبط المؤقت، واترك تايم رادار يحافظ على الإيقاع ببساطة.',
      emptyAction: 'إنشاء مهمة تركيز',
      openTask: 'فتح %{title}، مهمة تركيز لمدة %{minutes} دقيقة',
    },
    stats: {
      title: 'الإحصائيات',
      focusTime: 'وقت التركيز',
      previous: 'مقارنة بالفترة السابقة',
      distribution: 'توزيع وقت التركيز',
      chartSummary: 'مخطط التركيز، إجمالي %{minutes} دقيقة',
      distributionSummary: 'توزيع التركيز: %{summary}',
      totalMinutes: 'الإجمالي %{value}',
      zeroTotal: 'إجمالي 0د',
    },
    settings: {
      title: 'الإعدادات',
      language: 'اللغة',
      languageHelper: 'اختر لغة التطبيق أو اتبع لغة الجهاز.',
      switchToArabic: 'التبديل إلى العربية',
      switchToEnglish: 'التبديل إلى الإنجليزية',
      timerDefaults: 'إيقاع المؤقت الافتراضي',
      automation: 'تدفق الجلسة',
      notifications: 'تنبيهات المؤقت',
      completionSound: 'صوت التنبيه',
      focus: 'جلسة التركيز',
      focusHelper: 'المدة الافتراضية لمهام التركيز الجديدة.',
      shortBreak: 'استراحة قصيرة',
      shortBreakHelper: 'وقفة قصيرة بين جلسات التركيز.',
      longBreak: 'استراحة طويلة',
      longBreakHelper: 'استراحة أطول بعد دورة كاملة.',
      longBreakAfter: 'استراحة طويلة بعد',
      longBreakAfterHelper: 'عدد جلسات التركيز قبل الاستراحة الطويلة.',
      autoStartBreaks: 'بدء الاستراحات تلقائيًا',
      autoStartBreaksHelper: 'ابدأ الاستراحة تلقائيًا بعد انتهاء التركيز.',
      hapticFeedback: 'اهتزازات هادئة',
      hapticFeedbackHelper: 'استخدم نقرات خفيفة عند بدء المؤقت أو إيقافه أو إعادة ضبطه أو اكتماله.',
      notificationsReady: 'تنبيهات المؤقت جاهزة',
      notificationsEnable: 'فعّل تنبيهات المؤقت',
      notificationsBlocked:
        'التنبيهات محظورة من إعدادات النظام. اسمح بها ليتمكن تايم رادار من تنبيهك.',
      notificationsUnsupported: 'التنبيهات المحلية غير متاحة في معاينة الويب.',
      notificationsAvailable: 'يمكن لتايم رادار تنبيهك عند انتهاء جلسة التركيز أو الاستراحة.',
      allow: 'السماح بالتنبيهات',
      timerAlerts: 'تنبيهات المؤقت النشط',
      timerAlertsHelper: 'جدولة تنبيه محلي للمؤقت الجاري.',
      focusComplete: 'انتهاء التركيز',
      focusCompleteHelper: 'نبّهني عند انتهاء جلسة التركيز.',
      breakComplete: 'انتهاء الاستراحة',
      breakCompleteHelper: 'نبّهني عند انتهاء الاستراحة القصيرة أو الطويلة.',
      focusWarning: 'تذكير قبل النهاية',
      focusWarningHelper: 'إظهار تذكير هادئ قبل انتهاء التركيز.',
      warningTime: 'وقت التذكير',
      warningTimeHelper: 'كم يسبق التذكير نهاية جلسة التركيز.',
      systemSound: 'استخدام صوت النظام',
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
      taskNamePlaceholder: 'ما الذي ستركّز عليه؟',
      taskNameRequired: 'سمّ مهمة التركيز قبل المتابعة.',
      category: 'التصنيف',
      focusDuration: 'جلسة التركيز',
      shortBreak: 'استراحة قصيرة',
      longBreak: 'استراحة طويلة',
      sessionsBeforeLongBreak: 'جلسات التركيز قبل الاستراحة الطويلة',
      autoStartBreaks: 'بدء الاستراحات تلقائيًا',
      autoStartBreaksHelper: 'ابدأ الاستراحة تلقائيًا بعد انتهاء التركيز.',
      createTask: 'إنشاء مهمة تركيز',
      saveChanges: 'حفظ المهمة',
    },
    session: {
      newTask: 'مهمة تركيز جديدة',
      taskNotFound: 'لم نتمكن من العثور على هذه المهمة',
      taskNotFoundBody: 'ارجع واختر مهمة تركيز أخرى.',
      startSession: 'بدء جلسة التركيز',
    },
    notificationContent: {
      focusAlmostDoneTitle: 'جلسة التركيز قاربت على الانتهاء',
      focusAlmostDoneBody: '%{title}: تبقى %{time}.',
      focusCompleteTitle: 'اكتملت جلسة التركيز',
      breakCompleteTitle: 'انتهت الاستراحة',
      longBreakCompleteTitle: 'انتهت الاستراحة الطويلة',
      focusCompleteBody: 'اكتملت %{title}. خذ الاستراحة التي خططت لها.',
      breakCompleteBody: '%{title} جاهزة لجلسة التركيز التالية.',
      channelName: 'تنبيهات المؤقت',
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

function isRTLLocale(locale: AppLocale) {
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

export function rowDirectionForTextDirection(
  direction: AppTextDirection,
  nativeDirection: AppTextDirection = 'ltr'
): 'row' | 'row-reverse' {
  return direction === nativeDirection ? 'row' : 'row-reverse';
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

function localeTagForIntl(locale: AppLocale) {
  return locale === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US';
}

export function formatAppDate(
  locale: AppLocale,
  date: Date,
  options: Intl.DateTimeFormatOptions
) {
  return new Intl.DateTimeFormat(localeTagForIntl(locale), options).format(date);
}

function formatMinutesShort(locale: AppLocale, minutes: number) {
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
