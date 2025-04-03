import { MessageFormatResult } from "../types/messageTypes";
import { BaseFormatter } from "./baseFormatter";

export interface PullRequestMessageData {
  title: string;
  author: string;
  url: string;
  action: string;
}

export const pullRequestFormatter: BaseFormatter<PullRequestMessageData> = {
  canHandle(payload) {
    return payload.pull_request && payload.action;
  },

  format(payload) {
    const { pull_request } = payload;

    const result: MessageFormatResult<PullRequestMessageData> = {
      type: "PULL_REQUEST",
      data: {
        title: pull_request.title,
        author: pull_request.user?.login,
        url: pull_request.html_url,
        action: payload.action.toUpperCase(),
      },
    };

    return result;
  },
};
