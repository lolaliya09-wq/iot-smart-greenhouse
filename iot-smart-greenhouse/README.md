# IoT Smart Greenhouse

Учебный прототип веб‑платформы управления теплицей (HTML + CSS + JS + Chart.js + localStorage).

## Запуск
Откройте папку через VS Code **Live Server** (или `python -m http.server`) и перейдите на `index.html`.

## Возможности
- 3 зоны (Tomatoes, Cucumbers, Greens), 6 датчиков, 6 исполнительных устройств
- Симулятор данных (каждые 3/5/10 сек; симуляция идёт, пока открыта любая страница)
- Manual / Auto; автоматика с гистерезисом; SAFETY: насос блокируется при низком уровне воды
- Alerts (warning/critical), Event Log, поиск и фильтры
- Analytics: 4 графика Chart.js, Risk Score, обнаружение резких изменений, рекомендации
- Settings: пороги по зонам, тема, скорость, сброс данных (localStorage)

## Структура
`*.html` — страницы, `assets/css/style.css`, `assets/js/` — data, storage, simulator, automation, alerts, analytics, dashboard (layout и страницы).

Пороги — учебные, не агрономические нормы. Секреты/ключи в репозиторий не добавлять.
