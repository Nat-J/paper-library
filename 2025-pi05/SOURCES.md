# π0.5 导读：证据与验证

## 文献身份与范围

- 原文：Physical Intelligence，Kevin Black、Noah Brown 等，*π0.5: a Vision-Language-Action Model with Open-World Generalization*，2025。
- 用户提供 PDF：arXiv:2504.16054v1，2025-04-22，19 页；本记录页码均指 PDF 文件从 1 开始的页序。正文印刷页序与之对应，附录仍按 PDF 页定位。
- 完整提取并阅读 19 页（包括第 12–17 页参考文献及第 17–19 页附录）。使用 pypdf 抽取；pdftoppm 渲染第 4、5、6、8、9、10、11、19 页，亲眼查看第 4、5、6、8、10、11、19 页关键图/公式。
- 导读是非官方中文解释；没有取得原始训练集、内部激活或真实推理日志。

## 关键主张映射

| 网页位置 | 主张/对象 | 类型 | 原文依据 | 说明 |
|---|---|---|---|---|
| #overview | 异构共同训练、未见家庭与长流程 | 原文事实 | p1–3，Fig.1–2 | 10–15 分钟是长流程展示口径，非所有定量试验时长 |
| #overview | 同模型先子任务再动作，低层条件为子任务 | 原文事实 | p4 Fig.3，p5 §IV-A 分解式 | 高低层不是两套独立模型 |
| #variables | 图像 patch 经视觉编码、文字 embedding、状态离散为文本 | 原文事实 | p5 §IV-A；p19 Appendix E | 未给精确 token 数，不补造 |
| #variables | 高层4相机、低层3相机，18/19维 | 原文事实 | p7 §IV-E、Fig.5 | 混合训练最大补齐维数未报告 |
| #variables | 前缀双向、FAST因果、专家读前缀不读FAST | 原文事实 | p19 Fig.18、Appendix E | 原图 Query 是读者，Key 是被读取者 |
| #variables | τ 的 MLP / adaptive RMSNorm，专家参数 | 原文事实 | p19 Appendix E | 不将模型宽度误作token数量 |
| #difference | π0-FAST+Flow 的动作数据、无HL/WD及统一配方 | 原文事实 | p10 §V-D、Fig.12 | 使用本篇定义，不混入其他变体 |
| #difference | 对齐的两条中文路径 | 教学重绘 | p5 §IV，p10 §V-D | 用同一任务解释，非性能证据 |
| #formula | 线性混合、目标ω−a、联合损失 | 原文事实 | p5 Eq.(1) | 沿用原文符号；插值导数与目标符号相反，因此不擅自写采样积分代码 |
| #formula | a=.8、ω=−.2、τ=.25、输出−.7、概率.5 | 教学示意 | 依据 p5 Eq.(1) 重建 | 非实测值；单token单分量，平方误差.09，加权.9，总计1.593 |
| #time | 50动作、H=49，50Hz、10去噪步 | 原文事实/单位换算 | p5末段，p7 §IV-E，p19 Appendix E | 50/50=1秒；首末时间戳差.98秒，控制覆盖1秒 |
| #time | 前缀m、重预测间隔、延迟 | 未报告/条件换算 | 查 p3、p5、p7、p19 | m/50是条件公式；不指定m，不画假异步调度 |
| #training | 400小时、约100环境、97.6%其他样本 | 原文事实 | p2，p6 §IV-C | 样本比例不等于小时比例 |
| #training | MM/ME/CE/HL/WD/VI 定义与标签 | 原文事实 | p6 Fig.4、§IV-C，p7 §IV-D | WD无动作的样本不虚构flow标签 |
| #training | 280k + 80k步、α=10、随机初始化专家 | 原文事实 | p7 §IV-D | 联合训练；未推断冻结某主干 |
| #training | 归一化、补零、控制模式 | 原文事实 | p7首段 | 1%/99%分位，逐数据集逐维 |
| #training | VI约占高层移动样本11% | 原文事实 | p11 §V-E | 不是全部训练数据的11% |
| #training | 三类可点选样本追踪 | 教学示意 | p5–7 | 不是论文公开训练pair |
| #training | batch、优化器、GPU、墙钟时长、显存等 | 未报告 | 已查完整正文与附录 | 不用今日代码默认项补齐 |
| #evidence | 真实家庭与mock协议 | 原文事实 | p7–8 §V-A、Fig.6–7；p17 Appendix B | 图7每任务/环境10次，普通四任务比较约40次/策略，取消试验移除 |
| #evidence | 任务进度rubric与分母 | 原文事实 | p17 Appendix B | 8、4、3、5分；75%例子是教学计算 |
| #evidence | 场景数3/12/22/53/82/104、40k受控后训练 | 原文事实 | p8–9 §V-B、Fig.8–9 | 与完整主配方分开 |
| #evidence | 跨机体消融、WD影响依评估而异 | 原文事实 | p9–10 Fig.10–11；p18 Fig.16 | Fig.10 no WD p=.385，不能称显著 |
| #evidence | 五物体、follow与success区别 | 原文事实 | p17–18 Appendix C | 约20%只指无语义选择的参考选中率 |
| #evidence | implicit HL差异不显著、VI/WD影响 | 原文事实 | p11 Fig.13 | implicit HL p=.144；保留误差与显著性边界 |
| #limits | 陌生把手、遮挡、反复开关、上下文和提示限制 | 原文事实 | p11 §VI | 不外推任意技能或跨房间长期记忆 |

## 作者官方材料核对

访问日期：2026-10-25。

1. [作者项目页](https://www.pi.website/blog/pi05)：已读取。标题、发布日期、作者列表与论文匹配；页面明确 50-step / 1-second action chunk。主要机制与结果以所给 v1 PDF 为准，不把项目页额外数字移植为 PDF 精确数据。
2. [官方 openpi README](https://github.com/Physical-Intelligence/openpi)：通过公开 raw README 读取，确认官方代码入口及 π0.5 内容。当前 README 后续更新，未审计与论文版本逐项对应，不作为实验超参来源。无认证，无个人凭据。
3. 作者页官方媒体：已取得一段挂毛巾演示，文件名标记 10x、无音轨。没有下载完整大型演示合集；没有声称取得原始实时机器人日志或训练pair。

## 本地媒体清单

| 文件 | 来源与变换 | 用途/归属 |
|---|---|---|
| assets/paper.pdf | 用户原文件逐字节复制 | 完整原文 |
| assets/fig3.png | PDF p4 Fig.3 与图注裁剪 | 原版架构，Physical Intelligence |
| assets/fig4.png | PDF p6 Fig.4 与图注裁剪 | 原版数据构成 |
| assets/fig67.png | PDF p8 Fig.6–7 与图注裁剪 | 测试环境、轨迹、统计 |
| assets/fig10.png | PDF p10左上 Fig.10 与图注 | 数据消融 |
| assets/fig11.png | PDF p10左中 Fig.11 与图注 | 语言泛化 |
| assets/fig13.png | PDF p11左上 Fig.13 与图注 | 高层消融 |
| assets/fig18.png | PDF p19右上 Fig.18 与图注 | 注意力掩码 |
| assets/robot-frame.png | PDF p6 Fig.4 中移动机器人图像局部 | 原始输入视觉样例，不是本导读任务的真实同步帧 |
| assets/hang-towel-10x.mp4 | https://website.pi-asset.com/pi0_5/impressive-tasks/10x_hang_towel_no_audio_lowres.mp4 | 官方项目页链接，原样下载；10倍速无音轨 |

图像和视频归原作者所有，未见独立媒体许可说明；本导读未虚构开放许可。自制路径图、变量解释和数字演算均为教学示意。所有主要正文资源本地化；官方项目/代码链接需网络。共享 reader 脚本按要求引用兄弟目录，正文不依赖问答服务。

## 验证记录

- 已运行 `python3 skill/scripts/check_guide.py output/index.html`，结构检查通过（15 个唯一 ID、所有本地链接存在，2 个外部入口）。
- 已比对原 PDF 与 `assets/paper.pdf` 的 SHA-256，一致；检查所有页面引用的图片、视频和共享脚本均存在。
- 已核验教学混合、误差和加权计算；内联 JavaScript 使用 Node 语法检查通过。语法检查不验证 DOM 交互效果。
- 尝试通过已有 Playwright 启动独立无界面 Chrome，使用临时 profile，不连接用户浏览器。Chrome 启动即 SIGABRT，环境无法完成渲染。没有取得桌面/手机网页截图，未完成日夜模式、目录、滑杆、样本切换、视频播放和窄屏视觉验收；没有声称这些验证通过。
- PDF 原图已渲染并亲眼查看，与上述网页浏览器验证缺口分开记录。未安装任何新依赖、未使用 Git、未发布。
- 当前隔离目录建立了简单本地总目录 `../index.html`，使返回入口可检查；正式入库总目录由导入器管理。

