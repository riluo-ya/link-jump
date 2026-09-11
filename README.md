# link-jump

> 长链接 & 短链接跳转工具 · 纯静态 · 无需后端 · 一键部署 GitHub Pages

一个极简的网页跳转工具：通过 URL 参数识别**长链接**或**短链接识别码**，展示倒计时后自动跳转。内置深色/浅色主题（按本地时间自动切换）、DNS 预解析加速、CSS 加载动画，以及沉浸式 404 沙漠彩蛋页。

## 功能特性

- **长链接跳转**：`index.html?t=https://example.com`，5 秒倒计时 + 强制风险提示
- **短链接跳转**：`index.html?s=example`，读取 `ls/example.json` 配置，3 秒倒计时，无风险提示
- **极简主题**：本地时间 19:00–07:00 自动切换深色模式，其余时间为浅色模式
- **DNS 预解析**：动态插入 `dns-prefetch` 标签，3 秒超时自动销毁；支持多条附加域名
- **加载动画**：短链配置读取时展示 CSS 转圈动画 + 文字提示
- **404 彩蛋**：沙漠主题沉浸式页面，停留超 60 秒文案切换，随机抽取 `wordbank.json` 提示词
- **立即跳转**：倒计时期间随时可点击按钮跳过等待
- **无历史残留**：跳转使用 `location.replace()`，浏览器不保留中间页

## 目录结构

```
link-jump/
├── index.html          # 主跳转入口（长短链共用）
├── 404.html            # 沙漠彩蛋 404 页
├── index-intro.html    # 项目介绍页
├── ls/                 # 短链配置目录
│   └── example.json    # 内置示例 s=example
├── wordbank.json       # 404 随机提示词词库
└── assets/
    ├── css/main.css
    └── js/main.js
```

## 使用方式

| 模式 | 访问地址 | 行为 |
| --- | --- | --- |
| 长链接 | `index.html?t=https://example.com` | 5s 倒计时，强制风险提示后跳转 |
| 短链接 | `index.html?s=example` | 读取 `ls/example.json`，3s 倒计时跳转 |
| 异常/缺失 | 任意非法参数 | 跳转 404 沙漠彩蛋页 |

## 新增短链

在 `ls/` 目录新建 `识别码.json` 即可，无需修改任何源码：

```json
{
  "name": "站点展示名称",
  "link": "https://目标链接"
}
```

- `name`：页面展示名称（可为空，为空时直接展示 `link`）
- `link`：最终跳转目标地址

## 部署

### GitHub Pages

1. 将本仓库推送至 GitHub
2. 仓库 Settings → Pages → Source 选择 `main` 分支根目录
3. 访问 `https://<用户名>.github.io/<仓库名>/` 即可

### Vercel / Netlify

导入仓库后直接部署，无需任何配置。

## 自定义配置

修改 `assets/js/main.js` 顶部常量：

```js
var LONG_DELAY = 5;              // 长链倒计时（秒）
var SHORT_DELAY = 3;             // 短链倒计时（秒）
var PREFETCH_TIMEOUT = 3000;     // DNS 预解析超时（毫秒）
var PREFETCH_HOSTS = [           // 附加预解析域名，可多条
  'gcore.jsdelivr.net'
];
```

主题切换时间可在 `assets/js/main.js` 的 `applyTheme()` 中调整。

## 已知局限

- 纯静态实现，短链只能使用查询参数形式 `?s=code`，无法实现 `/s/code` 美化路径
- 长链接未做域名白名单/黑名单过滤，存在开放重定向风险，请勿用于钓鱼等用途
- 新增短链需要手动新建 json 文件，大批量短链时维护成本较高

## 免责声明

本项目仅用于学习与个人工具用途。跳转目标为第三方外部站点时，请自行甄别风险。
