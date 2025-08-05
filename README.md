# מנהל פרויקטים Pro

אפליקציית ניהול פרויקטים מתקדמת עם ממשק בעברית ותמיכה בפלטפורמות מרובות.

## תכונות

- ✅ ניהול פרויקטים ומשימות
- 👥 ניהול אנשי קשר וחיבור לאפליקציות חיצוניות
- 📱 תמיכה במספרי WhatsApp מרובים
- 📧 שליחת אימיילים ישירות מהאפליקציה
- 📞 חיוג ישיר למספרי טלפון
- 📁 פתיחת תיקיות מקושרות
- 🏷️ מערכת תגיות מתקדמת
- ⏱️ מדידת זמני עבודה
- 📊 דשבורד מתקדם עם גרפים
- 🌙 תמיכה במצב כהה/בהיר
- 💾 יצוא נתונים ל-Excel

## טכנולוגיות

- **Frontend**: React + TypeScript + Vite
- **UI Components**: Radix UI + shadcn/ui
- **Styling**: Tailwind CSS
- **Desktop App**: Tauri
- **State Management**: Zustand
- **Icons**: Lucide React

## הרצה מקומית

### דרישות מקדימות

- Node.js 18+ 
- Rust (עבור Tauri)
- npm או yarn

### התקנה

```bash
# Clone הפרויקט
git clone <YOUR_GIT_URL>
cd project-pulse-he

# התקן dependencies
npm install

# הרץ את האפליקציה בדפדפן
npm run dev

# הרץ את האפליקציה כ-desktop app
npm run tauri dev
```

### בנייה לפרודקשן

```bash
# בנה את האפליקציה לדפדפן
npm run build

# בנה קובץ התקנה לדסקטופ
npm run tauri build
```

## פרסום אוטומטי עם GitHub Actions

הפרויקט כולל GitHub Actions שבונה אוטומטית קבצי התקנה עבור:
- 🍎 macOS (.dmg)
- 🪟 Windows (.exe)
- 🐧 Linux (.AppImage)

### איך לפרסם גרסה חדשה:

1. **יצור tag חדש**:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **GitHub Actions יבנה אוטומטית**:
   - קבצי ההתקנה יתווספו כ-assets ל-Release החדש
   - ה-Release יכין כטיוטה ויצטרך אישור

3. **הפרסם את ה-Release**:
   - לך ל-GitHub → Releases
   - ערוך את הטיוטה
   - פרסם את ה-Release

### הורדת קבצי ההתקנה

לאחר הפרסום, המשתמשים יוכלו להוריד:
- **macOS**: `מנהל-פרויקטים-Pro_[version]_universal.dmg`
- **Windows**: `מנהל-פרויקטים-Pro_[version]_x64.msi`
- **Linux**: `מנהל-פרויקטים-Pro_[version]_amd64.AppImage`

## הגדרת GitHub

1. **התחבר ל-GitHub**:
   - לחץ על כפתור GitHub בלובייבל
   - עקב אחר ההוראות להתחברות

2. **העבר לפרודקשן**:
   - לחץ "Export to GitHub"
   - הפרויקט יועבר לרפוזיטורי הפרטי שלך

3. **בנה גרסה ראשונה**:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

## מבנה הפרויקט

```
src/
├── components/          # רכיבי UI
│   ├── ui/             # רכיבי UI בסיסיים
│   └── ...             # רכיבים מותאמים
├── pages/              # עמודים ראשיים
├── hooks/              # Hooks מותאמים
├── services/           # שירותים (Native, Export, וכו')
├── store/              # ניהול מצב עם Zustand
├── types/              # הגדרות TypeScript
└── lib/                # כלי עזר

src-tauri/              # קוד Rust לאפליקציית הדסקטופ
├── src/                # קוד המקור של Tauri
└── tauri.conf.json     # הגדרות Tauri
```
