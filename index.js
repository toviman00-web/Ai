import { Bot } from "grammy";
import { GoogleGenAI } from "@google/genai";

// Перевірка, чи задані змінні оточення на хостингу
if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.GEMINI_API_KEY) {
    console.error("Помилка: Не налаштовані змінні TELEGRAM_BOT_TOKEN або GEMINI_API_KEY в панелі хостингу!");
    process.exit(1);
}

// Ініціалізація ШІ та Бота через змінні оточення
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

// Реагуємо на команду /start
bot.command("start", async (ctx) => {
    await ctx.reply("Привіт! Я твій персональний ШІ-асистент. Запитай мене про що завгодно!");
});

// Обробка всіх текстових повідомлень
bot.on("message:text", async (ctx) => {
    try {
        // Ефект "друкує..." у Telegram, щоб користувач бачив, що ШІ думає
        await ctx.replyWithChatAction("typing");

        // Запит до моделі Gemini
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", 
            contents: ctx.message.text,
        });

        // Надсилаємо відповідь користувачу
        await ctx.reply(response.text);
    } catch (error) {
        console.error("Помилка обробки повідомлення:", error);
        await ctx.reply("Сталася помилка під час обробки запиту. Спробуйте ще раз трохи пізніше.");
    }
});

// Запуск бота в режимі Long Polling
bot.start({
    onStart: (botInfo) => {
        console.log(`Бот успішно запущений як @${botInfo.username}`);
    }
});
