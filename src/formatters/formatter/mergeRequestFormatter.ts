import { Formatter } from "./baseFormatter";

export const mergeRequestFormatter: Formatter = {
  canHandle(payload) {
    return payload.object_kind === "merge_request";
  },
  format(payload) {
    const { user, object_attributes } = payload;
    return `🔀 *Merge Request*\n*제목:* ${object_attributes.title}\n*작성자:* ${user.name}\n🔗 ${object_attributes.url}`;
  },
};
