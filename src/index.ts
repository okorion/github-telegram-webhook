import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import axios from "axios";
import path from "path";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// 정적 파일 (HTML) 서비스
app.use(express.static(path.join(__dirname, "public")));

// GitHub Webhook 수신
app.post("/webhook", async (req: Request, res: Response) => {
  const payload = req.body;

  const message = `📦 새로운 GitHub 이벤트!\n레포: ${payload.repository?.full_name}\n유저: ${payload.sender?.login}`;
  const telegramUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;

  try {
    await axios.post(telegramUrl, {
      chat_id: process.env.TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: "Markdown",
    });
    res.status(200).send("OK");
  } catch (err) {
    console.error("텔레그램 전송 오류:", err);
    res.status(500).send("Error");
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
  console.log(
    `🚀🚀🚀🚀🚀 Server is running at http://localhost:${port} 🚀🚀🚀🚀🚀`
  );
});
