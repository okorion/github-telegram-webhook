import { MessageFormatResult } from "../types/messageTypes";

export interface BaseFormatter<T = any> {
  canHandle(payload: any): boolean;
  format(payload: any): MessageFormatResult<T>;
}
