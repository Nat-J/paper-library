# 文献导读库

保存论文的中文交互导读、原文 PDF、图片、视频与来源记录，并维护生成导读所用的 `paper-to-web` skill。

## 阅读

下载或克隆整个仓库后，双击根目录的 `index.html` 打开文献总目录，也可以进入论文文件夹，打开其中的 `index.html`。导读主体和已收录媒体可离线阅读，访问作者官网需要网络。

本机保存位置：`~/Documents/文献/`，对应 Finder 的“文稿 → 文献”。GitHub 仓库页面用于查看文件和下载，HTML 导读请下载后在浏览器中打开。

| 年份 | 文献 | 导读 | 原文 | 来源 |
| --- | --- | --- | --- | --- |
| 2024 | π0: A Vision-Language-Action Flow Model for General Robot Control | [中文导读](2024-pi0/index.html) | [PDF](2024-pi0/assets/paper.pdf) | [来源与核对记录](2024-pi0/SOURCES.md) |

## 目录

```text
文献/
├── index.html                 文献总目录
├── 2024-pi0/
│   ├── index.html             中文交互导读
│   ├── assets/                原文 PDF、图片与视频
│   └── SOURCES.md             主张与来源对照
└── skills/paper-to-web/        完整 skill、网页模板、检查脚本与参考资料
```

每篇论文使用独立文件夹；链接和媒体使用相对路径，复制整库后仍可阅读。

## 使用 skill

完整文件位于 [skills/paper-to-web](skills/paper-to-web/)，跨平台安装步骤见 [INSTALL.md](skills/paper-to-web/INSTALL.md)。在 Codex 中提供 PDF 并输入：

```text
使用 $paper-to-web，把这篇 PDF 做成中文交互导读网页。
```

默认将导读归档到文稿下的“文献”文件夹，并更新总目录。修改 skill 时，同时更新仓库内的归档副本和本机已安装副本。

## 同步到 GitHub

新增或修改导读后，在本地文献目录执行：

```sh
cd "$HOME/Documents/文献"
git add .
git commit -m "更新文献导读"
git push
```

在其他电脑获取：

```sh
git clone https://github.com/Nat-J/paper-library.git
```

这是 public 仓库，提交并推送的内容会公开。论文、原图和官方媒体的权利归相应作者及权利人，各篇导读中的 `SOURCES.md` 保留来源与使用边界。
