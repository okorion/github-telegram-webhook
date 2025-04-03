import { BaseFormatter } from "./formatter/baseFormatter";
import { pushFormatter } from "./formatter/pushFormatter";
import { issueFormatter } from "./formatter/issueFormatter";
import { pullRequestFormatter } from "./formatter/pullRequestFormatter";
import { commentFormatter } from "./formatter/commentFormatter";
import { MessageFormatResult } from "./types/messageTypes";

const formatters: BaseFormatter[] = [
  pushFormatter,
  issueFormatter,
  pullRequestFormatter,
  commentFormatter,
];

export function getFormattedMessage(
  payload: any
): MessageFormatResult<BaseFormatter> | null {
  for (const formatter of formatters) {
    if (formatter.canHandle(payload)) {
      return formatter.format(payload);
    }
  }

  return null;
}
