const TelegramApi = require("node-telegram-bot-api");
const token = "";
const bot = new TelegramApi(token, { polling: true });

const Data = require("./db").Data;

let description = false,
  language,
  pz;

const languageButtons = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{ text: "C++", callback_data: "C++" }],
      [{ text: "C#", callback_data: "C#" }],
    ],
  }),
};

const pzButtons = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{ text: "С ПЗ", callback_data: "с пз" }],
      [{ text: "Без ПЗ", callback_data: "без пз" }],
    ],
  }),
};

let start = async () => {
  bot.setMyCommands([
    { command: "/start", description: "Сделать заказ" },
    { command: "/info", description: "Получить информацию о заказе" },
    { command: "/edit", description: "Изменить заказ" },
  ]);

  bot.on("message", async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;

    if (text === "/start") {
      let i;

      await new Promise((resolve, reject) => {
        Data.find(chatId, (err, row) => {
          if (err) {
            reject(err);
          } else {
            i = row;
            resolve();
          }
        });
      });

      if (i) return await bot.sendMessage(chatId, "Вы уже сделали заказ!");

      return await bot.sendMessage(
        chatId,
        "Выберите язык программирования для курсача:",
        languageButtons
      );
    } else if (text === "/info") {
      let i;

      await new Promise((resolve, reject) => {
        Data.find(chatId, (err, row) => {
          if (err) {
            reject(err);
          } else {
            i = row;
            resolve();
          }
        });
      });

      return await bot.sendMessage(chatId, `${i.msg}`, {
        parse_mode: "HTML",
      });
    } else if (text === "/edit") {
      let i;

      await new Promise((resolve, reject) => {
        Data.find(chatId, (err, row) => {
          if (err) {
            reject(err);
          } else {
            i = row;
            resolve();
          }
        });
      });

      if (i) {
        await Data.delete(chatId);
        return await bot.sendMessage(
          chatId,
          "Выберите язык программирования для курсача:",
          languageButtons
        );
      }

      return await bot.sendMessage(chatId, "Вы ещё не сделали заказ!");
    } else if (description === true) {
      description = false;
      let finalMsg = `<a href ='tg://user?id=${chatId}'>Пользователь</a> выбрал ${language},  ${pz}.  ${text}`;

      await bot.sendMessage(6794504602, finalMsg, {
        parse_mode: "HTML",
      });

      await Data.create({
        chatId: chatId,
        msg: finalMsg,
      });

      return await bot.sendMessage(
        chatId,
        "Ожидайте, в течение 24 часов с вами свяжутся в ЛС."
      );
    } else {
      return await bot.sendMessage(
        chatId,
        "Я тебя не понимаю, попробуй еще раз."
      );
    }
  });

  bot.on("callback_query", async (msg) => {
    const data = msg.data;
    const chatId = msg.message.chat.id;

    if (data === "C++" || data === "C#") {
      language = data;

      await bot.answerCallbackQuery(msg.id);

      return await bot.sendMessage(
        chatId,
        "Нужна пояснительная записка?",
        pzButtons
      );
    } else if (data === "с пз" || data === "без пз") {
      pz = data;
      description = true;

      await bot.answerCallbackQuery(msg.id);

      return await bot.sendMessage(
        chatId,
        "Опишите, что должно быть в курсаче:"
      );
    }
  });
};

start();
