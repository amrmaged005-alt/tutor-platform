"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

// ─── Translation dictionary ───────────────────────────────────────────────────
const DICT = {
  "a11y.skipToContent":   { en: "Skip to main content",       ar: "تخطي إلى المحتوى الرئيسي" },
  "toast.favorites.classSaved": { en: "Class saved to favorites", ar: "تم حفظ الفصل في المفضلة" },
  "toast.favorites.classRemoved": { en: "Class removed from favorites", ar: "تمت إزالة الفصل من المفضلة" },
  "toast.favorites.tutorSaved": { en: "Tutor saved to favorites", ar: "تم حفظ المدرس في المفضلة" },
  "toast.favorites.tutorRemoved": { en: "Tutor removed from favorites", ar: "تمت إزالة المدرس من المفضلة" },
  "toast.favorites.signIn": { en: "Sign in to save favorites", ar: "سجّل الدخول لحفظ المفضلة" },
  "toast.favorites.failed": { en: "We couldn't update your favorites. Try again.", ar: "لم نتمكن من تحديث المفضلة. حاول مرة أخرى." },
  "toast.dismiss":        { en: "Dismiss notification",       ar: "إغلاق الإشعار" },

  // ── Navigation ───────────────────────────────────────────────────────────────
  "nav.classes":          { en: "Classes",                    ar: "الفصول" },
  "nav.tutors":           { en: "Tutors",                     ar: "المدرسون" },
  "nav.centers":          { en: "Centers",                    ar: "المراكز" },
  "nav.forTutors":        { en: "For Tutors",                 ar: "للمدرسين" },
  "nav.signIn":           { en: "Sign In",                    ar: "تسجيل الدخول" },
  "nav.signOut":          { en: "Sign Out",                   ar: "تسجيل الخروج" },
  "nav.dashboard":        { en: "Dashboard",                  ar: "لوحة التحكم" },
  "nav.bookings":         { en: "Bookings",                   ar: "الحجوزات" },
  "nav.createClass":      { en: "+ Create Class",             ar: "+ إنشاء فصل" },
  "nav.admin":            { en: "Admin",                      ar: "المشرف" },
  "nav.browseClasses":    { en: "Browse Classes",             ar: "تصفح الفصول" },
  "nav.home":             { en: "Home",                       ar: "الرئيسية" },

  // ── Hero / landing ────────────────────────────────────────────────────────────
  "hero.tag":             { en: "Egypt's tutoring marketplace", ar: "سوق المدرسين في مصر" },
  "hero.title":           { en: "Find a tutor your family can actually trust.", ar: "ابحث عن مدرّس يمكن لعائلتك الوثوق به." },
  "hero.subtitle":        { en: "Verified tutors, top learning centers, every curriculum. Compare, book, and start in minutes — without phone calls.", ar: "مدرّسون موثّقون، أفضل المراكز التعليمية، كل المناهج. قارن، احجز، وابدأ في دقائق — دون مكالمات هاتفية." },
  "hero.browseClasses":   { en: "Browse Classes",             ar: "تصفح الفصول" },
  "hero.findTutor":       { en: "Find a Tutor",               ar: "ابحث عن مدرّس" },
  "trust.verified":       { en: "Verified tutors",            ar: "مدرّسون موثّقون" },
  "trust.booking":        { en: "Instant booking",            ar: "حجز فوري" },
  "trust.curricula":      { en: "All curricula",              ar: "جميع المناهج" },
  "trust.centers":        { en: "Trusted centers",            ar: "مراكز موثوقة" },
  "trust.fees":           { en: "Transparent fees",           ar: "أسعار شفافة" },
  "curricula.label":      { en: "Curricula",                  ar: "المناهج" },

  // ── Stats ─────────────────────────────────────────────────────────────────────
  "stats.classes":        { en: "Active Classes",             ar: "فصول نشطة" },
  "stats.tutors":         { en: "Verified Tutors",            ar: "مدرّسون موثّقون" },
  "stats.seats":          { en: "Seats Booked",               ar: "مقاعد محجوزة" },
  "stats.curricula":      { en: "Curricula",                  ar: "مناهج" },

  // ── How it works ──────────────────────────────────────────────────────────────
  "how.label":            { en: "How it works",               ar: "كيف يعمل" },
  "how.title":            { en: "From search to first class in four steps", ar: "من البحث إلى أول فصل في أربع خطوات" },
  "how.search":           { en: "Search",                     ar: "ابحث" },
  "how.searchDesc":       { en: "Filter by subject, grade, curriculum, area, and price to find the right class.", ar: "صفِّ بالمادة والصف والمنهج والمنطقة والسعر للعثور على الفصل المناسب." },
  "how.compare":          { en: "Compare",                    ar: "قارن" },
  "how.compareDesc":      { en: "Review tutors and centers side by side — credentials, schedules, ratings, fees.", ar: "راجع المدرّسين والمراكز جنبًا إلى جنب — المؤهلات والجداول والتقييمات والرسوم." },
  "how.book":             { en: "Book",                       ar: "احجز" },
  "how.bookDesc":         { en: "Confirm your seat instantly. Your booking is tracked in your dashboard.", ar: "أكّد مقعدك فورًا. يُتابع حجزك في لوحة التحكم الخاصة بك." },
  "how.learn":            { en: "Learn",                      ar: "تعلّم" },
  "how.learnDesc":        { en: "Attend, message your tutor, and manage everything from one place.", ar: "احضر، راسل مدرّسك، وأدر كل شيء من مكان واحد." },

  // ── Features section ──────────────────────────────────────────────────────────
  "features.label":       { en: "Why Coursaty",               ar: "لماذا كورساتي" },
  "features.title":       { en: "Everything you need to find the right class", ar: "كل ما تحتاجه للعثور على الفصل المناسب" },
  "features.subtitle":    { en: "Built specifically for Egypt's students, parents, tutors, and learning centers.", ar: "صُمّم خصيصًا لطلاب وأولياء أمور ومدرّسي ومراكز التعليم في مصر." },

  // ── Role row ──────────────────────────────────────────────────────────────────
  "roles.label":          { en: "Who is Coursaty for",        ar: "لمن كورساتي" },
  "roles.title":          { en: "A single platform, three sides of the marketplace", ar: "منصة واحدة، ثلاثة أطراف للسوق" },
  "roles.students":       { en: "Students & parents",         ar: "الطلاب وأولياء الأمور" },
  "roles.studentsTitle":  { en: "Find the right tutor, fast", ar: "اعثر على المدرّس المناسب بسرعة" },
  "roles.tutors":         { en: "Independent tutors",         ar: "المدرّسون المستقلون" },
  "roles.tutorsTitle":    { en: "Grow your student base",     ar: "نمِّ قاعدة طلابك" },
  "roles.centers":        { en: "Learning centers",           ar: "مراكز التعلّم" },
  "roles.centersTitle":   { en: "Manage your whole operation", ar: "أدر عملك بالكامل" },

  // ── Footer ────────────────────────────────────────────────────────────────────
  "footer.tagline":       { en: "Egypt's tutoring marketplace — verified tutors, trusted centers, every curriculum.", ar: "سوق المدرسين في مصر — مدرّسون موثّقون، مراكز موثوقة، كل المناهج." },
  "footer.platform":      { en: "Platform",                   ar: "المنصة" },
  "footer.partners":      { en: "For Partners",               ar: "للشركاء" },
  "footer.account":       { en: "Account",                    ar: "الحساب" },
  "footer.createAccount": { en: "Create Account",             ar: "إنشاء حساب" },
  "footer.rights":        { en: "All rights reserved.",       ar: "جميع الحقوق محفوظة." },
  "footer.privacy":       { en: "Privacy",                    ar: "الخصوصية" },
  "footer.terms":         { en: "Terms",                      ar: "الشروط" },
  "footer.contact":       { en: "Contact",                    ar: "اتصل بنا" },
  "footer.trust.verified":   { en: "Verified tutors",         ar: "مدرّسون موثّقون" },
  "footer.trust.free":       { en: "Free for students",       ar: "مجاني للطلاب" },
  "footer.trust.curricula":  { en: "All curricula",           ar: "جميع المناهج" },
  "footer.trust.booking":    { en: "Instant booking",         ar: "حجز فوري" },

  // ── Auth — login ──────────────────────────────────────────────────────────────
  "auth.welcome":         { en: "Welcome back — sign in to continue", ar: "أهلاً بعودتك — سجّل الدخول للمتابعة" },
  "auth.email":           { en: "Email address",              ar: "البريد الإلكتروني" },
  "auth.password":        { en: "Password",                   ar: "كلمة المرور" },
  "auth.passwordPlaceholder": { en: "Your password",          ar: "كلمة مرورك" },
  "auth.signIn":          { en: "Sign In",                    ar: "تسجيل الدخول" },
  "auth.signingIn":       { en: "Signing in…",                ar: "جارٍ تسجيل الدخول…" },
  "auth.noAccount":       { en: "Don't have an account?",     ar: "ليس لديك حساب؟" },
  "auth.createOne":       { en: "Create one free",            ar: "أنشئ واحدًا مجانًا" },
  "auth.created":         { en: "Account created. Sign in to continue.", ar: "تم إنشاء الحساب. سجّل الدخول للمتابعة." },
  "auth.invalid":         { en: "Invalid email or password",  ar: "بريد إلكتروني أو كلمة مرور غير صحيحة" },
  "auth.required":        { en: "Email and password are required", ar: "البريد الإلكتروني وكلمة المرور مطلوبان" },
  "auth.trust.verified":  { en: "Verified Tutors",            ar: "مدرّسون موثّقون" },
  "auth.trust.free":      { en: "Free to Browse",             ar: "تصفح مجاني" },
  "auth.trust.secure":    { en: "Secure Login",               ar: "تسجيل دخول آمن" },

  // ── Auth — signup ─────────────────────────────────────────────────────────────
  "signup.tagline":       { en: "Join Egypt's tutoring marketplace — free forever", ar: "انضم إلى سوق المدرسين في مصر — مجانًا للأبد" },
  "signup.fullName":      { en: "Full name",                  ar: "الاسم بالكامل" },
  "signup.iAm":           { en: "I am a…",                    ar: "أنا…" },
  "signup.student":       { en: "Student / Parent",           ar: "طالب / ولي أمر" },
  "signup.tutor":         { en: "Tutor / Instructor",         ar: "مدرّس / معلم" },
  "signup.center":        { en: "Learning Center",            ar: "مركز تعليمي" },
  "signup.creating":      { en: "Creating account…",          ar: "جارٍ إنشاء الحساب…" },
  "signup.submit":        { en: "Create Free Account",        ar: "إنشاء حساب مجاني" },
  "signup.hasAccount":    { en: "Already have an account?",   ar: "لديك حساب بالفعل؟" },
  "signup.signIn":        { en: "Sign in",                    ar: "سجّل الدخول" },
  "signup.trust.free":    { en: "Free to join",               ar: "انضمام مجاني" },
  "signup.trust.noCard":  { en: "No credit card",             ar: "لا بطاقة ائتمان" },
  "signup.trust.instant": { en: "Instant access",             ar: "وصول فوري" },
  "signup.error.generic": { en: "Something went wrong",       ar: "حدث خطأ ما" },
  "signup.minPassword":   { en: "Min 8 characters",           ar: "8 أحرف على الأقل" },

  // ── Booking modal ─────────────────────────────────────────────────────────────
  "modal.signInRequired.title":  { en: "Sign in to book this class", ar: "سجّل الدخول لحجز هذا الفصل" },
  "modal.signInRequired.body":   { en: "Create an account or sign in to confirm your seat. It only takes a minute.", ar: "أنشئ حسابًا أو سجّل الدخول لتأكيد مقعدك. لن يستغرق الأمر دقيقة." },
  "modal.signInRequired.signIn": { en: "Sign In",              ar: "تسجيل الدخول" },
  "modal.signInRequired.signUp": { en: "Create Account",       ar: "إنشاء حساب" },
  "modal.signInRequired.cancel": { en: "Continue Browsing",    ar: "متابعة التصفح" },

  // ── Final CTA ─────────────────────────────────────────────────────────────────
  "cta.ready":            { en: "Ready when you are",         ar: "جاهزون متى ما أردت" },
  "cta.title":            { en: "Start finding the right class today", ar: "ابدأ في العثور على الفصل المناسب اليوم" },
  "cta.subtitle":         { en: "Hundreds of classes. Verified tutors. Cairo's best educators in one organized place.", ar: "مئات الفصول. مدرّسون موثّقون. أفضل المعلمين في القاهرة في مكان منظّم واحد." },
  "cta.browse":           { en: "Browse All Classes",          ar: "تصفح جميع الفصول" },
  "cta.createAccount":    { en: "Create an Account",           ar: "إنشاء حساب" },

  // ── Common UI ─────────────────────────────────────────────────────────────────
  "common.free":          { en: "Free",                       ar: "مجاني" },
  "common.clearAll":      { en: "Clear all",                  ar: "مسح الكل" },
  "common.clearFilters":  { en: "Clear all filters",          ar: "مسح جميع الفلاتر" },
  "common.applyFilters":  { en: "Apply Filters",              ar: "تطبيق الفلاتر" },
  "common.close":         { en: "Close",                      ar: "إغلاق" },
  "common.cancel":        { en: "Cancel",                     ar: "إلغاء" },
  "common.save":          { en: "Save",                       ar: "حفظ" },
  "common.edit":          { en: "Edit",                       ar: "تعديل" },
  "common.filters":       { en: "Filters",                    ar: "الفلاتر" },
  "common.search":        { en: "Search",                     ar: "بحث" },
  "common.any":           { en: "Any",                        ar: "الكل" },
  "common.home":          { en: "Home",                       ar: "الرئيسية" },
  "common.tutors":        { en: "Tutors",                     ar: "المدرسون" },
  "common.classes":       { en: "Classes",                    ar: "الفصول" },
  "common.noResults":     { en: "No results found",           ar: "لا توجد نتائج" },
  "common.back":          { en: "Back",                       ar: "رجوع" },

  // ── Tutors page ───────────────────────────────────────────────────────────────
  "tutors.pageTitle":     { en: "Find Your Perfect Tutor",    ar: "اعثر على مدرّسك المثالي" },
  "tutors.pageSubtitle":  { en: "{count} verified tutors across Egypt — filter by subject, city, and rating.", ar: "{count} مدرّس موثّق في أنحاء مصر — صفِّ بالمادة والمدينة والتقييم." },
  "tutors.searchPlaceholder": { en: "Search by name, subject, or keyword…", ar: "ابحث بالاسم أو المادة أو كلمة مفتاحية…" },
  "tutors.city":          { en: "City",                       ar: "المدينة" },
  "tutors.subjects":      { en: "Subjects",                   ar: "المواد" },
  "tutors.minRating":     { en: "Minimum Rating",             ar: "أدنى تقييم" },
  "tutors.allCities":     { en: "All Cities",                 ar: "كل المدن" },
  "tutors.topRated":      { en: "Top Rated Tutors",           ar: "أعلى المدرّسين تقييمًا" },
  "tutors.topRatedSub":   { en: "Consistently rated 4.5+ by their students", ar: "يحافظون على تقييم 4.5+ من طلابهم" },
  "tutors.highlyRated":   { en: "Highly Rated",               ar: "تقييم عالٍ" },
  "tutors.highlyRatedSub": { en: "Rated 4.0 and above",      ar: "تقييم 4.0 وما فوق" },
  "tutors.newTutors":     { en: "New on Coursaty",            ar: "جدد على كورساتي" },
  "tutors.newTutorsSub":  { en: "Recently joined, ready to teach", ar: "انضموا حديثًا، مستعدون للتدريس" },
  "tutors.noFound":       { en: "No tutors found",            ar: "لم يُعثر على مدرّسين" },
  "tutors.noFoundSub":    { en: "Try adjusting your filters or clearing your search.", ar: "جرِّب تعديل الفلاتر أو مسح البحث." },
  "tutors.countSingular": { en: "{n} tutor",                  ar: "{n} مدرّس" },
  "tutors.countPlural":   { en: "{n} tutors",                 ar: "{n} مدرّس" },
  "tutors.matchFilters":  { en: "match your filters",         ar: "تطابق فلاترك" },
  "tutors.available":     { en: "available",                  ar: "متاح" },

  // ── Tutor card ────────────────────────────────────────────────────────────────
  "tutor.verified":       { en: "Verified",                   ar: "موثّق" },
  "tutor.unnamed":        { en: "Coursaty Tutor",             ar: "مدرس كورساتي" },
  "tutor.noReviews":      { en: "No reviews yet",             ar: "لا توجد تقييمات بعد" },
  "tutor.review":         { en: "review",                     ar: "تقييم" },
  "tutor.reviews":        { en: "reviews",                    ar: "تقييم" },
  "tutor.classes":        { en: "Classes",                    ar: "فصل" },
  "tutor.students":       { en: "Students",                   ar: "طالب" },
  "tutor.viewProfile":    { en: "View Profile",               ar: "عرض الملف" },
  "tutor.browseClasses":  { en: "Browse Classes",             ar: "تصفح الفصول" },
  "tutor.noClasses":      { en: "No Classes Yet",             ar: "لا فصول بعد" },
  "tutor.moreSubjects":   { en: "+{n} more",                  ar: "+{n} أخرى" },
  "tutor.egypt":          { en: "Egypt",                      ar: "مصر" },
  "tutor.verifiedTooltip": { en: "Identity and profile details verified by Coursaty", ar: "تم التحقق من الهوية وتفاصيل الملف بواسطة كورساتي" },
  "tutor.saveFavorite":   { en: "Save tutor to favorites",    ar: "احفظ المدرس في المفضلة" },
  "tutor.removeFavorite": { en: "Remove tutor from favorites", ar: "إزالة المدرس من المفضلة" },
  "tutor.topTutor":       { en: "Top Tutor",                  ar: "مدرس مميز" },
  "tutor.studentsThisWeek": { en: "{n} enrolled this week",   ar: "{n} حجزوا هذا الأسبوع" },
  "tutor.repeatStudents": { en: "{n} repeat students",        ar: "{n} طلاب متكررون" },
  "tutor.lastBookedMinutes": { en: "Last booked {n}m ago",    ar: "آخر حجز منذ {n} د" },
  "tutor.lastBookedHours": { en: "Last booked {n}h ago",      ar: "آخر حجز منذ {n} س" },
  "tutor.lastBookedDays": { en: "Last booked {n}d ago",       ar: "آخر حجز منذ {n} ي" },

  // ── Booking confirmed ─────────────────────────────────────────────────────────
  "booking.confirmed":    { en: "Booking Confirmed",          ar: "تم تأكيد الحجز" },
  "booking.received":     { en: "Booking Received",           ar: "تم استلام الحجز" },
  "booking.paymentFailed": { en: "Payment Failed",            ar: "فشل الدفع" },
  "booking.paymentFailedDesc": { en: "Your payment did not go through. Your seat has been released. Please try again.", ar: "لم تنجح عملية الدفع. تم إلغاء حجز مقعدك. يرجى المحاولة مجددًا." },
  "booking.paidDesc":     { en: "Your payment of {amount} EGP was processed successfully. Your spot in {class} is confirmed.", ar: "تمت معالجة دفعتك البالغة {amount} جنيه بنجاح. تم تأكيد مقعدك في {class}." },
  "booking.pendingDesc":  { en: "We are waiting to confirm your payment for {class}. This usually takes a few seconds.", ar: "ننتظر تأكيد دفعتك لـ{class}. يستغرق ذلك عادةً بضع ثوانٍ." },
  "booking.cashDesc":     { en: "Your booking for {class} is received. Please pay the tutor directly at the class.", ar: "تم استلام حجزك لـ{class}. يرجى الدفع للمدرّس مباشرةً في الفصل." },
  "booking.details":      { en: "Booking Details",            ar: "تفاصيل الحجز" },
  "booking.class":        { en: "Class",                      ar: "الفصل" },
  "booking.subject":      { en: "Subject",                    ar: "المادة" },
  "booking.schedule":     { en: "Schedule",                   ar: "الجدول" },
  "booking.location":     { en: "Location",                   ar: "الموقع" },
  "booking.amount":       { en: "Amount",                     ar: "المبلغ" },
  "booking.platformFee":  { en: "Platform fee",               ar: "رسوم المنصة" },
  "booking.payment":      { en: "Payment",                    ar: "الدفع" },
  "booking.paymentOnline": { en: "Online — Paymob",           ar: "أونلاين — پيموب" },
  "booking.paymentCash":  { en: "Cash at class",              ar: "نقدًا في الفصل" },
  "booking.statusConfirmed": { en: "Confirmed",               ar: "مؤكّد" },
  "booking.statusPending": { en: "Pending",                   ar: "قيد الانتظار" },
  "booking.statusFailed": { en: "Payment Failed",             ar: "فشل الدفع" },
  "booking.viewBookings": { en: "View My Bookings",           ar: "عرض حجوزاتي" },
  "booking.browseMore":   { en: "Browse more classes",        ar: "تصفح المزيد من الفصول" },
  "booking.tryAgain":     { en: "Try Booking Again",          ar: "المحاولة مجددًا" },
  "booking.whatsapp":     { en: "Message {name} on WhatsApp", ar: "راسل {name} على واتساب" },
  "booking.whatsappMsg":  { en: "Hi {name}, I just booked your class \"{title}\" on Coursaty. Looking forward to it!", ar: "مرحبًا {name}، لقد حجزت للتو فصل \"{title}\" على كورساتي. أتطلع للقائك!" },

  // ── Dashboard — tabs ──────────────────────────────────────────────────────────
  "dash.tab.overview":    { en: "Overview",                   ar: "نظرة عامة" },
  "dash.tab.classes":     { en: "My Classes",                 ar: "فصولي" },
  "dash.tab.bookings":    { en: "My Bookings",                ar: "حجوزاتي" },
  "dash.tab.students":    { en: "Students",                   ar: "الطلاب" },
  "dash.tab.center":      { en: "My Center",                  ar: "مركزي" },
  "dash.tab.analytics":   { en: "Analytics",                  ar: "التحليلات" },

  // ── Dashboard — stat labels ───────────────────────────────────────────────────
  "dash.stat.classes":    { en: "Classes",                    ar: "الفصول" },
  "dash.stat.students":   { en: "Students",                   ar: "الطلاب" },
  "dash.stat.bookings":   { en: "Bookings",                   ar: "الحجوزات" },
  "dash.stat.revenue":    { en: "Revenue",                    ar: "الإيرادات" },
  "dash.stat.egp":        { en: "EGP",                        ar: "ج.م." },
  "dash.stat.confirmed":  { en: "Confirmed",                  ar: "مؤكّدة" },
  "dash.stat.pending":    { en: "Pending",                    ar: "قيد الانتظار" },

  // ── Dashboard — section headers ───────────────────────────────────────────────
  "dash.section.yourClasses":       { en: "Your Classes",           ar: "فصولك" },
  "dash.section.yourBookings":      { en: "Your Bookings",          ar: "حجوزاتك" },
  "dash.section.recentBookings":    { en: "Recent Bookings",        ar: "آخر الحجوزات" },
  "dash.section.students":          { en: "Enrolled Students",      ar: "الطلاب المسجّلون" },
  "dash.section.revenue":           { en: "Revenue Overview",       ar: "نظرة على الإيرادات" },
  "dash.section.analytics":         { en: "Analytics Overview",     ar: "نظرة على التحليلات" },
  "dash.section.learningEngagement":{ en: "Learning Engagement",    ar: "مستوى المشاركة" },
  "dash.section.topEnrollments":    { en: "Top Enrollments",        ar: "أعلى تسجيلات" },
  "dash.section.perClassBreakdown": { en: "Per-Class Breakdown",    ar: "تفاصيل كل فصل" },
  "dash.section.centerOverview":    { en: "Center Overview",        ar: "نظرة عامة على المركز" },
  "dash.section.allClasses":        { en: "All Classes",            ar: "جميع الفصول" },
  "dash.section.allStudents":       { en: "All Students",           ar: "جميع الطلاب" },
  "dash.section.studentsCount":     { en: "Students ({n})",         ar: "الطلاب ({n})" },

  // ── Dashboard — stat labels (extended) ───────────────────────────────────────
  "dash.stat.totalClasses":   { en: "Total Classes",               ar: "إجمالي الفصول" },
  "dash.stat.totalStudents":  { en: "Total Students",              ar: "إجمالي الطلاب" },
  "dash.stat.totalTutors":    { en: "Total Tutors",                ar: "إجمالي المدرّسين" },
  "dash.stat.estRevenue":     { en: "Est. Revenue",                ar: "الإيرادات التقديرية" },
  "dash.stat.avgClass":       { en: "Avg / Class",                 ar: "متوسط / فصل" },
  "dash.stat.avgEnrollments": { en: "Avg Enrollments",             ar: "متوسط التسجيلات" },
  "dash.stat.price":          { en: "Price",                       ar: "السعر" },

  // ── Dashboard — empty states ──────────────────────────────────────────────────
  "dash.empty.classes":              { en: "No classes yet. Create your first class to get started.", ar: "لا فصول بعد. أنشئ فصلك الأول للبدء." },
  "dash.empty.bookings":             { en: "No bookings yet. Browse available classes to book your first session.", ar: "لا حجوزات بعد. تصفح الفصول المتاحة لحجز أول جلسة." },
  "dash.empty.students":             { en: "No students enrolled yet.",  ar: "لم يُسجَّل طلاب بعد." },
  "dash.empty.classes.action":       { en: "Create a Class",        ar: "إنشاء فصل" },
  "dash.empty.bookings.action":      { en: "Browse Classes",        ar: "تصفح الفصول" },
  "dash.empty.noCreatedClasses":     { en: "You haven't created any classes yet.", ar: "لم تُنشئ أي فصول بعد." },
  "dash.empty.centerClasses":        { en: "No classes created for this center yet.", ar: "لا فصول مُنشأة لهذا المركز بعد." },
  "dash.empty.centerClasses.action": { en: "Create First Class",    ar: "إنشاء أول فصل" },
  "dash.empty.centerTutors":         { en: "No tutors assigned to this center yet.", ar: "لا مدرّسين مُعيَّنين لهذا المركز بعد." },

  // ── Dashboard — action buttons ────────────────────────────────────────────────
  "dash.action.createClass":     { en: "Create Class",             ar: "إنشاء فصل" },
  "dash.action.editClass":       { en: "Edit",                     ar: "تعديل" },
  "dash.action.deleteClass":     { en: "Delete",                   ar: "حذف" },
  "dash.action.view":            { en: "View",                     ar: "عرض" },
  "dash.action.viewClass":       { en: "View Class",               ar: "عرض الفصل" },
  "dash.action.newClass":        { en: "+ New Class",              ar: "+ فصل جديد" },
  "dash.action.manageBookings":  { en: "Manage bookings",          ar: "إدارة الحجوزات" },
  "dash.action.editProfile":     { en: "Edit Profile",             ar: "تعديل الملف الشخصي" },
  "dash.action.backToDashboard": { en: "Back to Dashboard",        ar: "العودة للوحة التحكم" },
  "dash.action.viewPublicPage":  { en: "View Public Page",         ar: "عرض الصفحة العامة" },
  "dash.action.cancelBooking":   { en: "Cancel",                   ar: "إلغاء" },
  "dash.action.markPaid":        { en: "Mark paid",                ar: "تسجيل كمدفوع" },
  "dash.action.markAttended":    { en: "Mark attended",            ar: "تسجيل كحاضر" },
  "dash.action.noShow":          { en: "No-show",                  ar: "لم يحضر" },
  "dash.action.addNote":         { en: "Add note",                 ar: "إضافة ملاحظة" },
  "dash.action.editNote":        { en: "Edit note",                ar: "تعديل الملاحظة" },
  "dash.action.saveNote":        { en: "Save note",                ar: "حفظ الملاحظة" },

  // ── Dashboard — status labels ─────────────────────────────────────────────────
  "dash.status.CONFIRMED":  { en: "Confirmed",                ar: "مؤكّد" },
  "dash.status.CANCELLED":  { en: "Cancelled",                ar: "ملغى" },
  "dash.status.PENDING":    { en: "Pending",                  ar: "قيد الانتظار" },
  "dash.status.PAID":       { en: "Paid",                     ar: "مدفوع" },
  "dash.status.UNPAID":     { en: "Unpaid",                   ar: "غير مدفوع" },
  "dash.status.REFUNDED":   { en: "Refunded",                 ar: "مُستردّ" },
  "dash.status.ATTENDED":   { en: "Attended",                 ar: "حضر" },
  "dash.status.NO-SHOW":    { en: "No-show",                  ar: "لم يحضر" },

  // ── Dashboard — misc ──────────────────────────────────────────────────────────
  "dash.enrolled":        { en: "enrolled",                   ar: "مسجّل" },
  "dash.full":            { en: "Full",                       ar: "ممتلئ" },
  "dash.left":            { en: "{n} left",                   ar: "تبقّى {n}" },
  "dash.paid":            { en: "Paid {date}",                ar: "مدفوع {date}" },
  "dash.free":            { en: "Free",                       ar: "مجاني" },
  "dash.email":           { en: "Email",                      ar: "البريد" },
  "dash.whatsapp":        { en: "WhatsApp",                   ar: "واتساب" },
  "dash.by":              { en: "by {name}",                  ar: "بواسطة {name}" },
  "dash.nStudents":       { en: "students",                   ar: "طلاب" },
  "dash.nStudent":        { en: "student",                    ar: "طالب" },
  "dash.nClasses":        { en: "classes",                    ar: "فصول" },
  "dash.nClass":          { en: "class",                      ar: "فصل" },
  "dash.searchStudents":  { en: "Search students…",           ar: "ابحث عن طلاب…" },
  "dash.searchClasses":   { en: "Search classes…",            ar: "ابحث عن فصول…" },
  "dash.searchBookings":  { en: "Search bookings…",           ar: "ابحث عن حجوزات…" },
  "dash.noteHint":        { en: "Add class note, attendance detail, or payment context…", ar: "أضف ملاحظة للفصل، أو تفاصيل الحضور، أو سياق الدفع…" },
  "dash.role.STUDENT":    { en: "Student",                    ar: "طالب" },
  "dash.role.TUTOR":      { en: "Tutor",                      ar: "مدرّس" },
  "dash.role.CENTER_ADMIN": { en: "Center Admin",             ar: "مدير مركز" },
  "dash.profile.complete": { en: "Complete your profile ({pct}%)", ar: "أكمل ملفك الشخصي ({pct}%)" },
  "dash.profile.done":    { en: "{n}/{total} done",           ar: "{n}/{total} مكتمل" },
  "dash.profile.missing": { en: "Missing: {fields}",         ar: "ناقص: {fields}" },
  "dash.profile.bio":     { en: "bio",                        ar: "النبذة" },
  "dash.profile.phone":   { en: "phone",                      ar: "رقم الهاتف" },
  "dash.profile.subjects":{ en: "subjects",                   ar: "المواد" },
  "dash.profile.fullName":{ en: "full name",                  ar: "الاسم الكامل" },
  "dash.explore.desc":    { en: "Find new classes that match your learning goals.", ar: "اعثر على فصول جديدة تناسب أهدافك التعليمية." },
  "dash.chart.studyTime": { en: "Study Time",                 ar: "وقت الدراسة" },
  "dash.chart.hours":     { en: "{n} hours",                  ar: "{n} ساعة" },

  // ── Landing page — book & chapters ───────────────────────────────────────────
  "landing.spotsLeft":    { en: "{n} spots left",             ar: "تبقّى {n} مقاعد" },
  "landing.perSession":   { en: "/ session",                  ar: "/ جلسة" },
  "landing.chapter":      { en: "Chapter",                    ar: "الفصل" },
  "landing.cover":        { en: "Cover",                      ar: "الغلاف" },
  "landing.epilogue":     { en: "Epilogue",                   ar: "الخاتمة" },
  "landing.verifiedBadge": { en: "Verified",                  ar: "موثّق" },
  "landing.freeBadge":    { en: "Free",                       ar: "مجاني" },
  "landing.verifiedTutors": { en: "verified tutors",          ar: "مدرّسًا موثّقًا" },
  "landing.activeClasses": { en: "active classes",            ar: "فصلًا نشطًا" },
  "landing.seatsBooked":  { en: "seats booked",               ar: "مقعدًا محجوزًا" },
  "landing.previous":     { en: "Previous",                   ar: "السابق" },
  "landing.next":         { en: "Next",                       ar: "التالي" },
  "landing.muted":        { en: "Muted",                      ar: "صامت" },
  "landing.soundOn":      { en: "Sound on",                   ar: "الصوت مفعّل" },

  // ── Landing — TOC / chapters ──────────────────────────────────────────────────
  "landing.toc.find":     { en: "Find the right class",       ar: "اعثر على الفصل المناسب" },
  "landing.toc.how":      { en: "How Coursaty works",         ar: "كيف تعمل كورساتي" },
  "landing.toc.why":      { en: "Why it's different",         ar: "لماذا هي مختلفة" },
  "landing.toc.who":      { en: "Who it's for",               ar: "لمن هي" },
  "landing.toc.start":    { en: "Get started",                ar: "ابدأ الآن" },

  // ── Landing — trust items ─────────────────────────────────────────────────────
  "landing.trust.verified.title": { en: "Verified Tutors",   ar: "مدرّسون موثّقون" },
  "landing.trust.verified.body":  { en: "Every tutor is reviewed and verified before listing classes.", ar: "كل مدرّس يُراجع ويُوثَّق قبل نشر فصوله." },
  "landing.trust.booking.title":  { en: "Instant Booking",   ar: "حجز فوري" },
  "landing.trust.booking.body":   { en: "Confirm your spot in seconds — no calls, no waiting.", ar: "أكّد مقعدك في ثوانٍ — دون مكالمات أو انتظار." },
  "landing.trust.curricula.title": { en: "All Curricula",    ar: "جميع المناهج" },
  "landing.trust.curricula.body": { en: "Egyptian, British, American, IB, and more.", ar: "المناهج المصري والبريطاني والأمريكي والـ IB وغيرها." },
  "landing.trust.transparent.title": { en: "Transparent Fees", ar: "أسعار شفافة" },
  "landing.trust.transparent.body": { en: "See exactly what you pay, with no hidden charges.", ar: "انظر ما تدفعه بالضبط، دون رسوم خفية." },

  // ── Landing — steps ───────────────────────────────────────────────────────────
  "landing.step.search.title": { en: "Search & Filter",      ar: "ابحث وصفِّ" },
  "landing.step.search.body":  { en: "Filter by subject, grade, curriculum, area, and price.", ar: "صفِّ بالمادة والصف والمنهج والمنطقة والسعر." },
  "landing.step.compare.title": { en: "Compare Options",     ar: "قارن الخيارات" },
  "landing.step.compare.body": { en: "Review credentials, schedules, ratings, and fees.", ar: "راجع المؤهلات والجداول والتقييمات والرسوم." },
  "landing.step.book.title":   { en: "Book Instantly",       ar: "احجز فورًا" },
  "landing.step.book.body":    { en: "Confirm your seat with one click — no calls needed.", ar: "أكّد مقعدك بنقرة واحدة — لا مكالمات." },
  "landing.step.learn.title":  { en: "Start Learning",       ar: "ابدأ التعلّم" },
  "landing.step.learn.body":   { en: "Attend class and track everything from your dashboard.", ar: "احضر الفصل وتابع كل شيء من لوحة التحكم." },
  "nav.messages": { en: "Messages", ar: "الرسائل" },
  "mobileNav.aria": { en: "Mobile primary navigation", ar: "التنقل الرئيسي للجوال" },
  "mobileNav.browse": { en: "Browse", ar: "تصفح" },
  "mobileNav.profile": { en: "Profile", ar: "الملف" },

  "classes.kicker": { en: "Browse", ar: "تصفح" },
  "classes.title": { en: "Classes", ar: "الفصول" },
  "classes.summary": { en: "{count} classes across subjects, curricula, cities, and formats.", ar: "{count} فصلًا عبر المواد والمناهج والمدن وأنماط الحضور." },
  "classes.filters": { en: "Filters", ar: "الفلاتر" },
  "classes.results": { en: "{count} results", ar: "{count} نتيجة" },
  "classes.resultsWithFilters": { en: "{count} results, {filters} filters active", ar: "{count} نتيجة، {filters} فلاتر نشطة" },
  "classes.matching": { en: "{count} matching classes", ar: "{count} فصل مطابق" },
  "classes.sort.newest": { en: "Newest first", ar: "الأحدث أولًا" },
  "classes.sort.priceAsc": { en: "Price: Low to High", ar: "السعر: من الأقل للأعلى" },
  "classes.sort.priceDesc": { en: "Price: High to Low", ar: "السعر: من الأعلى للأقل" },
  "classes.sort.popular": { en: "Most popular", ar: "الأكثر شعبية" },
  "classes.sort.rating": { en: "Top rated", ar: "الأعلى تقييمًا" },
  "classes.empty.title": { en: "No classes found", ar: "لم يتم العثور على فصول" },
  "classes.empty.desc": { en: "Try changing your filters or search query.", ar: "جرّب تغيير الفلاتر أو عبارة البحث." },
  "classes.filter.search": { en: "Search classes", ar: "ابحث في الفصول" },
  "classes.filter.subject": { en: "Subject", ar: "المادة" },
  "classes.filter.allSubjects": { en: "All subjects", ar: "كل المواد" },
  "classes.filter.priceRange": { en: "Price range", ar: "نطاق السعر" },
  "classes.filter.maxPrice": { en: "Max price (EGP)", ar: "أقصى سعر (جنيه)" },
  "classes.filter.curriculum": { en: "Curriculum", ar: "المنهج" },
  "classes.filter.allCurricula": { en: "All curricula", ar: "كل المناهج" },
  "classes.filter.format": { en: "Format", ar: "طريقة الحضور" },
  "classes.filter.anyFormat": { en: "Any format", ar: "أي طريقة" },
  "classes.filter.city": { en: "City", ar: "المدينة" },
  "classes.filter.rating": { en: "Rating", ar: "التقييم" },
  "classes.filter.anyRating": { en: "Any rating", ar: "أي تقييم" },
  "classes.filter.starsPlus": { en: "{rating}+ stars", ar: "{rating}+ نجوم" },
  "classes.filter.close": { en: "Close filters", ar: "إغلاق الفلاتر" },
  "classes.filter.dialog": { en: "Class filters", ar: "فلاتر الفصول" },
  "classes.filter.resultCount": { en: "{count} of {total} results", ar: "{count} من {total} نتيجة" },
  "classes.loadingMore": { en: "Loading more...", ar: "جار تحميل المزيد..." },

  "materials.add": { en: "Add Material", ar: "إضافة مادة" },
  "materials.title": { en: "Title", ar: "العنوان" },
  "materials.url": { en: "URL", ar: "الرابط" },
  "materials.visible": { en: "Visible to students", ar: "مرئي للطلاب" },
  "materials.submit": { en: "Submit", ar: "إرسال" },

  "refund.request": { en: "Request Refund", ar: "طلب استرداد" },
  "refund.reason": { en: "Reason", ar: "السبب" },
  "refund.submit": { en: "Submit Request", ar: "إرسال الطلب" },
} as const;

type DictKey = keyof typeof DICT;
type Lang = "en" | "ar";

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: DictKey, vars?: Record<string, string | number>) => string;
  dir: "ltr" | "rtl";
}

const I18nContext = createContext<I18nContextValue>({
  lang: "en",
  setLang: () => {},
  t: (k) => DICT[k as DictKey]?.en ?? String(k),
  dir: "ltr",
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof document === "undefined") return "en";
    const stored = typeof window !== "undefined" ? localStorage.getItem("coursaty-lang") : null;
    if (stored === "ar" || stored === "en") return stored;
    const current = document.documentElement.lang;
    return current === "ar" ? "ar" : "en";
  });

  const apply = useCallback((l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") {
      localStorage.setItem("coursaty-lang", l);
      const html = document.documentElement;
      html.lang = l;
      html.dir = l === "ar" ? "rtl" : "ltr";
    }
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    html.lang = lang;
    html.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const t = useCallback(
    (key: DictKey, vars?: Record<string, string | number>): string => {
      const entry = DICT[key];
      if (!entry) return String(key);
      let s: string = entry[lang] ?? entry.en;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          s = s.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        }
      }
      return s;
    },
    [lang]
  );

  return (
    <I18nContext.Provider value={{ lang, setLang: apply, t, dir: lang === "ar" ? "rtl" : "ltr" }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);
