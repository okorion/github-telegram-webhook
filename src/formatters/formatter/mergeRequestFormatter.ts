import { MessageFormatResult } from "../types/messageTypes";
import { BaseFormatter } from "./baseFormatter";

export interface MergeRequestMessageData {
  title: string;
  author: string;
  url: string;
  action: string;
}

export const mergeRequestFormatter: BaseFormatter<MergeRequestMessageData> = {
  canHandle(payload) {
    return payload.object_kind === "merge_request";
  },

  format(payload) {
    const { pull_request, object_attributes } = payload;

    const result: MessageFormatResult<MergeRequestMessageData> = {
      type: "MERGE_REQUEST",
      data: {
        title: object_attributes.title,
        author: pull_request.user.login,
        url: object_attributes.url,
        action: object_attributes.action ?? "OPENED",
      },
    };

    return result;
  },
};
