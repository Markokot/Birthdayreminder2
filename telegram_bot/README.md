# Telegram-бот для напоминаний о днях рождения

Бот читает данные из `birthdays.json` и отправляет уведомления в Telegram о предстоящих днях рождения.

## Установка

Бот не требует установки дополнительных библиотек — использует только стандартную библиотеку Python 3.

## Настройка

### 1. Создайте Telegram-бота

1. Откройте Telegram и найдите @BotFather
2. Отправьте команду `/newbot`
3. Следуйте инструкциям и получите **токен бота**

### 2. Узнайте свой Chat ID

1. Найдите @userinfobot в Telegram
2. Отправьте ему любое сообщение
3. Он ответит вашим **Chat ID**

### 3. Настройте переменные

Вариант А — через переменные окружения:
```bash
export TELEGRAM_BOT_TOKEN="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
export TELEGRAM_CHAT_ID="987654321"
export DATA_DIR="/home/user/Birthdayreminder2"
export DAYS_AHEAD="7"  # За сколько дней предупреждать
```

Вариант Б — отредактируйте файл `birthday_bot.py`:
```python
BOT_TOKEN = "ваш_токен_бота"
CHAT_ID = "ваш_chat_id"
```

## Запуск

### Ручной запуск
```bash
python3 birthday_bot.py
```

### Автоматический запуск (cron)

Для ежедневной проверки в 9:00 утра:

```bash
crontab -e
```

Добавьте строку:
```
0 9 * * * TELEGRAM_BOT_TOKEN="ваш_токен" TELEGRAM_CHAT_ID="ваш_id" DATA_DIR="/home/user/Birthdayreminder2" /usr/bin/python3 /home/user/Birthdayreminder2/telegram_bot/birthday_bot.py >> /var/log/birthday_bot.log 2>&1
```

### Systemd таймер (альтернатива cron)

Создайте файл `/etc/systemd/system/birthday-bot.service`:
```ini
[Unit]
Description=Birthday Reminder Bot

[Service]
Type=oneshot
Environment="TELEGRAM_BOT_TOKEN=ваш_токен"
Environment="TELEGRAM_CHAT_ID=ваш_id"
Environment="DATA_DIR=/home/user/Birthdayreminder2"
ExecStart=/usr/bin/python3 /home/user/Birthdayreminder2/telegram_bot/birthday_bot.py
```

Создайте файл `/etc/systemd/system/birthday-bot.timer`:
```ini
[Unit]
Description=Run Birthday Bot daily

[Timer]
OnCalendar=*-*-* 09:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

Активируйте:
```bash
sudo systemctl daemon-reload
sudo systemctl enable birthday-bot.timer
sudo systemctl start birthday-bot.timer
```

## Пример сообщения

```
🎂 Напоминание о днях рождения

Мама — 15 марта
🎉 СЕГОДНЯ! 🎁
Любит орхидеи и книги по садоводству.

Папа — 20 мая
Через 5 дн. 🎁
Нужен новый набор инструментов.
```

## Переменные окружения

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `TELEGRAM_BOT_TOKEN` | Токен бота от @BotFather | - |
| `TELEGRAM_CHAT_ID` | Ваш Chat ID | - |
| `DATA_DIR` | Путь к папке с данными | `/home/user/Birthdayreminder2` |
| `DAYS_AHEAD` | За сколько дней предупреждать | `7` |
