import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import path from "path";

import { getFormattedMessage } from "./formatters";
import { sendTelegramMessage } from "./services/telegram";
import { generateMessage } from "./formatters/templates/messageTemplates";
import { notifyServerStarted } from "./services/lifecycleNotifier";

import testRoutes from "./routes/testRoutes";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/webhook", async (req: Request, res: Response) => {
  const payload = req.body;
  const result = getFormattedMessage(payload);
  if (!result) res.status(200).send("정의되지 않은 이벤트 (포맷터 없음)");

  const message = generateMessage(result);
  if (!message) {
    res.status(200).send("정의되지 않은 메시지 형식");
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

// 테스트 라우트 추가
app.use("/", testRoutes);

// 서버 시작
app.listen(port, async () => {
  console.log("\n" + "🚀".repeat(32));
  console.log(
    `🚀🚀🚀🚀🚀 Server is running at http://localhost:${port} 🚀🚀🚀🚀🚀`
  );
  console.log("🚀".repeat(32) + "\n");

  await notifyServerStarted();
});
