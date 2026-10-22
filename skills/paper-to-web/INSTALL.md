# paper-to-web 安装与跨平台使用

打包日期：2026-10-22。此包包含当前 paper-to-web skill 的完整内容，以及本安装说明。

## 包含什么

```text
paper-to-web/
├── SKILL.md                    技能入口与工作流程
├── INSTALL.md                  本说明
├── agents/openai.yaml          Codex 的可选界面元数据
├── assets/guide-template.html  可编辑的网页底稿
├── scripts/check_guide.py       只使用 Python 标准库的结构检查
└── references/                 写作规范、视觉规范和原始参考截图
```

保留整个 `paper-to-web` 文件夹。只复制 `SKILL.md` 会丢失底稿、截图与详细规范。ZIP 内只有一层 `paper-to-web/` 根目录；不要把它放成 `paper-to-web/paper-to-web/SKILL.md`。

本包不包含论文解析器、OCR、浏览器或托管服务。目标 agent 需要能读取 PDF、查看关键图页并生成文件；Python 用于随包结构检查，浏览器用于实际渲染验证。媒体检索需要该平台允许联网。无需安装 Codex 或连接 Codex 专用 MCP；已有 PDF 工具可直接使用。`agents/openai.yaml` 是可选的 Codex 界面配置，其他平台的技能入口是 `SKILL.md`，不要求它们解析该 YAML。

## 默认保存位置

本地 agent 默认将成品归档到 `~/Documents/文献/`（macOS 的“文稿 → 文献”），用户另指定目录时以指定位置为准。每篇论文独立存放，例如 `2024-pi0/`，包含导读 `index.html`、原文 PDF、本地媒体与 `SOURCES.md`；同时更新文献根目录的 `index.html` 总目录。以后双击总目录或论文页即可阅读，无需 agent 或常驻服务。备份时复制整个文献文件夹。

云端平台无法直接写入用户电脑时，应交付完整成品 ZIP，由用户解压到自己的文献目录；云端沙箱里的 `Documents` 不等于用户本机的“文稿”。

## Claude Code：放入技能目录

把解压出的整个文件夹复制到个人目录：

```text
~/.claude/skills/paper-to-web/
```

只希望当前项目可用时，放到项目的：

```text
.claude/skills/paper-to-web/
```

确认最终存在 `.../paper-to-web/SKILL.md`。如果已有同名 skill，先保留原目录再替换。提供 PDF 文件路径并调用：

```text
/paper-to-web 把这篇 PDF 做成中文交互导读网页：/你的路径/paper.pdf
```

来源：[Claude Code 官方技能说明](https://code.claude.com/docs/en/skills)。

## Cursor：放入技能目录

个人使用放到：

```text
~/.cursor/skills/paper-to-web/
```

项目使用放到：

```text
.cursor/skills/paper-to-web/
```

在 Agent 中附上 PDF 或提供文件路径，输入：

```text
/paper-to-web 把这篇 PDF 做成中文交互导读网页。
```

也可以用 `@` 选择该 skill。

来源：[Cursor 官方技能说明](https://cursor.com/help/customization/skills)。

## Claude 网页版：上传 ZIP

打开 `Customize → Skills` 的自定义技能添加/上传入口，上传这个 ZIP，再启用它。该功能需要启用代码执行；若组织管理策略限制了自定义技能，需要先满足该平台的启用条件。

上传论文后使用：

```text
使用 paper-to-web skill，把这篇 PDF 做成中文交互导读网页。
```

ZIP 的 `paper-to-web/SKILL.md` 结构按官方打包示例保留。不要把 Claude Code 的本地目录安装方式当作网页端上传方式。

来源：[Claude 官方自定义技能与打包说明](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills)。

## 其他支持 Agent Skills 的平台

把整个文件夹放进该平台规定的 skills 搜索目录或使用其 ZIP 导入入口，再通过该平台的技能选择器或技能名称调用。具体目录和调用前缀以该平台文档为准；`$paper-to-web` 是 Codex 的调用写法，不应假定每个平台都使用同一前缀。

## 没有原生 skill 功能的 agent

将整个文件夹放在 agent 可以读取的位置，然后在任务指令或该平台的工作流入口中写：

```text
先读取 <实际目录>/paper-to-web/SKILL.md，并按照其中要求读取 references 中的规范。
以 assets/guide-template.html 为底稿，把提供的论文 PDF 制作成中文交互导读网页。
使用当前平台可用的 PDF、文件、浏览器与联网工具。
无法完成的读取或视觉验证应明确说明，不要声称已经检查。
```

这种方式是在任务开始时显式加载工作流程，不等于平台已完成原生 skill 注册。

## 安装后的自检

让 agent 确认能读取 `SKILL.md`、`references/visual-system.md` 和 `assets/guide-template.html`。在临时目录试做一篇 PDF，并检查来源标注、pipeline、变量解释和训练细节。

可先运行随包检查器，确认解压完整；这只检查静态 HTML，不验证论文内容或浏览器效果：

```sh
python3 /实际安装目录/paper-to-web/scripts/check_guide.py /实际安装目录/paper-to-web/assets/guide-template.html
```

打包时已验证 ZIP 完整性、文件内容一致性，以及解压到另一目录后的底稿结构检查。尚未在 Claude Code、Cursor 或 Claude 网页版中实际安装试跑，平台支持与步骤依据以上官方文档核对。
