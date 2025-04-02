import { MessageFormatResult } from "../types/messageTypes";
import { BaseFormatter } from "./baseFormatter";

export interface IssueMessageData {
  action: string;
  title: string;
  url: string;
}

export const issueFormatter: BaseFormatter<IssueMessageData> = {
  canHandle(payload) {
    return payload.issue && payload.action;
  },

  format(payload) {
    const { action, issue } = payload;

    const result: MessageFormatResult<IssueMessageData> = {
      type: "ISSUE",
      data: {
        action,
        title: issue.title,
        url: issue.html_url,
      },
    };

    return result;
  },
};
