import { BaseFormatter } from "./baseFormatter";
import { MessageFormatResult } from "../types/messageTypes";

export interface PullRequestReviewMessageData {
  reviewer: string; // 리뷰 작성자
  prNumber: number; // PR 번호
  prTitle: string; // PR 제목
  url: string; // 리뷰 링크
}

export const pullRequestReviewFormatter: BaseFormatter<PullRequestReviewMessageData> =
  {
    canHandle(payload) {
      // action이 반드시 "submitted"일 때만 처리
      return (
        payload.action === "submitted" && payload.review && payload.pull_request
      );
    },

    format(payload) {
      const { review, pull_request } = payload;

      const result: MessageFormatResult<PullRequestReviewMessageData> = {
        type: "PULL_REQUEST_REVIEW",
        data: {
          reviewer: review.user.login,
          prNumber: pull_request.number,
          prTitle: pull_request.title,
          url: review.html_url,
        },
      };

      return result;
    },
  };
