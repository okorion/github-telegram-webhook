import { Formatter } from "./baseFormatter";

export const commentFormatter: Formatter = {
  canHandle(payload) {
    return payload.comment && payload.issue;
  },
  format(payload) {
    const { comment, issue, repository } = payload;
    return `💬 *이슈 코멘트*\n*레포:* ${repository.full_name}\n*이슈:* ${issue.title}\n*내용:* ${comment.body}`;
  },
};
