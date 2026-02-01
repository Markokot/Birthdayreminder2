#!/usr/bin/env python3
"""
Telegram-бот для напоминаний о днях рождения.
Читает данные из birthdays.json и отправляет уведомления.

Установка:
    pip install python-telegram-bot

Настройка:
    1. Создайте бота через @BotFather в Telegram
    2. Получите токен бота
    3. Узнайте свой chat_id (можно через @userinfobot)
    4. Укажите токен и chat_id в переменных ниже или через переменные окружения

Запуск:
    python birthday_bot.py

Для автоматического запуска добавьте в cron:
    0 9 * * * /usr/bin/python3 /path/to/birthday_bot.py
"""

import json
import os
from datetime import datetime, timedelta
from pathlib import Path

# Настройки - можно переопределить через переменные окружения
BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "YOUR_BOT_TOKEN_HERE")
CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "YOUR_CHAT_ID_HERE")
DATA_DIR = os.environ.get("DATA_DIR", "/home/user/Birthdayreminder2")
DAYS_AHEAD = int(os.environ.get("DAYS_AHEAD", "7"))  # За сколько дней предупреждать
DEEPSEEK_API_KEY = os.environ.get("DEEPSEEK_API_KEY", "")

# Путь к файлу данных
BIRTHDAYS_FILE = os.path.join(DATA_DIR, "birthdays.json")

# Названия месяцев в родительном падеже
MONTHS_GENITIVE = [
    "января", "февраля", "марта", "апреля", "мая", "июня",
    "июля", "августа", "сентября", "октября", "ноября", "декабря"
]


def load_birthdays():
    """Загрузить дни рождения из JSON файла."""
    try:
        with open(BIRTHDAYS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Файл {BIRTHDAYS_FILE} не найден")
        return []
    except json.JSONDecodeError as e:
        print(f"Ошибка чтения JSON: {e}")
        return []


def format_date(date_str):
    """Форматировать дату в читаемый вид."""
    try:
        date = datetime.strptime(date_str, "%Y-%m-%d")
        day = date.day
        month = MONTHS_GENITIVE[date.month - 1]
        return f"{day} {month}"
    except ValueError:
        return date_str


def get_upcoming_birthdays(birthdays, days_ahead=7):
    """Найти дни рождения в ближайшие N дней."""
    today = datetime.now().date()
    upcoming = []
    
    for b in birthdays:
        try:
            birth_date = datetime.strptime(b["birthDate"], "%Y-%m-%d").date()
            # Проверяем дату в этом году
            this_year_birthday = birth_date.replace(year=today.year)
            
            # Если день рождения уже прошёл в этом году, смотрим на следующий
            if this_year_birthday < today:
                this_year_birthday = birth_date.replace(year=today.year + 1)
            
            days_until = (this_year_birthday - today).days
            
            if 0 <= days_until <= days_ahead:
                upcoming.append({
                    "name": b["name"],
                    "date": format_date(b["birthDate"]),
                    "days_until": days_until,
                    "description": b.get("description", ""),
                    "is_gift_required": b.get("isGiftRequired", False),
                })
        except (ValueError, KeyError) as e:
            print(f"Ошибка обработки записи: {e}")
            continue
    
    # Сортируем по количеству дней до дня рождения
    upcoming.sort(key=lambda x: x["days_until"])
    return upcoming


def format_message(upcoming_birthdays):
    """Сформировать сообщение для отправки."""
    if not upcoming_birthdays:
        return None
    
    lines = ["🎂 Напоминание о днях рождения\n"]
    
    for b in upcoming_birthdays:
        if b["days_until"] == 0:
            when = "🎉 СЕГОДНЯ!"
        elif b["days_until"] == 1:
            when = "⏰ Завтра"
        else:
            when = f"Через {b['days_until']} дн."
        
        gift_emoji = "🎁" if b["is_gift_required"] else ""
        
        line = f"\n{b['name']} — {b['date']}\n{when} {gift_emoji}"
        
        # Генерируем AI-поздравление для именинников сегодня или завтра
        if b["days_until"] <= 1 and DEEPSEEK_API_KEY:
            print(f"✨ Генерация поздравления для {b['name']}...")
            greeting = generate_greeting(b["name"], b["description"])
            if greeting:
                line += f"\n\n💬 Вариант поздравления:\n{greeting}"
        
        lines.append(line)
    
    return "\n".join(lines)


def generate_greeting(name, note=""):
    """Сгенерировать поздравление с помощью DeepSeek API."""
    import urllib.request
    import urllib.error
    
    if not DEEPSEEK_API_KEY:
        return None
    
    prompt = f"Напиши короткое (2-3 предложения) искреннее поздравление с днём рождения для {name}."
    if note:
        prompt += f" Учти следующую информацию о человеке: {note}"
    prompt += " Поздравление должно быть тёплым и персональным. Не используй слишком формальный стиль."
    
    payload = {
        "model": "deepseek-chat",
        "messages": [
            {"role": "system", "content": "Ты помощник, который пишет тёплые и искренние поздравления с днём рождения на русском языке."},
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 200,
        "temperature": 0.8
    }
    
    try:
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(
            "https://api.deepseek.com/chat/completions",
            data=data,
            method='POST'
        )
        req.add_header('Content-Type', 'application/json')
        req.add_header('Authorization', f'Bearer {DEEPSEEK_API_KEY}')
        
        with urllib.request.urlopen(req, timeout=30) as response:
            result = json.loads(response.read().decode())
            greeting = result.get("choices", [{}])[0].get("message", {}).get("content", "")
            return greeting.strip() if greeting else None
    except urllib.error.HTTPError as e:
        print(f"⚠️ Ошибка DeepSeek API: {e.code}")
        return None
    except Exception as e:
        print(f"⚠️ Ошибка генерации поздравления: {e}")
        return None


def send_telegram_message(message):
    """Отправить сообщение в Telegram."""
    import urllib.request
    import urllib.parse
    import urllib.error
    
    if BOT_TOKEN == "YOUR_BOT_TOKEN_HERE" or CHAT_ID == "YOUR_CHAT_ID_HERE":
        print("⚠️  Настройте BOT_TOKEN и CHAT_ID!")
        print("\nСообщение, которое было бы отправлено:")
        print("-" * 40)
        print(message)
        print("-" * 40)
        return False
    
    # Отладочная информация
    print(f"\n📤 Отправка сообщения...")
    print(f"   BOT_TOKEN: {BOT_TOKEN[:10]}...{BOT_TOKEN[-5:]}")
    print(f"   CHAT_ID: {CHAT_ID}")
    print(f"   Длина сообщения: {len(message)} символов")
    print(f"\n--- Текст сообщения ---")
    print(message)
    print("--- Конец сообщения ---\n")
    
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    
    payload = {
        "chat_id": CHAT_ID,
        "text": message
    }
    
    data = urllib.parse.urlencode(payload).encode('utf-8')
    
    try:
        req = urllib.request.Request(url, data=data, method='POST')
        req.add_header('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8')
        
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode())
            if result.get("ok"):
                print("✅ Сообщение отправлено!")
                return True
            else:
                print(f"❌ Ошибка Telegram API: {result}")
                return False
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        print(f"❌ HTTP ошибка {e.code}: {e.reason}")
        print(f"   Ответ сервера: {error_body}")
        return False
    except Exception as e:
        print(f"❌ Ошибка отправки: {type(e).__name__}: {e}")
        return False


def main():
    """Основная функция."""
    print(f"📅 Проверка дней рождения...")
    print(f"📁 Файл данных: {BIRTHDAYS_FILE}")
    print(f"🔔 Период уведомлений: {DAYS_AHEAD} дней\n")
    
    birthdays = load_birthdays()
    if not birthdays:
        print("Нет данных о днях рождения.")
        return
    
    print(f"Загружено записей: {len(birthdays)}")
    
    upcoming = get_upcoming_birthdays(birthdays, DAYS_AHEAD)
    
    if not upcoming:
        print(f"Нет дней рождения в ближайшие {DAYS_AHEAD} дней.")
        return
    
    print(f"Найдено предстоящих: {len(upcoming)}")
    
    message = format_message(upcoming)
    if message:
        send_telegram_message(message)


if __name__ == "__main__":
    main()
