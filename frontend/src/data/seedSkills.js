/**
 * 技能中心 — 静态种子数据
 *
 * 数据分层：
 *  1. CATEGORIES - 顶部快速筛选分类
 *  2. AGENTS     - 统一形态的智能体卡片数据（每个分类 5-8 条）
 *  3. SKILLS     - 兼容旧版"我的技能"展示的扁平单技能数据
 *  4. SKILL_PACKS / DATASETS - 旧版数据（保留导出，避免外部引用报错）
 *
 * 用户状态（已添加）独立于本文件存储在 localStorage，避免污染种子数据。
 */

/* ===== 顶部快速筛选分类 ===== */
export const CATEGORIES = [
  { key: 'all',        label: '全部',     icon: 'apps' },
  { key: 'office',     label: '办公效率', icon: 'work' },
  { key: 'dev',        label: '研发辅助', icon: 'code' },
  { key: 'test',       label: '测试工具', icon: 'bug_report' },
  { key: 'ops',        label: '运维工具', icon: 'settings' },
  { key: 'operation',  label: '运营工具', icon: 'campaign' },
]

/* ===== 标签筛选（保留以兼容外部 import） ===== */
export const TAG_FILTERS = [
  { key: 'pack',     label: '技能包',     icon: 'inventory_2' },
  { key: 'dataset',  label: '数据集',     icon: 'database' },
  { key: 'dev',      label: '开发辅助',   icon: 'code' },
  { key: 'office',   label: '办公效率',   icon: 'work' },
  { key: 'analysis', label: '数据分析',   icon: 'monitoring' },
  { key: 'fun',      label: '影音娱乐',   icon: 'movie' },
]

/* ===== 渐变色池（卡片缩略图背景） ===== */
const BG = {
  blue:   'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  purple: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  green:  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  orange: 'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
  pink:   'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
  cyan:   'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
  red:    'linear-gradient(135deg, #f5576c 0%, #ff6f61 100%)',
  gold:   'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
  violet: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
  teal:   'linear-gradient(135deg, #2af598 0%, #009efd 100%)',
  peach:  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  mint:   'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  sunset: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  ocean:  'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)',
  forest: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)',
  cosmos: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)',
}

/* ===== 统一形态的智能体数据（核心数据源） ===== */
export const AGENTS = [
  /* ========== 办公效率 office ========== */
  {
    id: 'agt-ppt',
    name: 'AI PPT 制作助手',
    description: '一键生成专业级 PPT 演示文稿，支持多种风格模板与在线编辑，输出 PPTX 格式。',
    category: 'office',
    icon: 'slideshow',
    iconBg: BG.purple,
    addCount: 12580,
    isHot: true,
  },
  {
    id: 'agt-prd',
    name: '产品文档PRD生成器',
    description: '输入需求想法，自动生成包含架构图、时序图、功能描述的标准化 PRD 文档。',
    category: 'office',
    icon: 'description',
    iconBg: BG.cyan,
    addCount: 8920,
  },
  {
    id: 'agt-excel',
    name: '智能 Excel 分析师',
    description: '用自然语言完成复杂表格处理与数据分析，自动生成可视化图表。',
    category: 'office',
    icon: 'table_chart',
    iconBg: BG.green,
    addCount: 7340,
  },
  {
    id: 'agt-doc-summary',
    name: '长文档摘要助手',
    description: '快速提炼合同、报告、论文等长文档核心观点，输出结构化摘要。',
    category: 'office',
    icon: 'auto_stories',
    iconBg: BG.peach,
    addCount: 6210,
  },
  {
    id: 'agt-mindmap',
    name: '思维导图生成器',
    description: '将任意主题、文档、会议纪要一键转化为清晰的思维导图，支持编辑导出。',
    category: 'office',
    icon: 'account_tree',
    iconBg: BG.mint,
    addCount: 5470,
  },
  {
    id: 'agt-meeting',
    name: '会议纪要整理',
    description: '上传会议录音自动转写并整理为结构化纪要，提取待办事项与责任人。',
    category: 'office',
    icon: 'mic',
    iconBg: BG.pink,
    addCount: 4890,
  },
  {
    id: 'agt-translate',
    name: '专业文档翻译',
    description: '针对技术、商务、学术场景的精准翻译，保留原文格式与专业术语一致性。',
    category: 'office',
    icon: 'translate',
    iconBg: BG.blue,
    addCount: 9350,
    isHot: true,
  },

  /* ========== 研发辅助 dev ========== */
  {
    id: 'agt-code-review',
    name: '代码审查助手',
    description: '智能审查代码质量、安全漏洞与性能问题，支持 Java、Python、Go 等主流语言。',
    category: 'dev',
    icon: 'rate_review',
    iconBg: BG.ocean,
    addCount: 11200,
    isHot: true,
  },
  {
    id: 'agt-git-assistant',
    name: 'Git 智能助手',
    description: '自然语言生成 commit message、解决冲突、解释复杂 git 历史与分支结构。',
    category: 'dev',
    icon: 'account_tree',
    iconBg: BG.forest,
    addCount: 6850,
  },
  {
    id: 'agt-api-doc',
    name: 'API 文档生成',
    description: '基于代码自动生成 OpenAPI 文档、调用示例与错误码说明，告别手写文档。',
    category: 'dev',
    icon: 'api',
    iconBg: BG.gold,
    addCount: 5740,
  },
  {
    id: 'agt-sql-gen',
    name: 'SQL 自然语言生成',
    description: '用中文描述需求自动生成 SQL，支持复杂 JOIN、子查询与性能优化建议。',
    category: 'dev',
    icon: 'database',
    iconBg: BG.teal,
    addCount: 8920,
  },
  {
    id: 'agt-bug-loc',
    name: 'Bug 定位分析',
    description: '粘贴报错日志与代码片段，AI 智能定位根因并给出修复方案。',
    category: 'dev',
    icon: 'bug_report',
    iconBg: BG.red,
    addCount: 7660,
  },
  {
    id: 'agt-arch-design',
    name: '系统架构设计',
    description: '根据业务需求自动输出技术选型、模块划分、时序图与部署架构建议。',
    category: 'dev',
    icon: 'architecture',
    iconBg: BG.violet,
    addCount: 4520,
  },
  {
    id: 'agt-regex',
    name: '正则表达式生成',
    description: '描述匹配规则即可生成对应正则表达式，支持多语言转义与可视化解释。',
    category: 'dev',
    icon: 'code',
    iconBg: BG.cosmos,
    addCount: 3940,
  },

  /* ========== 测试工具 test ========== */
  {
    id: 'agt-test-case',
    name: '测试用例自动生成',
    description: '基于需求文档或接口契约自动生成功能、边界、异常场景的完整测试用例。',
    category: 'test',
    icon: 'fact_check',
    iconBg: BG.blue,
    addCount: 6780,
    isHot: true,
  },
  {
    id: 'agt-ui-test',
    name: 'UI 自动化测试',
    description: '录制一次操作即可生成可复用的自动化测试脚本，覆盖回归测试主流程。',
    category: 'test',
    icon: 'phonelink_setup',
    iconBg: BG.purple,
    addCount: 5230,
  },
  {
    id: 'agt-perf-test',
    name: '性能压测脚本生成',
    description: '自动生成 JMeter / Locust 压测脚本，支持阶梯加压与结果可视化分析。',
    category: 'test',
    icon: 'speed',
    iconBg: BG.red,
    addCount: 3870,
  },
  {
    id: 'agt-bug-report',
    name: '缺陷报告助手',
    description: '整理零散的测试记录为标准缺陷报告，自动补充复现步骤与影响范围。',
    category: 'test',
    icon: 'report',
    iconBg: BG.orange,
    addCount: 4120,
  },
  {
    id: 'agt-mock-data',
    name: 'Mock 测试数据生成',
    description: '一键生成符合业务规则的高保真测试数据，支持姓名、地址、银行卡等场景。',
    category: 'test',
    icon: 'shuffle',
    iconBg: BG.mint,
    addCount: 4890,
  },
  {
    id: 'agt-coverage',
    name: '测试覆盖率分析',
    description: '深度解读覆盖率报告，识别盲区与冗余用例，给出提升测试效率的建议。',
    category: 'test',
    icon: 'donut_large',
    iconBg: BG.teal,
    addCount: 2740,
  },

  /* ========== 运维工具 ops ========== */
  {
    id: 'agt-log-analysis',
    name: '日志智能分析',
    description: '聚合多源日志进行异常检测与根因分析，秒级定位线上故障链路。',
    category: 'ops',
    icon: 'monitor_heart',
    iconBg: BG.red,
    addCount: 8920,
    isHot: true,
  },
  {
    id: 'agt-alert',
    name: '告警收敛与降噪',
    description: '智能聚合重复告警、识别根因告警，大幅减少告警风暴带来的干扰。',
    category: 'ops',
    icon: 'notifications_active',
    iconBg: BG.orange,
    addCount: 5430,
  },
  {
    id: 'agt-k8s-assistant',
    name: 'K8s 运维助手',
    description: '通过自然语言操作 Kubernetes 集群，支持 Pod 排查、YAML 生成与故障恢复。',
    category: 'ops',
    icon: 'deployed_code',
    iconBg: BG.violet,
    addCount: 6180,
  },
  {
    id: 'agt-deploy',
    name: '一键发布助手',
    description: '自动化构建、灰度发布、回滚全流程，支持主流 CI/CD 平台无缝对接。',
    category: 'ops',
    icon: 'rocket_launch',
    iconBg: BG.gold,
    addCount: 4760,
  },
  {
    id: 'agt-monitor',
    name: '监控大盘搭建',
    description: '快速生成 Grafana / Prometheus 监控配置与业务大盘，开箱即用。',
    category: 'ops',
    icon: 'monitoring',
    iconBg: BG.cyan,
    addCount: 3920,
  },
  {
    id: 'agt-runbook',
    name: '应急预案 Runbook',
    description: '为常见故障自动生成标准处置流程，支持一键执行与事后复盘。',
    category: 'ops',
    icon: 'menu_book',
    iconBg: BG.forest,
    addCount: 2870,
  },
  {
    id: 'agt-cost',
    name: '云成本优化',
    description: '分析云资源使用情况，识别浪费资源，给出可量化的成本优化方案。',
    category: 'ops',
    icon: 'savings',
    iconBg: BG.peach,
    addCount: 3540,
  },

  /* ========== 运营工具 operation ========== */
  {
    id: 'agt-content',
    name: '爆款内容创作',
    description: '针对小红书、公众号、抖音等多平台生成高传播性的爆款图文与脚本。',
    category: 'operation',
    icon: 'edit_note',
    iconBg: BG.pink,
    addCount: 14620,
    isHot: true,
  },
  {
    id: 'agt-user-research',
    name: '用户调研分析',
    description: '自动设计调研问卷、分析用户反馈与访谈记录，输出洞察报告。',
    category: 'operation',
    icon: 'psychology',
    iconBg: BG.purple,
    addCount: 5870,
  },
  {
    id: 'agt-data-analysis',
    name: '业务数据分析',
    description: '上传业务数据自动生成多维分析报告，识别增长点与运营风险。',
    category: 'operation',
    icon: 'analytics',
    iconBg: BG.blue,
    addCount: 9120,
  },
  {
    id: 'agt-campaign',
    name: '营销活动策划',
    description: '一键生成完整营销活动方案，包含主题、玩法、预算分配与效果预估。',
    category: 'operation',
    icon: 'campaign',
    iconBg: BG.sunset,
    addCount: 6420,
  },
  {
    id: 'agt-seo',
    name: 'SEO 优化助手',
    description: '分析关键词竞争度、生成 SEO 友好内容与元数据，提升搜索排名。',
    category: 'operation',
    icon: 'travel_explore',
    iconBg: BG.mint,
    addCount: 4890,
  },
  {
    id: 'agt-cs-bot',
    name: '智能客服助手',
    description: '基于企业知识库提供 7×24 小时精准客服回答，支持多轮对话与人机协作。',
    category: 'operation',
    icon: 'support_agent',
    iconBg: BG.gold,
    addCount: 11230,
  },
  {
    id: 'agt-review',
    name: '评论舆情分析',
    description: '实时监控全网评论与舆情动态，情感分析与风险预警一站完成。',
    category: 'operation',
    icon: 'forum',
    iconBg: BG.cyan,
    addCount: 5340,
  },
]

/* ===== 兼容旧版"我的技能"网格的扁平单技能数据 ===== */
export const SKILLS = AGENTS.map((a) => ({
  id: a.id,
  name: a.name,
  description: a.description,
  icon: a.icon,
  iconBg: a.iconBg,
  category: a.category,
}))

/* ===== 兼容旧版字段：行业技能包 / 数据集 ===== */
export const SKILL_PACKS = []
export const DATASETS = []

/* ===== 用户初始已添加的技能（首次进入默认预置 2 个） ===== */
export const DEFAULT_ADDED_SKILL_IDS = ['agt-ppt', 'agt-code-review']

/* ===== localStorage Key 常量 ===== */
export const STORAGE_KEYS = {
  ADDED:    'user:skills:added:v1',
  CUSTOMS:  'user:skills:customs:v1',
}
