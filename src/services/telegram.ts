import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export async function sendTelegramMessage(message: string | null) {
  const telegramUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
  const hasNotMatchedFormatter = message === null;

  if (hasNotMatchedFormatter) return;

  await axios.post(telegramUrl, {
    chat_id: process.env.TELEGRAM_CHAT_ID,
    text: message,
    parse_mode: "Markdown",
  });
}
