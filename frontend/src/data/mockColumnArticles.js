/**
 * 专栏文章 Mock 数据
 *
 * 字段约定与 PRD §4.6.4 表 2 一致：
 *   id, column_id, title, summary, source, source_url, published_at, created_at
 *
 * 规模：8 个专栏 × 8 篇文章 = 64 篇
 * 时间分布：跨 30 天,前 3 篇为"最新"
 */

const now = new Date('2026-06-15T10:00:00+08:00')

/**
 * 工具函数：按列生成 N 篇文章
 *   columnId     - 专栏 ID
 *   articles     - 标题/摘要列表
 *   baseDaysAgo  - 起始天数（最新一篇距今几天）
 */
const buildArticles = (columnId, articles, baseDaysAgo = 1) => {
  return articles.map((a, idx) => {
    const daysAgo = baseDaysAgo + idx * 3
    const publishedAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
    return {
      id: `${columnId}-art-${String(idx + 1).padStart(2, '0')}`,
      column_id: columnId,
      title: a.title,
      summary: a.summary,
      source: a.source || '平台专题库',
      source_url: a.source_url || null,
      published_at: publishedAt.toISOString(),
      created_at: publishedAt.toISOString(),
      read_minutes: a.read_minutes || 5,
    }
  })
}

const MOCK_COLUMN_ARTICLES = [
  // ---------- col-001 卫星姿轨控算法专题 ----------
  ...buildArticles('col-001', [
    { title: '基于 EKF 的星敏感器+陀螺组合定姿算法', summary: '本文提出一种基于扩展卡尔曼滤波(EKF)的星敏感器与陀螺组合定姿算法,详细推导了状态方程与量测方程,并通过仿真验证了其在不同噪声水平下的收敛性能。', read_minutes: 8 },
    { title: 'UKF 在卫星姿态估计中的非线性处理优势', summary: '无迹卡尔曼滤波(UKF)通过确定性采样处理强非线性系统,本文对比了 UKF 与 EKF 在大角度机动场景下的姿态估计精度。', read_minutes: 6 },
    { title: '卫星姿态控制律的滑模变结构设计', summary: '针对卫星姿态控制系统存在参数摄动和外部干扰的问题,本文设计了滑模变结构控制律,提高了系统鲁棒性。', read_minutes: 7 },
    { title: '陀螺漂移误差的在线辨识与补偿方法', summary: '陀螺漂移是影响卫星长期姿态精度的关键因素,本文提出一种基于星敏感器观测的在线漂移辨识方法。', read_minutes: 5 },
    { title: '星敏感器标定误差对定姿精度的影响分析', summary: '本文从星敏感器主点、焦距、畸变等标定参数出发,定量分析各项误差对最终定姿精度的影响程度。', read_minutes: 6 },
    { title: '低轨卫星磁力矩器卸载算法研究', summary: '当反作用轮饱和时需使用磁力矩器卸载角动量,本文比较了 B-dot 和交叉乘积两种典型卸载策略的效果。', read_minutes: 5 },
    { title: '姿轨控系统的故障诊断与重构方法', summary: '本文提出基于解析冗余的姿轨控系统故障诊断方法,并设计了在陀螺失效情况下的控制重构策略。', read_minutes: 8 },
    { title: '卫星姿态机动路径规划与时间最优控制', summary: '针对大角度姿态机动场景,本文研究了基于四元数反馈的时间最优机动路径规划方法。', read_minutes: 7 },
  ]),

  // ---------- col-002 载荷测试方法论 ----------
  ...buildArticles('col-002', [
    { title: '通信卫星转发器 EIRP 与 G/T 测量方法', summary: '本文系统介绍了通信卫星有效载荷 EIRP(等效全向辐射功率)与 G/T(品质因数)的标准测量方法,含地面测试与在轨标定两种场景。', read_minutes: 7 },
    { title: 'Ka 频段载荷功率放大器线性度测试', summary: 'Ka 频段载荷功放的线性度直接影响链路质量,本文给出 AM-AM、AM-PM、ACPR 等关键指标的测试方案。', read_minutes: 6 },
    { title: '载荷热真空试验中的性能漂移监测', summary: '在热真空环境下,载荷性能参数会出现温漂,本文介绍一种基于参考源的实时漂移监测方法。', read_minutes: 5 },
    { title: '多波束天线波束指向精度的测试与标定', summary: '多波束卫星的波束指向精度是核心指标,本文讨论了远场测试与近场扫描两种方法的应用场景。', read_minutes: 7 },
    { title: '星上载荷灵敏度温度补偿算法', summary: '载荷接收机灵敏度随温度变化,本文提出一种基于温度查表+最小二乘拟合的补偿方法,实测改善 2 dB。', read_minutes: 6 },
    { title: '载荷级 EMC 测试与电磁兼容性问题定位', summary: 'EMC 问题是载荷整星级测试的常见失败项,本文总结了辐射敏感度与传导敏感度的定位思路。', read_minutes: 8 },
    { title: '在轨载荷性能退化趋势分析方法', summary: '利用遥测数据,采用 ARIMA 与机器学习相结合的方法,实现了在轨载荷性能退化的提前预警。', read_minutes: 7 },
    { title: 'Q/V 频段载荷链路预算与余量设计', summary: 'Q/V 频段雨衰严重,本文给出 Q/V 频段载荷链路预算的工程余量设计方法与自适应编码策略。', read_minutes: 8 },
  ]),

  // ---------- col-003 行业月报 ----------
  ...buildArticles('col-003', [
    { title: '2026 年 5 月卫星互联网行业月报', summary: '本月 Starlink 发射 28 颗,累计在轨超过 8200 颗;Kuiper 完成首批 27 颗部署;国内 GW 星座发射节奏加快。', source: '行业快讯', read_minutes: 5 },
    { title: '2026 年 4 月卫星互联网行业月报', summary: '本月亮点:工信部发放第三批卫星互联网牌照,银河航天完成新一轮融资,卫星直连手机业务测试加速。', source: '行业快讯', read_minutes: 5 },
    { title: '2026 年 3 月卫星互联网行业月报', summary: '本月共完成 14 次航天发射,其中 11 次与卫星互联网相关,商业航天领域投融资总额超 30 亿元。', source: '行业快讯', read_minutes: 5 },
    { title: 'Starlink Gen2 卫星直连 LTE 进展', summary: 'SpaceX 在 Starlink Gen2 卫星上实现与地面 LTE 基站的直连互通测试,峰值速率达到 18 Mbps。', source: '行业快讯', read_minutes: 6 },
    { title: '国内卫星互联网标准化进展', summary: 'CCSA 启动了 5G NTN 卫星通信系列行标的制定工作,涵盖空口、终端、卫星载荷等 12 项标准。', source: '行业快讯', read_minutes: 5 },
    { title: '3GPP Release 19 NTN 标准冻结要点', summary: '3GPP R19 NTN 标准已冻结,本文梳理了 NR-NTN、IoT-NTN 的关键增强与运营商部署路线图。', source: '行业快讯', read_minutes: 7 },
    { title: '低轨星座频率协调国际进展', summary: 'WRC-27 筹备会议讨论了低轨星座频率协调规则,本文分析了 ITU 优先级与协调门限的最新变化。', source: '行业快讯', read_minutes: 6 },
    { title: '卫星互联网与 5G/6G 融合发展趋势', summary: '本文从架构、频谱、业务三方面分析卫星互联网与 5G/6G 融合发展的技术路径与商业模式。', source: '行业快讯', read_minutes: 7 },
  ]),

  // ---------- col-004 数传链路与调制解调 ----------
  ...buildArticles('col-004', [
    { title: 'LDPC 编码在卫星数传中的性能优势', summary: 'LDPC 码相比传统 RS+卷积级联码,在低 SNR 下增益可达 1.5-2 dB,本文给出 DVB-S2X 标准的实现细节。', read_minutes: 7 },
    { title: '高阶调制 APSK 与 QAM 在卫星链路的对比', summary: '本文从峰均比、解调复杂度、误码平层三个维度对比 16/32/64-APSK 与 16/64-QAM 在卫星场景的适用性。', read_minutes: 6 },
    { title: '突发模式 QPSK 解调的同步算法', summary: '针对低轨卫星的突发传输场景,本文提出基于前导序列的快速载波同步与定时恢复算法。', read_minutes: 7 },
    { title: 'Turbo 均衡在卫星高速数传中的应用', summary: 'Turbo 均衡通过迭代检测与信道译码,有效对抗多径与符号间干扰,提升高速数传链路的吞吐量。', read_minutes: 6 },
    { title: '卫星信道非线性失真预补偿技术', summary: '针对星上高功放的非线性失真,本文介绍数字预失真(DPD)技术在卫星载荷中的工程实现。', read_minutes: 6 },
    { title: '数传链路自适应编码调制(ACM)策略', summary: '本文给出基于 SNR 反馈的 ACM 切换门限设计方法,平衡了频谱效率与链路可用度。', read_minutes: 7 },
    { title: '星地链路多普勒频偏估计算法', summary: '低轨卫星相对运动引入多普勒,本文比较了基于 FFT 与基于相关器的两种频偏估计算法性能。', read_minutes: 5 },
    { title: 'Ka 频段雨衰对抗与链路余量设计', summary: 'Ka 频段雨衰可达 10+ dB,本文给出基于雨衰预测的上行功率控制(ULPC)与自适应编码策略。', read_minutes: 7 },
  ]),

  // ---------- col-005 终端射频前端 ----------
  ...buildArticles('col-005', [
    { title: '卫星终端低噪声放大器(LNA)选型与测试', summary: 'LNA 的噪声系数直接决定系统 G/T,本文从选型、PCB 布局、测试方法三方面给出工程实践。', read_minutes: 6 },
    { title: 'Ku 频段终端功率放大器线性化设计', summary: '针对 Ku 频段终端功放的非线性,本文介绍了数字预失真与前馈线性化两种方案的实现成本对比。', read_minutes: 7 },
    { title: '终端天线跟踪精度测试方法', summary: '本文给出便携式卫星终端动态跟踪精度的外场测试方法,使用近场探头与飞行试验两种验证手段。', read_minutes: 6 },
    { title: '射频前端电磁兼容设计要点', summary: '射频前端的 EMC 设计涉及屏蔽、滤波、接地,本文总结了数字与射频混合电路的常见问题。', read_minutes: 5 },
    { title: '宽带频率合成器在终端中的应用', summary: '本文介绍了一种基于 DDS+PLL 的宽带频率合成方案,相位噪声优于 -95 dBc/Hz@10kHz。', read_minutes: 6 },
    { title: '终端射频一致性测试与认证流程', summary: '本文梳理了国内主要运营商与认证机构对终端射频一致性的测试要求,包括传导与辐射两类。', read_minutes: 7 },
    { title: '相控阵终端波束指向校准方法', summary: '相控阵终端的波束指向受多通道一致性影响,本文介绍了一种基于远场标定的快速校准方法。', read_minutes: 6 },
    { title: 'Ka 频段小型化终端设计挑战', summary: 'Ka 频段终端小型化面临热设计、损耗、互调等挑战,本文给出工程化设计的经验总结。', read_minutes: 7 },
  ]),

  // ---------- col-006 测运控与在轨管理 ----------
  ...buildArticles('col-006', [
    { title: '卫星在轨健康管理的多源遥测融合', summary: '本文介绍了一种基于贝叶斯网络的卫星多源遥测数据融合方法,可实现 24h 提前的健康度预警。', read_minutes: 7 },
    { title: '反作用轮异常振动诊断与处理', summary: '反作用轮是姿轨控分系统的高故障率部件,本文总结了异常振动的典型特征与在轨处置流程。', read_minutes: 6 },
    { title: '整星级断电恢复的应急流程', summary: '在太阳翼异常、星务机死机等极端情况下,卫星需要进入安全模式并完成断电恢复,本文给出标 准 SOP。', read_minutes: 5 },
    { title: '卫星在轨软件升级(OIP)工程实践', summary: 'OIP 是在轨延寿和功能增强的关键手段,本文从校验、回滚、时序三方面给出工程实践要点。', read_minutes: 7 },
    { title: '测控资源冲突的智能调度算法', summary: '当多星共享测控资源时,如何最小化冲突并最大化测控弧段,本文提出一种基于遗传算法的调度方案。', read_minutes: 6 },
    { title: '低轨星座碰撞预警与规避', summary: '随着 Starlink 等巨型星座部署,碰撞预警成为常态工作,本文介绍工程化的预警阈值与规避决策。', read_minutes: 7 },
    { title: '卫星在轨延寿的关键技术', summary: '推进剂管理、电池健康度、单机老化是延寿的关键,本文给出基于遥测的剩余寿命评估方法。', read_minutes: 6 },
    { title: '测运控一体化平台架构演进', summary: '本文介绍了一种云原生+AI 辅助的测运控一体化平台架构,以及从 SCOS-2000 演进的技术路径。', read_minutes: 7 },
  ]),

  // ---------- col-007 AI 在卫星中的应用 ----------
  ...buildArticles('col-007', [
    { title: '基于 LSTM 的卫星遥测异常检测', summary: 'LSTM 能有效捕捉遥测时序数据的长程依赖,本文给出滚动预测+残差检测的工程化方案。', read_minutes: 7 },
    { title: '深度学习在 SAR 图像船舶检测中的应用', summary: '本文对比了 YOLOv8、CenterNet 与 PP-YOLOE 在 SAR 图像船舶检测任务上的精度与速度。', read_minutes: 6 },
    { title: 'Transformer 在轨任务规划中的探索', summary: '将卫星任务规划建模为序列决策问题,使用 Decision Transformer 取得了优于启发式基线的效果。', read_minutes: 7 },
    { title: '星上 AI 推理的轻量化部署', summary: '受限于星上算力,本文介绍了模型剪枝、量化、知识蒸馏在轨部署的实践经验。', read_minutes: 6 },
    { title: '基于强化学习的卫星波束调度', summary: '使用 PPO 算法优化多波束卫星的波束调度策略,频谱效率相比传统方法提升 18%。', read_minutes: 7 },
    { title: '故障预测与健康管理(PHM)的机器学习方法', summary: '本文梳理了 PHM 任务的机器学习方案选型,涵盖分类、回归、时序三类典型问题。', read_minutes: 6 },
    { title: '生成式 AI 在卫星运营文档中的应用', summary: '使用领域微调的大模型辅助生成测试报告、故障复盘等文档,显著提升工程师效率。', read_minutes: 5 },
    { title: '联邦学习在星座协同推理中的探索', summary: '星座多星协同推理面临数据孤岛问题,联邦学习提供了一种隐私保护的协同方案。', read_minutes: 7 },
  ]),

  // ---------- col-008 卫星互联网政策与标准 ----------
  ...buildArticles('col-008', [
    { title: '工信部卫星互联网频谱使用政策最新解读', summary: '本文解读了工信部最新发布的卫星互联网频谱使用政策,涵盖 Ku/Ka/Q/V 频段的分配与协调规则。', read_minutes: 6 },
    { title: '3GPP NTN R19 标准化进展与时间表', summary: 'R19 NTN 重点增强 NTN-NR 与 NB-IoT NTN 的互通性,本文梳理了关键时间节点与功能冻结。', read_minutes: 7 },
    { title: 'ITU WRC-27 议题与低轨星座协调', summary: 'WRC-27 将讨论多个低轨星座频谱协调议题,本文分析了可能影响国内星座的关键议题。', read_minutes: 6 },
    { title: '国内外卫星互联网监管框架对比', summary: '本文对比了美国 FCC、欧盟 ECC 与中国工信部在卫星互联网监管上的主要差异。', read_minutes: 7 },
    { title: '卫星直连手机业务的合规要求', summary: '卫星直连手机业务涉及多重监管,本文梳理了国际协调、电信业务、应急通信三个维度的合规要点。', read_minutes: 6 },
    { title: 'Q/V 频段频谱共享技术研究进展', summary: 'Q/V 频段资源稀缺,频谱共享是必经之路,本文介绍了几种主流的频谱共享技术方案。', read_minutes: 7 },
    { title: '中国卫星互联网产业链政策环境分析', summary: '从终端、芯片、载荷、运营、发射全产业链角度,分析政策环境对行业的影响。', read_minutes: 7 },
    { title: '国际电信联盟 ITU-R 卫星相关建议书更新', summary: 'ITU-R 多个关于卫星通信的建议书在 2025-2026 年间更新,本文梳理了关键变化点。', read_minutes: 6 },
  ]),
]

export default MOCK_COLUMN_ARTICLES
export { MOCK_COLUMN_ARTICLES }
