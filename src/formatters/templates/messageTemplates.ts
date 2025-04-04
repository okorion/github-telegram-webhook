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

export function escapeMarkdownV2(text: string): string {
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, "\\$1");
}

function escapeMarkdownV2Lines(lines: string[]): string {
  return lines.map((line) => escapeMarkdownV2(line)).join("\n");
}

export function generateMessage(
  result: MessageFormatResult | null
): string | null {
  if (!result) return null;

  let lines: string[] = [];

  switch (result.type) {
    case "PUSH": {
      const { author, commits, ref } = result.data;

      const resolvedPusher = escapeMarkdownV2(resolveUsername(author));
      const branchName = ref.replace("refs/heads/", "");
      const escapedBranchName = escapeMarkdownV2(branchName);
      const commitLines = commits
        .map((c: any) => `\\- ${escapeMarkdownV2(c.message)}`)
        .join("\n");

      lines = [
        `*\\[🚀 Git Push\\]* ${resolvedPusher}`,
        `🌿 *브랜치:* \`${escapedBranchName}\``,
        `📝 *커밋 내역*\n${commitLines}`,
      ];
      break;
    }

    case "ISSUE": {
      const { title, action, url, author, issueNumber } = result.data;

      const escapedAction = escapeMarkdownV2(action);
      const escapedAuthor = escapeMarkdownV2(resolveUsername(author));
      const escapedTitle = escapeMarkdownV2(title);
      const escapedUrl = escapeMarkdownV2(url);

      lines = [
        `*\\[📌 이슈 ${escapedAction}\\]* ${escapedAuthor}`,
        `📌 *ISSUE 번호:* #${issueNumber}`,
        `📝 *제목:* ${escapedTitle}`,
        `🔗 ${escapedUrl}`,
      ];
      break;
    }

    case "PULL_REQUEST": {
      const { prNumber, prTitle, action, author, url, baseBranch, headBranch } =
        result.data;

      const escapedAction = escapeMarkdownV2(action);
      const escapedAuthor = escapeMarkdownV2(resolveUsername(author));
      const escapedTitle = escapeMarkdownV2(prTitle);
      const escapedUrl = escapeMarkdownV2(url);
      const escapedHeadBranch = escapeMarkdownV2(headBranch);
      const escapedBaseBranch = escapeMarkdownV2(baseBranch);

      lines = [
        `*\\[🔀 PR ${escapedAction}\\]* ${escapedAuthor}`,
        `📌 *PR 번호:* #${prNumber}`,
        `📝 *제목:* ${escapedTitle}`,
        `🌿 *브랜치:* \`${escapedHeadBranch}\` → \`${escapedBaseBranch}\``,
        `🔗 ${escapedUrl}`,
      ];
      break;
    }

    case "COMMENT": {
      const { comment, issueTitle, url, author } = result.data;

      const escapedAuthor = escapeMarkdownV2(resolveUsername(author));
      const escapedTitle = escapeMarkdownV2(issueTitle);
      const escapedComment = escapeMarkdownV2(comment);
      const escapedUrl = escapeMarkdownV2(url);

      lines = [
        `*\\[💬 이슈 코멘트\\]* ${escapedAuthor}`,
        `🧵 *이슈 제목:* ${escapedTitle}`,
        `🗨️ *코멘트 내용:*\n"${escapedComment}"`,
        `🔗 ${escapedUrl}`,
      ];
      break;
    }

    case "PULL_REQUEST_REVIEW": {
      const { reviewer, prNumber, prTitle, url, approved, comment } =
        result.data;

      const escapedReviewer = escapeMarkdownV2(resolveUsername(reviewer));
      const escapedTitle = escapeMarkdownV2(prTitle);
      const escapedComment = comment ? escapeMarkdownV2(comment) : null;
      const escapedUrl = escapeMarkdownV2(url);
      const statusText = approved ? "Approved!" : "리뷰 제출됨";

      lines = [
        `*\\[✅ PR ${statusText}\\]* ${escapedReviewer}`,
        `📌 *PR 번호:* #${prNumber}`,
        `📝 *제목:* ${escapedTitle}`,
      ];

      if (escapedComment) {
        lines.push(`💬 *리뷰 코멘트*`);
        lines.push(escapedComment);
      }

      lines.push(`🔗 ${escapedUrl}`);
      break;
    }

    default:
      const escapedType = escapeMarkdownV2(result.type);

      lines = [`⚠️ *알 수 없는 이벤트 타입입니다:* \`${escapedType}\``];
  }

  return lines.join("\n");
}
