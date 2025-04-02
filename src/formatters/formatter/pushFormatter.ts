import { Formatter } from "./baseFormatter";

export const pushFormatter: Formatter = {
  canHandle(payload) {
    return payload?.commits && payload?.ref;
  },
  format(payload) {
    const repo = payload.repository?.full_name;
    const pusher = payload.pusher?.name;
    const commits = payload.commits
      .map((c: any) => `- ${c.message} (${c.url})`)
      .join("\n");

    return `🚀 *Push 이벤트 발생*\n*레포:* ${repo}\n*푸셔:* ${pusher}\n*커밋 내역:*\n${commits}`;
  },
};
