# テストケース一覧

対象: `src/inquiry.ts`(`validateInquiry` / `canTransition` / `filterByStatus`)
仕様の出典: `README.md`「仕様」節

- 列は `TEST_CASES_TEMPLATE.md` に合わせています。「実際」は配布時のコード(修正前)での結果です
- 判定は修正前の結果です。期待結果と一致すれば OK、一致しなければ NG(不具合)です
- 「修正後」は修正したコードで確認した結果です。自動テストの実行ログは [修正前](docs/test-results/before-fix.txt)・[修正後](docs/test-results/after-fix.txt)を参照してください

## 基本ケース(6件)

| ID | 対象 | 入力・前提 | 期待結果 | 実際 | 判定 | 修正後 | 証跡 |
|---|---|---|---|---|---|---|---|
| T01 | 件名検証 | `''`(空文字) | `false`(拒否) | `false` | OK | `false`(OK) | 既存テスト `rejects empty subject` |
| T02 | 件名検証 | `'   '`(半角スペース3つ) | `false`(拒否) | `true`(受理) | **NG(不具合1)** | `false`(OK) | R1 / `T02/T07/T08: 半角スペース だけの件名は拒否する` |
| T03 | 件名検証 | `'相談事項'` | `true`(受理) | `true` | OK | `true`(OK) | 手順B / 既存テスト `accepts subject`(通常件名の別入力) |
| T04 | 状態遷移 | `new` → `in_progress` | `true`(許可) | `true` | OK | `true`(OK) | R2 / `T04/T12: new→in_progress の正規の遷移は許可する` |
| T05 | 状態遷移 | `closed` → `new` | `false`(禁止) | `true`(許可) | **NG(不具合2)** | `false`(OK) | R2 / `T05/T11: closed→new の再開は拒否する` |
| T06 | 一覧抽出 | `sample-data.json` から `new` を抽出 | `D001`・`D004` の2件。元の配列は変わらない | 2件(`D001`・`D004`)。元配列は不変 | OK | 2件(`D001`・`D004`)。元配列は不変(OK) | R3 / `T06: new の ID だけを返し、元の配列を変更しない` |

## 境界値・追加ケース

基本ケースだけでは見落とす境界を補います。

| ID | 対象 | 入力・前提 | 期待結果 | 実際 | 判定 | 修正後 | 証跡 |
|---|---|---|---|---|---|---|---|
| T07 | 件名検証 | `'　'`(全角スペース1つ。日本語入力で混ざりやすい) | `false` | `true` | **NG(不具合1)** | `false`(OK) | R1 / `T02/T07/T08: 全角スペース だけの件名は拒否する` |
| T08 | 件名検証 | `'\t\n'`(タブ・改行のみ。貼り付けで混ざりやすい) | `false` | `true` | **NG(不具合1)** | `false`(OK) | R1 / `T02/T07/T08: タブ・改行 だけの件名は拒否する` |
| T09 | 件名検証 | `'a'`(trim 後ちょうど1文字。下限の境界) | `true` | `true` | OK | `true`(OK) | R1 / `T09/T10: trim 後1文字 の件名は受理する` |
| T10 | 件名検証 | `' 相談 '`(前後に空白。修正で正常な件名まで拒否しないこと) | `true` | `true` | OK | `true`(OK) | R1 / `T09/T10: 前後に空白 の件名は受理する` |
| T11 | 状態遷移 | `closed` → `in_progress`(new 以外への再開) | `false` | `true` | **NG(不具合2)** | `false`(OK) | R2 / `T05/T11: closed→in_progress の再開は拒否する` |
| T12 | 状態遷移 | `in_progress` → `closed`(正規の完了操作) | `true` | `true` | OK | `true`(OK) | R2 / `T04/T12: in_progress→closed の正規の遷移は許可する` |
| T13 | 状態遷移 | 同値(`new`→`new`、`in_progress`→`in_progress`、`closed`→`closed`) | `true`(3通りとも) | `false`(3通りとも) | **NG(不具合3)** | `true`(3通りともOK) | R2 / `T13: new→new の同値遷移は許可する`・`T13: in_progress→in_progress の同値遷移は許可する`・`T13: closed→closed の同値遷移は許可する` |

### 仕様で決まっていない遷移

次の2つは仕様に書かれていません。現在のコードはどちらも許可します。今回は挙動を変えず、改善提案で仕様の確定を求めます。

| 遷移 | 実際 | 論点 |
|---|---|---|
| `new` → `closed` | `true` | 対応せずに完了できてよいか(未対応のまま完了するリスク) |
| `in_progress` → `new` | `true` | 差し戻しを認めるか |

## 再現記録

### 再現環境

- macOS(Darwin 25.5.0)/ Node.js 24.4.1 / npm 11.4.2 / Vitest 2.1.9
- 配布 zip の内容を無変更で取り込んだコミット `7d17f8c` で確認

### 再現手順

**手順A: 自動テストで再現する(Node.js 20 以上)**

1. リポジトリを clone し、`npm ci` を実行する
2. 不具合検出テストを追加した修正前のコミットに切り替える: `git checkout 10e48123c3a057903e00dc6b5daeb47f53fb03b0`
3. `npm test` を実行する → 不具合1〜3のテストが失敗する

**手順B: 関数を直接呼んで全パターンを確認する(Node.js 24 で確認)**

`.ts` を直接 import できる Node.js が必要です。配布時のコード(`7d17f8c`)で、次のコマンドを実行します。

```bash
node --input-type=module -e "
import { validateInquiry, canTransition, filterByStatus } from './src/inquiry.ts';
import fs from 'node:fs';
for (const s of ['', ' ', '   ', '　', '\t\n', ' 相談 ', 'a', '相談事項'])
  console.log('validateInquiry(' + JSON.stringify(s) + ') =', validateInquiry(s));
const S = ['new', 'in_progress', 'closed'];
for (const f of S) console.log(f.padEnd(11), S.map(t => t + ':' + canTransition(f, t)).join('  '));
const data = JSON.parse(fs.readFileSync('sample-data.json', 'utf8'));
const before = JSON.stringify(data);
const r = filterByStatus(data, 'new');
console.log('filter new ->', r.map(x => x.id), 'original unchanged:', before === JSON.stringify(data));
"
```

### R1 不具合1: 空白だけの件名が受理される

```
validateInquiry("") = false
validateInquiry(" ") = true
validateInquiry("   ") = true
validateInquiry("　") = true
validateInquiry("\t\n") = true
validateInquiry(" 相談 ") = true
validateInquiry("a") = true
validateInquiry("相談事項") = true
```

- 期待結果: 空白(半角・全角・タブ・改行)だけの件名は `false`
- 実際: 空文字以外はすべて `true`
- 原因: `subject.length > 0` が trim 前の長さを見ている。仕様は「trim 後に1文字以上」
- 想定される影響: 件名のない問い合わせが一覧に並び、内容を開くまで用件が分からない。振り分けや対応が遅れる

### R2 不具合2・3: 状態遷移の判定(3×3 の全組み合わせ)

```
new         new:false  in_progress:true  closed:true
in_progress new:true  in_progress:false  closed:true
closed      new:true  in_progress:true  closed:false
```

**不具合2: closed から再開できる**

- 期待結果: `closed` → `new`、`closed` → `in_progress` は `false`
- 実際: どちらも `true`
- 原因: 「closed からは他の状態に変えられない」という条件がない
- 想定される影響: 完了した問い合わせが誤操作で未完了に戻り、二重対応が起きる。対応記録の正確さが求められる医療・福祉の現場では特に問題になる

**不具合3: 同値遷移が拒否される(課題に記載のない不具合)**

- 期待結果: 仕様「遷移なし(同値)は許可」のとおり、3通りとも `true`
- 実際: 3通りとも `false`
- 原因: `from !== to` で判定しており、同値を拒否する条件が仕様と逆になっている
- 想定される影響: 状態を変えずに保存する操作(件名だけを直すなど)で、この判定を通している場合に保存できない

### R3 一覧抽出

```
filter new -> [ 'D001', 'D004' ] original unchanged: true
```

- 期待どおり。元の配列も変更されない

### 修正後の確認

- 修正コミット: `b5e5a44`
- 自動テスト: 16件成功・0件失敗。修正前は8件成功・8件失敗です
- 手順Bの全入力と状態遷移9通りを修正後にも実行し、表の「修正後」と一致することを確認しました
- 未定義の `new` → `closed` と `in_progress` → `new` は、修正後も `true` のままです
- GitHub Actions は未確認です。上記はローカルでの結果です
