import { Bot } from "grammy";
import { GoogleGenAI } from "@google/generative-ai"; // Використовуємо стабільний пакет

if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.GEMINI_API_KEY) {
    console.error("Помилка: Не налаштовані змінні оточення!");
    process.exit(1);
}

// Стабільна ініціалізація Google Gemini
const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);
// Вибираємо модель тексту
const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

bot.command("start", async (ctx) => {
    await ctx.reply("Привіт! Я твій персональний ШІ-асистент. Запитай мене про що завгодно!");
});

bot.on("message:text", async (ctx) => {
    try {
        await ctx.replyWithChatAction("typing");

        // Прямий запит до моделі без зайвих обгорток
        const result = await model.generateContent(ctx.message.text);
        const response = await result.response;
        const text = response.text();

        if (text) {
            await ctx.reply(text);
        } else {
            await ctx.reply("ШІ повернув порожню відповідь.");
        }
    } catch (error) {
        console.error("Помилка Google Gemini API:", error);
        await ctx.reply("Сталася помилка під час обробки запиту. Спробуйте ще раз трохи пізніше.");
    }
});

bot.start({
    onStart: (botInfo) => {
        console.log(`Бот успішно запущений як @${botInfo.username}`);
    }
});
