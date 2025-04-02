import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import axios from "axios";
import path from "path";

import { getFormattedMessage } from "./formatters";
import { sendTelegramMessage } from "./services/telegram";
import { generateMessage } from "./formatters/formatter/templates/messageTemplates";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "public")));

// GitHub Webhook 수신
app.post("/webhook", async (req: Request, res: Response) => {
  const payload = req.body;

  // 1. GitHub Webhook에서 수신한 payload를 포맷팅
  const result = getFormattedMessage(payload);
  if (!result) {
    res.status(200).send("정의되지 않은 이벤트 (포맷터 없음)");
  }

  // 2. 포맷팅한 Data를 텔레그램 메시지로 변환
  const message = generateMessage(result);
  if (!message) {
    res.status(200).send("정의되지 않은 메시지 형식");

    // 3. 정의되지 않은 이벤트 axios(sendTelegramMessage) 전송 방지
    return;
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
