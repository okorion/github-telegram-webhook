import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export async function sendTelegramMessage(message: string) {
  const telegramUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;

  await axios.post(telegramUrl, {
    chat_id: process.env.TELEGRAM_CHAT_ID,
    text: message,
    parse_mode: "Markdown",
  });
}
