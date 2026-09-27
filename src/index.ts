import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { createServer } from './server.js';

serveStdio(createServer);
// stdout は MCP の通信に使うので、ログは stderr に出す
console.error('github-repo-mcp listening on stdio');
