import { BaseFormatter } from "./formatter/baseFormatter";
import { pushFormatter } from "./formatter/pushFormatter";
import { issueFormatter } from "./formatter/issueFormatter";
import { pullRequestFormatter } from "./formatter/pullRequestFormatter";
import { commentFormatter } from "./formatter/commentFormatter";
import { MessageFormatResult } from "./types/messageTypes";
import { pullRequestReviewFormatter } from "./formatter/pullRequestReviewFormatter";

// 메시지를 보내기 위한 포맷터들을 배열로 정의합니다.
const formatters: BaseFormatter[] = [
  pushFormatter,
  issueFormatter,
  pullRequestFormatter,
  pullRequestReviewFormatter,
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
