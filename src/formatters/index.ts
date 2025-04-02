import { Formatter } from "./formatter/baseFormatter";
import { pushFormatter } from "./formatter/pushFormatter";
import { issueFormatter } from "./formatter/issueFormatter";
import { mergeRequestFormatter } from "./formatter/mergeRequestFormatter";
import { commentFormatter } from "./formatter/commentFormatter";

const formatters: Formatter[] = [
  pushFormatter,
  issueFormatter,
  mergeRequestFormatter,
  commentFormatter,
];

export function getFormattedMessage(payload: any): string | null {
  let hasMatchedFormatter = false;

  for (const formatter of formatters) {
    if (formatter.canHandle(payload)) {
      return formatter.format(payload);
    }
  }

  if (!hasMatchedFormatter) {
    console.log("❗️처리 가능한 포맷터 없음");
  }

  return null;
}
