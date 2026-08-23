# Облачная сборка APK через GitHub Actions

Этот проект подготовлен для сборки Android APK без локальной Android Studio.

## Что понадобится

- аккаунт GitHub;
- Git на Windows либо загрузка файлов через веб-интерфейс GitHub;
- браузер.

Android Studio, Android SDK и JDK на локальном компьютере не требуются.

## Вариант 1 — через Git на Windows

Создайте пустой репозиторий на GitHub, например:

`digital-ruble-pwa-mock`

Затем в PowerShell:

```powershell
cd C:\CR_LAB\digital-ruble-pwa-mock

git init
git add .
git commit -m "Initial Digital Ruble demo"
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_LOGIN>/digital-ruble-pwa-mock.git
git push -u origin main
```

## Вариант 2 — без Git

1. Создайте пустой repository на github.com.
2. Нажмите **Add file → Upload files**.
3. Загрузите содержимое этого проекта.
4. Важно: каталог `.github/workflows/` тоже должен попасть в repository.

## Как собрать APK

После загрузки проекта:

1. Откройте repository на GitHub.
2. Перейдите во вкладку **Actions**.
3. Выберите **Build Android APK**.
4. Нажмите **Run workflow**.
5. Дождитесь зелёной галочки.
6. Откройте завершившийся workflow.
7. Внизу страницы в разделе **Artifacts** скачайте:
   `digital-ruble-demo-apk`.
8. Распакуйте ZIP — внутри будет:
   `app-debug.apk`.

## Установка на Android

Передайте `app-debug.apk` на телефон и откройте его.

Android может попросить разрешить установку приложений из этого источника
(Chrome, Files, Telegram и т.п.). Разрешите установку для выбранного приложения.

Это debug APK для демонстрационного стенда, не для Google Play.

## Что делает GitHub Actions

Workflow автоматически:

1. ставит Node.js;
2. ставит Java;
3. выполняет `npm ci`;
4. собирает React/Vite через `npm run build`;
5. создаёт Android-проект Capacitor, если его ещё нет;
6. синхронизирует web build в Android;
7. запускает Gradle `assembleDebug`;
8. сохраняет готовый APK как GitHub Artifact.

## App ID

`ru.demo.digitalruble`

Имя Android-приложения:

`Digital Ruble Demo`
