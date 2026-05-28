import { Bot } from "grammy";
import { GoogleGenerativeAI } from "@google/generative-ai"; // Виправили назву імпорту на стандартну

if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.GEMINI_API_KEY) {
    console.error("Помилка: Не налаштовані змінні оточення!");
    process.exit(1);
}

// Ініціалізуємо Google за стандартним перевіреним класом
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Використовуємо стабільну та швидку модель
const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

bot.command("start", async (ctx) => {
    await ctx.reply("Привіт! Я твій персональний ШІ-асистент. Запитай мене про що завгодно!");
});

bot.on("message:text", async (ctx) => {
    try {
        await ctx.replyWithChatAction("typing");

        // Запит до Gemini
        const result = await model.generateContent(ctx.message.text);
        const response = await result.response;
        const text = response.text();

        if (text) {
            await ctx.reply(text);
        } else {
            await ctx.reply("ШІ повернув порожню відповідь.");
        }
    } catch (error) {
        console.error("Помилка Google Gemini API:", error.message || error);
        await ctx.reply("Сталася помилка під час обробки запиту. Спробуйте ще раз трохи пізніше.");
    }
});

// Запуск бота
bot.start({
    onStart: (botInfo) => {
        console.log(`Бот успішно запущений як @${botInfo.username}`);
    }
});
