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
    'nav.saved': {AppLang.en: 'Saved', AppLang.ar: 'المحفوظات'},
    'nav.browse': {AppLang.en: 'Browse', AppLang.ar: 'تصفح'},
    'browse.title': {AppLang.en: 'Explore', AppLang.ar: 'استكشف'},
    'browse.search': {
      AppLang.en: 'Search tutors, classes, centers',
      AppLang.ar: 'ابحث عن مدرسين أو فصول أو مراكز',
    },
    'browse.centers': {AppLang.en: 'Centers', AppLang.ar: 'المراكز'},
    'profile.title': {AppLang.en: 'Profile', AppLang.ar: 'الملف الشخصي'},
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
    'home.trending': {AppLang.en: 'Trending now', AppLang.ar: 'الأكثر رواجًا'},
    'home.nearbyCenters': {
      AppLang.en: 'Nearby centers',
      AppLang.ar: 'مراكز قريبة',
    },
    'home.trendMath': {
      AppLang.en: 'Exam-ready math groups this week',
      AppLang.ar: 'مجموعات رياضيات جاهزة للامتحانات هذا الأسبوع',
    },
    'home.trendOnline': {
      AppLang.en: 'Online classes with flexible timing',
      AppLang.ar: 'فصول أونلاين بمواعيد مرنة',
    },
    'home.trendExam': {
      AppLang.en: 'IGCSE and international curriculum picks',
      AppLang.ar: 'اختيارات IGCSE والمناهج الدولية',
    },
    'home.nearYou': {AppLang.en: 'Near you in', AppLang.ar: 'بالقرب منك في'},
    'onboarding.skip': {AppLang.en: 'Skip', AppLang.ar: 'تخطي'},
    'onboarding.next': {AppLang.en: 'Next', AppLang.ar: 'التالي'},
    'onboarding.start': {
      AppLang.en: 'Start learning',
      AppLang.ar: 'ابدأ التعلم',
    },
    'onboarding.tutors': {
      AppLang.en: 'Find Expert Tutors',
      AppLang.ar: 'اعثر على مدرسين خبراء',
    },
    'onboarding.tutorsBody': {
      AppLang.en:
          'Compare trusted tutors, centers, subjects, ratings, and prices in seconds.',
      AppLang.ar:
          'قارن المدرسين والمراكز والمواد والتقييمات والأسعار خلال ثوانٍ.',
    },
    'onboarding.book': {AppLang.en: 'Book Instantly', AppLang.ar: 'احجز فورًا'},
    'onboarding.bookBody': {
      AppLang.en:
          'Reserve your seat, add notes, and choose online payment or pay at center.',
      AppLang.ar: 'احجز مقعدك، أضف ملاحظاتك، واختر الدفع أونلاين أو في المركز.',
    },
    'onboarding.pace': {
      AppLang.en: 'Learn at Your Pace',
      AppLang.ar: 'تعلم بالسرعة المناسبة لك',
    },
    'onboarding.paceBody': {
      AppLang.en:
          'Keep upcoming bookings, class details, and reminders organized in one app.',
      AppLang.ar: 'احتفظ بحجوزاتك وتفاصيل فصولك وتنبيهاتك منظمة في تطبيق واحد.',
    },
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
    'classes.related': {
      AppLang.en: 'You might also like',
      AppLang.ar: 'قد يعجبك أيضًا',
    },
    'booking.title': {AppLang.en: 'Booking summary', AppLang.ar: 'ملخص الحجز'},
    'booking.sessions': {
      AppLang.en: 'Student/session count',
      AppLang.ar: 'عدد الطلاب/الحصص',
    },
    'booking.note': {
      AppLang.en: 'Add a note for the tutor',
      AppLang.ar: 'أضف ملاحظة للمدرس',
    },
    'booking.payNow': {
      AppLang.en: 'Pay Now (Online)',
      AppLang.ar: 'ادفع الآن أونلاين',
    },
    'booking.payNowBody': {
      AppLang.en: 'Continue to secure Paymob checkout.',
      AppLang.ar: 'تابع إلى صفحة دفع آمنة عبر Paymob.',
    },
    'booking.payCenter': {
      AppLang.en: 'Pay at Center',
      AppLang.ar: 'الدفع في المركز',
    },
    'booking.payCenterBody': {
      AppLang.en: 'Confirm your seat and pay directly at class.',
      AppLang.ar: 'أكد مقعدك وادفع مباشرة عند الحضور.',
    },
    'booking.confirm': {AppLang.en: 'Confirm', AppLang.ar: 'تأكيد'},
    'booking.success': {
      AppLang.en: 'Booking confirmed',
      AppLang.ar: 'تم تأكيد الحجز',
    },
    'booking.id': {AppLang.en: 'Booking ID', AppLang.ar: 'رقم الحجز'},
    'booking.viewBookings': {
      AppLang.en: 'View My Bookings',
      AppLang.ar: 'عرض حجوزاتي',
    },
    'reviews.title': {AppLang.en: 'Reviews', AppLang.ar: 'التقييمات'},
    'reviews.empty': {
      AppLang.en: 'No reviews yet',
      AppLang.ar: 'لا توجد تقييمات بعد',
    },
    'reviews.emptyBody': {
      AppLang.en: 'Reviews will appear here after students share feedback.',
      AppLang.ar: 'ستظهر التقييمات هنا بعد أن يشارك الطلاب آراءهم.',
    },
    'reviews.leave': {AppLang.en: 'Leave review', AppLang.ar: 'أضف تقييمًا'},
    'reviews.comment': {
      AppLang.en: 'Tell others about your experience',
      AppLang.ar: 'احكِ للآخرين عن تجربتك',
    },
    'reviews.submit': {
      AppLang.en: 'Submit review',
      AppLang.ar: 'إرسال التقييم',
    },
    'saved.title': {AppLang.en: 'Saved classes', AppLang.ar: 'الفصول المحفوظة'},
    'saved.empty': {
      AppLang.en: 'No saved classes yet',
      AppLang.ar: 'لا توجد فصول محفوظة',
    },
    'saved.emptyBody': {
      AppLang.en: 'Tap the heart on any class to keep it here.',
      AppLang.ar: 'اضغط على القلب في أي فصل للاحتفاظ به هنا.',
    },
    'filter.title': {AppLang.en: 'Filter classes', AppLang.ar: 'تصفية الفصول'},
    'filter.reset': {AppLang.en: 'Reset', AppLang.ar: 'إعادة ضبط'},
    'filter.apply': {AppLang.en: 'Apply filters', AppLang.ar: 'تطبيق الفلاتر'},
    'filter.format': {AppLang.en: 'Format', AppLang.ar: 'طريقة الحضور'},
    'filter.both': {AppLang.en: 'Both', AppLang.ar: 'الكل'},
    'filter.price': {AppLang.en: 'Max price', AppLang.ar: 'أعلى سعر'},
    'filter.city': {AppLang.en: 'City', AppLang.ar: 'المدينة'},
    'filter.sort': {AppLang.en: 'Sort', AppLang.ar: 'ترتيب'},
    'filter.lowestPrice': {
      AppLang.en: 'Lowest price',
      AppLang.ar: 'الأقل سعرًا',
    },
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
    'dashboard.total': {AppLang.en: 'Total', AppLang.ar: 'الإجمالي'},
    'dashboard.active': {AppLang.en: 'Active', AppLang.ar: 'نشطة'},
    'dashboard.completed': {AppLang.en: 'Completed', AppLang.ar: 'مكتملة'},
    'dashboard.cancelled': {AppLang.en: 'Cancelled', AppLang.ar: 'ملغاة'},
    'dashboard.spent': {AppLang.en: 'Spent', AppLang.ar: 'المدفوع'},
    'dashboard.myClasses': {AppLang.en: 'My Classes', AppLang.ar: 'فصولي'},
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
    'notifications.title': {
      AppLang.en: 'Notifications',
      AppLang.ar: 'الإشعارات',
    },
    'notifications.booking': {
      AppLang.en: 'Booking confirmed',
      AppLang.ar: 'تم تأكيد الحجز',
    },
    'notifications.bookingBody': {
      AppLang.en: 'Your class seat is reserved.',
      AppLang.ar: 'تم حجز مقعدك في الفصل.',
    },
    'notifications.soon': {
      AppLang.en: 'Class starting soon',
      AppLang.ar: 'الفصل سيبدأ قريبًا',
    },
    'notifications.soonBody': {
      AppLang.en: 'Check your schedule before heading out.',
      AppLang.ar: 'راجع موعدك قبل التوجه إلى الفصل.',
    },
    'notifications.review': {
      AppLang.en: 'New review prompt',
      AppLang.ar: 'تذكير بتقييم جديد',
    },
    'notifications.reviewBody': {
      AppLang.en: 'Share feedback after your completed class.',
      AppLang.ar: 'شارك رأيك بعد انتهاء الفصل.',
    },
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
