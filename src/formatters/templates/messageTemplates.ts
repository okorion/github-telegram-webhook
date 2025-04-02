import { MessageFormatResult } from "../types/messageTypes";

export function generateMessage(
  result: MessageFormatResult | null
): string | null {
  if (!result) {
    return null;
  }

  switch (result.type) {
    case "PUSH": {
      const { pusher, commits } = result.data;
      const commitLines = commits
        .map((c: any) => `- ${c.message} (${c.url})`)
        .join("\n");
      return `🚀 *Push 이벤트 발생*\n*푸셔:* ${pusher}\n*커밋 내역:*\n${commitLines}`;
    }

    case "ISSUE": {
      const { title, action, url } = result.data;
      return `📌 *이슈 ${action}*\n*제목:* ${title}\n🔗 ${url}`;
    }

    case "MERGE_REQUEST": {
      const { title, action, url, author } = result.data;
      return `🔀 *PR ${action}*\n*제목:* ${title}\n*작성자:* ${author}\n🔗 ${url}`;
    }

    case "COMMENT": {
      const { comment, issueTitle, url } = result.data;
      return `💬 *이슈 코멘트*\n*이슈:* ${issueTitle}\n*내용:* ${comment}\n🔗 ${url}`;
    }

    default:
      return `⚠️ 알 수 없는 이벤트 타입입니다: ${result.type}`;
  }
}
