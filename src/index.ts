import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import axios from "axios";
import path from "path";

import { getFormattedMessage } from "./formatters";
import { sendTelegramMessage } from "./services/telegram";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "public")));

// GitHub Webhook 수신
app.post("/webhook", async (req: Request, res: Response) => {
  const payload = req.body;

  const message = getFormattedMessage(payload);

  if (!message) {
    console.log("⚠️ 해당 이벤트는 처리 대상 아님");
    res.status(200).send("No formatter matched");
  }

  try {
    await sendTelegramMessage(message);
    res.status(200).send("알림 전송 완료");
  } catch (err) {
    console.error("❌ 텔레그램 전송 오류:", err);
    res.status(500).send("전송 실패");
  }
});

// Telegram 연결 테스트
app.post("/test/telegram", async (_req: Request, res: Response) => {
  const telegramUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
  const message = "✅ Telegram 연결 테스트 메시지입니다.";

  try {
    await axios.post(telegramUrl, {
      chat_id: process.env.TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: "Markdown",
    });
    res.json({ ok: true, message: "메시지 전송 성공" });
  } catch (err) {
    console.error("테스트 메시지 전송 실패:", err);
    res.status(500).json({ ok: false, message: "메시지 전송 실패" });
  }
});

app.listen(port, () => {
  console.log("\n" + "🚀".repeat(32));
  console.log(
    `🚀🚀🚀🚀🚀 Server is running at http://localhost:${port} 🚀🚀🚀🚀🚀`
  );
  console.log("🚀".repeat(32) + "\n");
});
