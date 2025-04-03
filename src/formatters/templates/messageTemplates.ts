import { MessageFormatResult } from "../types/messageTypes";
import fs from "fs";
import path from "path";

const mapperPath = path.join(
  __dirname,
  "../../../private/github-user-mapping.json"
);
const mapperRaw = fs.readFileSync(mapperPath, "utf-8");
const mapperJson = JSON.parse(mapperRaw);

function resolveUsername(githubId: string): string {
  return mapperJson[githubId] ?? githubId;
}

function escapeMarkdownV2(text: string): string {
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, "\\$1");
}

export function generateMessage(
  result: MessageFormatResult | null
): string | null {
  if (!result) return null;

  switch (result.type) {
    case "PUSH": {
      const { author, commits } = result.data;
      const resolvedPusher = escapeMarkdownV2(resolveUsername(author));
      const commitLines = commits
        .map((c: any) => `\\- ${escapeMarkdownV2(c.message)}`)
        .join("\n");

      return [
        `*\\[🚀 Push 발생\\]* 👤 *푸시한 사람:* ${resolvedPusher}`,
        `📝 *커밋 내역:*\n${commitLines}`,
      ].join("\n");
    }

    case "ISSUE": {
      const { title, action, url, author } = result.data;
      const resolvedAuthor = escapeMarkdownV2(resolveUsername(author));
      const safeTitle = escapeMarkdownV2(title);
      const safeAction = escapeMarkdownV2(action);

      return [
        `*\\[📌 이슈 ${safeAction}\\]* 🧑 *작성자:* ${resolvedAuthor}`,
        `📝 *제목:* ${safeTitle}`,
        `🔗 ${url}`,
      ].join("\n");
    }

    case "MERGE_REQUEST": {
      const { title, action, author } = result.data;
      const resolvedAuthor = escapeMarkdownV2(resolveUsername(author));
      const safeTitle = escapeMarkdownV2(title);
      const safeAction = escapeMarkdownV2(action);

      return [
        `*\\[🔀 PR ${safeAction}\\]* 🧑 *작성자:* ${resolvedAuthor}`,
        `📝 *제목:* ${safeTitle}`,
      ].join("\n");
    }

    case "COMMENT": {
      const { comment, issueTitle, url, author } = result.data;
      const resolvedAuthor = escapeMarkdownV2(resolveUsername(author));
      const safeComment = escapeMarkdownV2(comment);
      const safeIssueTitle = escapeMarkdownV2(issueTitle);

      return [
        `*\\[💬 이슈 코멘트\\]* 🧑 *작성자:* ${resolvedAuthor}`,
        `🧵 *이슈 제목:* ${safeIssueTitle}`,
        `🗨️ *코멘트 내용:*\n"${safeComment}"`,
        `🔗 ${url}`,
      ].join("\n");
    }

    case "PULL_REQUEST_REVIEW": {
      const { reviewer, prNumber, prTitle, url } = result.data;
      const resolvedReviewer = escapeMarkdownV2(resolveUsername(reviewer));
      const safeTitle = escapeMarkdownV2(prTitle);

      return [
        `*\\[✅ PR 리뷰 제출됨\\]* 👤 *리뷰어:* ${resolvedReviewer}`,
        `📌 *PR 번호:* #${prNumber} 📝 *제목:* ${safeTitle}`,
        `🔗 ${url}`,
      ].join("\n");
    }

    default:
      return `⚠️ *알 수 없는 이벤트 타입입니다:* \`${escapeMarkdownV2(
        result.type
      )}\``;
  }
}
