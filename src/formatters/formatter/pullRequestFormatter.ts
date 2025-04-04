import { MessageFormatResult } from "../types/messageTypes";
import { BaseFormatter } from "./baseFormatter";

export interface PullRequestMessageData {
  prNumber: number;
  prTitle: string;
  author: string;
  url: string;
  action: string;
  baseBranch: string;
  headBranch: string;
}

const ALLOWED_ACTIONS = [
  "opened", // PR이 처음 생성되었을 때
  "closed", // PR이 닫혔을 때 (병합되었거나 수동으로 닫힌 경우 포함)
  "synchronize", // PR의 소스 브랜치(head)에 새로운 커밋이 push되었을 때
  "ready_for_review", // draft 상태의 PR이 리뷰 가능한 상태로 전환되었을 때
  "review_requested", // 특정 사용자에게 리뷰를 요청했을 때
  "edited", // PR의 제목, 설명 등이 수정되었을 때
];

export const pullRequestFormatter: BaseFormatter<PullRequestMessageData> = {
  canHandle(payload) {
    return payload.pull_request && ALLOWED_ACTIONS.includes(payload.action);
  },

  format(payload) {
    const { number, pull_request, action } = payload;

    const result: MessageFormatResult<PullRequestMessageData> = {
      type: "PULL_REQUEST",
      data: {
        prNumber: number,
        prTitle: pull_request.title,
        author: pull_request.user?.login,
        url: pull_request.html_url,
        action: action,
        baseBranch: pull_request.base.ref,
        headBranch: pull_request.head.ref,
      },
    };

    return result;
  },
};
