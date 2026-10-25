# 文献导读库

保存论文的中文交互导读、原文 PDF、图片、视频与来源记录，并维护生成导读所用的 `paper-to-web` skill。

## 阅读

下载或克隆整个仓库后，双击根目录的 `index.html` 打开文献总目录，也可以进入论文文件夹，打开其中的 `index.html`。导读主体和已收录媒体可离线阅读，访问作者官网需要网络。

本机保存位置：`~/Documents/paper-library/`，对应 Finder 的“文稿 → paper-library”。GitHub 仓库页面用于查看文件和下载，HTML 导读请下载后在浏览器中打开。

| 年份 | 文献 | 导读 | 原文 | 来源 |
| --- | --- | --- | --- | --- |
| 2024 | π0: A Vision-Language-Action Flow Model for General Robot Control | [中文导读](2024-pi0/index.html) | [PDF](2024-pi0/assets/paper.pdf) | [来源与核对记录](2024-pi0/SOURCES.md) |

## 目录

```text
paper-library/
├── start-reader.command       双击启动本机阅读与问答
├── config.example.json        空配置样例
├── config.json                个人 API key（Git 忽略）
├── reader/                    选文界面、本机服务与测试
├── index.html                 文献总目录
├── 2024-pi0/
│   ├── index.html             中文交互导读
│   ├── assets/                原文 PDF、图片与视频
│   └── SOURCES.md             主张与来源对照
└── skills/paper-to-web/        完整 skill、网页模板、检查脚本与参考资料
```

每篇论文使用独立文件夹；链接和媒体使用相对路径，复制整库后仍可阅读。

## 选中文字，向 DeepSeek 提问

1. 在根目录的本机 `config.json` 中填写自己的 DeepSeek API key。首次启动会自动创建空配置，也可以先复制 `config.example.json`：

   ```json
   {
     "api_key": "在这里填写你自己的 key",
     "model": "deepseek-flash"
   }
   ```

2. 在 macOS Finder 中双击 `start-reader.command`，保持启动的终端窗口开启。它用 Python 3 标准库启动本机阅读服务，并打开 `http://127.0.0.1:8787/`。其他系统可在仓库目录执行 `python3 reader/server.py --open`。
3. 从总目录进入文章，选中正文，点击浮出的“就这段问 AI”，填写问题或选择快捷问题，再发送。也可使用页面右下方的“问 AI”。

默认会附带当前章节的一部分文字，可取消勾选。提问内容只包含问题、选文、文章标题和选择附带的章节文字，不发送 PDF 或图片。API key 仅由本机服务用于 DeepSeek 身份验证，不暴露给网页。修改配置后重新打开提问面板即可，无需重启服务。

`config.json` 已加入 Git 忽略规则；它由本机服务读取，不提供给网页。GitHub 只保存空的 `config.example.json`。服务只监听 `127.0.0.1`，问题和回答不保存成文件。直接双击 HTML 仍可阅读，AI 问答需使用启动器打开的本机网页。

接口和默认模型依据 [DeepSeek 官方调用文档](https://api-docs.deepseek.com/)（2026-10-25 核对）。如果需要其他 DeepSeek 模型，在个人配置中修改 `model`。

检查本机服务可运行 `python3 -m unittest discover -s reader -v`；测试使用假凭据和模拟响应，不消耗 DeepSeek 额度。

## 使用 skill

完整文件位于 [skills/paper-to-web](skills/paper-to-web/)，跨平台安装步骤见 [INSTALL.md](skills/paper-to-web/INSTALL.md)。在 Codex 中提供 PDF 并输入：

```text
使用 $paper-to-web，把这篇 PDF 做成中文交互导读网页。
```

默认将导读归档到文稿下的“paper-library”文件夹，并更新总目录。修改 skill 时，同时更新仓库内的归档副本和本机已安装副本。

## 同步到 GitHub

新增或修改导读后，在本地文献目录执行：

```sh
cd "$HOME/Documents/paper-library"
git add .
git commit -m "更新文献导读"
git push
```

在其他电脑获取：

```sh
git clone https://github.com/Nat-J/paper-library.git
```

这是 public 仓库，提交并推送的内容会公开。论文、原图和官方媒体的权利归相应作者及权利人，各篇导读中的 `SOURCES.md` 保留来源与使用边界。
