import express, { Request, Response } from "express";

import {
  sendTelegramMessage,
  sendTelegramMessageRaw,
} from "../services/telegram";
import { getFormattedMessage } from "../formatters";
import { generateMessage } from "../formatters/templates/messageTemplates";
import { dummy } from "../__tests__/dummyPayloads";

const router = express.Router();

router.post("/test/telegram", async (_req: Request, res: Response) => {
  try {
    await sendTelegramMessageRaw("✅ Telegram 연결 테스트 메시지입니다.");
    res.json({ ok: true, message: "📧 메시지 전송 성공" });
  } catch (err) {
    console.error("테스트 메시지 전송 실패:", err);
    res.status(500).json({ ok: false, message: "메시지 전송 실패" });
  }
});

// 선택한 더미 페이로드를 활용한 포맷 테스트
router.post(
  "/test/format-and-generate/:type",
  async (req: Request, res: Response) => {
    const { type } = req.params;
    const payload = dummy[type as keyof typeof dummy];

    if (!payload) {
      res
        .status(400)
        .json({ ok: false, message: `존재하지 않는 payload: ${type}` });
      return;
    }

    console.log("payload:", !!payload);
    const result = getFormattedMessage(payload);
    console.log("result:", !!result);
    const message = generateMessage(result);
    console.log("message:", !!message);

    try {
      if (message) {
        await sendTelegramMessage(message);
        res.json({ ok: true, message: "📧 Message 포맷팅 확인 성공" });
      } else {
        res.status(200).json({ ok: false, message: "생성된 메시지가 없음" });
      }
    } catch (e) {
      console.error("테스트 메시지 전송 실패:", e);
      res.status(500).json({ ok: false, message: "메시지 전송 실패" });
    }
  }
);

export default router;
