/**
 * רשימת הפרויקטים לתיק העבודות.
 *
 * כדי להוסיף פרויקט חדש, הוסף אובייקט לרשימה הזו.
 *
 * שדות:
 *   id       – מזהה ייחודי (אותיות קטנות, ללא רווחים)
 *   title    – שם הפרויקט
 *   desc     – תיאור קצר (2-3 משפטים)
 *   emoji    – אמוג'י שמוצג כשאין תמונה
 *   image    – נתיב לתמונת סקרין (אפשרי: null)
 *   link     – URL לאפליקציה / אתר החי
 *   tags     – מערך טכנולוגיות
 *   category – "app" | "web" | "tool"
 *   year     – שנה
 *   order    – סדר התצוגה (קטן = ראשון)
 *
 * התמונות ב-images/ נוצרו מצילום מסך של האתר החי (1200×750).
 * לרענון תמונה: לצלם מחדש ולשמור באותו שם קובץ.
 */

export const PROJECTS = [
  {
    id: "piaseczner",
    title: "האדמו״ר מפיאסצנה — בית מדרש דיגיטלי",
    desc: "בית מדרש דיגיטלי לתורת ר׳ קלונימוס קלמיש שפירא הי״ד. כל הספרים — דרך המלך, אש קודש, חובת התלמידים ועוד — בעריכה מאירה, עם לימוד יומי, דרשות על פרשת השבוע וחיפוש בכל הכתבים.",
    emoji: "✡️",
    image: "images/piaseczner.jpg",
    link: "https://piaseczner.vercel.app/",
    tags: ["Next.js", "Supabase", "PWA", "Google Play"],
    category: "web",
    year: "2026",
    order: 1
  },
  {
    id: "torat-nachman",
    title: "תורת רבי נחמן מברסלב",
    desc: "ארון הספרים הברסלבי המלא, ממופה ומקושר — ליקוטי מוהר״ן וליקוטי הלכות עם ״מהלך״ רעיוני שמתמצת כל תורה לפי נושאיה. חיפוש בכל הספרים, מדור תפילות ומדור חגים.",
    emoji: "🕯️",
    image: "images/torat-nachman.jpg",
    link: "https://torat-nachman.vercel.app/",
    tags: ["Next.js", "Supabase", "ייצוא סטטי", "SEO"],
    category: "web",
    year: "2026",
    order: 2
  },
  {
    id: "tanach-yb-bagrut",
    title: "תנ״ך י״ב — כל הדרך לבגרות",
    desc: "אתר הלימוד לבגרות בתנ״ך חמ״ד, שאלון 2575 (5 יח״ל). יחידות מבוארות בדברים, ירמיהו, יחזקאל, עזרא ונחמיה, בחנים, סימולציות ומבחני בגרות אמיתיים.",
    emoji: "📜",
    image: "images/tanach-yb-bagrut.jpg",
    link: "https://tanach-yb-bagrut.web.app/",
    tags: ["Firebase", "JavaScript", "PWA"],
    category: "web",
    year: "2026",
    order: 3
  },
  {
    id: "gemara-sukkah",
    title: "מסכת סוכה — מהדף אל הבגרות",
    desc: "אתר לימוד כיתתי ליחידת ההגבר בגמרא במסלול תושב״ע. משימות פענוח סוגיה, רש״י, מקורות ובחנים — מהדף הראשון ועד הבגרות.",
    emoji: "📖",
    image: "images/gemara-sukkah.jpg",
    link: "https://sukkah-bagrut-yb.web.app/",
    tags: ["Firebase", "Firestore", "JavaScript"],
    category: "web",
    year: "2026",
    order: 4
  },
  {
    id: "math-yud",
    title: "מתמטיקה כיתה י׳",
    desc: "הכנה למבחן החלוקה ליחידות: הסברים, תרגול ומבחנים בחמישה נושאים — צמצום שברים, משוואות ואי-שוויונים, פרבולות, סטטיסטיקה והסתברות. נוסחאות חיות עם KaTeX.",
    emoji: "📐",
    image: "images/math-yud.jpg",
    link: "https://math-yud.vercel.app/",
    tags: ["Next.js", "KaTeX", "PWA"],
    category: "app",
    year: "2026",
    order: 5
  },
  {
    id: "mechina-lachaim",
    title: "מכינה לחיים — מסע שנת י״ב",
    desc: "אתר המסע של שכבת י״ב בישיבה התיכונית זכרון יעקב. תכנים, לוח מסע ומשימות לשנה האחרונה בישיבה — לקראת היציאה לחיים.",
    emoji: "🎓",
    image: "images/mechina-lachaim.jpg",
    link: "https://mechina-lachaim-yb.web.app/",
    tags: ["Firebase", "JavaScript", "RTL"],
    category: "web",
    year: "2026",
    order: 6
  },
  {
    id: "bocharim-ahava",
    title: "בוחרים אהבה — בונים כבוד",
    desc: "אתר ההרצאות והסדנאות לבני נוער על זוגיות בריאה ובניית קשר יציב. דף נחיתה עם מערכת המלצות חיה, טפסי תיאום ואופטימיזציה לחיפוש.",
    emoji: "❤️",
    image: "images/bocharim-ahava.jpg",
    link: "https://bocharim-ahava.web.app/",
    tags: ["Firebase", "Firestore", "SEO"],
    category: "web",
    year: "2026",
    order: 7
  },
  {
    id: "tamar-mamet",
    title: "קבוצה היא כח — תמר ממט",
    desc: "אתר תדמית לסדנאות גיבוש והעצמה לכיתות. עמוד אחד זורם עם מסלולים, המלצות וטופס יצירת קשר — בנוי לנייד ומוכר בגפ״ן.",
    emoji: "🤝",
    image: "images/tamar-mamet.jpg",
    link: "https://tamar-mamet.web.app/",
    tags: ["Firebase Hosting", "HTML/CSS", "SEO"],
    category: "web",
    year: "2026",
    order: 8
  },
  {
    id: "tivei-labayit",
    title: "טבעי לבית",
    desc: "חנות הזמנות אונליין למשק חקלאי — מיצים סחוטים, שמן זית, טחינה ופירות קפואים. ההזמנה נשלחת ישירות בוואטסאפ, והמחירים נערכים מגוגל שיטס בלי לגעת בקוד.",
    emoji: "🥑",
    image: "images/tivei-labayit.jpg",
    link: "https://tivei-labayit.vercel.app/",
    tags: ["Vercel", "Google Sheets", "WhatsApp", "PWA"],
    category: "web",
    year: "2026",
    order: 9
  },
  {
    id: "gitara",
    title: "לומדים גיטרה",
    desc: "מסע לימוד גיטרה מאפס בעברית — אקורדים, מעברים ושירים אמיתיים, שלב אחרי שלב. כולל דיאגרמות אינטראקטיביות, נגינת דגימות וטיונר. בחנות Google Play.",
    emoji: "🎸",
    image: "images/gitara.jpg",
    link: "https://lomdim-gitara.web.app/",
    tags: ["Firebase", "PWA", "Web Audio", "Google Play"],
    category: "app",
    year: "2026",
    order: 10
  },
  {
    id: "kamancheh",
    title: "לומדים קמנצ'ה",
    desc: "אפליקציית לימוד לכלי הפרסי העתיק — מכיוון המיתרים ועד נגינה, בעברית מלאה. מסע לימוד מדורג עם דיאגרמות, דגימות שמע וזיהוי צליל מהמיקרופון.",
    emoji: "🎻",
    image: "images/kamancheh.jpg",
    link: "https://lomdim-kamancheh.web.app/",
    tags: ["Firebase", "PWA", "Web Audio"],
    category: "app",
    year: "2026",
    order: 11
  },
  {
    id: "shnayim-mikra",
    title: "שניים מקרא ואחד תרגום",
    desc: "אפליקציה לקריאת פרשת השבוע לפי מנהג שניים מקרא ואחד תרגום — מעקב אחר כל עלייה וכל קריאה, התחברות עם גוגל וסנכרון בין מכשירים. בחנות Google Play.",
    emoji: "📖",
    image: "images/shnayim-mikra.jpg",
    link: "https://shnayim-mikra-app.web.app/",
    tags: ["React", "Firebase", "PWA", "Google Play"],
    category: "app",
    year: "2026",
    order: 12
  },
  {
    id: "hilula",
    title: "הילולא",
    desc: "תזכורות לימי הילולא של צדיקים לפי הלוח העברי — התראה בערב ההילולא, נוסחי תפילה והדלקת נר נשמה, והכול מסונכרן לחשבון האישי.",
    emoji: "🕯️",
    image: "images/hilula.jpg",
    link: "https://hilula-app.web.app/",
    tags: ["React", "Firebase", "PWA", "Hebcal"],
    category: "app",
    year: "2026",
    order: 13
  },
  {
    id: "koach-5",
    title: "5 דקות כוח",
    desc: "אימון כוח יומי של חמש דקות — דחיפה, משיכה וליבה לסירוגין, עם מעקב רצף וסטטיסטיקות. אפליקציית PWA שנפתחת מיד ועובדת גם בלי רשת.",
    emoji: "💪",
    image: "images/koach-5.jpg",
    link: "https://koach-5.web.app/",
    tags: ["PWA", "JavaScript", "Offline"],
    category: "app",
    year: "2026",
    order: 14
  },
  {
    id: "dream-journal",
    title: "יומן חלומות",
    desc: "יומן חלומות אישי, שקט ופרטי — תיעוד חלומות עם תגיות ורגשות, שלב הירח, לוח שנה וסטטיסטיקות שמזהות דפוסים חוזרים. עברית ואנגלית.",
    emoji: "🌙",
    image: "images/dream-journal.jpg",
    link: "https://dream-journal-aa25d.web.app/",
    tags: ["React", "Firebase", "PWA"],
    category: "app",
    year: "2026",
    order: 15
  },
  {
    id: "shas-tracker",
    title: "מעקב הש״ס",
    desc: "מעקב אישי בדרך לסיום הש״ס — סימון דפים שנלמדו, התקדמות חזותית לכל מסכת וסנכרון בין מכשירים. בחנות Google Play.",
    emoji: "📚",
    image: "images/shas-tracker.jpg",
    link: "https://atz1800.github.io/shas-tracker/",
    tags: ["Firebase", "PWA", "Google Play"],
    category: "app",
    year: "2026",
    order: 16
  },
  {
    id: "midrash-rabbah-tracker",
    title: "מעקב מדרש רבה",
    desc: "כלי מעקב ייעודי ללימוד מדרש רבה — סימון פרשיות שנלמדו, אחוז השלמה לכל ספר, ודרך מסודרת לסיים את כל המדרש.",
    emoji: "📚",
    image: "images/midrash-rabbah-tracker.jpg",
    link: "https://atz1800.github.io/midrash-rabbah-tracker/",
    tags: ["JavaScript", "Firebase", "PWA"],
    category: "app",
    year: "2026",
    order: 17
  },
  {
    id: "chidushei-torah",
    title: "חידושי תורה",
    desc: "מחברת דיגיטלית לרישום חידושי תורה — כתיבה, ארגון וחיפוש לפי פרשה, נושא או מקור, עם ייצוא לקובץ. הכול במקום אחד ומגובה בענן.",
    emoji: "💡",
    image: "images/chidushei-torah.jpg",
    link: "https://atz1800.github.io/chidushei-torah/",
    tags: ["Firebase", "Google Auth", "JavaScript"],
    category: "app",
    year: "2026",
    order: 18
  },
  {
    id: "niggunim",
    title: "יומן הניגונים",
    desc: "מאגר אישי לניגונים — שם, אקורדים, מקור והסיפור שמלווה כל ניגון, עם דירוג וחיפוש. כדי שתמיד תמצא את הניגון הנכון לרגע הנכון.",
    emoji: "🎵",
    image: "images/niggunim.jpg",
    link: "https://atz1800.github.io/niggunim/",
    tags: ["Firebase", "Google Auth", "JavaScript"],
    category: "app",
    year: "2026",
    order: 19
  },
  {
    id: "sipurei-chaim",
    title: "סיפורי חיים",
    desc: "אתר לתיעוד זיכרונות משפחתיים — סיפורים, חוויות ותובנות של היקירים שלנו, בעיצוב ארכיוני חם, לדורות הבאים.",
    emoji: "📝",
    image: "images/sipurei-chaim.jpg",
    link: "https://atz1800.github.io/sipurei-chaim/",
    tags: ["React", "Firebase", "Firestore"],
    category: "app",
    year: "2026",
    order: 20
  },
  {
    id: "giyur-quiz",
    title: "נתיב ליהדות — סימולטור בית הדין",
    desc: "תרגול שאלות ותשובות לקראת בית הדין לגיור — הלכה, מועדים, תפילה וכשרות, בשש שפות ובפורמט חידון נגיש.",
    emoji: "🕍",
    image: "images/giyur-quiz.jpg",
    link: "https://giyur-quiz.vercel.app/",
    tags: ["React", "Vercel", "רב-לשוני"],
    category: "app",
    year: "2026",
    order: 21
  },
  {
    id: "aramaic-game",
    title: "משחק ארמית — 300 מילים",
    desc: "משחק אינטראקטיבי ללימוד אוצר המילים הארמי של הגמרא — 300 מילים, טבלת מובילים ורמות קושי. מתאים למי שמתחיל ללמוד גמרא.",
    emoji: "🎮",
    image: "images/aramaic-game.jpg",
    link: "https://atz1800.github.io/-aramaic-game-/game6.html",
    tags: ["HTML", "CSS", "JavaScript"],
    category: "app",
    year: "2025",
    order: 22
  },
  {
    id: "tzadok-dashboard",
    title: "דשבורד משפחתי",
    desc: "מרכז בקרה פיננסי למשפחה — הכנסות והוצאות, תקציב חודשי וגרפים, עם התחברות מורשית בלבד. נבנה כדי להחליף גיליון אקסל שהתפוצץ.",
    emoji: "📊",
    image: "images/tzadok-dashboard.jpg",
    link: "https://tzadok-dashboard.web.app/",
    tags: ["React", "Firebase", "Firestore"],
    category: "tool",
    year: "2026",
    order: 23
  }
];
