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
  if (!result) {
    return null;
  }

  switch (result.type) {
    case "PUSH": {
      const { author, commits } = result.data;
      const resolvedPusher = resolveUsername(author);
      const commitLines = commits.map((c: any) => `- ${c.message}`).join("\n");

      return [
        `**[🚀 Push 발생]** 👤 **푸시한 사람:** ${resolvedPusher}`,
        `📝 **커밋 내역:**\n${commitLines}`,
      ].join("\n");
    }

    case "ISSUE": {
      const { title, action, url, author } = result.data;
      const resolvedAuthor = resolveUsername(author);

      return [
        `**[📌 이슈 ${action}]** 🧑 **작성자:** ${resolvedAuthor}`,
        `📝 **제목:** ${title}`,
        `🔗 ${url}`,
      ].join("\n");
    }

    case "MERGE_REQUEST": {
      const { title, action, author } = result.data;
      const resolvedAuthor = resolveUsername(author);

      return [
        `**[🔀 PR ${action}]** 🧑 **작성자:** ${resolvedAuthor}`,
        `📝 **제목:** ${title}`,
      ].join("\n");
    }

    case "COMMENT": {
      const { comment, issueTitle, url, author } = result.data;
      const resolvedAuthor = resolveUsername(author);

      return [
        `**[💬 이슈 코멘트]** 🧑 **작성자:** ${resolvedAuthor}`,
        `🧵 **이슈 제목:** ${issueTitle}`,
        `🗨️ **코멘트 내용:**\n"${comment}"`,
        `🔗 [코멘트 링크](${url})`,
      ].join("\n");
    }

    case "PULL_REQUEST_REVIEW": {
      const { reviewer, prNumber, prTitle, url } = result.data;
      const resolvedReviewer = resolveUsername(reviewer);

      return [
        `**[✅ PR 리뷰 제출됨]** 👤 **리뷰어:** ${resolvedReviewer}`,
        `📌 **PR 번호:** #${prNumber} 📝 **제목:** ${prTitle}`,
        `🔗 [리뷰 보기](${url})`,
      ].join("\n");
    }

    default:
      return `⚠️ **알 수 없는 이벤트 타입입니다:** \`${result.type}\``;
  }
}
