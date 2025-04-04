# 📦 GitHub → Telegram Webhook 알림봇

GitHub 이벤트 발생 시 알림 메시지를 **Telegram 자동 알림**을 전송하는 Webhook 서버입니다. 특정 이벤트 유형에 따라 메시지를 포맷팅하고, 텔레그램으로 전송됩니다.

## 🚀 주요 기능

- GitHub `push`, `issue`, `pull_request`, `comment`, `pull_request_review` 이벤트 수신
- 이벤트에 따라 마크다운V2 포맷으로 메시지 변환
- Telegram Bot API를 통한 메시지 전송
- 불필요한 이벤트 필터링 (예: `push` 알람 OFF, PR `opened`/`approved`만 알림 등)
- GitHub ID → 실제 이름 매핑 지원 (`github-user-mapping.json`)

---

## 🚀 프로젝트 시작 방법

### 1. 저장소 클론

```
git clone https://github.com/your-repo/github-telegram-webhook.git
cd github-telegram-webhook
```

### 2. 패키지 설치

```
npm install
```

### 3. `.env` 환경변수 설정

루트에 `.env` 파일을 만들고 아래와 같이 입력하세요:

```
TELEGRAM_BOT_TOKEN=<당신의 텔레그램 봇 토큰>
TELEGRAM_CHAT_ID=<메시지를 받을 채팅방 ID>
PORT=3000
```

> 🛡️ `TELEGRAM_CHAT_ID`는 개인 혹은 그룹의 고유 ID입니다.

> ⚠️ **처음 프로젝트를 시작할 때 가장 중요한 부분입니다. .env 파일이 없거나 내용이 틀릴 경우 서버가 정상 동작하지 않으므로 꼭 설정하세요.**

### 4. `github-user-mapping.json` 매퍼 설정 (선택)

`/private/github-user-mapping.json` 경로에 아래 형식으로 GitHub ID ↔ 이름 매핑 정보를 입력하면, 텔레그램 알림 시 실제 이름으로 출력됩니다.

```
{
  "Joong-Rainy": "김중우",
  "devUser": "홍길동"
}
```

> ✅ 파일이 없을 경우 GitHub ID 그대로 출력됩니다.

### 5. GitHub Webhook 등록 (로컬 개발 시)

로컬 서버를 외부에서 접근하려면 [ngrok](https://ngrok.com/)을 사용하여 공개 주소를 발급받고 GitHub Repository > Settings > Webhooks에 등록해야 합니다.

```
npx ngrok http 3000
```

Webhook URL 예: `https://abcd1234.ngrok.io/webhook`

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

| 이벤트 유형            | 설명                        |
| ---------------------- | --------------------------- |
| `push`                 | 브랜치에 푸시된 커밋 메시지 |
| `issues`               | 이슈 열림, 닫힘 등          |
| `issue_comment`        | 이슈 코멘트 작성            |
| `pull_request`         | 병합 요청(MR or PR) 생성    |
| `pull_request_comment` | 병합 요청 코멘트 액션       |

---

## ✏️ 텔레그램 알림 메시지 예시

### Push Event

```
[🚀 Git Push] 홍길동
🌿 브랜치: `main`
📝 커밋 내역
- feat: PR 메시지 브랜치 추가
- fix: escape 오류 수정
```

### Pull Request Opened

```
[🔀 PR Opened] 홍길동
📌 PR 번호: #123
📝 제목: 로그인 기능 추가
🌿 브랜치: `feature/login` → `main`
🔗 https://github.com/your-repo/pull/123
```

### Pull Request Approved

```
[✅ PR Approved!] 홍길동
📌 PR 번호: #123
📝 제목: 로그인 기능 추가
💬 리뷰 코멘트
Looks good to me!
🔗 https://github.com/your-repo/pull/123
```

### Issue Created

```
[📌 이슈 opened] 홍길동
📌 ISSUE 번호: #456
📝 제목: 로그인 오류 발생
🔗 https://github.com/your-repo/issues/456
```

### Comment Event

```
[💬 이슈 코멘트] 홍길동
🧵 이슈 제목: 로그인 오류 발생
🗨️ 코멘트 내용:
"동일 현상 확인했습니다."
🔗 https://github.com/your-repo/issues/456#issuecomment-7890
```

---

## 🧩 알림 항목을 추가하고 싶다면?

1. **`/src/formatters/`** 폴더에 새 formatter 파일을 추가
2. `canHandle(payload)` → 이벤트 감지 조건 정의
3. `format(payload)` → `type` + `data` 구조로 반환
4. `MessageFormatResult` -> `MessageType` 에 해당 포맷 타입 정의
5. `src/formatters/index.ts`에서 포맷터 등록

```
import { yourFormatter } from "./formatter/yourFormatter";

const formatters: BaseFormatter[] = [
  issueFormatter,
  pullRequestFormatter,
  commentFormatter,
  yourFormatter, // ✅ 추가
];
```

##

6. **`/src/templates/generateMessage.ts`** 에서 해당 type에 대한 메시지 추가

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

`http://localhost:3000` 접속

| TEST                                                                                      | Client 메시지 확인1 | Telegram 메시지 확인2 |
| ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | - |
| ![image](https://github.com/user-attachments/assets/fe10e1a9-d6a5-4f13-9cd0-0e05baf304af) | ![image](https://github.com/user-attachments/assets/4f795b94-290b-401b-8a0f-2a2c3e3f9f4d) | ![image](https://github.com/user-attachments/assets/b1186f4d-b4e8-425d-962e-7749834d9a69) |
| ![image](https://github.com/user-attachments/assets/bc4e394b-6588-48ea-99b3-a9228f87685f) | ![image](https://github.com/user-attachments/assets/6054b024-6f5b-43eb-a9cf-2587fa6f46bb) | ![image](https://github.com/user-attachments/assets/b49c296e-85ed-4682-9edd-0317b6717d73) |

---

## 📌 유의사항

- 모든 특수문자는 반드시 이스케이프 필요 (특히 `*`, `_`, `-`, `.` 등)
- `escapeMarkdownV2()` 유틸 함수로 문자열을 이스케이프 처리 후 전송해야 텔레그램 API에서 오류 없음
- .env 미설정 시 서버가 정상 기동되지 않으니 반드시 작성 필요

배포 후 브랜치에 커밋이 푸시되었을 때, 이 텔레그램 봇이 적절한 메시지를 자동 전송하도록 동작합니다.

---

### 🎐 templates/ 폴더 내 .ts 파일을 인식하지 못한다면?
VSCode가 해당 폴더를 특정 언어 모드로 강제 인식하고 있을 가능성 => **TS 빌드 경로 문제 (tsconfig 설정)**

✅ 해결 방법
✅ 1. .vscode/settings.json 확인 (로컬 폴더 설정)
templates/ 폴더가 Django로 오인될 경우 이 설정으로 덮어씌우기

```json
// .vscode/settings.json
{
  "files.associations": {
    "**/templates/**/*.ts": "typescript"  => VSCode가 templates/ 안의 .ts 파일도 타입스크립트로 인식
  }
}
```


---

## 📎 참고

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [GitHub Webhook Events](https://docs.github.com/en/webhooks/webhook-events-and-payloads)
- [ngrok - 로컬 서버 외부 연결](https://ngrok.com/)  => **로컬 서버 운용 시, 서버 정상 동작을 위해 ngrok으로 발급 받은 주소를 GitHub Repository Webhook에 등록하는 과정 필수!**
