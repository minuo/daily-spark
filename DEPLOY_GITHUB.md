# 🚀 将「微光 (Daily Spark)」应用部署到 GitHub 完整指南

本指南将详细介绍如何从 Google AI Studio 导出项目，并将其完整部署到 **GitHub Pages** 静态托管服务中，同时确保 **Firebase 云端同步功能** 完美运行。

---

## 📋 目录
1. [第一步：从 AI Studio 导出项目](#1-第一步从-ai-studio-导出项目)
2. [第二步：在 GitHub 上创建新的仓库](#2-第二步在-github-上创建新的仓库)
3. [第三步：配置 Vite Base 路径（重要）](#3-第三步配置-vite-base-路径重要)
4. [第四步：部署到 GitHub Pages（二选一）](#4-第四步部署到-github-pages二选一)
   - [方法 A：使用 GitHub Actions 自动构建与部署（推荐）](#方法-a使用-github-actions-自动构建与部署推荐)
   - [方法 B：使用 `gh-pages` 脚本本地手动部署](#方法-b使用-gh-pages-脚本本地手动部署)
5. [第五步：配置 Firebase 授信域名（防授权失效，关键步骤）](#5-第五步配置-firebase-授信域名防授权失效关键步骤)

---

## 1. 第一步：从 AI Studio 导出项目

1. 在 Google AI Studio 界面右上角，点击 **Settings (设置)** 菜单或 **Export (导出)**。
2. 选择 **Download ZIP**（下载为 ZIP 压缩包）或选择 **Export to GitHub**（直接导出为 GitHub 仓库）。
3. 如果下载的是 ZIP 压缩包，请在本地解压到工作目录。

---

## 2. 第二步：在 GitHub 上创建新的仓库

1. 登录 [GitHub官网](https://github.com/)。
2. 点击右上角 **`+`** -> **New repository**。
3. 输入仓库名称（例如：`daily-spark`），选择 **Public (公开)**。
4. **不要** 勾选 "Add a README.md" 或 ".gitignore"（因为应用内已经有完美的配置文件）。
5. 点击 **Create repository** 创建仓库。
6. 本地初始化 Git 并建立关联（若直接使用 AI Studio 导出到新仓库可跳过此步）：
   ```bash
   git init
   git add .
   git commit -m "Initialize Daily Spark app"
   git branch -M main
   git remote add origin https://github.com/你的用户名/你的仓库名.git
   git push -u origin main
   ```

---

## 3. 第三步：配置 Vite Base 路径（重要）

由于 GitHub Pages 默认托管在 `https://<你的用户名>.github.io/<你的仓库名>/` 下（属于子目录），如果直接打包会导致静态资源（CSS, JS）404 无法加载。

你需要修改根目录下的 `vite.config.ts`：

```typescript
// vite.config.ts 修改示例
export default defineConfig(() => {
  return {
    // 将下面的 '你的仓库名' 替换为你在 GitHub 上创建的实际项目仓库名称
    base: process.env.NODE_ENV === 'production' ? '/你的仓库名/' : '/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    // ... 保留其余配置不变
  };
});
```

> **提示：** 如果你的自定义域名（Custom Domain）已经绑定到 GitHub Pages（例如直接运行在根域名下 `https://yourdomain.com`），则 `base` 保持 `/` 即可，不需要做此修改。

---

## 4. 第四步：部署到 GitHub Pages（二选一）

### 方法 A：使用 GitHub Actions 自动构建与部署（推荐）

这是最现代、最省心的方法。每次你向 `main` 分支推送代码，GitHub 都会自动帮你构建并部署上线。

1. 在项目根目录下，创建 `.github/workflows/deploy.yml` 文件夹和文件。
2. 填入以下配置：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main  # 当推送到 main 分支时触发

permissions:
  contents: write

jobs:
  build-and-deploy:
    concurrency: ci-${{ github.ref }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout 🛎️
        uses: actions/checkout@v4

      - name: Install and Build 🔧
        run: |
          npm ci
          npm run build

      - name: Deploy 🚀
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          folder: dist # Vite 默认打包输出的文件夹
          branch: gh-pages # 部署的目标静态分支
```

3. 将这个文件一同 commit 并 push 到 GitHub。
4. 在 GitHub 仓库设置页中：
   - 进入 **Settings** -> **Pages**。
   - 在 **Build and deployment** 下的 **Source** 选择 **Deploy from a branch**。
   - Branch（分支）选择 **`gh-pages`**，文件夹选择 `/ (root)`。
   - 保存后，稍等 1-2 分钟，即可通过生成的链接访问在线版！

---

### 方法 B：使用 `gh-pages` 脚本本地手动部署

如果你更习惯在本地命令行通过单条命令部署，可以使用此方法：

1. 打开项目终端，安装部署依赖工具：
   ```bash
   npm install gh-pages --save-dev
   ```
2. 打开 `package.json`，在 `"scripts"` 块内部添加 `predeploy` 和 `deploy` 脚本：
   ```json
   "scripts": {
     "dev": "vite",
     "build": "tsc -b && vite build",
     "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
     "preview": "vite preview",
     
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```
3. 在本地控制台运行以下命令：
   ```bash
   npm run deploy
   ```
   *该命令将自动构建你的包，并在你的 GitHub 仓库中创建/更新 `gh-pages` 分支提供部署托管。*

---

## 5. 第五步：配置 Firebase 授信域名（防授权失效，关键步骤）

应用中集成了 **Firebase Firestore 与 Anonymous Auth (匿名认证)** 引擎。如果你的网站从未授权域名（如刚发布的 `https://<用户名>.github.io`）向 Firebase 发起匿名身份请求，Firebase 会出于安全性保护拒绝该请求，控制台由于安全原因会收到跨域或非法主机的授权错误。

### ⚙️ 授权域名配置步骤：

1. 登录你的 [Firebase 控制台 (Firebase Console)](https://console.firebase.google.com/)。
2. 在左侧菜单栏选择 **Authentication (身分验证/鉴权)**。
3. 切换至 **Settings (设置)** 选项卡（或者顶部的 Settings 页签）。
4. 在下面的配置列表中，找到 **Authorized domains (授信域名/授权网域)** 栏目。
5. 点击 **Add domain (添加网域)** 按钮。
6. 填入你在 GitHub Pages 上生成的主域名（**注意：不要带子路径和 `https://`**）：
   - 填写格式：`你的用户名.github.io`
   - *（如果是自定义域名，请直接填入自定义根域名即可，如 `my-web-domain.com`）*
7. 点击 **Add (添加)** 确认。

---

## 6. 🙋‍♂️ 常见问题：部署后打开页面显示空白（Blank Screen / 404）

如果在 GitHub Actions 构建部署成功后，访问页面是一片空白，请按以下步骤排除：

### 🔍 诊断方法
在浏览器中打开你的主页，按键盘 F12 或右键选择 **检查/审查元素**，切换到 **Console (控制台)** 页签。如果看到大量的类似以下的红色报错，则说明是**路径映射问题（404）**：
```bash
Failed to load resource: net::ERR_ABORTED 404 (Not Found)  - index-xxxx.js
Failed to load resource: net::ERR_ABORTED 404 (Not Found)  - index-xxxx.css
```

### 💡 解决方案

#### 方案一：你使用的是默认项目仓库路径（子路径页面，如 `https://<用户名>.github.io/<仓库名>/`）
此时浏览器需要去像 `<用户名>.github.io/<仓库名>/assets/` 这样的二级子路径去加载静态资源。
1. 确认你推送的 `vite.config.ts` 已经有了静态 `base` 设置。
2. 我们已经将 `vite.config.ts` 中的 `base` 修改为在 GitHub Actions 构建环境中**全自动获取子仓库名称**。如果你是使用我们自带的 `.github/workflows/deploy.yml` 触发的自动构建部署，请确认构建时用的是最新的 `vite.config.ts`。
3. **关键补充：** 如果你是通过本地手动打包（在本地电脑运行 `npm run build`）并手动将 `dist` 目录内容强推到 GitHub 上的，GitHub Actions 的环境变量不生效。此时你需要**把 `vite.config.ts` 中的 `base` 强制写死为你的仓库子路径**，例如：
   ```typescript
   // vite.config.ts 
   base: '/你的仓库名/', 
   ```
   然后重新在本地打包、推送。

#### 方案二：你使用的是个人主页专属仓库（例如：仓库名字恰好就是 `<用户名>.github.io`）
此时你的网站是直接部署在根域名 `https://<用户名>.github.io/` 下的。
1. 在这种情况下，静态资源并不在二级路径下，Vite 配置的 `base` 参数**必须是 `'/'`**，而绝不能是 `'/<用户名>.github.io/'`。
2. 我们已经在最新的 `vite.config.ts` 中加入了自动检测逻辑（如果仓库名称以 `.github.io` 结尾，则 `base` 会自动回退为 `'/'`），请确认你最新提交的代码包含最新版 `vite.config.ts` 并重新触发一次部署。

#### 方案三：你绑定了个人自定义域名
此时无论仓库名字是什么，你的网站都是直接在域名的根目录 `/` 下访问。
1. 请进入 `vite.config.ts`，直接修改 `base` 为 `'/'` 并保存。
2. 重新提交部署即可解决。

---

🎉 **至此配置全部完成！** 你的「微光」应用在 GitHub Pages 部署后，将实现完美的本地极速加载，且只要网络通畅，所有的“收藏”、“个人手记”和“专注正念历史记录”都会静默安全、高可靠地自动双向同步至你的云端 Firebase 数据库中。
