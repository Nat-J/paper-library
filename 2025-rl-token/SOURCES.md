# SOURCES — RL Token 导读

论文：Charles Xu, Jost Tobias Springenberg, Michael Equi, Ali Amin, Adnan Esmail, Sergey Levine, Liyiming Ke. *RL Token: Bootstrapping Online RL with Vision-Language-Action Models*. Physical Intelligence, 2025.

- 原文 PDF：`assets/paper.pdf`（本地副本，未修改）
- 页码说明：本记录使用 PDF 页序（第 1–13 页），与部分印刷版页码可能不同。
- 类型约定：**原文事实** = 直接来自 PDF；**教学示意** = 依原文结构重绘、非论文原图；**教学推导** = 为帮助理解而做的数值/代数简化；**未报告** = 正文与可见附录未给出。

## 关键主张映射

| 网页位置 | 主张 / 对象 | 类型 | 依据 | 补充说明 |
| --- | --- | --- | --- | --- |
| 首屏 | VLA 暴露 RL token，轻量 actor-critic 在线 RL，数小时/数分钟实践 | 原文事实 | PDF 第 1 页 摘要、Fig. 1 | — |
| 首屏 | 螺钉安装关键阶段 20% → 65% | 原文事实 | PDF 第 1 页 摘要、第 2 页 §I | — |
| 首屏 | 整任务成功率螺钉 +40%、扎带 +60% | 原文事实 | PDF 第 8 页 §VI-C Q1 | 相对提升口径 |
| 首屏 | 以太网中位步数 66 vs 遥操作 146 | 原文事实 | PDF 第 9 页 Fig. 9 标注 | — |
| #pipeline 全貌图 | 由 VLA 内部特征经编码器-解码器产生 RL token，再交给 actor-critic | 教学示意 | 依 PDF 第 1 页 Fig. 1、第 4 页 Fig. 2、第 5 页 Algorithm 1 重绘 | 模块数量与连线为简化 |
| #pipeline | 冻结 VLA 提供表示、参考动作与探索引导 | 原文事实 | PDF 第 3 页 §IV 开头 | — |
| #problem | VLA 在最后一毫米变慢/反复试探 | 原文事实 | PDF 第 1 页 §I、第 9 页 §VI-C Q4 | 行为描述为定性 |
| #problem 对照图 | 基座 probing vs RLT 流畅插入 | 教学示意 | 依 PDF 第 9 页 §VI-C Q4 文字重绘 | 非逐帧测量 |
| #problem | 关键阶段 5–20 s（250–1000 步）；整任务 30–120 s | 原文事实 | PDF 第 7 页 §VI-A | 50 Hz |
| #token 图 | 编码器-解码器结构、z_rl 1×2048 | 教学示意 | 依 PDF 第 4 页 Fig. 2、§IV-A 重绘 | token 小块数为示意 |
| #token | Eq. (1)(2) | 原文事实 | PDF 第 4 页 Eq. (1)(2)、脚注 1 | 实验固定指令故省略语言嵌入 |
| #token 数值例 | 两项重建误差 0.25+0.64=0.89 | 教学推导 | 一维简化，依据 Eq. (2) | 非论文数值 |
| #token | token 训练 2000–10000 梯度步 | 原文事实 | PDF 第 12 页 附录 B | — |
| #actor 对照图 | 与单步残差类、DSRL/GR-RL 的方法差异 | 原文事实 + 教学示意 | PDF 第 2–3 页 §II、§IV-B | 对照方法描述按原文，图形重绘 |
| #actor | Eq. (3)(4)(5)、C=10、双 Q 取最小、参考动作 dropout 50% | 原文事实 | PDF 第 3–5 页 §IV-B；第 12 页 附录 B | β 具体值未报告 |
| #actor 数值例 | C=2、γ=0.9 的 TD 目标 2.43 | 教学推导 | 依 Eq. (3) 简化 | 忽略奖励项，非论文配置 |
| #system 时间线 | 基座执行→RL 关键阶段→复位，人工选择切换点 | 教学示意 | 依 PDF 第 5–6 页 §V 重绘 | 时长与切换点示意 |
| #system 表 | 示范 1–10 小时、在线 400–1000 episodes、15 分钟–5 小时机器人数据、H=50/C=10、每 2 步抽样、2 层/3 层 MLP、G=5、稀疏 +1 | 原文事实 | PDF 第 6 页 §VI-B；第 5 页 §V；第 12 页 附录 B | — |
| #system 表 | GPU 型号、训练墙钟时长 | 未报告 | 查正文与附录 | 未以默认配置补齐 |
| #evidence 图示 | 遥操作 146 / 基座 228 / RLT 66 步 | 原文事实 | PDF 第 9 页 Fig. 9 标注 | 柱长线性缩放 |
| #evidence | 去除 RL token 吞吐降 50%、去 BC 正则最大跌幅等 | 原文事实 | PDF 第 9 页 §VI-C Q3、Figs. 7–8 | — |
| #evidence | 单步方法 HIL-SERL/PLD 失败；DSRL 成功率接近但更慢 | 原文事实 | PDF 第 8 页 §VI-C Q2、Fig. 6 | — |
| #limits | 依赖人工奖励/干预/切换；自动化列为未来工作 | 原文事实 | PDF 第 9 页 §VII | — |
| #limits | 评测协议：关键阶段每任务 50 episodes；整任务仅螺钉与扎带 | 原文事实 | PDF 第 7 页 §VI-A | — |
| #limits | β、σ、单次推理耗时未给出 | 未报告 | 查正文与可见附录 | — |

## 媒体文件来源

| 文件 | 内容 | 来源 | 说明 |
| --- | --- | --- | --- |
| `assets/paper.pdf` | 论文原文 | 用户提供 PDF | 未修改 |
| `assets/pdf-page-10.png` | PDF 第 10 页渲染 | 用户提供 | 未在页面中引用（保留备用） |
| `assets/pdf-page-11.png` | PDF 第 11 页渲染（参考文献与附录开头） | 用户提供 | 页面“证据”一节引用，用于核对附录与引用 |
| `assets/pdf-page-12.png` | PDF 第 12 页渲染（附录 B/C） | 用户提供 | 未在页面中引用（保留备用） |

页面内全部示意图为 HTML/CSS 教学重绘，不声称是论文原始图；原图以 PDF 页图和文字页码指引。
