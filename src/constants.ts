export const SITE_TITLE = "TRISHAFT";

export type Categories = "typescript" | "rust";

/** カテゴリーの表示情報 */
export type CategoryInfo = {
  /** カテゴリー */
  category: Categories;
  /** カテゴリーの表示文字列 */
  title: string;
};

/** カテゴリーを表示順に並べた配列 */
export const CATEGORIES_LIST: Categories[] = ["typescript", "rust"];

/** カテゴリーの情報 */
export const CATEGORIES_DATA: Record<Categories, CategoryInfo> = {
  typescript: { category: "typescript", title: "TypeScript" },
  rust: { category: "rust", title: "Rust" },
};
