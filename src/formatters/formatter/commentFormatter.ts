import { MessageFormatResult } from "../types/messageTypes";
import { BaseFormatter } from "./baseFormatter";

export interface CommentMessageData {
  issueTitle: string;
  comment: string;
  url: string;
  author: string;
}

export const commentFormatter: BaseFormatter<CommentMessageData> = {
  canHandle(payload) {
    return payload.comment && payload.issue;
  },

  format(payload) {
    const { comment, issue, user } = payload;

    const result: MessageFormatResult<CommentMessageData> = {
      type: "COMMENT",
      data: {
        issueTitle: issue.title,
        comment: comment.body,
        url: comment.html_url,
        author: user.name,
      },
    };

    return result;
  },
};
