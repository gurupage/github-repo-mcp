# github-repo-mcp

GitHub REST API で公開リポジトリの情報を取得する、ツール1つだけの MCP サーバーです。
[MCP TypeScript SDK v2](https://github.com/modelcontextprotocol/typescript-sdk) の学習用に作りました。

ローカルで **stdio（標準入出力）** で動かす前提です。HTTP での公開（リモートサーバー）には対応していません。
MCP クライアント（Claude Code など）がこのサーバーを子プロセスとして起動し、標準入力・標準出力で JSON-RPC メッセージをやりとりします。

## 提供するツール

| ツール名 | 引数 | 返す内容 |
|---|---|---|
| `get-repo` | `owner`（例: `modelcontextprotocol`）<br>`repo`（例: `typescript-sdk`） | リポジトリ名・説明・スター数・主な言語・URL |

エラー時（リポジトリが存在しない、認証エラー、レート制限など）は `isError: true` で理由を返します。

## 必要なもの

- Node.js 22.19 以上（MCP Inspector を使わない場合は 22.9 以上で動きます）

## セットアップ

```bash
npm install
```

サーバーの実行に必要なパッケージと、動作確認用の MCP Inspector がダウンロードされます。

### GitHub トークン（任意）

トークンなしでも公開リポジトリは取得できますが、GitHub API の制限は 1 時間あたり 60 回です。
回数を増やしたい場合は `.env.example` を `.env` にコピーし、`GITHUB_TOKEN` を設定してください。
`.env` は `.gitignore` 済みです。

## 使い方

### Claude Code から使う

**このリポジトリの中で使う場合**

このリポジトリのディレクトリで Claude Code を起動すると、`.mcp.json` に定義した `github-repo` サーバーが読み込まれます（初回は読み込みの承認を求められます）。

**ほかのディレクトリからも使う場合**

`claude mcp add` でユーザー全体に登録します。`<このリポジトリの絶対パス>` は自分の環境に合わせて置き換えてください。

```bash
claude mcp add github-repo --scope user -- npx tsx <このリポジトリの絶対パス>/src/index.ts
```

この登録方法では `.env` は読み込まれません。トークンを使う場合は `-e GITHUB_TOKEN=...` を付けて登録してください。

登録できたかは `claude mcp list` で確認できます。

### Claude Desktop から使う

`claude_desktop_config.json` の `mcpServers` に次のように追加します。

```json
{
  "mcpServers": {
    "github-repo": {
      "command": "npx",
      "args": ["tsx", "<このリポジトリの絶対パス>/src/index.ts"]
    }
  }
}
```

### MCP Inspector で試す

[MCP Inspector](https://github.com/modelcontextprotocol/inspector) は、MCP サーバーをブラウザの画面から試せる公式の開発ツールです。
Claude Code などに登録しなくても、ツールの一覧を見たり、引数を入れてツールを呼び出したりできます。

**1. MCP Inspector をダウンロードする**

MCP Inspector はこのリポジトリの開発用の依存パッケージ（`devDependencies` の `@modelcontextprotocol/inspector`）に入れてあります。
「セットアップ」の `npm install` を実行すると、サーバー本体の依存と一緒に `node_modules/` へダウンロードされます。

ダウンロードできたかは、次のコマンドで確認できます（使い方が表示されれば OK です）。

```bash
npx mcp-inspector --help
```

> MCP Inspector 2.8 は Node.js 22.19 以上が必要です。

**2. MCP Inspector を起動する**

```bash
npm run inspect
```

MCP Inspector がこのサーバーを子プロセス（stdio）として起動し、ブラウザで画面が開きます。
ブラウザが自動で開かない場合は、ターミナルに表示された `http://127.0.0.1:6274?MCP_INSPECTOR_API_TOKEN=...` の URL を開いてください（URL の中のトークンは起動するたびに変わります）。

**3. ツールを呼び出す**

1. 「Servers」タブのサーバーのスイッチをオンにして、「Connected」になることを確認する
2. 画面上部の「Tools」タブを開き、一覧から `get-repo` を選ぶ
3. `owner` に `modelcontextprotocol`、`repo` に `typescript-sdk` を入力する
4. 「Execute Tool」を押す
5. 「Results」にリポジトリ名・説明・スター数・言語・URL が表示されれば成功

存在しないリポジトリ名を入れると、エラーの理由（`Repository not found ...`）が返ることも確認できます。
終わったらターミナルで `Ctrl + C` を押して止めます。

**ブラウザを使わずに試す（CLI モード）**

MCP Inspector はコマンドだけでも使えます。

```bash
# ツールの一覧を見る
npx mcp-inspector --cli npx tsx src/index.ts --method tools/list

# get-repo を呼び出す
npx mcp-inspector --cli npx tsx src/index.ts --method tools/call --tool-name get-repo --tool-arg owner=modelcontextprotocol repo=typescript-sdk
```

### JSON-RPC を直接送って試す

```bash
cat test/get-repo.jsonl | npx tsx src/index.ts
```

存在するリポジトリと存在しないリポジトリの 2 パターンを呼び出します。
結果は標準出力に JSON-RPC のレスポンスとして 1 行ずつ出ます（順番は前後することがあります）。

## 注意

- stdio では標準出力が MCP の通信に使われます。サーバーのコードで `console.log` を使うと通信が壊れるため、ログは `console.error`（標準エラー出力）に出してください。

## ファイル構成

```
src/
  index.ts   # stdio で起動するエントリーポイント
  server.ts  # MCP サーバーと get-repo ツールの定義
test/
  get-repo.jsonl  # 動作確認用の JSON-RPC メッセージ
```
