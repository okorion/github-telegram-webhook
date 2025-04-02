# 📦 GitHub → Telegram Webhook 알림봇

GitHub Webhook 이벤트를 받아 **텔레그램으로 자동 알림**을 보내는 Node.js 프로젝트입니다.  
Webhook 이벤트 타입별로 메시지를 포맷팅해 직관적인 형태로 받아볼 수 있습니다.

---

## 🚀 프로젝트 시작 방법

### 1. 저장소 클론

```bash
git clone https://github.com/your-repo/github-telegram-webhook.git
cd github-telegram-webhook
```

### 2. 패키지 설치

```bash
npm install
```

### 3. `.env` 환경변수 설정

루트에 `.env` 파일을 만들고 아래와 같이 입력하세요:

```
TELEGRAM_BOT_TOKEN=<당신의 텔레그램 봇 토큰>
TELEGRAM_CHAT_ID=<메시지를 받을 채팅방 ID>
PORT=3000
```

예시:

```
TELEGRAM_BOT_TOKEN=7812057626:AAHFE7j63Vs5PFYeWWegHCeIkW2DPPXaPj8
TELEGRAM_CHAT_ID=-4725564338
PORT=3000
```

> 🛡️ `TELEGRAM_CHAT_ID`는 개인 혹은 그룹의 고유 ID입니다.

---

## 🌐 서버 실행

개발 모드 실행:

```bash
npm run dev
```

빌드 후 실행:

```bash
npm run build
npm run serve
```

---

## ⚙️ 사용 흐름 요약

### Webhook 수신 흐름

```
graph TD
  A[GitHub에서 Push 등 이벤트 발생] --> B[Webhook으로 서버 호출]
  B --> C[Payload 분석 및 formatter에 전달]
  C --> D[타입 + 데이터 추출]
  D --> E[generateMessage로 메시지 포맷 결정]
  E --> F[Telegram API로 메시지 전송]
```

---

## 📬 지원 이벤트 유형

기본적으로 다음 이벤트에 대해 알림을 제공합니다:

| 이벤트 유형     | 설명                        |
| --------------- | --------------------------- |
| `push`          | 브랜치에 푸시된 커밋 메시지 |
| `issues`        | 이슈 열림, 닫힘 등          |
| `issue_comment` | 이슈 코멘트 작성            |
| `merge_request` | 병합 요청(MR or PR) 생성    |

---

## ✏️ 텔레그램 알림 메시지 예시

```
🚀 Push 이벤트 발생
푸셔: 사용자명
커밋 내역:
- Fix: 로그인 오류 수정 (https://github.com/xxx/commit/abc123)

📌 이슈 opened
제목: 로그인 불가 현상
🔗 https://github.com/xxx/issues/42

💬 이슈 코멘트
이슈: 로그인 불가 현상
내용: 저도 같은 현상이 있어요
🔗 https://github.com/xxx/issues/42#issuecomment-111
```

---

## 🧩 알림 항목을 추가하고 싶다면?

1. **`/src/formatters/`** 폴더에 새 formatter 파일을 추가
2. `canHandle(payload)` → 이벤트 감지 조건 정의
3. `format(payload)` → `type` + `data` 구조로 반환
4. **`/src/templates/generateMessage.ts`**에서 해당 type에 대한 메시지 추가

```ts
// 예시 generateMessage.ts
case "RELEASE": {
  const { tag, title, url } = result.data;
  return `🏷️ 릴리즈 ${tag}\n${title}\n🔗 ${url}`;
}
```

---

## 🔐 보안 팁

- `.env`는 `.gitignore`에 포함되어 있으므로 절대 Git에 올라가지 않도록 주의하세요.
- Telegram 봇 토큰이나 채팅 ID는 노출되지 않도록 설정 파일에서만 관리하세요.

---

## 🧪 테스트 방법

```bash
curl -X POST http://localhost:3000/test/telegram
```

> 텔레그램 봇이 연결되었는지 테스트 메시지를 전송합니다.

---

## 🙌 기여 방법

1. 포맷터 추가
2. 템플릿 개선 (HTML 지원 등)
3. 슬랙, Discord 등 멀티 채널 확장도 환영합니다!

---

## 📎 참고

- Telegram Bot API
- [GitHub Webhook Events](https://docs.github.com/en/webhooks/webhook-events-and-payloads)
- [ngrok - 로컬 서버 외부 연결](https://ngrok.com/)
