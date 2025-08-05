# הוראות פריסה ל-GitHub

## שלבים להעברת הפרויקט ל-GitHub ויצירת קבצי התקנה

### 1. חיבור ל-GitHub
1. לחץ על כפתור **GitHub** בפינה הימנית העליונה של Lovable
2. בחר **"Export to GitHub"**
3. עקוב אחר ההוראות להתחברות לחשבון GitHub שלך
4. הפרויקט יועבר אוטומטית לרפוזיטורי חדש בחשבון שלך

### 2. הוספת סקריפטי Tauri ל-package.json

לאחר העברה ל-GitHub, תצטרך להוסיף את הסקריפטים הבאים לקובץ `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "tauri": "tauri",
    "tauri:dev": "tauri dev", 
    "tauri:build": "tauri build"
  }
}
```

### 3. פקודות לפרסום גרסה חדשה

לאחר שהפרויקט ב-GitHub:

```bash
# Clone הפרויקט למחשב שלך
git clone [URL של הרפוזיטורי שלך]
cd [שם הפרויקט]

# התקן dependencies
npm install

# יצור גרסה חדשה ופרסם
git tag v1.0.0
git push origin v1.0.0
```

### 4. GitHub Actions יבנה אוטומטית

GitHub Actions יזהה את ה-tag החדש ויתחיל לבנות:
- **macOS**: קובץ .dmg להתקנה במק
- **Windows**: קובץ .exe/.msi להתקנה בחלונות
- **Linux**: קובץ .AppImage להתקנה בלינוקס

### 5. הורדת קבצי ההתקנה

1. לך ל-**GitHub → Releases** ברפוזיטורי שלך
2. תמצא release חדש עם הגרסה שיצרת (יהיה בסטטוס "Draft")
3. ערוך את ה-Release ופרסם אותו
4. קבצי ההתקנה יהיו זמינים להורדה ב-**Assets**

### 6. קבצי ההתקנה שיווצרו

- **macOS**: `מנהל-פרויקטים-Pro_1.0.0_universal.dmg`
- **Windows**: `מנהל-פרויקטים-Pro_1.0.0_x64.msi`
- **Linux**: `מנהל-פרויקטים-Pro_1.0.0_amd64.AppImage`

## פקודות שימושיות

```bash
# בנייה מקומית (צריך Rust מותקן)
npm run tauri:build

# הרצה מקומית כאפליקציית דסקטופ
npm run tauri:dev

# בדיקת סטטוס ה-build
git log --oneline

# יצירת גרסאות נוספות
git tag v1.0.1
git push origin v1.0.1
```

## זמן בנייה משוער

- **macOS**: 15-20 דקות
- **Windows**: 10-15 דקות  
- **Linux**: 8-12 דקות

הקבצים יהיו מוכנים להורדה לאחר שהבנייה תסתיים והתצטרך לפרסם את ה-Release ידנית.