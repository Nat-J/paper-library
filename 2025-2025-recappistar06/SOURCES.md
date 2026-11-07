# π*0.6 论文导读事实来源

所有页码为 PDF 物理页码（该 PDF 无单独印刷页码）。网页内容按“原文事实”与“教学示意”区分。

| 网页位置 | 主张/对象 | 类型 | 依据 | 补充说明 |
| --- | --- | --- | --- | --- |
| 首屏 | 标题、作者机构、arXiv 编号、年份 2025 | 原文事实 | PDF 第 1 页标题与 arXiv 页眉 | 作者列表见原文 |
| #pipeline | RECAP 三步骤：数据收集、价值函数训练、优势条件策略训练 | 原文事实 | PDF 第 3–4 页 §IV 开头 | 图 1 给出总体示意 |
| #pipeline | 预训练在数万小时多任务多机器人演示上执行步骤 (2)(3) | 原文事实 | PDF 第 4 页 §IV 开头 | “数万小时”为原文表述 |
| #problem | 模仿学习存在复合误差且性能至多与演示数据相当 | 原文事实 | PDF 第 2 页 §II | 引用 [7] |
| #problem | 三个真实任务：叠衣、组装盒子、制作 espresso，每项 5–15 分钟 | 原文事实 | PDF 第 7 页 §VI 开头 | 任务细节见第 8 页 |
| #value-function | 分布式价值函数输出 B=201 个离散桶 | 原文事实 | PDF 第 4 页 §IV-A | — |
| #value-function | 价值函数 VLM 主干 670M，初始化自 Gemma 3 | 原文事实 | PDF 第 7 页 §V-C | — |
| #value-function | 奖励函数 Eq.5：成功末步 0，失败末步 −C_fail，其余 −1 | 原文事实 | PDF 第 7 页 Eq.5 | — |
| #value-function | 价值函数可视化图 4 成功与失败 episode | 原文事实 | PDF 第 7 页图 4 | 图 13 为扩展可视化 |
| #value-function | 优势估计后训练 N=50，预训练 N=T | 原文事实 | PDF 第 18 页 §F | 预训练为高方差估计 |
| #advantage-conditioning | 改进指示 I 服从 delta 分布，阈值 ε_ℓ | 原文事实 | PDF 第 5 页 §IV-B 与脚注 2 | — |
| #advantage-conditioning | 改进策略闭式 Eq.2；β=1 时 π̂ = π_ref(a|I,o,ℓ) | 原文事实 | PDF 第 5 页 Eq.2 | 基于 CFGRL [4] |
| #advantage-conditioning | 策略训练目标 Eq.3 | 原文事实 | PDF 第 5 页 Eq.3 | 人类纠正强制 I_t=True |
| #advantage-conditioning | 30% 概率随机丢弃优势指示 | 原文事实 | PDF 第 6 页 §V-B；第 18 页 §F | 用于支持 CFG |
| #advantage-conditioning | 优势阈值：预训练约 30% 正样本；下游约 40%；衬衫任务 10% | 原文事实 | PDF 第 7 页 §V-D；第 18 页 §F | — |
| #advantage-conditioning | Eq.4 连续动作采用 flow matching 下界 | 原文事实 | PDF 第 6 页 Eq.4；附录 C Eq.6–9 | — |
| #training | VLA 基础 VLM 为 Gemma 3 4B，动作专家 860M | 原文事实 | PDF 第 6 页 §V-A | — |
| #training | 动作控制 50 Hz 关节位置 | 原文事实 | PDF 第 6 页 §V-A；第 7 页图 5 | — |
| #training | 下游数据收集量：衬衫 300/轮 4 机器人；装盒 600 自主+360 干预/轮；咖啡 429 纠正+414 自主（单轮） | 原文事实 | PDF 第 10 页 §VI-C2；第 18 页 §F | — |
| #training | 训练序列 token 顺序：子任务 → 优势指示 → 动作 | 教学示意 | 依据 §V-A 与 §V-B 重建 | 非原始训练样本；具体图像帧与 token 数为示意 |
| #training | 训练未报告硬件、总时长、batch、优化器 | 未报告 | 查正文与附录 | 未以常识补齐 |
| #evidence | 多样叠衣与咖啡任务吞吐量翻倍以上，失败率降低约一半 | 原文事实 | PDF 第 9 页 §VI-C1；图 7、图 8 | 指标为成功次数/小时与成功率 |
| #evidence | 除多样叠衣外，成功率均在 90%+ | 原文事实 | PDF 第 9 页 §VI-C1 | — |
| #evidence | 装盒四个子阶段成功率均最高，约 90% | 原文事实 | PDF 第 10 页 §VI-C2；图 8 (右) | 失败多因超时 |
| #evidence | 叠衣两轮迭代吞吐量提升 50%；装盒第二轮提升约 2 倍 | 原文事实 | PDF 第 10 页 §VI-C2；图 9、图 10 | — |
| #evidence | 严格失败模式移除：600 轨迹/轮 ×2 轮后成功率 97% | 原文事实 | PDF 第 11 页 §VI-C4；图 12 | 无干预数据与额外演示 |
| #evidence | AWR 与 PPO 对比，RECAP 吞吐量最高 | 原文事实 | PDF 第 10 页 §VI-C3；图 11 | 基线使用同一批数据，且略占优势 |
| #limitations | 系统非全自主，依赖人类标注、干预与重置 | 原文事实 | PDF 第 11 页 §VII | — |
| #limitations | 探索较朴素，主要为贪心加随机性 | 原文事实 | PDF 第 11 页 §VII | — |
| #limitations | 采用迭代离线更新而非完全在线 RL | 原文事实 | PDF 第 11 页 §VII | — |
| #reading-path | 官方项目页 https://pi.website/blog/pistar06 | 原文事实 | PDF 第 1 页脚注 | 外部链接，需联网 |
| 全页 | 所有教学 SVG 流程图与训练序列 | 教学示意 | 依据 PDF §I–§V 重建 | 不是论文原始图，未复制真实图像帧 |

## 本地媒体

- assets/paper.pdf——用户提供的原始 PDF，未修改。
- assets/pdf-page-10.png、assets/pdf-page-11.png、assets/pdf-page-12.png——PDF 第 10–12 页渲染图（对应图 9–12 与部分正文）。

## 网页成品

- index.html——本导读文件；内联 CSS/JS，引用 ../reader/reader-ai.js 与 ../reader/reader-service.js（存在时），并返回 ../index.html。
- 所有事实以 PDF 原文为准；网页中的“教学示意”已明确标注，不冒充原始数据或内部可视化。
