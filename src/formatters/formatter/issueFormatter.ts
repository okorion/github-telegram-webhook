import { Formatter } from "./baseFormatter";

export const issueFormatter: Formatter = {
  canHandle(payload) {
    return payload.issue && payload.action;
  },
  format(payload) {
    const { action, issue, repository } = payload;
    return `📌 *이슈 ${action}*\n*레포:* ${repository.full_name}\n*제목:* ${issue.title}\n🔗 ${issue.html_url}`;
  },
};
