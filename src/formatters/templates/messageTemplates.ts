import { MessageFormatResult } from "../types/messageTypes";
import fs from "fs";
import path from "path";

const mapperPath = path.join(
  __dirname,
  "../../../private/github-user-mapping.json"
);
const mapperRaw = fs.readFileSync(mapperPath, "utf-8");
const mapperJson = JSON.parse(mapperRaw);

export function escapeMarkdownV2(text: string): string {
  return text.replace(/([_\[\]()~>#+\-=|{}.!\\])/g, "\\$1");
}

function resolveUsername(githubId: string): string {
  return mapperJson[githubId] ?? githubId;
}

export function generateMessage(
  result: MessageFormatResult | null
): string | null {
  if (!result) return null;

  let lines: string[] = [];

  switch (result.type) {
    case "PUSH": {
      const { author, commits } = result.data;
      const resolvedPusher = resolveUsername(author);
      const commitLines = commits.map(
        (c: any) => `\\- ${escapeMarkdownV2(c.message)}`
      );
      lines = [
        `**\\[🚀 Git Push\\] ${escapeMarkdownV2(resolvedPusher)}**`,
        `📝 **커밋 내역**:\\n${commitLines.join("\\n")}`,
      ];
      break;
    }

    case "ISSUE": {
      const { title, action, url, author, issueNumber } = result.data;
      const resolvedAuthor = resolveUsername(author);
      lines = [
        `**\\[📌 이슈 ${escapeMarkdownV2(action)}\\] ${escapeMarkdownV2(
          resolvedAuthor
        )}**`,
        `📌 **ISSUE 번호**: \\#${issueNumber}`,
        `📝 **제목**: ${escapeMarkdownV2(title)}`,
        `🔗 ${escapeMarkdownV2(url)}`,
      ];
      break;
    }

    case "PULL_REQUEST": {
      const { prNumber, prTitle, action, author, url } = result.data;
      const resolvedAuthor = resolveUsername(author);
      lines = [
        `**\\[🔀 PR ${escapeMarkdownV2(action)}\\] ${escapeMarkdownV2(
          resolvedAuthor
        )}**`,
        `📌 **PR 번호**: \\#${prNumber}`,
        `📝 **제목**: ${escapeMarkdownV2(prTitle)}`,
        `🔗 ${escapeMarkdownV2(url)}`,
      ];
      break;
    }

    case "COMMENT": {
      const { comment, issueTitle, url, author } = result.data;
      const resolvedAuthor = resolveUsername(author);
      lines = [
        `**\\[💬 이슈 코멘트\\] ${escapeMarkdownV2(resolvedAuthor)}**`,
        `🧵 **이슈 제목**: ${escapeMarkdownV2(issueTitle)}`,
        `🗨️ **코멘트 내용**:\\n\\"${escapeMarkdownV2(comment)}\\"`,
        `🔗 ${escapeMarkdownV2(url)}`,
      ];
      break;
    }

    case "PULL_REQUEST_REVIEW": {
      const { reviewer, prNumber, prTitle, url } = result.data;
      const resolvedReviewer = resolveUsername(reviewer);
      lines = [
        `**\\[✅ PR 리뷰 제출됨\\] ${escapeMarkdownV2(resolvedReviewer)}**`,
        `📌 **PR 번호**: \\#${prNumber}`,
        `📝 **제목**: ${escapeMarkdownV2(prTitle)}`,
        `🔗 ${escapeMarkdownV2(url)}`,
      ];
      break;
    }

    default:
      lines = [
        `**⚠️ 알 수 없는 이벤트 타입입니다: ${escapeMarkdownV2(result.type)}**`,
      ];
  }

  return lines.join("\\n");
}
