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

export function generateMessage(
  result: MessageFormatResult | null
): string | null {
  if (!result) return null;

  switch (result.type) {
    case "PUSH": {
      const { author, commits } = result.data;
      const resolvedPusher = resolveUsername(author);
      const commitLines = commits
        .map((c: any) => `\\- ${c.message}`)
        .join("\n");

      return [
        `*\\[🚀 Git Push \\]* ${resolvedPusher}`,
        `📝 *커밋 내역:*\n${commitLines}`,
      ].join("\n");
    }

    case "ISSUE": {
      const { title, action, url, author, issueNumber } = result.data;
      const resolvedAuthor = resolveUsername(author);
      const safeTitle = title;
      const safeAction = action;

      return [
        `*\\[📌 이슈 ${safeAction}\\]* ${resolvedAuthor}`,
        `📌 *PR 번호:* #${issueNumber} 📝 *제목:* ${safeTitle}`,
        `🔗 ${url}`,
      ].join("\n");
    }

    case "PULL_REQUEST": {
      const { title, action, author, url } = result.data;
      const resolvedAuthor = resolveUsername(author);
      const safeTitle = title;
      const safeAction = action;

      return [
        `*\\[🔀 PR ${safeAction}\\]* ${resolvedAuthor}`,
        `📝 *제목:* ${safeTitle}`,
        `🔗 ${url}`,
      ].join("\n");
    }

    case "COMMENT": {
      const { comment, issueTitle, url, author } = result.data;
      const resolvedAuthor = resolveUsername(author);
      const safeComment = comment;
      const safeIssueTitle = issueTitle;

      return [
        `*\\[💬 이슈 코멘트\\]* ${resolvedAuthor}`,
        `🧵 *이슈 제목:* ${safeIssueTitle}`,
        `🗨️ *코멘트 내용:*\n"${safeComment}"`,
        `🔗 ${url}`,
      ].join("\n");
    }

    case "PULL_REQUEST_REVIEW": {
      const { reviewer, prNumber, prTitle, url } = result.data;
      const resolvedReviewer = resolveUsername(reviewer);
      const safeTitle = prTitle;

      return [
        `*\\[✅ PR 리뷰 제출됨\\]* ${resolvedReviewer}`,
        `📌 *PR 번호:* #${prNumber} 📝 *제목:* ${safeTitle}`,
        `🔗 ${url}`,
      ].join("\n");
    }

    default:
      return `⚠️ *알 수 없는 이벤트 타입입니다:* \`${result.type}\``;
  }
}
