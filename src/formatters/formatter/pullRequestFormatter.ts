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

export const pullRequestFormatter: BaseFormatter<PullRequestMessageData> = {
  canHandle(payload) {
    return payload.pull_request && payload.action;
  },

  format(payload) {
    const { number, pull_request } = payload;

    const result: MessageFormatResult<PullRequestMessageData> = {
      type: "PULL_REQUEST",
      data: {
        prNumber: number,
        prTitle: pull_request.title,
        author: pull_request.user?.login,
        url: pull_request.html_url,
        action: payload.action.toUpperCase(),
        baseBranch: pull_request.base.ref,
        headBranch: pull_request.head.ref,
      },
    };

    return result;
  },
};
