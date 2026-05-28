import { Bot } from "grammy";
import { GoogleGenAI } from "@google/genai";

if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.GEMINI_API_KEY) {
    console.error("Помилка: Не налаштовані змінні оточення!");
    process.exit(1);
}

// Ініціалізуємо ШІ та бота
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

bot.command("start", async (ctx) => {
    await ctx.reply("Привіт! Я твій персональний ШІ-асистент. Запитай мене про що завгодно!");
});

bot.on("message:text", async (ctx) => {
    try {
        await ctx.replyWithChatAction("typing");

        // Універсальний та найбільш стабільний виклик моделі в нових версіях SDK
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: ctx.message.text,
        });

        // Перевіряємо, чи повернув Google текст
        if (response && response.text) {
            await ctx.reply(response.text);
        } else {
            // Якщо структура відповіді інша, дістаємо текст через стандартний метод text()
            const textResponse = typeof response.text === 'function' ? await response.text() : response.text;
            await ctx.reply(textResponse || "Не вдалося розпізнати відповідь ШІ.");
        }
    } catch (error) {
        // Виводимо детальну помилку в логи Render, щоб ми бачили, якщо щось не так з ключем
        console.error("Помилка Google Gemini API:", error.message || error);
        await ctx.reply("Сталася помилка під час обробки запиту. Спробуйте ще раз трохи пізніше.");
    }
});

bot.start({
    onStart: (botInfo) => {
        console.log(`Бот успішно запущений як @${botInfo.username}`);
    }
});
