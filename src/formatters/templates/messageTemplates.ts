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
  return text.replace(/([_\[\]()~`>#+\-=|{}.!\\])/g, "\\$1");
}

function escapeMarkdownV2Lines(lines: string[]): string {
  return lines.map((line) => escapeMarkdownV2(line)).join("\n");
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
      const commitLines = commits.map((c: any) => `- ${c.message}`);
      lines = [
        `**[🚀 Git Push] ${resolvedPusher}**`,
        `📝 **커밋 내역**:\n${commitLines.join("\n")}`,
      ];
      break;
    }

    case "ISSUE": {
      const { title, action, url, author, issueNumber } = result.data;
      const resolvedAuthor = resolveUsername(author);
      lines = [
        `**[📌 이슈 ${action}] ${resolvedAuthor}**`,
        `📌 **ISSUE 번호**: #${issueNumber}`,
        `📝 **제목**: ${title}`,
        `🔗 ${url}`,
      ];
      break;
    }

    case "PULL_REQUEST": {
      const { prNumber, prTitle, action, author, url } = result.data;
      const resolvedAuthor = resolveUsername(author);
      lines = [
        `**[🔀 PR ${action}] ${resolvedAuthor}**`,
        `📌 **PR 번호**: #${prNumber}`,
        `📝 **제목**: ${prTitle}`,
        `🔗 ${url}`,
      ];
      break;
    }

    case "COMMENT": {
      const { comment, issueTitle, url, author } = result.data;
      const resolvedAuthor = resolveUsername(author);
      lines = [
        `**[💬 이슈 코멘트] ${resolvedAuthor}**`,
        `🧵 **이슈 제목**: ${issueTitle}`,
        `🗨️ **코멘트 내용**:\n"${comment}"`,
        `🔗 ${url}`,
      ];
      break;
    }

    case "PULL_REQUEST_REVIEW": {
      const { reviewer, prNumber, prTitle, url } = result.data;
      const resolvedReviewer = resolveUsername(reviewer);
      lines = [
        `**[✅ PR 리뷰 제출됨] ${resolvedReviewer}**`,
        `📌 **PR 번호**: #${prNumber}`,
        `📝 **제목**: ${prTitle}`,
        `🔗 ${url}`,
      ];
      break;
    }

    default:
      lines = [`**⚠️ 알 수 없는 이벤트 타입입니다: ${result.type}**`];
  }

  return escapeMarkdownV2Lines(lines);
}
