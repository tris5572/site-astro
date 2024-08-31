---
title: "TypeScript のユーティリティ型全部"
pubDate: 2024-08-30
publish: true
---

TypeScript に用意されているユーティリティ型 (Utility Types) の全部について書く。

情報のソースは [TypeScript 公式サイトの Utility Types のページ](https://www.typescriptlang.org/docs/handbook/utility-types.html)を基本に、解説を追加している。

順番は、よく使うであろうものを上に、あまり使わないであろうものを下の方に並べている。


## Pick<Type, Keys>

追加されたバージョン: 2.1

`Type` から `Keys` のプロパティの集合を選び出して型を構築する。要するに `Type` から特定のプロパティだけをピックアップした型を生成できる。

`Keys` は単なる文字列リテラルか、あるいは文字列リテラルのユニオンを指定できる。

```ts
type T = {
  a: number;
  b: boolean;
  c: string;
};

// 型 T から、プロパティ a と c だけを取り出した型 AC を作る
type AC = Pick<T, "a" | "c">;
// type AC = {
//   a: number;
//   c: string;
// }

const x: AC = { a: 42, c: "世界" };
```

この `Pick` のメリットは、型をそのまま流用できるので、変更が自動的に反映されること。例えば上記例の `T` のプロパティ `a` の型を `string`へ変更すると、型 `AC` の `a` の型も自動的に `string` になる。したがって、変更時に手を加えるべき箇所が減るので変更しやすいコードになるし、型が合わなければエラーが出るので実行前に気付けて嬉しい。

```ts
type T = {
  a: string; // number から string へ変更
  b: boolean;
  c: string;
};

type AC = Pick<T, "a" | "c">;
// type AC = {
//   a: string; // Pick しているので、元の型の変更が自動的に反映される
//   c: string;
// }

// !! ERROR !!
// 型を使っている箇所で整合性が取れなければエラーが出る
const x: AC = { a: 42, c: "世界" }; // 型 'number' を型 'string' に割り当てることはできません。
```

また、プロパティに存在しない `Keys` を指定するとエラーになってくれるのも嬉しいところ。


## Omit<Type, Keys>

追加されたバージョン: 3.5

`Type` から `Keys` (文字列か、文字列のユニオン型)を削除した型を構築する。`Pick` の逆。

```ts
type T = {
  a: number;
  b: boolean;
  c: string;
};

// 型 T からプロパティ a と c を取り除いた型を作る
type OnlyB = Omit<T, "a" | "c">;
// type OnlyB = {
//   b: boolean;
// };

const x: OnlyB = { b: true };
```

`Omit` は `Keys` の制約が緩く、**`Type` に存在しないプロパティを `Keys` で指定してもエラーにならない**ため、タイプミスには注意が必要。

なお `Pick` では存在しないキーを指定するとエラーになるので `Omit` も同様にエラーにして欲しいという要望は上がっているが、TypeScript チームはそれを拒否している。（[当該 Issue](https://github.com/microsoft/TypeScript/issues/30825)）

```ts
type T = {
  a: number;
  b: boolean;
  c: string;
};

// 型 T に存在しないプロパティを Omit で指定してもエラーにならない
type U = Omit<T, "z">;
// type U = {
//   a: number;
//   b: boolean;
//   c: string;
// };
```


## Exclude<UnionType, ExcludedMembers>

追加されたバージョン: 2.8

**ユニオン型** `UnionType` から、`ExcludedMembers` に割り当て可能なものを除外した型を構築する。

言い換えると、`UnionType` と `ExcludedMembers` の差分が取れる。（元々はその挙動そのままの `Diff` という名前で提案されていたらしい）

もっとシンプルに言えば、ユニオン型に対する `Omit` である。

```ts
// "a" を取り除く
type T0 = Exclude<"a" | "b" | "c", "a">;
// type T0 = "b" | "c";

// "a" と "b" を取り除く
type T1 = Exclude<"a" | "b" | "c", "a" | "b">;
// type T1 = "c";

// 関数を取り除く
type T2 = Exclude<string | number | (() => void), Function>;
// type T2 = string | number;

type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; x: number }
  | { kind: "triangle"; x: number; y: number };

// 型 Shape から { kind: "circle" } を除外する
type T3 = Exclude<Shape, { kind: "circle" }>;
// type T3 =
//   | {
//       kind: "square";
//       x: number;
//     }
//   | {
//       kind: "triangle";
//       x: number;
//       y: number;
//     };
```

## Extract<Type, Union>

追加されたバージョン: 2.8

`Type` から `Union` に代入可能なすべてのユニオン型のメンバーを抽出した型を構築する。

言い換えると、ユニオン型において `Type` の中から `Union` に存在する同じものだけを抽出するということ（厳密に言えばちょっと違う）。これをもっとざっくり言うと、`Type` と `Union` の `AND (論理積)` を取るのと大体同じだと言える。

```ts
// 共通する "a" だけを抽出する
type T0 = Extract<"a" | "b" | "c", "a" | "f">;
// type T0 = "a";

// 関数だけを抽出する
type T1 = Extract<string | number | (() => void), Function>;
// type T1 = () => void;

type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; x: number }
  | { kind: "triangle"; x: number; y: number };

// { kind: "circle" } に代入可能なものだけを抽出する
type T2 = Extract<Shape, { kind: "circle" }>;
// type T2 = {
//   kind: "circle";
//   radius: number;
// };
```

> **Extract の逆をやりたいとき**
>
> `Extract` の `AND (論理積)` とは逆に `OR (論理積)` したいときは、それらを `|` で並べてユニオン型にしてやればよい。
>
> ```ts
> type A = "a" | "b" | "c";
> type B = "a" | "f";
> type C = A | B;
> // type C = "a" | "b" | "c" | "f";
> ```


## NonNullable<Type>

追加されたバージョン: 2.8

`Type` から `null` と `undefined` を取り除いた型を構築する。

```ts
type T0 = NonNullable<string | number | undefined>;
// type T0 = string | number;

type T1 = NonNullable<string[] | null | undefined>;
// type T1 = string[];
```


## Partial<Type>

追加されたバージョン: 2.1

`Type` のすべてのプロパティをオプショナルにした型を構築する。

```ts
type A = {
  n: number;
  s: string | null;
};

// type A のすべてのプロパティがオプショナルになった型を得られる
type B = Partial<A>;
// type B = {
// 	 n?: number | undefined;
// 	 s?: string | null | undefined;
// }
```

`Partial` は、オブジェクトの一部の値を上書きする関数を作るときに便利。これはテスト用データ作成で一部のプロパティを変更する場合などによく使われる。

```ts
type A = {
  n: number;
  s: string;
};

// 型 A のオブジェクト x を、オブジェクト y で上書きした新しいオブジェクトを生成する関数。
// y は型 A の Partial なので、指定するプロパティは全部でなくて良い。
function update(x: A, y: Partial<A>): A {
  return { ...x, ...y };
}

const source: A = {
  n: 1,
  s: "元",
};

const v1 = update(source, { n: 7, s: "変更" });
// { n: 7, s: '変更' }

// 一部のプロパティのみ (この場合だと n のみ) を上書きできる
const v2 = update(source, { n: 42 });
// { n: 42, s: '元' }

// 何も上書きしないこともできる
const v3 = update(source, {});
// { n: 1, s: '元' }
```


## Required<Type>

追加されたバージョン: 2.8

`Type` のすべてのプロパティを必須にした型を構築する。`Partial` の逆。

```ts
type A = {
  n?: number;
  s?: string;
};

// type A のすべてのプロパティが必須（オプショナルではない）になった型を得られる
type B = Required<A>;
// type B = {
//   n: number;
//   s: string;
// }

const x: B = {
  n: 0,
  s: "文字列",
};

// !! ERROR !!
// s が不足しているためエラー
const y: B = {
  n: 0,
};
```

なお、プロパティがオプショナルである（`?`）ことと `undefined` をユニオン型で許容する（`| undefined`）ことは意味が異なるため、`Required` ではユニオンの `undefined` は変化しない。

```ts
type C = {
  a?: number;
  b: number | undefined;
};

// Required により a はオプショナルではなくなるが、b は undefined も代入可能なまま
type D = Required<C>;
// type D = {
//   a: number;
//   b: number | undefined;
// }

// 全部の値を入れているためOK
const x: D = { a: 0, b: 1 };

// b は undefined を代入可能
const y: D = { a: 0, b: undefined };

// !! ERROR !!
// b はオプショナルではなく省略できないためエラー
const z: D = { a: 0 }; // ERROR!!
```

そしてややこしいことに、オプショナル `?` と `| undefined` を同時に指定した型へ `Required` を適用すると、それは必須になるとともに `undefined` を許容しなくなる。

```ts
type E = {
  a?: number | undefined;
};

// オプショナル + undefined 許容を Required すると、必須で undefined を許容しなくなる
type F = Required<E>;
// type F = {
//   a: number;
// }

const x: F = { a: 42 };

// !! ERROR !!
// a は省略不可でエラー
const y: F = {}; // ERROR!!

// !! ERROR !!
// a は undefined を許容しなくなるためエラー
const z: F = { a: undefined }; // ERROR!!
```


## Readonly<Type>

追加されたバージョン: 2.1

`Type` のすべてのプロパティが `readonly` に設定された型を構築する。すなわち、プロパティがすべて読み取り専用になり、代入できなくなる。

```ts
type A = {
  n: number;
};

// 型 A を読み取り専用にした変数 x を
const x: Readonly<A> = {
  n: 0,
};

// !! ERROR !!
x.n = 42; // 読み取り専用プロパティであるため、'n' に代入することはできません。
```

ただし配列やオブジェクトは `readonly` になってもその内部は操作可能であるため、完全に読み取り専用の型になるわけではない。

```ts
type B = {
  a: string[];
};

const x: Readonly<B> = {
  a: ["あ", "い"],
};

// readonly の配列やオブジェクトは操作可能
x.a.push("う"); // [ 'あ', 'い', 'う' ]

// !! ERROR !!
// ただし代入はできない。
x.a = ["ん"]; // 読み取り専用プロパティであるため、'a' に代入することはできません。
```


## Record<Keys, Type>

追加されたバージョン: 2.1

プロパティのキーが `Keys` 型で、プロパティの型が `Type` であるオブジェクト型を構築する。これはある型のプロパティを別の型にマッピングするために使用できる。

```ts
type CatName = "tama" | "mike" | "kuro";

type CatInfo = {
  age: number;
  breed: string;
};

// 猫のデータを表す型
// プロパティのキーが CatName 型で、値が CatInfo 型
type Cats = Record<CatName, CatInfo>;

const cats: Cats = {
  tama: { age: 5, breed: "アメリカンショートヘア" },
  mike: { age: 5, breed: "雑種" },
  kuro: { age: 5, breed: "ボンベイ" },
};
// もしも CatName を網羅していない場合（例えば kuro が抜けているような場合）は型エラーとなる
```


## Parameters<Type>

追加されたバージョン: 3.1

`Type` 関数型の引数の型のタプル型を構築する。

要するに、関数の引数の型を得られる。

```ts
// 引数がないため空のタプル型
type T0 = Parameters<() => string>;
// type T0 = [];

// 引数が文字列1つなのでそのタプル型
type T1 = Parameters<(s: string) => void>;
// type T1 = [s: string];

// ジェネリクス型のときは確定しないので unknown
type T2 = Parameters<<T>(arg: T) => T>;
// type T2 = [arg: unknown];

function f1(arg: { a: number; b: string }): void {}

// 関数に対して適用する時は typeof で関数を型にする
type T3 = Parameters<typeof f1>;
// type T3 = [
//   arg: {
//     a: number;
//     b: string;
//   }
// ];

// any は何でもあり
type T4 = Parameters<any>;
// type T4 = unknown[];

// never は何もない
type T5 = Parameters<never>;
// type T5 = never;

// !! ERROR !!
// string 型は関数ではないためエラー
type T6 = Parameters<string>; // 型 'string' は制約 '(...args: any) => any' を満たしていません。
// type T6 = never;

// !! ERROR !!
// 型 Function は曖昧すぎるためにエラーとなる模様
type T7 = Parameters<Function>;
// 型 'Function' は制約 '(...args: any) => any' を満たしていません。
//   型 'Function' にはシグネチャ '(...args: any): any' に一致するものがありません。
// type T7 = never;
```

これは React でコンポーネントのプロパティの型を外部から得るときによく利用される。プロパティの型が `export` されていなくても外部から知ることができる。


## ReturnType<Type>

追加されたバージョン: 2.8

関数 `Type` が返す型を得る。

```ts
declare function f1(): { a: number; b: string };

type T0 = ReturnType<() => string>;
// type T0 = string;

type T1 = ReturnType<(s: string) => void>;
// type T1 = void;

// 単なるジェネリクスの場合は不明
type T2 = ReturnType<<T>() => T>;
// type T2 = unknown;

// ジェネリクスで型があらかじめ分かっている範囲までは絞り込まれる
type T3 = ReturnType<<T extends U, U extends number[]>() => T>;
// type T3 = number[];

// 関数そのものに対して適用する場合は typeof で型にする
type T4 = ReturnType<typeof f1>;
// type T4 = {
//   a: number;
//   b: string;
// };

type T5 = ReturnType<any>;
// type T5 = any;

type T6 = ReturnType<never>;
// type T6 = never;

// !! ERROR !!
// string は関数ではない
type T7 = ReturnType<string>; // 型 'string' は制約 '(...args: any) => any' を満たしていません。
// type T7 = any;

// !! ERROR !!
type T8 = ReturnType<Function>;
// 型 'Function' は制約 '(...args: any) => any' を満たしていません。
//   型 'Function' にはシグネチャ '(...args: any): any' に一致するものがありません。
// type T8 = any;
```


## Awaited<Type>

追加されたバージョン: 4.5

非同期関数の `await` や、 `Promise` の `.then()` のような操作を行う。特に `Promise` の再帰的な型の取り出しをモデル化する。

```ts
// Promise を外した型を取り出せる
type A = Awaited<Promise<string>>;
// type A = string

// Promise がネストされて二重になっていても再帰的に型を取り出せる
type B = Awaited<Promise<Promise<number>>>;
// type B = number

// Promise とそれ以外があっても大丈夫
type C = Awaited<boolean | Promise<number>>;
// type C = number | boolean
```

導入前までは `Promise.all` や `Promise.race` 等の型推論で問題が起きることがあったが、それを解決した。

- [参考PR](https://github.com/microsoft/TypeScript/pull/45350)



## NoInfer<Type>

追加されたバージョン: 5.4

含まれる型への推論をブロックする。それ以外は `NoInfer<Type>` は `Type` と同じ。

ざっくりと言えば、TypeScript が行う型推論 (type inference) に、余計な型を加えないようにブロックする機能。

例えば下記のコードにおいて、推論された型に余計な型が含まれ、エラーになって欲しいところでエラーにならない。

```ts
// 文字列のリストと、リスト中のデフォルト値を設定する関数
// リストにない値がデフォルト値として指定されたときには型エラーを出したい
function fn<C extends string>(values: C[], defaultValue: C) {
  // ...
}

// デフォルト値を設定する普通の使い方
fn(["a", "b", "c"], "a");

// リストに存在しない文字列をデフォルト値に設定してもエラーにならない！
// これは TypeScript が C の型として "z" も含める型推論を行ってしまい、
// 型 C が "a" | "b" | "c" | "z" と型推論されているため
fn(["a", "b", "c"], "z");
```

ここで `NoInfer` を使うと、特定の型を推論の対象から除外できるため、想定通りの挙動を実現できる。

```ts
// defaultValue の型を NoInfer で囲み、型推論の対象外とする
function fn<C extends string>(values: C[], defaultValue: NoInfer<C>) {
  // ...
}

// 普通にデフォルト値を設定できる
fn(["a", "b", "c"], "a");

// !! ERROR !!
// 型 C が "a" | "b" | "c" と型推論され、"z" が含まれないため、正しくエラーになる
fn(["a", "b", "c"], "z"); // 型 '"z"' の引数を型 '"a" | "b" | "c"' のパラメーターに割り当てることはできません。
```


---

ここから下は明らかに使用頻度が低いと思われるもの。


## ConstructorParameters<Type>

追加されたバージョン: 3.1

`Parameters` のコンストラクタ関数型バージョン。

最近の TypeScript では `class` が使われることがとても少ないため、目にする機会はほとんどない。

```ts
type T0 = ConstructorParameters<ErrorConstructor>;
// type T0 = [message?: string, options?: ErrorOptions]

type T1 = ConstructorParameters<FunctionConstructor>;
// type T1 = string[];

type T2 = ConstructorParameters<RegExpConstructor>;
// type T2 = [pattern: string | RegExp, flags?: string];

class C {
  constructor(a: number, b: string) {}
}

type T3 = ConstructorParameters<typeof C>;
// type T3 = [a: number, b: string];

type T4 = ConstructorParameters<any>;
// type T4 = unknown[];

// !! ERROR !!
type T5 = ConstructorParameters<Function>;
// 型 'Function' は制約 'abstract new (...args: any) => any' を満たしていません。
//   型 'Function' にはシグネチャ 'new (...args: any): any' に一致するものがありません。
```

## InstanceType<Type>

追加されたバージョン: 2.8

コンストラクタ関数 `Type` のインスタンス型からなる型を構築する。

要するにインスタンスのクラスを得られるが、最近は `class` が使われることが少ないので、あまり目にしない。

```ts
class C {
  x = 0;
  y = 0;
}

type T0 = InstanceType<typeof C>;
// type T0 = C;

type T1 = InstanceType<any>;
// type T1 = any;

type T2 = InstanceType<never>;
// type T2 = never;

// !! ERROR !!
type T3 = InstanceType<string>; // 型 'string' は制約 'abstract new (...args: any) => any' を満たしていません。
// type T3 = any;

// !! ERROR !!
type T4 = InstanceType<Function>;
// 型 'Function' は制約 'abstract new (...args: any) => any' を満たしていません。
//   型 'Function' にはシグネチャ 'new (...args: any): any' に一致するものがありません。
// type T4 = any;
```

## ThisParameterType<Type>

追加されたバージョン: 3.3

関数型 `Type` の `this` 引数の型を抽出する。関数型が `this` 引数を持たない場合、`unknown` となる。

使うことはほとんどないはず。

```ts
function toHex(this: Number) {
  return this.toString(16);
}

function numberToString(n: ThisParameterType<typeof toHex>) {
  return toHex.apply(n);
}
```

## OmitThisParameter<Type>

追加されたバージョン: 3.3

関数型 `Type` の `this` 引数の型を取り除いた型を構築する。

使うことはほとんどないはず。

```ts
function toHex(this: Number) {
  return this.toString(16);
}

const fiveToHex: OmitThisParameter<typeof toHex> = toHex.bind(5);

console.log(fiveToHex()); // 5
```

## ThisType<Type>

追加されたバージョン: 2.3

関数中の `this` の型を `Type` として扱えるようになる。`noImplicitThis` フラグが有効化されている必要がある。

使うことはまずないはず。

例示は省略。

