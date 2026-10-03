# תיק עבודות — עמיחי צדוק

אתר סטטי (HTML/CSS/JS ללא build) שמציג את הפרויקטים, עם ממשק ניהול מבוסס Supabase.

כתובת: https://atz1800.github.io/portfolio/

## מבנה

| קובץ | תפקיד |
|---|---|
| `index.html`, `style.css`, `app.js` | האתר הציבורי |
| `projects.js` | רשימת הפרויקטים הבסיסית — תמיד מוצגת, גם אם Supabase לא זמין |
| `images/` | צילומי מסך של הפרויקטים (1200×750) |
| `admin.html`, `admin.css`, `admin.js` | ממשק ניהול (כניסה בסיסמה, רק למייל המנהל) |
| `supabase-config.js` | כתובת ומפתח ציבורי (publishable) של Supabase |
| `404.html`, `robots.txt`, `sitemap.xml`, `manifest.webmanifest`, `og-image.png` | SEO ושיתוף |

## הוספת פרויקט

1. דרך ממשק הניהול (`admin.html`) — נשמר ב-Supabase ומופיע מיד.
2. או ידנית: להוסיף אובייקט ל-`projects.js` ותמונה ל-`images/`.

שורה ב-Supabase עם אותו `id` כמו בקובץ דורסת את השדות שיש בהם ערך.
כפתור העיפרון על כרטיס (כשמחוברים כמנהל) פותח את הפרויקט ישירות בממשק הניהול.

## פריסה

כל push ל-`main` מפרסם ל-`gh-pages` דרך GitHub Actions (`.github/workflows/deploy.yml`).

## אבטחה — חובה להגדיר ב-Supabase

המפתח ב-`supabase-config.js` ציבורי, ולכן ההגנה היחידה על הנתונים היא Row Level Security.
יש לוודא שהמדיניות הבאה מוגדרת (SQL Editor):

```sql
alter table portfolio_projects enable row level security;

create policy "Public read" on portfolio_projects
  for select using (true);

create policy "Admin write" on portfolio_projects
  for all using (auth.email() = 'amichai85@gmail.com')
  with check (auth.email() = 'amichai85@gmail.com');

create policy "Public read images" on storage.objects
  for select using (bucket_id = 'portfolio-images');

create policy "Admin upload images" on storage.objects
  for insert with check (bucket_id = 'portfolio-images' and auth.email() = 'amichai85@gmail.com');
```

מומלץ גם לכבות הרשמה של משתמשים חדשים (Authentication → Providers → Email → Allow new users to sign up).
