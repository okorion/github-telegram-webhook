import { MessageFormatResult } from "../types/messageTypes";
import { BaseFormatter } from "./baseFormatter";

export interface PushMessageData {
  pusher: string;
  commits: { message: string; url: string }[];
}

export const pushFormatter: BaseFormatter<PushMessageData> = {
  canHandle(payload) {
    return payload?.commits && payload?.ref;
  },

  format(payload) {
    const pusher = payload.pusher?.name;
    const commits = payload.commits.map((c: any) => ({
      message: c.message,
    }));

    const result: MessageFormatResult<PushMessageData> = {
      type: "PUSH",
      data: {
        pusher,
        commits,
      },
    };

    return result;
  },
};
