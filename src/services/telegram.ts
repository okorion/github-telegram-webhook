import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export function escapeMarkdownV2(text: string): string {
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, "\\$1");
}

export async function sendTelegramMessage(message: string) {
  const telegramUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
  const escapeMarkdownV2Message = escapeMarkdownV2(message);

  await axios.post(telegramUrl, {
    chat_id: process.env.TELEGRAM_CHAT_ID,
    text: escapeMarkdownV2Message,
    parse_mode: "MarkdownV2",
  });
}
