import type { FC, ReactNode } from "react";

export interface LandingStats {
  tutors: number;
  classes: number;
  bookings: number;
}

export interface FeaturedTutor {
  id: string;
  fullName: string | null;
  name: string | null;
  bio: string | null;
  subjects: string[];
  photoUrl: string | null;
  city: string | null;
  center: { id: string; name: string } | null;
  classCount: number;
  studentCount: number;
  avgRating: number | null;
  reviewCount: number;
  isVerified: boolean;
}

export interface FeaturedClass {
  id: string;
  title: string;
  subject: string;
  description: string | null;
  city: string;
  location: string | null;
  priceEgp: number;
  capacity: number | null;
  schedule: string | null;
  format: string;
  curriculum: string;
  gradeLevel: string | null;
  language: string;
  bookingsCount: number;
  spotsLeft: number | null;
  avgRating: number | null;
  reviewCount: number;
  center: { id: string; name: string; city: string } | null;
  owner: {
    id: string;
    fullName: string | null;
    name: string | null;
    photoUrl: string | null;
    isVerified: boolean;
  } | null;
}

export type IconComponent = FC<{ size?: number; strokeWidth?: number; color?: string; }>;
export interface TocData { id: string; title: string; desc: string; }
export interface StepData { title: string; desc: string; icon: IconComponent; }
export interface TrustData { title: string; desc: string; icon: IconComponent; }
export interface BookPageData {
  id: string;
  tab: string;
  left: ReactNode;
  right: ReactNode;
}

export const COPY = {
  en: {
    toc: [
      { id: "find",    title: "Find a tutor",    desc: "Search by subject, curriculum, location, and format." },
      { id: "compare", title: "Compare classes",  desc: "Review prices, schedules, seats, ratings, and profiles." },
      { id: "book",    title: "Book a session",   desc: "Reserve a seat and keep every booking organized." },
      { id: "learn",   title: "Start learning",   desc: "Move from scattered search to academic support faster." },
    ],
    steps: [
      { title: "Search",  desc: "Filter by subject, grade, curriculum, location, format, and price." },
      { title: "Compare", desc: "Read profiles, ratings, class details, and availability before committing." },
      { title: "Book",    desc: "Reserve a seat and keep the booking visible in your dashboard." },
      { title: "Learn",   desc: "Attend the class, contact the tutor, and stay organized from one place." },
    ],
    trust: [
      { title: "Verified tutors",    desc: "Profiles are reviewed so students and parents have a stronger starting point." },
      { title: "Organized booking",  desc: "Classes, seats, payment status, and schedules live in one structured flow." },
      { title: "Payment-ready",      desc: "Online and in-person options support different class formats and local needs." },
      { title: "Less chat chaos",    desc: "Coursaty turns scattered WhatsApp discovery into searchable, comparable choices." },
    ],
    cover: { fieldGuide: "Coursaty Field Guide", tagline: "Find the right tutor", verified: "Verified", comparable: "Comparable", bookable: "Bookable" },
    tutor: {
      fallbackName: "Coursaty Tutor",
      verified: "Verified",
      fallbackCity: "Cairo",
      classesSuffix: "classes",
      subjectsFallback: "core subjects",
      subjectsJoin: " and ",
      bioFallback: (name: string, subjects: string) => `${name} teaches ${subjects} with clear class options.`,
    },
    class: {
      online: "Online", hybrid: "Hybrid", inPerson: "In person",
      free: "Free",
      gradeDefault: "Students",
      spotsLeft: (n: number) => `${n} spots left`,
      descFallback: (grade: string) => `${grade} can compare the class, schedule, and seat availability before booking.`,
    },
    pages: {
      cover: {
        tab: "Cover", kicker: "Premium tutoring marketplace",
        heading: "Open the right path to better tutoring.",
        body: "Coursaty helps students and parents browse verified tutors, compare classes, and book academic support without scattered recommendations or message chaos.",
        btnBrowse: "Browse classes", btnTutors: "Find a tutor",
        statTutors: "verified tutors", statClasses: "active classes", statSeats: "seats booked", statCurricula: "curricula covered",
      },
      contents: {
        tab: "Contents", kicker: "Table of contents",
        heading: "A guided journey from search to first session.",
        body: "Start with the question every family has: who can help, when are they available, and how quickly can learning begin?",
        annotation: "Follow the path from discovery to booking with the important details visible at each step.",
        plateCaption: "Setup",
      },
      find: {
        tab: "Chapter I", kicker: "How it works",
        heading: "Four pages from uncertainty to a confirmed class.",
        body: "Coursaty is structured around the real workflow families already use: find credible options, compare fit, reserve the right session, and stay organized.",
        searchQueries: [
          "Math · IGCSE · Cairo",
          "Physics · Thanaweya Amma",
          "Chemistry · Online",
          "English · Year 11 · Heliopolis",
        ],
        chips: ["Math", "Physics", "Chemistry", "Online", "Hybrid", "IGCSE"],
        plateCaption: "Discover",
      },
      compare: {
        tab: "Chapter II", kicker: "Tutor and class discovery",
        heading: "A catalog that students can actually compare.",
        body: "Tutor profiles and class cards are treated like clean catalog entries: subject, curriculum, schedule, location, seats, price, and trust signals are all visible.",
        emptyTutors: "Verified tutor profiles will appear here as your marketplace grows.",
        emptyClasses: "Open class listings will appear here once classes are published.",
        btnBrowse: "Explore all classes",
        featuredCaption: "Featured tutor",
        featuredBio: "Bilingual tutor for IGCSE and Thanaweya Amma — calm, structured sessions for serious students.",
        plateCaption: "Catalog",
      },
      book: {
        tab: "Chapter III", kicker: "Trust and quality",
        heading: "More trustworthy than a forwarded phone number.",
        body: "Coursaty turns discovery into a clearer decision. Students see the essentials before booking, while tutors and centers manage demand in one place.",
        annotation: "The goal is not more decoration. It is a calmer system for choosing academic support with fewer unknowns.",
        plateCaption: "In-class",
        preview: {
          title: "IGCSE Physics — Mechanics",
          subtitle: "Tue & Thu · 7:00 PM · Heliopolis",
          ctaIdle: "Book seat",
          ctaBooking: "Reserving…",
          ctaConfirmed: "Confirmed",
          dashboardTitle: "Booking added",
          dashboardSub: "Visible in your dashboard",
          dashboardWhen: "Just now",
        },
      },
      learn: {
        tab: "Chapter IV", kicker: "Student outcome",
        heading: "Find support faster, then focus on the learning.",
        body: "The platform helps families move from uncertainty to action: fewer dead ends, better comparison, and a single record of what was booked.",
        outcome1Title: "Less time searching",
        outcome1Body: "Filtering narrows the options quickly so students can spend less time asking around.",
        outcome2Title: "Better class fit",
        outcome2Body: "Curriculum, level, price, format, and schedule are visible before the first message.",
        rightKicker: "Final page",
        rightHeading: "Start with the class that fits.",
        rightBody: "Browse current classes, compare available tutors, or create an educator profile if you are ready to teach through Coursaty.",
        rightBtn: "Browse all classes", rightBtnSecondary: "Join as a tutor",
        rightAnnotation: "Coursaty is built for Egypt’s tutoring market: verified educators, organized classes, and booking flows that respect how students actually choose support.",
        plateCaption: "Outcome",
        dashboard: {
          title: "Your bookings",
          live: "Live",
          row1Title: "IGCSE Physics — Mechanics",
          row1Sub: "Tue & Thu · 7:00 PM",
          row2Title: "Math Tutoring — One-on-One",
          row2Sub: "Online · This Saturday",
          row3Title: "Chemistry Review",
          row3Sub: "Awaiting payment confirmation",
          confirmed: "Confirmed",
          upcoming: "Upcoming",
          pending: "Pending",
        },
      },
    },
  },
  ar: {
    toc: [
      { id: "find",    title: "ابحث عن مدرّس",  desc: "ابحث حسب المادة والمنهج والموقع والطريقة." },
      { id: "compare", title: "قارن الفصول",     desc: "استعرض الأسعار والمواعيد والأماكن والتقييمات والملفات." },
      { id: "book",    title: "احجز جلسة",        desc: "احجز مقعداً وابقِ كل حجوزاتك منظّمة." },
      { id: "learn",   title: "ابدأ التعلّم",     desc: "انتقل من البحث المشتّت إلى الدعم الأكاديمي بسرعة." },
    ],
    steps: [
      { title: "ابحث",  desc: "صفّح حسب المادة والصف والمنهج والموقع والطريقة والسعر." },
      { title: "قارن",  desc: "اقرأ الملفات الشخصية والتقييمات وتفاصيل الفصل والإتاحة قبل الحجز." },
      { title: "احجز",  desc: "احجز مقعداً وابقِ الحجز ظاهراً في لوحة تحكّمك." },
      { title: "تعلّم", desc: "احضر الفصل وتواصل مع المدرّس وابقَ منظّماً من مكان واحد." },
    ],
    trust: [
      { title: "مدرّسون موثّقون", desc: "يُراجَع الملف الشخصي للمدرّسين لمنح الطلاب وأولياء الأمور نقطة انطلاق أقوى." },
      { title: "حجز منظّم",       desc: "الفصول والمقاعد وحالة الدفع والمواعيد في مسار واحد." },
      { title: "جاهز للدفع",      desc: "تدعم الخيارات الإلكترونية والحضورية تنسيقات الفصول المختلفة والاحتياجات المحلية." },
      { title: "أقل فوضى",        desc: "تحوّل Coursaty الاكتشاف المشتّت عبر واتساب إلى خيارات قابلة للبحث والمقارنة." },
    ],
    cover: { fieldGuide: "دليل Coursaty", tagline: "ابحث عن المدرّس المناسب", verified: "موثّق", comparable: "قابل للمقارنة", bookable: "قابل للحجز" },
    tutor: {
      fallbackName: "مدرّس Coursaty",
      verified: "موثّق",
      fallbackCity: "القاهرة",
      classesSuffix: "فصول",
      subjectsFallback: "المواد الأساسية",
      subjectsJoin: " و",
      bioFallback: (name: string, subjects: string) => `يدرّس ${name} ${subjects} مع خيارات فصول واضحة.`,
    },
    class: {
      online: "أونلاين", hybrid: "مختلط", inPerson: "حضوري",
      free: "مجاني",
      gradeDefault: "الطلاب",
      spotsLeft: (n: number) => `${n} أماكن متبقية`,
      descFallback: (grade: string) => `يمكن لـ${grade} مقارنة الفصل والجدول وتوفّر المقاعد قبل الحجز.`,
    },
    pages: {
      cover: {
        tab: "الغلاف", kicker: "منصة تعليم متميّزة",
        heading: "افتح الطريق الصحيح نحو تجربة تعليمية أفضل.",
        body: "تساعد Coursaty الطلاب وأولياء الأمور على تصفّح مدرّسين موثّقين، ومقارنة الفصول، وحجز الدعم الأكاديمي دون توصيات مشتّتة أو فوضى الرسائل.",
        btnBrowse: "تصفّح الفصول", btnTutors: "ابحث عن مدرّس",
        statTutors: "مدرّس موثّق", statClasses: "فصل نشط", statSeats: "مقعد محجوز", statCurricula: "مناهج مشمولة",
      },
      contents: {
        tab: "المحتويات", kicker: "جدول المحتويات",
        heading: "رحلة موجَّهة من البحث إلى أول جلسة.",
        body: "ابدأ بالسؤال الذي يطرحه كل عائلة: من يستطيع المساعدة، متى يكون متاحاً، وكم يستغرق البدء؟",
        annotation: "اتّبع المسار من الاكتشاف إلى الحجز مع ظهور التفاصيل المهمة في كل خطوة.",
        plateCaption: "البداية",
      },
      find: {
        tab: "الفصل الأول", kicker: "كيف يعمل",
        heading: "أربع خطوات من الحيرة إلى فصل مؤكّد.",
        body: "بُنيت Coursaty حول سير العمل الحقيقي الذي تتّبعه العائلات: إيجاد خيارات موثوقة، ومقارنة الملاءمة، وحجز الجلسة المناسبة، والبقاء منظّماً.",
        searchQueries: [
          "رياضيات · IGCSE · القاهرة",
          "فيزياء · ثانوية عامة",
          "كيمياء · أونلاين",
          "إنجليزي · سنة 11 · هليوبوليس",
        ],
        chips: ["رياضيات", "فيزياء", "كيمياء", "أونلاين", "مختلط", "IGCSE"],
        plateCaption: "اكتشف",
      },
      compare: {
        tab: "الفصل الثاني", kicker: "اكتشاف المدرّسين والفصول",
        heading: "كتالوج يمكن للطلاب فعلاً مقارنته.",
        body: "تُعامَل ملفات المدرّسين وبطاقات الفصول كإدخالات كتالوج واضحة: المادة والمنهج والجدول والموقع والمقاعد والسعر وعلامات الثقة — كلّها ظاهرة.",
        emptyTutors: "ستظهر ملفات المدرّسين الموثّقين هنا كلما نمت منصتك.",
        emptyClasses: "ستظهر قوائم الفصول المفتوحة هنا بمجرد نشر الفصول.",
        btnBrowse: "استكشف جميع الفصول",
        featuredCaption: "مدرّسة مميّزة",
        featuredBio: "مدرّسة ثنائية اللغة لـ IGCSE والثانوية العامة — جلسات هادئة ومنظّمة للطلاب الجادّين.",
        plateCaption: "الكتالوج",
      },
      book: {
        tab: "الفصل الثالث", kicker: "الثقة والجودة",
        heading: "أكثر موثوقية من رقم هاتف مُحال.",
        body: "تحوّل Coursaty الاكتشاف إلى قرار أوضح. يرى الطلاب الأساسيات قبل الحجز، بينما يدير المدرّسون والمراكز الطلب في مكان واحد.",
        annotation: "الهدف ليس المزيد من الزخارف. بل نظام أهدأ لاختيار الدعم الأكاديمي مع قدر أقل من المجهول.",
        plateCaption: "داخل الفصل",
        preview: {
          title: "فيزياء IGCSE — ميكانيكا",
          subtitle: "الثلاثاء والخميس · 7:00 م · هليوبوليس",
          ctaIdle: "احجز مقعدك",
          ctaBooking: "جارٍ الحجز…",
          ctaConfirmed: "تم التأكيد",
          dashboardTitle: "تمت إضافة الحجز",
          dashboardSub: "ظاهر في لوحة تحكّمك",
          dashboardWhen: "الآن",
        },
      },
      learn: {
        tab: "الفصل الرابع", kicker: "نتيجة الطالب",
        heading: "اعثر على الدعم بسرعة، ثم ركّز على التعلّم.",
        body: "تساعد المنصة العائلات على الانتقال من الحيرة إلى العمل: طرق مسدودة أقل، ومقارنة أفضل، وسجل واحد لما تم حجزه.",
        outcome1Title: "وقت أقل في البحث",
        outcome1Body: "يضيّق الفلتر الخيارات بسرعة حتى يقضي الطلاب وقتاً أقل في السؤال.",
        outcome2Title: "فصل أنسب",
        outcome2Body: "المنهج والمستوى والسعر والطريقة والجدول كلّها ظاهرة قبل أول رسالة.",
        rightKicker: "الصفحة الأخيرة",
        rightHeading: "ابدأ بالفصل المناسب.",
        rightBody: "تصفّح الفصول الحالية، وقارن المدرّسين المتاحين، أو أنشئ ملف مدرّس إذا كنت مستعداً للتدريس عبر Coursaty.",
        rightBtn: "تصفّح جميع الفصول", rightBtnSecondary: "انضم كمدرّس",
        rightAnnotation: "بُنيت Coursaty لسوق التعليم المصري: مدرّسون موثّقون، وفصول منظّمة، وتدفقات حجز تحترم الطريقة الحقيقية التي يختار بها الطلاب الدعم.",
        plateCaption: "النتيجة",
        dashboard: {
          title: "حجوزاتك",
          live: "مباشر",
          row1Title: "فيزياء IGCSE — ميكانيكا",
          row1Sub: "الثلاثاء والخميس · 7:00 م",
          row2Title: "دروس رياضيات خصوصية",
          row2Sub: "أونلاين · السبت القادم",
          row3Title: "مراجعة كيمياء",
          row3Sub: "بانتظار تأكيد الدفع",
          confirmed: "تم التأكيد",
          upcoming: "قريباً",
          pending: "معلّق",
        },
      },
    },
  },
};

