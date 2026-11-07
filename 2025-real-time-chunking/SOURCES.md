# Sources / 证据审计

## 论文与本地媒体

- `output/assets/paper.pdf`：用户提供的完整 PDF，25 页；标题页标注 arXiv:2506.07339v2，5 Dec 2025，NeurIPS 2025。
- `#overview`：RTC 目标、无需重新训练、Fig. 1 点火示例；PDF 第 1–3 页，Fig. 1。
- `#problem`：预测/执行 horizon、推理延迟 d、同步/朴素异步/时间集成的分叉；PDF 第 2–4 页，Fig. 2。
- `#method`：冻结前缀、软掩码三段区域、硬/软掩码对照；PDF 第 4–6 页，Fig. 3–4，Eq. 2–5，Algorithm 1。
- `#formula`：流匹配更新 Eq. 1、ΠGDM 引导 Eq. 2–4、β 裁剪；PDF 第 3–5 页；β 消融 PDF 第 23 页 Fig. 7。
- `#timeline`：异步后台线程、GETACTION/INFERENCELOOP、实机 H=50、Δt=20ms、n=5、smin=25；PDF 第 5–8 页 Algorithm 1 与 Setup。
- `#training`：Kinetix 12 环境、1M transition、H=8、32 epochs、2048 rollouts；实机 6 任务、480 episodes、约 28 小时；PDF 第 6–8 页。
- `#evidence`：模拟 solve rate PDF 第 7 页 Fig. 5；实机累计进度与吞吐 PDF 第 8–9 页 Fig. 6；延迟表 PDF 第 24 页 Table 1–3；超参/算力 PDF 第 25 页 Table 4 与 A.7。
- `#limits`：计算开销、仅 diffusion/flow、实机 locomotion 未评估、数据/运行时代码未公开；PDF 第 10、18、25 页。

## 类型区分

- 论文事实：上述 PDF 页码、图、公式和表格直接支持。
- 教学示意：`#formula` 的单分量数字代入（0.20、0.50、0.10 等）和 `#timeline` 的交互文字；不代表论文内部轨迹或额外实验。
- 未报告项：网页没有用常识补齐 action 维度、真实内部 token 数、训练数据细节或全量实机代码。

## 外部官方材料

- 作者项目页：[Real-Time Action Chunking with Large Models](https://www.pi.website/research/real_time_chunking)，核对 RTC 的公开简介、视频入口和实机任务叙述；视频未下载，网页离线阅读不依赖该链接。
- 作者论文 PDF：[pi.website/download/real_time_chunking.pdf](https://www.pi.website/download/real_time_chunking.pdf)，用于核对论文版本与标题。
- 官方模拟代码：[Physical-Intelligence/real-time-chunking-kinetix](https://github.com/Physical-Intelligence/real-time-chunking-kinetix)，论文附录 A.6 给出；本导读没有克隆或运行代码。

## 渲染检查

已用本机 `pdftoppm` 渲染并人工检查 PDF 第 1、3、4、5、7、8、23、24、25 页；对应 PNG 已保存到 `output/assets/`。未使用用户浏览器或个人凭据。无界面浏览器未在当前环境中可用，因此未声称完成浏览器截图检查；静态结构检查已运行。
