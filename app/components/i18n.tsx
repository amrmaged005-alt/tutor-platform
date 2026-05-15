"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

// ─── Translation dictionary ───────────────────────────────────────────────────
// Add keys here. English values are the source of truth — keep keys descriptive.
// Use {placeholder} syntax for interpolation.
const DICT = {
  // Navigation
  "nav.classes":          { en: "Classes",            ar: "الفصول" },
  "nav.tutors":           { en: "Tutors",             ar: "المدرسون" },
  "nav.centers":          { en: "Centers",            ar: "المراكز" },
  "nav.forTutors":        { en: "For Tutors",         ar: "للمدرسين" },
  "nav.signIn":           { en: "Sign In",            ar: "تسجيل الدخول" },
  "nav.signOut":          { en: "Sign Out",           ar: "تسجيل الخروج" },
  "nav.dashboard":        { en: "Dashboard",          ar: "لوحة التحكم" },
  "nav.bookings":         { en: "Bookings",           ar: "الحجوزات" },
  "nav.createClass":      { en: "+ Create Class",     ar: "+ إنشاء فصل" },
  "nav.admin":            { en: "Admin",              ar: "المشرف" },
  "nav.browseClasses":    { en: "Browse Classes",     ar: "تصفح الفصول" },
  "nav.home":             { en: "Home",               ar: "الرئيسية" },

  // Hero / landing
  "hero.tag":             { en: "Egypt's tutoring marketplace", ar: "سوق المدرسين في مصر" },
  "hero.title":           { en: "Find a tutor your family can actually trust.", ar: "ابحث عن مدرّس يمكن لعائلتك الوثوق به." },
  "hero.subtitle":        { en: "Verified tutors, top learning centers, every curriculum. Compare, book, and start in minutes — without phone calls.", ar: "مدرّسون موثّقون، أفضل المراكز التعليمية، كل المناهج. قارن، احجز، وابدأ في دقائق — دون مكالمات هاتفية." },
  "hero.browseClasses":   { en: "Browse Classes",     ar: "تصفح الفصول" },
  "hero.findTutor":       { en: "Find a Tutor",       ar: "ابحث عن مدرّس" },
  "trust.verified":       { en: "Verified tutors",    ar: "مدرّسون موثّقون" },
  "trust.booking":        { en: "Instant booking",    ar: "حجز فوري" },
  "trust.curricula":      { en: "All curricula",      ar: "جميع المناهج" },
  "trust.centers":        { en: "Trusted centers",    ar: "مراكز موثوقة" },
  "trust.fees":           { en: "Transparent fees",   ar: "أسعار شفافة" },
  "curricula.label":      { en: "Curricula",          ar: "المناهج" },

  // Stats
  "stats.classes":        { en: "Active Classes",     ar: "فصول نشطة" },
  "stats.tutors":         { en: "Verified Tutors",    ar: "مدرّسون موثّقون" },
  "stats.seats":          { en: "Seats Booked",       ar: "مقاعد محجوزة" },
  "stats.curricula":      { en: "Curricula",          ar: "مناهج" },

  // How it works
  "how.label":            { en: "How it works",       ar: "كيف يعمل" },
  "how.title":            { en: "From search to first class in four steps", ar: "من البحث إلى أول فصل في أربع خطوات" },
  "how.search":           { en: "Search",             ar: "ابحث" },
  "how.searchDesc":       { en: "Filter by subject, grade, curriculum, area, and price to find the right class.", ar: "صفِّ بالمادة والصف والمنهج والمنطقة والسعر للعثور على الفصل المناسب." },
  "how.compare":          { en: "Compare",            ar: "قارن" },
  "how.compareDesc":      { en: "Review tutors and centers side by side — credentials, schedules, ratings, fees.", ar: "راجع المدرّسين والمراكز جنبًا إلى جنب — المؤهلات والجداول والتقييمات والرسوم." },
  "how.book":             { en: "Book",               ar: "احجز" },
  "how.bookDesc":         { en: "Confirm your seat instantly. Your booking is tracked in your dashboard.", ar: "أكّد مقعدك فورًا. يُتابع حجزك في لوحة التحكم الخاصة بك." },
  "how.learn":            { en: "Learn",              ar: "تعلّم" },
  "how.learnDesc":        { en: "Attend, message your tutor, and manage everything from one place.", ar: "احضر، راسل مدرّسك، وأدر كل شيء من مكان واحد." },

  // Features section
  "features.label":       { en: "Why Coursaty",       ar: "لماذا كورساتي" },
  "features.title":       { en: "Everything you need to find the right class", ar: "كل ما تحتاجه للعثور على الفصل المناسب" },
  "features.subtitle":    { en: "Built specifically for Egypt's students, parents, tutors, and learning centers.", ar: "صُمّم خصيصًا لطلاب وأولياء أمور ومدرّسي ومراكز التعليم في مصر." },

  // Role row
  "roles.label":          { en: "Who is Coursaty for", ar: "لمن كورساتي" },
  "roles.title":          { en: "A single platform, three sides of the marketplace", ar: "منصة واحدة، ثلاثة أطراف للسوق" },
  "roles.students":       { en: "Students & parents", ar: "الطلاب وأولياء الأمور" },
  "roles.studentsTitle":  { en: "Find the right tutor, fast", ar: "اعثر على المدرّس المناسب بسرعة" },
  "roles.tutors":         { en: "Independent tutors", ar: "المدرّسون المستقلون" },
  "roles.tutorsTitle":    { en: "Grow your student base", ar: "نمِّ قاعدة طلابك" },
  "roles.centers":        { en: "Learning centers",   ar: "مراكز التعلّم" },
  "roles.centersTitle":   { en: "Manage your whole operation", ar: "أدر عملك بالكامل" },

  // Footer
  "footer.tagline":       { en: "Egypt's tutoring marketplace — verified tutors, trusted centers, every curriculum.", ar: "سوق المدرسين في مصر — مدرّسون موثّقون، مراكز موثوقة، كل المناهج." },
  "footer.platform":      { en: "Platform",           ar: "المنصة" },
  "footer.partners":      { en: "For Partners",       ar: "للشركاء" },
  "footer.account":       { en: "Account",            ar: "الحساب" },
  "footer.createAccount": { en: "Create Account",     ar: "إنشاء حساب" },
  "footer.rights":        { en: "All rights reserved.", ar: "جميع الحقوق محفوظة." },
  "footer.privacy":       { en: "Privacy",            ar: "الخصوصية" },
  "footer.terms":         { en: "Terms",              ar: "الشروط" },
  "footer.contact":       { en: "Contact",            ar: "اتصل بنا" },

  // Auth
  "auth.welcome":         { en: "Welcome back — sign in to continue", ar: "أهلاً بعودتك — سجّل الدخول للمتابعة" },
  "auth.email":           { en: "Email address",      ar: "البريد الإلكتروني" },
  "auth.password":        { en: "Password",           ar: "كلمة المرور" },
  "auth.signIn":          { en: "Sign In",            ar: "تسجيل الدخول" },
  "auth.signingIn":       { en: "Signing in…",        ar: "جارٍ تسجيل الدخول…" },
  "auth.noAccount":       { en: "Don't have an account?", ar: "ليس لديك حساب؟" },
  "auth.createOne":       { en: "Create one free",    ar: "أنشئ واحدًا مجانًا" },
  "auth.created":         { en: "Account created. Sign in to continue.", ar: "تم إنشاء الحساب. سجّل الدخول للمتابعة." },
  "auth.invalid":         { en: "Invalid email or password", ar: "بريد إلكتروني أو كلمة مرور غير صحيحة" },

  // Booking modal
  "modal.signInRequired.title":   { en: "Sign in to book this class", ar: "سجّل الدخول لحجز هذا الفصل" },
  "modal.signInRequired.body":    { en: "Create an account or sign in to confirm your seat. It only takes a minute.", ar: "أنشئ حسابًا أو سجّل الدخول لتأكيد مقعدك. لن يستغرق الأمر دقيقة." },
  "modal.signInRequired.signIn":  { en: "Sign In",            ar: "تسجيل الدخول" },
  "modal.signInRequired.signUp":  { en: "Create Account",     ar: "إنشاء حساب" },
  "modal.signInRequired.cancel":  { en: "Continue Browsing",  ar: "متابعة التصفح" },

  // Final CTA
  "cta.ready":            { en: "Ready when you are", ar: "جاهزون متى ما أردت" },
  "cta.title":            { en: "Start finding the right class today", ar: "ابدأ في العثور على الفصل المناسب اليوم" },
  "cta.subtitle":         { en: "Hundreds of classes. Verified tutors. Cairo's best educators in one organized place.", ar: "مئات الفصول. مدرّسون موثّقون. أفضل المعلمين في القاهرة في مكان منظّم واحد." },
  "cta.browse":           { en: "Browse All Classes",  ar: "تصفح جميع الفصول" },
  "cta.createAccount":    { en: "Create an Account",   ar: "إنشاء حساب" },
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
