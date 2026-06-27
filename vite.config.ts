import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';
  const repoFull = process.env.GITHUB_REPOSITORY || ''; // 格式通常为 'username/repo-name'
  const repoName = repoFull.split('/')[1] || '';

  // 1. 如果是 GitHub 个人主页仓库 (例如: 'username.github.io')，或者绑定了自定义域名，应该部署在根路径 '/'
  // 2. 如果是正常的子项目仓库 (例如: 'my-app')，应该部署在 '/my-app/' 子路径
  const isUserPage = repoName.toLowerCase().endsWith('.github.io');
  
  // 提示: 如果你是本地手动打包 (npm run build) 强推 dist 目录：
  // 请直接将下面的 base 改写为你的实际线上二级路径，例如：base: '/你的仓库名/'
  // const base = (isGitHubActions && repoName && !isUserPage) ? `/${repoName}/` : '/';

  return {
    base:'/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});