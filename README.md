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
├── .reader-data/              个人提问与回答（Git 忽略）
├── reader/                    选文界面、本机服务与测试
├── index.html                 文献总目录
├── 2024-pi0/
│   ├── index.html             中文交互导读
│   ├── assets/                原文 PDF、图片与视频
│   └── SOURCES.md             主张与来源对照
└── skills/paper-to-web/        完整 skill、网页模板、检查脚本与参考资料
```

每篇论文使用独立文件夹；链接和媒体使用相对路径，复制整库后仍可阅读。

## 选文提问与本地小钉子

1. 在根目录的本机 `config.json` 中填写自己的 DeepSeek API key。首次启动会自动创建空配置，也可以先复制 `config.example.json`：

   ```json
   {
     "base_url": "https://api.deepseek.com",
     "api_key": "在这里填写你自己的 key",
     "model": "deepseek-flash"
   }
   ```

2. 在 macOS Finder 中双击 `start-reader.command`，保持启动的终端窗口开启。它用 Python 3 标准库启动本机阅读服务，并打开 `http://127.0.0.1:8787/`。其他系统可在仓库目录执行 `python3 reader/server.py --open`。
3. 从总目录进入文章，选中正文，点击浮出的“就这段问 AI”，填写问题或选择快捷问题，再发送。也可使用页面右下方的“问 AI”。

默认配置使用 DeepSeek，也支持其他提供 **OpenAI 兼容 Chat Completions 接口**的服务：修改 `base_url`、`model`、`api_key` 即可。例如 `base_url` 为 `https://服务域名/v1` 时，请求发送至其 `/v1/chat/completions`；也可填写完整的 `/chat/completions` 地址。远程接口使用 HTTPS，本机接口支持 HTTP 和空 key。其他协议的接口不在此兼容范围内。

默认会附带当前章节的一部分文字，可取消勾选。提问内容只包含问题、选文、文章标题和选择附带的章节文字，不发送 PDF 或图片。API key 仅由本机服务用于接口身份验证，不暴露给网页。修改配置后重新打开提问面板即可，无需重启服务；原有不含 `base_url` 的配置仍默认使用 DeepSeek。

发送后，选文会淡色标出，段落旁留下 **📌 问题摘要**，点击即可展开当时的问题、选文和回答。同一段多次提问会归在一个标记里并显示数量。窄屏空间不足时收为小钉子，点击查看；右下角“问 AI → 本页记录”也能查看本篇所有问答，包括未选中文字的问题。查看旧记录不会重新调用 AI，也不需要有效 API key。

问答保存在本机 `.reader-data/questions.sqlite3`，刷新页面、关闭浏览器、重启服务后仍在。记录按文章相对路径关联，定位使用章节、选文及前后文；页面局部增字通常仍可定位，若选文被改写则以虚线标记放在原章节附近，原始选文仍在记录中。重命名或移动文章文件夹会改变关联路径，应先备份记录。

`config.json` 和整个 `.reader-data/` 都已加入 Git 忽略规则，不通过 GitHub 同步。备份个人问答时请先关闭本机服务，再一并复制此隐藏目录；macOS Finder 可按 ⌘⇧. 显示隐藏文件。GitHub 只保存空配置样例和功能代码。服务只监听 `127.0.0.1`，私有配置和记录文件不作为静态资源提供。直接双击 HTML 仍可阅读；**AI 问答和个人标记需使用启动器打开的本机网页**。

接口和默认模型依据 [DeepSeek 官方调用文档](https://api-docs.deepseek.com/)（2026-10-25 核对）。如果需要其他 DeepSeek 模型，在个人配置中修改 `model`。

检查本机服务可运行 `python3 -m unittest discover -s reader -v`；测试使用临时记录库、假凭据和模拟响应，不消耗 API 额度。

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
