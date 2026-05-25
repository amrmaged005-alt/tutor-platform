import 'package:flutter/material.dart';

enum AppLang { en, ar }

extension AppLangX on AppLang {
  String get code => this == AppLang.ar ? 'ar' : 'en';
  TextDirection get direction =>
      this == AppLang.ar ? TextDirection.rtl : TextDirection.ltr;
  Locale get locale => Locale(code);
}

class AppLocalizations {
  AppLocalizations(this.lang);
  final AppLang lang;

  static final _values = <String, Map<AppLang, String>>{
    'app.name': {AppLang.en: 'Coursaty', AppLang.ar: 'كورساتي'},
    'common.retry': {AppLang.en: 'Retry', AppLang.ar: 'إعادة المحاولة'},
    'common.cancel': {AppLang.en: 'Cancel', AppLang.ar: 'إلغاء'},
    'common.close': {AppLang.en: 'Close', AppLang.ar: 'إغلاق'},
    'common.free': {AppLang.en: 'Free', AppLang.ar: 'مجاني'},
    'common.egp': {AppLang.en: 'EGP', AppLang.ar: 'جنيه'},
    'common.emailExample': {
      AppLang.en: 'you@example.com',
      AppLang.ar: 'name@example.com',
    },
    'common.comingSoon': {AppLang.en: 'Coming soon', AppLang.ar: 'قريباً'},
    'nav.home': {AppLang.en: 'Home', AppLang.ar: 'الرئيسية'},
    'nav.classes': {AppLang.en: 'Classes', AppLang.ar: 'الفصول'},
    'nav.tutors': {AppLang.en: 'Tutors', AppLang.ar: 'المدرسون'},
    'nav.bookings': {AppLang.en: 'Bookings', AppLang.ar: 'الحجوزات'},
    'nav.account': {AppLang.en: 'Account', AppLang.ar: 'الحساب'},
    'home.kicker': {
      AppLang.en: 'Egypt tutoring marketplace',
      AppLang.ar: 'منصة الدروس في مصر',
    },
    'home.title': {
      AppLang.en: 'Find trusted classes faster',
      AppLang.ar: 'اعثر على فصول موثوقة بسرعة',
    },
    'home.subtitle': {
      AppLang.en:
          'Compare tutors, schedules, seats, ratings, and prices in one compact app.',
      AppLang.ar:
          'قارن المدرسين والمواعيد والمقاعد والتقييمات والأسعار في تطبيق واحد.',
    },
    'home.searchHint': {
      AppLang.en: 'Search math, IGCSE, online...',
      AppLang.ar: 'ابحث عن رياضيات، IGCSE، أونلاين...',
    },
    'home.featuredClasses': {
      AppLang.en: 'Featured classes',
      AppLang.ar: 'فصول مميزة',
    },
    'home.featuredTutors': {
      AppLang.en: 'Featured tutors',
      AppLang.ar: 'مدرسون مميزون',
    },
    'home.subjects': {
      AppLang.en: 'Browse by subject',
      AppLang.ar: 'تصفح حسب المادة',
    },
    'home.viewAll': {AppLang.en: 'View all', AppLang.ar: 'عرض الكل'},
    'auth.welcome': {
      AppLang.en: 'Welcome to Coursaty',
      AppLang.ar: 'أهلاً بك في كورساتي',
    },
    'auth.loginTitle': {AppLang.en: 'Sign in', AppLang.ar: 'تسجيل الدخول'},
    'auth.loginSub': {
      AppLang.en: 'Continue to bookings and your dashboard.',
      AppLang.ar: 'تابع إلى حجوزاتك ولوحة التحكم.',
    },
    'auth.signupTitle': {
      AppLang.en: 'Create account',
      AppLang.ar: 'إنشاء حساب',
    },
    'auth.signupSub': {
      AppLang.en: 'Join as a student, tutor, or center.',
      AppLang.ar: 'انضم كطالب أو مدرس أو مركز.',
    },
    'auth.email': {AppLang.en: 'Email', AppLang.ar: 'البريد الإلكتروني'},
    'auth.password': {AppLang.en: 'Password', AppLang.ar: 'كلمة المرور'},
    'auth.name': {AppLang.en: 'Full name', AppLang.ar: 'الاسم الكامل'},
    'auth.signIn': {AppLang.en: 'Sign in', AppLang.ar: 'دخول'},
    'auth.signUp': {AppLang.en: 'Sign up', AppLang.ar: 'إنشاء حساب'},
    'auth.logout': {AppLang.en: 'Logout', AppLang.ar: 'تسجيل الخروج'},
    'auth.noAccount': {
      AppLang.en: 'No account yet?',
      AppLang.ar: 'ليس لديك حساب؟',
    },
    'auth.hasAccount': {
      AppLang.en: 'Already registered?',
      AppLang.ar: 'لديك حساب بالفعل؟',
    },
    'auth.forgot': {
      AppLang.en: 'Forgot password?',
      AppLang.ar: 'نسيت كلمة المرور؟',
    },
    'auth.forgotBody': {
      AppLang.en:
          'Password reset is not enabled in the mobile API yet. Please contact support or sign in on the web.',
      AppLang.ar:
          'استعادة كلمة المرور غير مفعلة بعد في تطبيق الهاتف. يرجى التواصل مع الدعم أو تسجيل الدخول عبر الموقع.',
    },
    'auth.student': {AppLang.en: 'Student', AppLang.ar: 'طالب'},
    'auth.tutor': {AppLang.en: 'Tutor', AppLang.ar: 'مدرس'},
    'auth.center': {AppLang.en: 'Center', AppLang.ar: 'مركز'},
    'auth.emailRequired': {
      AppLang.en: 'Enter your email.',
      AppLang.ar: 'أدخل البريد الإلكتروني.',
    },
    'auth.emailInvalid': {
      AppLang.en: 'Enter a valid email.',
      AppLang.ar: 'أدخل بريداً صحيحاً.',
    },
    'auth.passwordRequired': {
      AppLang.en: 'Enter your password.',
      AppLang.ar: 'أدخل كلمة المرور.',
    },
    'auth.passwordShort': {
      AppLang.en: 'Use at least 8 characters.',
      AppLang.ar: 'استخدم 8 أحرف على الأقل.',
    },
    'auth.nameRequired': {
      AppLang.en: 'Enter your full name.',
      AppLang.ar: 'أدخل اسمك الكامل.',
    },
    'classes.title': {AppLang.en: 'Browse classes', AppLang.ar: 'تصفح الفصول'},
    'classes.search': {
      AppLang.en: 'Search classes or tutors',
      AppLang.ar: 'ابحث عن فصل أو مدرس',
    },
    'classes.filters': {AppLang.en: 'Filters', AppLang.ar: 'الفلاتر'},
    'classes.newest': {AppLang.en: 'Newest', AppLang.ar: 'الأحدث'},
    'classes.popular': {AppLang.en: 'Popular', AppLang.ar: 'الأكثر حجزاً'},
    'classes.empty': {
      AppLang.en: 'No classes match your search.',
      AppLang.ar: 'لا توجد فصول تطابق البحث.',
    },
    'classes.about': {AppLang.en: 'About this class', AppLang.ar: 'عن الفصل'},
    'classes.info': {AppLang.en: 'Class info', AppLang.ar: 'معلومات الفصل'},
    'classes.book': {AppLang.en: 'Book now', AppLang.ar: 'احجز الآن'},
    'classes.confirmBook': {
      AppLang.en: 'Confirm booking',
      AppLang.ar: 'تأكيد الحجز',
    },
    'classes.signInToBook': {
      AppLang.en: 'Sign in to book this class.',
      AppLang.ar: 'سجل الدخول لحجز هذا الفصل.',
    },
    'classes.booked': {
      AppLang.en: 'Booking confirmed',
      AppLang.ar: 'تم تأكيد الحجز',
    },
    'classes.bookingReceived': {
      AppLang.en: 'Booking received.',
      AppLang.ar: 'تم استلام الحجز.',
    },
    'classes.spots': {AppLang.en: 'spots left', AppLang.ar: 'مقاعد متبقية'},
    'classes.enrolled': {AppLang.en: 'enrolled', AppLang.ar: 'مشترك'},
    'classes.curriculum': {AppLang.en: 'Curriculum', AppLang.ar: 'المنهج'},
    'classes.grade': {AppLang.en: 'Grade', AppLang.ar: 'الصف'},
    'classes.schedule': {AppLang.en: 'Schedule', AppLang.ar: 'الموعد'},
    'classes.location': {AppLang.en: 'Location', AppLang.ar: 'المكان'},
    'classes.language': {AppLang.en: 'Language', AppLang.ar: 'اللغة'},
    'tutors.title': {AppLang.en: 'Browse tutors', AppLang.ar: 'تصفح المدرسين'},
    'tutors.search': {
      AppLang.en: 'Search tutors or subjects',
      AppLang.ar: 'ابحث عن مدرس أو مادة',
    },
    'tutors.empty': {
      AppLang.en: 'No tutors match your search.',
      AppLang.ar: 'لا يوجد مدرسون مطابقون للبحث.',
    },
    'tutors.classes': {AppLang.en: 'classes', AppLang.ar: 'فصول'},
    'tutors.students': {AppLang.en: 'students', AppLang.ar: 'طلاب'},
    'tutors.verified': {AppLang.en: 'Verified', AppLang.ar: 'موثّق'},
    'tutors.rating': {AppLang.en: 'Rating', AppLang.ar: 'التقييم'},
    'dashboard.title': {AppLang.en: 'Dashboard', AppLang.ar: 'لوحة التحكم'},
    'dashboard.mine': {AppLang.en: 'My bookings', AppLang.ar: 'حجوزاتي'},
    'dashboard.manage': {
      AppLang.en: 'Manage bookings',
      AppLang.ar: 'إدارة الحجوزات',
    },
    'dashboard.empty': {
      AppLang.en: 'No bookings yet.',
      AppLang.ar: 'لا توجد حجوزات بعد.',
    },
    'dashboard.upcoming': {AppLang.en: 'Upcoming', AppLang.ar: 'قادمة'},
    'dashboard.past': {AppLang.en: 'Past', AppLang.ar: 'سابقة'},
    'account.title': {AppLang.en: 'Account', AppLang.ar: 'الحساب'},
    'account.theme': {AppLang.en: 'Dark mode', AppLang.ar: 'الوضع الداكن'},
    'account.language': {AppLang.en: 'Language', AppLang.ar: 'اللغة'},
    'account.english': {AppLang.en: 'English', AppLang.ar: 'الإنجليزية'},
    'account.arabic': {AppLang.en: 'Arabic', AppLang.ar: 'العربية'},
    'account.roleFeature': {
      AppLang.en:
          'Create and edit class tools are available on the web dashboard for now.',
      AppLang.ar:
          'أدوات إنشاء وتعديل الفصول متاحة حالياً من لوحة التحكم على الموقع.',
    },
    'state.loading': {AppLang.en: 'Loading...', AppLang.ar: 'جار التحميل...'},
    'state.error': {
      AppLang.en: 'Something went wrong.',
      AppLang.ar: 'حدث خطأ ما.',
    },
    'state.offline': {
      AppLang.en: 'Check your connection and try again.',
      AppLang.ar: 'تحقق من الاتصال وحاول مرة أخرى.',
    },
    'format.IN_PERSON': {AppLang.en: 'In person', AppLang.ar: 'حضوري'},
    'format.ONLINE': {AppLang.en: 'Online', AppLang.ar: 'أونلاين'},
    'format.HYBRID': {AppLang.en: 'Hybrid', AppLang.ar: 'مختلط'},
    'status.PENDING': {AppLang.en: 'Pending', AppLang.ar: 'قيد الانتظار'},
    'status.CONFIRMED': {AppLang.en: 'Confirmed', AppLang.ar: 'مؤكد'},
    'status.CANCELLED': {AppLang.en: 'Cancelled', AppLang.ar: 'ملغي'},
    'payment.UNPAID': {AppLang.en: 'Unpaid', AppLang.ar: 'غير مدفوع'},
    'payment.PAID': {AppLang.en: 'Paid', AppLang.ar: 'مدفوع'},
    'payment.FAILED': {AppLang.en: 'Failed', AppLang.ar: 'فشل الدفع'},
  };

  String t(String key) =>
      _values[key]?[lang] ?? _values[key]?[AppLang.en] ?? key;
}

extension L10nBuildContext on BuildContext {
  AppLocalizations get l10n {
    final scope = LocalizationsScope.maybeOf(this);
    return AppLocalizations(scope?.lang ?? AppLang.en);
  }
}

class LocalizationsScope extends InheritedWidget {
  const LocalizationsScope({
    super.key,
    required this.lang,
    required super.child,
  });

  final AppLang lang;

  static LocalizationsScope? maybeOf(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<LocalizationsScope>();
  }

  @override
  bool updateShouldNotify(LocalizationsScope oldWidget) =>
      oldWidget.lang != lang;
}
