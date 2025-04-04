import axios from "axios";

import { sendTelegramMessageRaw } from "./telegram";

/**
 * 서버 시작 알림 전송
 */

export async function notifyServerStarted() {
  try {
    await sendTelegramMessageRaw("🟢 Webhook 서버가 시작되었습니다.");
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const description = err.response?.data?.description || "";
      const errorCode = err.response?.data?.error_code;

      console.error("📡 서버 시작 메시지 전송 실패 (AxiosError):", err.message);
      console.error("🔧 응답 데이터:", err.response?.data);

      if (errorCode === 400 && description.includes("chat not found")) {
        console.error(
          "❗ [가이드] TELEGRAM_CHAT_ID가 잘못되었거나, 봇이 해당 사용자 또는 그룹과 대화를 시작하지 않았습니다.\n" +
            "👉 1) TELEGRAM_CHAT_ID가 정확한지 확인하세요.\n" +
            "👉 2) 개인 채팅인 경우: 봇에게 먼저 말을 걸어야 합니다.\n" +
            "👉 3) 그룹 채팅인 경우: 그룹에 봇을 추가하고, 관리자 권한을 부여해야 합니다."
        );
      }

      if (errorCode === 401 && description === "Unauthorized") {
        console.error(
          "❗ [가이드] TELEGRAM_BOT_TOKEN이 잘못되었거나 권한이 없습니다.\n" +
            "👉 1) .env 파일에 설정한 TELEGRAM_BOT_TOKEN 값을 확인하세요.\n" +
            "👉 2) BotFather에서 발급받은 토큰이 맞는지 검토하세요.\n" +
            "👉 3) 봇이 삭제되었거나 비활성화되지 않았는지도 확인하세요."
        );
      }
    } else {
      console.error(
        "📡 서버 시작 메시지 전송 실패 (Unknown Error):",
        (err as Error).message
      );
    }
  }
}
