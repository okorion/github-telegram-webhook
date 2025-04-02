import { MessageFormatResult } from "../types/messageTypes";

// MarkdownV2 포맷 대응용 이스케이프 함수
function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, "\\$&");
}

export function generateMessage(
  result: MessageFormatResult | null
): string | null {
  if (!result) {
    return null;
  }

  switch (result.type) {
    case "PUSH": {
      const { pusher, commits, branch } = result.data;
      const commitLines = commits
        .map((c: any) => `- ${escapeMarkdown(c.message)}`)
        .join("\n");

      return [
        `🚀 **[Push 발생]**`,
        `👤 **푸시한 사람:** ${escapeMarkdown(pusher)}`,
        `🌿 **브랜치:** \`${escapeMarkdown(branch)}\``,
        `📝 **커밋 내역:**\n${commitLines}`,
      ].join("\n");
    }

    case "ISSUE": {
      const { title, action, url, author } = result.data;
      return [
        `📌 **[이슈 ${escapeMarkdown(action)}]**`,
        `🧑 **작성자:** ${escapeMarkdown(author)}`,
        `📝 **제목:** ${escapeMarkdown(title)}`,
        `🔗 [이슈 링크](${escapeMarkdown(url)})`,
      ].join("\n");
    }

    case "MERGE_REQUEST": {
      const { title, action, url, author, targetBranch } = result.data;
      return [
        `🔀 **[PR ${escapeMarkdown(action)}]**`,
        `🧑 **작성자:** ${escapeMarkdown(author)}`,
        `📝 **제목:** ${escapeMarkdown(title)}`,
        `🌿 **병합 대상 브랜치:** \`${escapeMarkdown(targetBranch)}\``,
        // 필요하다면 링크 포함 가능
        // `🔗 [PR 링크](${escapeMarkdown(url)})`,
      ].join("\n");
    }

    case "COMMENT": {
      const { comment, issueTitle, url, author } = result.data;
      return [
        `💬 **[이슈 코멘트]**`,
        `🧑 **작성자:** ${escapeMarkdown(author)}`,
        `🧵 **이슈 제목:** ${escapeMarkdown(issueTitle)}`,
        `🗨️ **코멘트 내용:**\n"${escapeMarkdown(comment)}"`,
        `🔗 [코멘트 링크](${escapeMarkdown(url)})`,
      ].join("\n");
    }

    default:
      return `⚠️ **알 수 없는 이벤트 타입입니다:** \`${escapeMarkdown(
        result.type
      )}\``;
  }
}
