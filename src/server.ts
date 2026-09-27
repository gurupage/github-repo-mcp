import { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';

const GITHUB_API = 'https://api.github.com';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'github-repo-mcp/1.0',
};
if (GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
}

interface GitHubRepo {
    full_name: string;
    description: string | null;
    stargazers_count: number;
    language: string | null;
    html_url: string;
}

export function createServer(): McpServer {
    const server = new McpServer({
        name: 'github-repo-mcp',
        version: '1.0.0',
    });

    server.registerTool(
        'get-repo',
        {
            description: 'GitHub リポジトリの情報を取得する',
            inputSchema: z.object({
                owner: z.string().describe('例: modelcontextprotocol'),
                repo: z.string().describe('例: typescript-sdk'),
            }),
        },
        async ({ owner, repo }) => {
            const url = `${GITHUB_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
            const res = await fetch(url, { headers });

            if (res.status === 404) {
                return {
                    content: [{ type: 'text', text: `Repository not found: ${owner}/${repo} (status: ${res.status})` }],
                    isError: true,
                };
            } else if (res.status === 401 || res.status === 403) {
                return {
                    content: [{ type: 'text', text: `Authorization error or rate limit exceeded (status: ${res.status})` }],
                    isError: true,
                };
            } else if (!res.ok) {
                return {
                    content: [{ type: 'text', text: `GitHub API error (status: ${res.status})` }],
                    isError: true,
                };
            }

            const data = (await res.json()) as GitHubRepo;
            const text = `${data.full_name}
説明：${data.description ?? '（なし）'}
⭐${data.stargazers_count} / 言語: ${data.language ?? '不明'}
${data.html_url}`;

            return {
                content: [{ type: 'text', text }],
            };
        }
    );

    return server;
}
