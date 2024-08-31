import { SITE_TITLE } from "./constants";

/**
 * ページのタイトルを生成する。
 */
export function getTitle(title?: string): string {
  if (!title) {
    return SITE_TITLE;
  }
  return `${title} - ${SITE_TITLE}`;
}
