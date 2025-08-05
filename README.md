# 🎯 מנהל פרויקטים Pro

<div align="center">

![Project Manager Pro](https://img.shields.io/badge/Version-1.0.0-blue.svg)
![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20Desktop-green.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)
![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)

**מערכת ניהול פרויקטים ומשימות מתקדמת בעברית**

[🚀 הורדה](#-התקנה) • [📖 תיעוד](#-תכונות) • [🛠️ פיתוח](#-פיתוח) • [🐛 דיווח בעיות](https://github.com/username/repo/issues)

</div>

---

## 🌟 תיאור

מנהל פרויקטים Pro הוא כלי מתקדם לניהול פרויקטים ומשימות, המיועד לעבודה בעברית עם ממשק משתמש אינטואיטיבי ותכונות מתקדמות.

### ✨ תכונות עיקריות

#### 📊 ניהול פרויקטים
- **יצירה וניהול פרויקטים** עם תיאורים מפורטים
- **מעקב סטטוס** - תכנון, פעיל, הושלם, בהמתנה
- **רמות עדיפות** - נמוכה, בינונית, גבוהה
- **ניהול אנשי קשר** לכל פרויקט
- **אינטגרציה עם WhatsApp** למשלוח מהיר

#### ✅ ניהול משימות
- **משימות פרויקט** - קשורות לפרויקטים ספציפיים
- **משימות אישיות** - ניהול עצמאי
- **תאריכי יעד** ומעקב זמנים
- **מעקב התקדמות** עם גרפים ויזואליים
- **סינון וחיפוש מתקדם**

#### 📈 דשבורד ואנליטיקה
- **סטטיסטיקות בזמן אמת** על הפרויקטים והמשימות
- **גרפים אינטראקטיביים** - התקדמות שבועית, התפלגות סטטוסים
- **ניתוח עדיפויות** עם גרפים מפורטים
- **מעקב ביצועים** ושיעורי השלמה

#### 🎨 ממשק משתמש מתקדם
- **עיצוב מודרני ויפה** עם אנימציות חלקות
- **ניווט אינטואיטיבי** עם סיידברים חכמים
- **תמיכה מלאה בעברית** כולל RTL
- **סיידבר משימות** עם ניהול מהיר
- **סיידבר פרויקטים** עם סינון ומיון

### 🏗️ טכנולוגיות

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **State Management**: Zustand
- **UI Components**: shadcn/ui + Radix UI
- **Charts**: Recharts
- **Desktop App**: Tauri (Rust)
- **Build Tool**: Vite
- **Deployment**: GitHub Actions

---

## 🚀 התקנה

### 💻 אפליקציית דסקטופ (מומלץ)

#### macOS
1. הורד את קובץ ה-DMG מ-[GitHub Releases](https://github.com/username/repo/releases)
2. פתח את קובץ ה-DMG
3. גרור את האפליקציה לתיקיית Applications
4. פתח את האפליקציה (ייתכן צורך באישור אבטחה)

#### Windows
1. הורד את קובץ ה-MSI מ-[GitHub Releases](https://github.com/username/repo/releases)
2. הרץ את המתקין ועקוב אחר ההוראות

#### Linux
1. הורד את קובץ ה-AppImage מ-[GitHub Releases](https://github.com/username/repo/releases)
2. תן הרשאות הרצה: `chmod +x filename.AppImage`
3. הרץ את הקובץ

### 🌐 הרצה מקומית

```bash
# Clone הפרויקט
git clone https://github.com/username/repo.git
cd project-manager-pro

# התקן dependencies
npm install

# הרץ בפיתוח
npm run dev

# בנה לפרודקשן
npm run build
```

---

## 📖 שימוש

### ניהול פרויקטים
1. **לחץ על "פרויקטים"** בניווט העליון
2. **הוסף פרויקט חדש** עם כפתור ה-"+"
3. **מלא פרטים** - שם, תיאור, עדיפות, סטטוס
4. **הוסף אנשי קשר** לפרויקט
5. **נהל משימות** בתוך הפרויקט

### ניהול משימות
1. **משימות פרויקט** - מתווספות דרך עמוד הפרויקט
2. **משימות אישיות** - דרך הסיידבר השמאלי
3. **קביעת עדיפות** ותאריכי יעד
4. **מעקב התקדמות** בדשבורד

### דשבורד ואנליטיקה
- **צפה בסטטיסטיקות כלליות** בעמוד הבית
- **נתח גרפים** של התקדמות שבועית
- **עקוב אחר התפלגות עדיפויות**
- **בדוק משימות דחופות**

---

## 🛠️ פיתוח

### דרישות מוקדמות
- Node.js 18+
- Rust (לאפליקציית דסקטופ)
- Git

### הגדרת סביבת פיתוח
```bash
# Clone הפרויקט
git clone https://github.com/username/repo.git
cd project-manager-pro

# התקן dependencies
npm install

# הרץ בפיתוח
npm run dev

# לפיתוח אפליקציית דסקטופ
npm run tauri:dev
```

### סקריפטים זמינים
```bash
npm run dev          # הרצה בפיתוח
npm run build        # בנייה לפרודקשן
npm run preview      # תצוגה מקדימה של הבנייה
npm run tauri:dev    # אפליקציית דסקטופ בפיתוח
npm run tauri:build  # בנייה של אפליקציית דסקטופ
```

### מבנה הפרויקט
```
src/
├── components/          # קומפוננטי UI
│   ├── ui/             # קומפוננטי shadcn/ui
│   ├── Layout.tsx      # לייאאוט ראשי
│   ├── TopNavigation.tsx
│   └── ...
├── pages/              # עמודי האפליקציה
├── store/              # ניהול מצב (Zustand)
├── hooks/              # Custom hooks
├── services/           # שירותים וAPI
└── types/              # הגדרות TypeScript
```

---

## 🔄 פרסום גרסאות

### יצירת גרסה חדשה
```bash
# עדכן את הקוד
git add .
git commit -m "הוספת תכונה חדשה"

# צור tag לגרסה חדשה
git tag v1.1.0
git push origin v1.1.0
```

GitHub Actions יבנה אוטומטית את קבצי ההתקנה לכל המערכות.

---

## 🤝 תרומה

מוזמנים לתרום לפרויקט! 

1. **Fork** את הפרויקט
2. **צור branch** לתכונה חדשה (`git checkout -b feature/amazing-feature`)
3. **Commit** את השינויים (`git commit -m 'Add amazing feature'`)
4. **Push** ל-branch (`git push origin feature/amazing-feature`)
5. **פתח Pull Request**

---

## 📝 רישיון

הפרויקט מופץ תחת רישיון MIT. ראה את קובץ [LICENSE](LICENSE) לפרטים נוספים.

---

## 📞 יצירת קשר

- **GitHub Issues**: [דיווח על בעיות](https://github.com/username/repo/issues)
- **Discussions**: [דיונים ורעיונות](https://github.com/username/repo/discussions)

---

<div align="center">

**נוצר עם ❤️ בעברית**

[⬆️ חזרה למעלה](#-מנהל-פרויקטים-pro)

</div>
