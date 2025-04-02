import { MessageFormatResult } from "../types/messageTypes";
import { BaseFormatter } from "./baseFormatter";

export interface PushMessageData {
  author: string;
  commits: { message: string; url: string }[];
}

export const pushFormatter: BaseFormatter<PushMessageData> = {
  canHandle(payload) {
    return payload?.commits && payload?.ref;
  },

  format(payload) {
    const { pusher, commits } = payload;
    const arrayCommits = commits.map((c: any) => ({
      message: c.message,
    }));

    const result: MessageFormatResult<PushMessageData> = {
      type: "PUSH",
      data: {
        author: pusher.name,
        commits: arrayCommits,
      },
    };

    return result;
  },
};
