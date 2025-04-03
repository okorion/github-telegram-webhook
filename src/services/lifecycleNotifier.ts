import { sendTelegramMessageRaw } from "./telegram";

/**
 * 서버 시작 알림 전송
 */
export async function notifyServerStarted() {
  try {
    await sendTelegramMessageRaw("🟢 Webhook 서버가 시작되었습니다.");
  } catch (err) {
    console.error("서버 시작 메시지 전송 실패:", err);
  }
}
