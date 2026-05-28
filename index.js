import { Bot } from "grammy";

if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.GEMINI_API_KEY) {
    console.error("Помилка: Не налаштовані змінні оточення!");
    process.exit(1);
}

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

bot.command("start", async (ctx) => {
    await ctx.reply("Привіт! Я твій персональний ШІ-асистент. Запитай мене про що завгодно!");
});

bot.on("message:text", async (ctx) => {
    try {
        await ctx.replyWithChatAction("typing");

        // Пряме посилання до API Gemini з передачею ключа в URL (це обходить блокування 401)
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

        // Формуємо правильний JSON-запит для Google
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: ctx.message.text }]
                }]
            })
        });

        const data = await response.json();

        // Якщо Google повернув помилку, виводимо її в логи
        if (data.error) {
            throw new Error(`${data.error.code} - ${data.error.message}`);
        }

        // Дістаємо текст відповіді з JSON-структури Google
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (aiText) {
            await ctx.reply(aiText);
        } else {
            await ctx.reply("ШІ повернув відповідь у невідомому форматі.");
        }

    } catch (error) {
        console.error("Помилка запиту до Gemini:", error.message || error);
        await ctx.reply("Сталася помилка під час обробки запиту. Спробуйте ще раз трохи пізніше.");
    }
});

bot.start({
    onStart: (botInfo) => {
        console.log(`Бот успішно запущений як @${botInfo.username}`);
    }
});
