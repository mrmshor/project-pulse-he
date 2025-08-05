# 🚀 הוראות פריסה ל-GitHub וקובץ התקנה למק

## 📋 דרישות מוקדמות
- חשבון GitHub
- הפרויקט מוכן ב-Lovable

## 🔗 שלב 1: חיבור ל-GitHub

### דרך Lovable (מומלץ)
1. **לחץ על כפתור GitHub** בפינה הימנית העליונה של Lovable
2. **בחר "Connect to GitHub"**
3. **אמת גישה לחשבון GitHub** שלך
4. **בחר "Create Repository"** - Lovable ייצור רפוזיטורי חדש עם כל הקוד

### דרך ידנית (חלופית)
```bash
# צור רפוזיטורי חדש ב-GitHub ולאחר מכן:
git init
git add .
git commit -m "Initial commit - מנהל פרויקטים Pro"
git branch -M main
git remote add origin https://github.com/[USERNAME]/[REPO-NAME].git
git push -u origin main
```

## ⚙️ שלב 2: הכנת הפרויקט לבנייה

### וידוא קונפיגורציה
הקבצים הבאים כבר מוכנים ומוגדרים:
- ✅ `.github/workflows/build.yml` - GitHub Actions
- ✅ `src-tauri/tauri.conf.json` - קונפיגורציית Tauri
- ✅ `src-tauri/Cargo.toml` - תלותיות Rust

## 🎯 שלב 3: פרסום גרסה ויצירת קובץ התקנה

### פקודות לפרסום:
```bash
# 1. Clone הפרויקט למחשב (אם עדיין לא)
git clone https://github.com/[USERNAME]/[REPO-NAME].git
cd [REPO-NAME]

# 2. ודא שהכל מעודכן
git pull origin main

# 3. צור גרסה חדשה (שנה את מספר הגרסה לפי הצורך)
git tag v1.0.0
git push origin v1.0.0
```

### 🔄 מה קורה באופן אוטומטי:
1. **GitHub Actions מתחיל** - זיהוי ה-tag החדש
2. **בנייה במקביל** על 3 מערכות הפעלה:
   - 🍎 **macOS** (עבור Mac)
   - 🪟 **Windows** (עבור PC)
   - 🐧 **Linux** (עבור לינוקס)
3. **יצירת קבצי התקנה** מוכנים להורדה

## 📦 שלב 4: הורדת קובץ ההתקנה למק

### איפה למצוא:
1. **לך לרפוזיטורי שלך ב-GitHub**
2. **לחץ על "Releases"** (בצד ימין)
3. **תמצא Release חדש** בשם `מנהל פרויקטים Pro v1.0.0`
4. **לחץ "Edit"** על ה-Release (יהיה בסטטוס Draft)
5. **פרסם את ה-Release** על ידי לחיצה על "Publish Release"

### קבצי ההתקנה שיווצרו:
- 🍎 **למק**: `מנהל-פרויקטים-Pro_1.0.0_universal.dmg`
- 🪟 **לחלונות**: `מנהל-פרויקטים-Pro_1.0.0_x64.msi`
- 🐧 **ללינוקס**: `מנהל-פרויקטים-Pro_1.0.0_amd64.AppImage`

## 🖥️ התקנה במק

### אחרי הורדת קובץ ה-DMG:
1. **פתח את קובץ ה-DMG** שהורדת
2. **גרור את האפליקציה** לתיקיית Applications
3. **פתח Finder → Applications**
4. **לחיצה ימנית על האפליקציה → Open**
5. **אשר פתיחה** (ייתכן שיהיה אזהרת אבטחה ברצים הראשונים)

## 🔄 עדכון לגרסאות חדשות

```bash
# לכל גרסה חדשה:
git add .
git commit -m "עדכון לגרסה 1.0.1"
git tag v1.0.1
git push origin v1.0.1
```

## ⏱️ זמני בנייה משוערים

| מערכת הפעלה | זמן בנייה | קובץ פלט |
|-------------|-----------|----------|
| 🍎 macOS | 15-20 דקות | .dmg |
| 🪟 Windows | 10-15 דקות | .msi |
| 🐧 Linux | 8-12 דקות | .AppImage |

## 🛠️ פקודות שימושיות לפיתוח

```bash
# הרצה מקומית כאפליקציית דסקטופ
npm run dev

# בנייה מקומית (דורש Rust מותקן)
npm run tauri:build

# בדיקת סטטוס GitHub Actions
# לך ל: https://github.com/[USERNAME]/[REPO]/actions

# צפייה בכל הגרסאות
git tag --list

# מחיקת גרסה (אם צריך)
git tag -d v1.0.0
git push origin --delete v1.0.0
```

## 🎉 סיכום

אחרי ביצוע השלבים:
1. ✅ **הפרויקט ב-GitHub** עם GitHub Actions
2. ✅ **קובץ התקנה למק** (.dmg) מוכן להורדה
3. ✅ **תמיכה במערכות נוספות** (Windows, Linux)
4. ✅ **עדכונים אוטומטיים** לגרסאות חדשות

---

📧 **זקוק לעזרה?** צור issue ברפוזיטורי או בדוק את החוגי GitHub Actions לפרטי השגיאה.