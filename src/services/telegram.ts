import axios from "axios";
import dotenv from "dotenv";
import { escapeMarkdownV2 } from "../formatters/templates/messageTemplates";

dotenv.config();

export async function sendTelegramMessage(message: string) {
  const telegramUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;

  await axios.post(telegramUrl, {
    chat_id: process.env.TELEGRAM_CHAT_ID,
    text: message,
    parse_mode: "MarkdownV2",
  });
}

export async function sendTelegramMessageRaw(message: string) {
  const telegramUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;

  await axios.post(telegramUrl, {
    chat_id: process.env.TELEGRAM_CHAT_ID,
    text: escapeMarkdownV2(message),
    parse_mode: "MarkdownV2",
  });
}
