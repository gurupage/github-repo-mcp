# github-repo-mcp

GitHub REST API で公開リポジトリの情報を取得する、ツール1つだけの MCP サーバーです。
[MCP TypeScript SDK v2](https://github.com/modelcontextprotocol/typescript-sdk) の学習用に作りました。

## 提供するツール

| ツール名 | 引数 | 返す内容 |
|---|---|---|
| `get-repo` | `owner`（例: `modelcontextprotocol`）<br>`repo`（例: `typescript-sdk`） | リポジトリ名・説明・スター数・主な言語・URL |

エラー時（リポジトリが存在しない、認証エラー、レート制限など）は `isError: true` で理由を返します。

## 必要なもの

- Node.js 22.9 以上（`--env-file-if-exists` を使うため）

## セットアップ

```bash
npm install
```

### GitHub トークン（任意）

トークンなしでも公開リポジトリは取得できますが、GitHub API の制限は 1 時間あたり 60 回です。
回数を増やしたい場合は `.env.example` を `.env` にコピーし、`GITHUB_TOKEN` を設定してください。
`.env` は `.gitignore` 済みです。

## 使い方

### Claude Code から使う

このリポジトリのディレクトリで Claude Code を起動すると、`.mcp.json` に定義した `github-repo` サーバーが読み込まれます。

### MCP Inspector で試す

```bash
npm run inspect
```

### JSON-RPC を直接送って試す

```bash
cat test/get-repo.jsonl | npx tsx src/index.ts
```

存在するリポジトリと存在しないリポジトリの 2 パターンを呼び出します。

## ファイル構成

```
src/
  index.ts   # stdio で起動するエントリーポイント
  server.ts  # MCP サーバーと get-repo ツールの定義
test/
  get-repo.jsonl  # 動作確認用の JSON-RPC メッセージ
```

## License

MIT
