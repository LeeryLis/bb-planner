# Battle Brothers Planner
Планировщик перков для наёмников из игры Battle Brothers, встроенный в Obsidian. Позволяет собирать билды, сохранять их в виде обычных Markdown-заметок и загружать обратно. Вдохновлено сайтом https://www.bbplanner.xyz.
## Возможности
- Планирование перков - присутствуют все 50 перков игры.
- Иконки перков встроены в плагин (base64).
- Каждый билд сохраняется как `.md` с YAML-frontmatter (`type: bb-build`, `perks`, описание в теле заметки).
- Локализация - доступны английский и русский языки.
## Установка
### Через BRAT
1. Установите и включите плагин BRAT в Obsidian.
2. `Ctrl+P` -> `BRAT: Add a beta plugin for testing`.
3. Введите https://github.com/LeeryLis/bb-planner (или **LeeryLis/bb-planner**).
4. Выберите версию, нажмите `Add Plugin`, дождитесь установки.
5. Включите BB Planner в списке сторонних плагинов.
Обновления: `Ctrl+P` -> `BRAT: Check for updates to all beta plugins and UPDATE`
### Вручную
1. Скачайте `main.js`, `manifest.json` и `styles.css` из последнего релиза.
2. Положите их в `<vault>/.obsidian/plugins/bb-planner/`.
3. Перезапустите Obsidian и включите плагин в настройках.
Альтернативно - скачайте архив `bb-planner.zip` из релиза и распакуйте в `<vault>/.obsidian/plugins/` (папка `bb-planner` появится автоматически).
## Разработка
Требования: Node.js 18+, npm
```
git clone https://github.com/LeeryLis/bb-planner.git
cd bb-planner
npm install
npm run dev    # watch-режим, собирает dist/bb-planner/
npm run build  # production-сборка
```
Сборка складывается в `dist/bb-planner/` - готовую папку можно скопировать в `<vault>/.obsidian/plugins/`
## Структура проекта (src)
- **main.ts** - точка входа плагина
- **types.ts** - общие типы
- **data/perks.ts** - список перков
- **data/perk-icons.ts** - импорты иконок (base64 через esbuild loader)
- **i18n/** - локализация
- **models/BuildModel.ts** - логика выбора перков
- **models/BuildStore.ts** - чтение/запись .md-файлов
- **ui/views/PlannerView.ts** - главная панель плагина
## Совместимость
- Obsidian: 1.5.0+
- Платформы: desktop и мобильные
## Лицензия
MIT