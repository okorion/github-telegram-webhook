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

function resolveUsername(githubId: string): string {
  return mapperJson[githubId] ?? githubId;
}

function bold(text: string): string {
  return `*${escapeMarkdownV2(text)}*`;
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
        (c: any) => `\- ${escapeMarkdownV2(c.message)}`
      );
      lines = [
        bold(`[🚀 Git Push] ${resolvedPusher}`),
        `📝 ${bold("커밋 내역")}: ${commitLines.join("\n")}`,
      ];
      break;
    }

    case "ISSUE": {
      const { title, action, url, author, issueNumber } = result.data;
      const resolvedAuthor = resolveUsername(author);
      lines = [
        bold(`[📌 이슈 ${action}] ${resolvedAuthor}`),
        `📌 ${bold("ISSUE 번호")}: #${issueNumber}`,
        `📝 ${bold("제목")}: ${escapeMarkdownV2(title)}`,
        `🔗 ${escapeMarkdownV2(url)}`,
      ];
      break;
    }

    case "PULL_REQUEST": {
      const { prNumber, prTitle, action, author, url } = result.data;
      const resolvedAuthor = resolveUsername(author);
      lines = [
        bold(`[🔀 PR ${action}] ${resolvedAuthor}`),
        `📌 ${bold("PR 번호")}: #${prNumber}`,
        `📝 ${bold("제목")}: ${escapeMarkdownV2(prTitle)}`,
        `🔗 ${escapeMarkdownV2(url)}`,
      ];
      break;
    }

    case "COMMENT": {
      const { comment, issueTitle, url, author } = result.data;
      const resolvedAuthor = resolveUsername(author);
      lines = [
        bold(`[💬 이슈 코멘트] ${resolvedAuthor}`),
        `🧵 ${bold("이슈 제목")}: ${escapeMarkdownV2(issueTitle)}`,
        `🗨️ ${bold("코멘트 내용")}:
"${escapeMarkdownV2(comment)}"`,
        `🔗 ${escapeMarkdownV2(url)}`,
      ];
      break;
    }

    case "PULL_REQUEST_REVIEW": {
      const { reviewer, prNumber, prTitle, url } = result.data;
      const resolvedReviewer = resolveUsername(reviewer);
      lines = [
        bold(`[✅ PR 리뷰 제출됨] ${resolvedReviewer}`),
        `📌 ${bold("PR 번호")}: #${prNumber}`,
        `📝 ${bold("제목")}: ${escapeMarkdownV2(prTitle)}`,
        `🔗 ${escapeMarkdownV2(url)}`,
      ];
      break;
    }

    default:
      lines = [bold(`⚠️ 알 수 없는 이벤트 타입입니다: ${result.type}`)];
  }

  return lines.join("\n");
}
