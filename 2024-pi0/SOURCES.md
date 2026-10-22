# π0 中文交互导读：来源与证据

整理日期：2026-10-22。网页入口：`index.html`。

## 主要材料

1. 用户提供的《π0: A Vision-Language-Action Flow Model for General Robot Control》PDF，共 17 页，作者 Kevin Black 等 / Physical Intelligence。包内 `assets/paper.pdf` 是原文件副本；以下页码均为文件页序号。原 PDF 未在正文显式标出 arXiv 修订号，不据其创建日期推断发表日期。
2. [Physical Intelligence 官方项目页](https://www.pi.website/blog/pi0)，检查日期 2026-10-22。原域名 `physicalintelligence.company/blog/pi0` 当前重定向至该页。用于确认原始工作发布于 2024-10-31、获取官方演示文件，并核对网站与 PDF 的口径差异。技术解释与实验结论以用户提供 PDF 为主。
3. 用户此前指定的 RoboTTT 风格，由本地 `paper-to-web` skill 提供的版式规范与底稿继承。该风格来源不作为 π0 论文技术事实的证据。

## 主张 → 原文 → 网页位置

| 网页位置 | 主张 / 对象 | 类型 | 依据 |
| --- | --- | --- | --- |
| 首屏 / #overview | 预训练 VLM、动作专家、跨机器人数据、目标任务后训练的总体配方 | 原文事实与导读重组 | PDF 第 1、3–5 页，Fig. 1 / 3，§III–IV |
| 首屏 | 总参数约 3.3B，VLM 约 3B，动作专家约 300M | 原文事实 | PDF 第 5 页，§IV |
| 首屏 / #training | 约 10,000 小时自有示范，另混合开源机器人数据 | 原文事实 | PDF 第 3、11 页，§II / VII |
| #overview / #architecture | 当前图像、语言、状态和带噪动作组成输入；H = 50 | 原文事实 | PDF 第 5 页，§IV |
| #overview | 内部积分与环境观测—执行循环分开 | 依据原文重绘 | PDF 第 5 页，§IV；第 16 页，附录 D |
| #architecture | 两套权重属于同一 Transformer，按 token 类型路由，只经自注意力交互 | 原文事实 | PDF 第 15 页，附录 B |
| #architecture | 图文、状态、动作的三块 blockwise causal mask | 原文事实 / 表格重绘 | PDF 第 15 页，附录 B：Attention mask |
| #architecture | VLM 隐藏宽度 2048，动作专家宽度 1024、MLP 4096 | 原文事实 | PDF 第 15 页，附录 B：Action expert |
| #architecture / #training | 状态与动作统一补零至 18 维，缺图槽位 mask | 原文事实 | PDF 第 6 页，§V-A |
| #architecture | 填充动作块可看成 [50, 18]，省略 batch | 由 H 和最大动作维度推得 | PDF 第 5–6 页；并非精确程序张量布局承诺 |
| #flow | A^τ = τA + (1−τ)ϵ；目标向量为 A−ϵ；MSE 向量场损失 | 原文公式释义 | PDF 第 5 页，§IV，未编号公式 |
| #flow | δ = 0.1，前向 Euler 10 次积分，推理更新 A 而非 θ | 原文事实与机制解释 | PDF 第 5 页，§IV |
| #flow | 移位 Beta 采样偏向低 τ / 高噪声，s = 0.999 | 原文事实 | PDF 第 15–16 页，附录 B、Fig. 14 |
| #flow | 二维噪声 (−0.8, 1.4)、目标 (1.2, 0.8) 及插值图 | 原创教学示意 | 按第 5 页的采样公式计算；不是机器人轨迹或模型实测输出 |
| #training | 一个样本 (o_t, A_t)；窗口随 t 移动 | 原文定义与教学重建 | PDF 第 5 页、§V-A；不声称复现未公开采样代码 |
| #training | 自有 903M 时间步：单臂 106M、双臂 797M；68 任务、7 种配置 | 原文事实 | PDF 第 6 页，§V-A / C |
| #training | 开源混合占 9.1%；按 n^0.43 重加权 | 原文事实 | PDF 第 5–6 页，§V-A，Fig. 4 |
| #training | 任务名与约 2 秒子轨迹语言标注 | 原文事实 | PDF 第 4 页，§III；第 8 页，§VI-B |
| #training | 主模型 700K、parity 160K；OpenVLA 160K、Octo 320K | 原文事实 | PDF 第 7–8 页，§VI-A，Fig. 7 |
| #training | 目标任务数据约 5 至 100+ 小时；新任务实验另比较 1 / 5 / 10 小时 | 原文事实 | PDF 第 6、9–10 页，§V-A / VI-C，Fig. 11 |
| #training | GPU 数、训练总时长、峰值显存、batch、优化器 / 学习率、逐层冻结未完整报告 | 未报告 | 检查正文 §IV–V 与附录 B–D；不以其他版本实现补齐 |
| #runtime | 50 Hz 执行前 25 个 / 0.5 秒；20 Hz UR5e / Franka 前 16 个 / 0.8 秒 | 原文事实 | PDF 第 16 页，附录 D |
| #runtime | 50 步在 50 Hz 覆盖 1 秒，在 20 Hz 覆盖 2.5 秒 | 算术换算 | H / 执行频率；不等于实际执行窗口 |
| #runtime | RTX 4090，3 图像：14 + 32 + 27 = 73 ms；异机加 13 → 86 ms | 原文实测 | PDF 第 16 页，Table I；27 ms 是 10 次动作前向合计 |
| #evidence | 四组实验的任务、基线、试验次数、评分口径 | 原文事实与解读 | PDF 第 7–11 页，§VI，Fig. 7 / 9 / 11 / 13；第 17 页，附录 E |
| #evidence | 装鸡蛋 scratch 在 Fig. 13 中略高于 fine-tuned | 对原图的定性读取 | PDF 第 11 页，Fig. 13；未从柱高杜撰精确数字 |
| #limits | 数据组成未最优化、可靠性不足、远领域迁移未证明 | 原文限制 | PDF 第 12 页，§VII |
| #limits | 无 RoboTTT 式 fast-weight 流程；人类示范重定向非本文方案 | 依据方法边界的澄清 | 本文 §IV、附录 B / D 没有此输入或更新流程；不扩大到其他 π 系列论文 |

## 原图

以下文件是从用户 PDF 的渲染结果裁取的原图区域，保留图形、图例与原始坐标标签；网页中文解释在图外，未更改图内内容。受 Type 3 字体等影响，PDF 渲染器产生部分字体警告；关键图、公式页与计时表已视觉检查。

| 本地文件 | PDF 位置 |
| --- | --- |
| `assets/figure-1-overview.png` | 第 1 页，Fig. 1 |
| `assets/figure-3-architecture.png` | 第 4 页，Fig. 3 |
| `assets/figure-4-mixture.png` | 第 5 页，Fig. 4 |
| `assets/figure-5-robots.png` | 第 6 页，Fig. 5 |
| `assets/figure-7-base-results.png` | 第 8 页，Fig. 7 |
| `assets/figure-9-language.png` | 第 9 页，Fig. 9 |
| `assets/figure-11-finetuning.png` | 第 10 页，Fig. 11 |
| `assets/figure-12-tasks.png` | 第 11 页，Fig. 12；保留作补充材料 |
| `assets/figure-13-posttraining.png` | 第 11 页，Fig. 13 |

## 官方媒体

所有视频由官方项目页公开引用，下载后未转码或重新剪辑。海报从对应本地文件的约 0.5 秒处提取。下面的时长是发布文件时长，不是推定的真实任务耗时。

| 本地文件 | 官方片源 | 文件时长 |
| --- | --- | --- |
| `assets/box.mp4` | [官方搭纸盒片源](https://website.pi-asset.com/v2/upload/lowres_processed1xspeed_build_box_3.mp4) | 48.375 秒 |
| `assets/folding-success.mp4` | [官方折衣成功片源](https://website.pi-asset.com/v2/upload/processed_folding_single_shirt_success.mp4) | 75.4 秒 |
| `assets/folding-failure.mp4` | [官方折衣失败片源](https://website.pi-asset.com/v2/upload/processed_folding_single_shirt_fail.mp4) | 196.5 秒 |
| `assets/recovery.mp4` | [官方恢复片源](https://website.pi-asset.com/v2/upload/lowres_recovery1.mp4) | 13.125 秒 |

## 版本与使用边界

- 官网的“8 个机器人”与此 PDF 的“7 种配置”不做无依据合并；本文技术统计以所提供 PDF 为准。
- PDF §III 对 OXE 的概述与 Fig. 4 / §V 的子集说明存在口径差异，网页采用细化混合说明，没有改成“整个 OXE 全量都用于实际混合”的确定结论。
- 本页核心说明、原图、PDF 与选取视频都在包内。访问官网、额外视频或外部片源才需要网络。
- 没有打包或执行 π0 模型；交互图是机制教学，不是模型推理服务，也不控制真实机器人。
- 论文、原图和媒体权利归原作者及相应权利人；本页为非官方学习导读，不虚构额外授权。

## 文件完整性与验证

- 原始 PDF SHA-256：`75667e62ba43f153805f2330b55966d0ff51abd03aa0ab76ef2d62ab201cc1fd`。
- 已进行：静态锚点 / 本地资源检查、脚本语法检查、桌面及 390px 窄屏布局检查、日夜切换、目录跳转、注意力解释、τ 插值、采样起点、20/50 Hz 参数、四类实验和媒体选择检查。
- 官方搭纸盒片段已实际播放，播放进度与 2× 倍速均验证；四段视频均成功解码并提取海报。没有声称逐秒审看了全部视频。
- 实验图保留原始数据展示；没有运行或重新评测 π0 模型，也没有控制机器人。

| 媒体文件 | 字节数 | SHA-256 |
| --- | --- | --- |
| `assets/folding-success.mp4` | 17751451 | `5ada1069650bdcf46ce29d35c3c7685fccec2acf62df6481f18632193725bd09` |
| `assets/folding-failure.mp4` | 40183327 | `b2990468b11459800a994b29f97598941b9f761897f52549c503e9b5206f4d68` |
| `assets/box.mp4` | 2489240 | `b50df0253a578931f6c30172587247e29f64b727e5570d3546faecb1be9fa912` |
| `assets/recovery.mp4` | 538146 | `dee0c1bf8805f36e95a7217e95aa60ac14a5f9b3fcf446e37582c544e7fe86c6` |
