/**
 * 模拟对话数据集
 *
 * 设计目标：展示"未加载智能体的对话（standard）"与"加载智能体的对话（agent）"之间的差异。
 *
 * 数据集组成（5 个会话，1 个 agent 模式 + 4 个 standard 模式）：
 *   conv-001   - agent 模式:Python 代码调试帮助（点击进入智能体模式，左右分栏布局）
 *   conv-002   - standard:卫星链路损耗计算方法（点击进入普通对话模式）
 *   conv-003   - standard:终端兼容性问题排查
 *   conv-004   - standard:AI 模型在轨更新流程咨询
 *   conv-005   - standard:网络安全防护建议
 *
 * 字段约定：
 *   conversation.agent          加载的智能体元数据；standard 模式为 null
 *   message.role                'user' | 'assistant' | 'system'
 *   message.type                'message' | 'agent_system'
 *                                (agent 模式首条系统消息会标注 type='agent_system')
 *   message.agentSteps          仅 agent 模式 AI 消息含有：智能体的步骤化执行序列
 *   message.processSnapshot     仅 agent 模式 AI 消息含有：该轮结束时的进程状态
 *   message.fileSnapshot        仅 agent 模式 AI 消息含有：该轮结束时的文件树
 *
 * Step.type 约定：
 *   'thinking' | 'file_read' | 'file_write' | 'command' | 'tool' | 'summary' | 'other'
 */

/* ============================================================
 *  智能体元数据
 * ============================================================ */
const AGENT_PY_DEBUGGER = {
  id: 'agent-py-debugger',
  name: 'Python 代码调试助手',
  description: '专门用于排查 / 优化 / 测试 Python 数据处理脚本,支持文件读写、命令执行与单元测试。',
  type: 'code_debugger',
  category: 'code',
  icon: 'code',
  iconBg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  welcomeMessage: '你好,我是 Python 代码调试助手。',
  colorTheme: 'primary',
}

/* ============================================================
 *  工具:构造 processSnapshot
 * ============================================================ */
const processSnapshot = (progress = 100, status = 'completed', stepCount = 4) => ({
  status,                                 // 'idle' | 'running' | 'completed' | 'paused' | 'failed'
  progress,                               // 0-100
  currentStep: stepCount,                 // 当前执行到的步骤索引
  runtime: '5.4s',                        // 累计运行时长
  resources: {                            // 资源占用
    cpu: '32%',
    memory: '128 MB',
    network: '12 KB/s',
  },
  nodes: Array.from({ length: stepCount }).map((_, i) => ({
    id: `n${i + 1}`, name: `步骤 ${i + 1}`, type: 'step', status: 'done', duration: '0.4s',
  })),
})

/* ============================================================
 *  工具:构造文件树(扁平数组 + 嵌套 children)
 *  格式与 FileTree 组件期望一致:{ type, name, size, children }
 * ============================================================ */
const makeFileTree = (entries) => {
  // entries: [{ path: 'a/b/c.py', size: '1.2 KB' }]
  const root = { type: 'dir', name: 'workspace', children: [] }
  entries.forEach(({ path, size }) => {
    const parts = path.split('/')
    let cur = root
    parts.forEach((seg, i) => {
      const isFile = i === parts.length - 1
      let next = cur.children?.find((c) => c.name === seg)
      if (!next) {
        next = isFile
          ? { type: 'file', name: seg, size, children: [] }
          : { type: 'dir',  name: seg, children: [] }
        cur.children.push(next)
      }
      cur = next
    })
  })
  return [root]
}

/* ============================================================
 *  Agent 模式 - conv-001 数据
 *  主题:Python 代码调试帮助(3 轮)
 * ============================================================ */
const PY_R1_USER = '我有一个处理卫星链路 CSV 数据的 Python 脚本,运行后部分行的"自由空间损耗(FSPL)"会算成负数,帮我排查一下。脚本和示例数据我已经放到 workspace 里。'

const PY_R1_AI_TEXT = `## 排查结果

我已经定位到 Bug 并给出修复方案。

### 根因分析

\`fspl_calc.py\` 中使用了

\`\`\`python
fspl = 32.45 + 20*log10(freq_mhz) + 20*log10(dist_km)
\`\`\`

**问题 1**:未做单位换算,直接传入的 \`freq_mhz\` 和 \`dist_km\` 与公式期望的 **MHz** 和 **km** 一致,看似没问题;  
**问题 2**:当 \`dist_km <= 0\`(CSV 中存在 0 / 空值)时, \`log10(0)\` 返回 \`NaN\`,在累加到 FSPL 列表后被 \`min()\` 比较时变成极小负数。

### 修复方案

1. **过滤非法值**:在读取 CSV 后,丢掉 \`dist_km <= 0\` 的行;
2. **加钳位**:对 \`fspl\` 做 \`max(0, fspl)\` 钳位,避免异常值;
3. **空值兜底**:若 \`fspl.isna().all()\`,直接抛 \`ValueError("无有效样本")\`。

### 修改后的核心代码

\`\`\`python
def fspl_db(freq_mhz: float, dist_km: float) -> float:
    if dist_km <= 0 or freq_mhz <= 0:
        raise ValueError("freq / dist 必须 > 0")
    return 32.45 + 20 * math.log10(freq_mhz) + 20 * math.log10(dist_km)

df = df[df["dist_km"] > 0]
df["fspl_db"] = df.apply(lambda r: fspl_db(r.freq_mhz, r.dist_km), axis=1)
\`\`\`

修复后该列已无非负异常,可以直接进入下游的链路预算计算。`

const PY_R2_USER = '明白了。那能不能把 FSPL 计算和 CSV 处理都封装成可复用的函数,顺便加个简单的进度条?数据量大概 50 万行。'

const PY_R2_AI_TEXT = `## 重构 & 性能优化

已经把脚本拆分到 \`fspl_calc.py\`(纯计算)与 \`sat_link_loss.py\`(IO + 进度),并使用 **numpy 向量化 + tqdm 进度条** 把 50 万行数据的处理时间从约 18s 降到 2.3s。

### 关键改动

1. **向量化** \`fspl_db_arr = 32.45 + 20*log10(freq) + 20*log10(dist)\`,整列一次性算;
2. **tqdm 进度条** 包裹 \`iterrows\` 改为分块 \`itertuples\`,每 50000 行更新一次进度;
3. **类型提示 + docstring** 便于后续维护。

### 性能对比

| 实现 | 50 万行耗时 | 内存峰值 |
| --- | --- | --- |
| 原始 apply | 18.4s | 312 MB |
| 向量化 + tqdm | **2.3s** | 168 MB |

可以直接 \`python sat_link_loss.py --csv data/leo_link_q1.csv --out fspl.csv\` 运行,详细说明见 \`optimization_notes.md\`。`

const PY_R3_USER = '不错。能不能顺便给 fspl_calc 写几个单元测试?我担心以后改公式会破坏既有行为。'

const PY_R3_AI_TEXT = `## 单元测试已就绪

我为 \`fspl_calc\` 与 \`sat_link_loss\` 添加了完整的单元测试,使用 \`pytest\`,共 12 个用例全部通过。

### 覆盖范围

- 基础数值校验(频率 1 GHz / 距离 1 km 时的 FSPL ≈ 92.45 dB);
- 边界值(距离趋近 0 时抛 \`ValueError\`);
- 浮点容差(\`pytest.approx\` 容忍 1e-6);
- 大批量数据(50 万行)端到端耗时 < 5s 的性能断言。

### 测试结果

\`\`\`
$ pytest -q
............                                                     [100%]
12 passed in 4.2s
\`\`\`

### 产物

- \`tests/test_fspl_calc.py\`:基础计算;
- \`tests/test_sat_link_loss.py\`:批量处理;
- \`test_report.html\`:可分享的测试报告(已生成)。

后续修改公式时,只要 \`pytest\` 全绿即可放心发布。`


/* —— conv-001 步骤(按轮次)—— */
const pyStepsR1 = [
  { id: 's1',  title: '正在解析任务需求…',                                       type: 'thinking',   status: 'done', duration: '0.6s', content: '用户反馈 FSPL 出现负数,先读取脚本与样本数据,定位根因。' },
  { id: 's2',  title: '已完成文件读取: /workspace/scripts/fspl_calc.py',          type: 'file_read',  status: 'done', duration: '0.1s' },
  { id: 's3',  title: '已完成文件读取: /workspace/scripts/sat_link_loss.py',       type: 'file_read',  status: 'done', duration: '0.1s' },
  { id: 's4',  title: '已完成文件读取: /workspace/data/leo_link_q1.csv',           type: 'file_read',  status: 'done', duration: '0.2s' },
  { id: 's5',  title: '已完成:静态分析 + 运行样本数据',                              type: 'tool',       status: 'done', duration: '0.4s' },
  { id: 's6',  title: '已完成:定位 Bug(dist_km=0 行触发 NaN)',                       type: 'thinking',   status: 'done', duration: '0.3s' },
  { id: 's7',  title: '已完成文件修改: /workspace/scripts/fspl_calc.py',           type: 'file_write', status: 'done', duration: '0.4s' },
  { id: 's8',  title: '已完成文件修改: /workspace/scripts/sat_link_loss.py',        type: 'file_write', status: 'done', duration: '0.4s' },
  { id: 's9',  title: '已完成命令执行: python sat_link_loss.py --csv data/leo_link_q1.csv', type: 'command', status: 'done', duration: '1.4s' },
  { id: 's10', title: '已完成:运行结果无非负异常',                                     type: 'summary',    status: 'done', duration: '0.2s' },
]

const pyStepsR2 = [
  { id: 's1',  title: '正在理解重构需求…',                                            type: 'thinking',   status: 'done', duration: '0.4s', content: '把 FSPL 计算与 CSV 处理拆分,加入 numpy 向量化与 tqdm 进度条。' },
  { id: 's2',  title: '已完成文件读取: /workspace/scripts/fspl_calc.py',               type: 'file_read',  status: 'done', duration: '0.1s' },
  { id: 's3',  title: '已完成文件读取: /workspace/scripts/sat_link_loss.py',            type: 'file_read',  status: 'done', duration: '0.1s' },
  { id: 's4',  title: '已完成文件创建: /workspace/scripts/utils_vector.py',             type: 'file_write', status: 'done', duration: '0.3s' },
  { id: 's5',  title: '已完成文件修改: /workspace/scripts/fspl_calc.py',                type: 'file_write', status: 'done', duration: '0.3s' },
  { id: 's6',  title: '已完成文件修改: /workspace/scripts/sat_link_loss.py',             type: 'file_write', status: 'done', duration: '0.5s' },
  { id: 's7',  title: '已完成命令执行: pip install numpy tqdm',                          type: 'command',    status: 'done', duration: '1.6s' },
  { id: 's8',  title: '已完成命令执行: python sat_link_loss.py --csv data/leo_link_q1.csv', type: 'command', status: 'done', duration: '2.3s' },
  { id: 's9',  title: '已完成:性能提升 8x',                                              type: 'summary',    status: 'done', duration: '0.2s' },
  { id: 's10', title: '已完成文件创建: /workspace/optimization_notes.md',                type: 'file_write', status: 'done', duration: '0.2s' },
]

const pyStepsR3 = [
  { id: 's1',  title: '正在分析测试覆盖点…',                                            type: 'thinking',   status: 'done', duration: '0.3s', content: '为基础计算、边界值、性能三类场景各写一组 pytest 用例。' },
  { id: 's2',  title: '已完成文件读取: /workspace/scripts/fspl_calc.py',                type: 'file_read',  status: 'done', duration: '0.1s' },
  { id: 's3',  title: '已完成文件读取: /workspace/scripts/sat_link_loss.py',            type: 'file_read',  status: 'done', duration: '0.1s' },
  { id: 's4',  title: '已完成文件创建: /workspace/tests/test_fspl_calc.py',              type: 'file_write', status: 'done', duration: '0.4s' },
  { id: 's5',  title: '已完成文件创建: /workspace/tests/test_sat_link_loss.py',         type: 'file_write', status: 'done', duration: '0.4s' },
  { id: 's6',  title: '已完成命令执行: pip install pytest',                              type: 'command',    status: 'done', duration: '1.4s' },
  { id: 's7',  title: '已完成命令执行: pytest -q',                                       type: 'command',    status: 'done', duration: '4.2s' },
  { id: 's8',  title: '已完成:12 个用例全部通过',                                          type: 'summary',    status: 'done', duration: '0.2s' },
  { id: 's9',  title: '已完成文件创建: /workspace/test_report.html',                     type: 'file_write', status: 'done', duration: '0.3s' },
]

/* —— conv-001 文件树快照(按轮次)—— */
const pyFileTreeR1 = makeFileTree([
  { path: 'scripts/sat_link_loss.py', size: '3.2 KB' },
  { path: 'scripts/fspl_calc.py',     size: '1.4 KB' },
  { path: 'data/leo_link_q1.csv',     size: '24.6 KB' },
  { path: 'bug_report.md',            size: '612 B' },
])

const pyFileTreeR2 = makeFileTree([
  { path: 'scripts/sat_link_loss.py',     size: '4.1 KB' },
  { path: 'scripts/fspl_calc.py',         size: '1.4 KB' },
  { path: 'scripts/utils_vector.py',      size: '2.1 KB' },
  { path: 'data/leo_link_q1.csv',         size: '24.6 KB' },
  { path: 'bug_report.md',                size: '612 B' },
  { path: 'optimization_notes.md',        size: '418 B' },
])

const pyFileTreeR3 = makeFileTree([
  { path: 'scripts/sat_link_loss.py',         size: '4.1 KB' },
  { path: 'scripts/fspl_calc.py',             size: '1.4 KB' },
  { path: 'scripts/utils_vector.py',          size: '2.1 KB' },
  { path: 'tests/test_fspl_calc.py',          size: '1.8 KB' },
  { path: 'tests/test_sat_link_loss.py',      size: '2.4 KB' },
  { path: 'data/leo_link_q1.csv',             size: '24.6 KB' },
  { path: 'bug_report.md',                    size: '612 B' },
  { path: 'optimization_notes.md',            size: '418 B' },
  { path: 'test_report.html',                 size: '8.6 KB' },
])

/* —— conv-001 完整消息序列 —— */
const AGENT_PY_MESSAGES = [
  // 系统消息:提示智能体已加载
  { id: 'py-sys-1', role: 'system',    type: 'agent_system', content: '已加载智能体:Python 代码调试助手', created_at: '2026-06-11T14:00:00Z' },

  // R1
  { id: 'py-u1', role: 'user',      type: 'message', content: PY_R1_USER, created_at: '2026-06-11T14:00:30Z' },
  {
    id: 'py-a1', role: 'assistant', type: 'message', content: PY_R1_AI_TEXT, created_at: '2026-06-11T14:00:38Z',
    agentSteps: pyStepsR1,
    processSnapshot: processSnapshot(100, 'completed', 10),
    fileSnapshot: pyFileTreeR1,
  },

  // R2
  { id: 'py-u2', role: 'user',      type: 'message', content: PY_R2_USER, created_at: '2026-06-11T14:05:00Z' },
  {
    id: 'py-a2', role: 'assistant', type: 'message', content: PY_R2_AI_TEXT, created_at: '2026-06-11T14:05:09Z',
    agentSteps: pyStepsR2,
    processSnapshot: processSnapshot(100, 'completed', 10),
    fileSnapshot: pyFileTreeR2,
  },

  // R3
  { id: 'py-u3', role: 'user',      type: 'message', content: PY_R3_USER, created_at: '2026-06-11T14:10:00Z' },
  {
    id: 'py-a3', role: 'assistant', type: 'message', content: PY_R3_AI_TEXT, created_at: '2026-06-11T14:10:15Z',
    agentSteps: pyStepsR3,
    processSnapshot: processSnapshot(100, 'completed', 9),
    fileSnapshot: pyFileTreeR3,
  },
]

/* ============================================================
 *  Standard 模式 - conv-002 ~ conv-005
 *  均为普通对话,无智能体加载,仅展示标准消息流
 * ============================================================ */

// conv-002 卫星链路损耗计算方法
const CONV_002_MESSAGES = [
  {
    id: 'std2-u1', role: 'user', type: 'message',
    content: '请介绍下卫星通信中常用的链路损耗计算方法,以及 Ka / Ku 波段的差异。',
    created_at: '2026-06-10T09:00:00Z',
  },
  {
    id: 'std2-a1', role: 'assistant', type: 'message',
    content: `## 卫星链路损耗常用计算方法

卫星通信链路的总损耗主要由以下几部分组成:

### 1. 自由空间路径损耗 (FSPL)

\`\`\`
FSPL(dB) = 32.45 + 20·log10(f_MHz) + 20·log10(d_km)
\`\`\`

- 是最主要的损耗项,随距离与频率增大;
- Ka 波段(26.5–40 GHz)比 Ku 波段(12–18 GHz)在相同距离下多约 **7–14 dB** 的 FSPL。

### 2. 大气吸收与雨衰

| 波段 | 晴空衰减 | 雨衰(中雨, 99.5% 可用度) |
| --- | --- | --- |
| Ku | 0.5–1 dB | 3–6 dB |
| Ka | 1–2 dB | 6–12 dB |

Ka 波段对降雨更敏感,链路预算中通常需要 **比 Ku 高 4–8 dB 的链路余量**。

### 3. 其他损耗

- **天线指向误差**:0.5–2 dB;
- **极化损耗**:0.2–0.5 dB;
- **馈线与接头损耗**:1–3 dB。

### 实测建议

1. 使用 ITU-R P.618 模型做可用度分析;
2. 上行/下行分别算 Eb/N0,再合成总 C/N;
3. Ka 波段建议在地面站配置 **上行功率控制 (UPC)**,应对雨衰。`,
    created_at: '2026-06-10T09:00:12Z',
  },
  {
    id: 'std2-u2', role: 'user', type: 'message',
    content: '链路余量一般取多少合适?',
    created_at: '2026-06-10T09:02:30Z',
  },
  {
    id: 'std2-a2', role: 'assistant', type: 'message',
    content: `## 链路余量取值建议

链路余量的选取需要权衡 **可用度** 与 **成本**。

| 业务类型 | 推荐余量 | 备注 |
| --- | --- | --- |
| 关键控制链路 | 8–10 dB | 99.9%+ 可用度 |
| 普通业务链路 | 4–6 dB | 99.5% 可用度 |
| 实验 / 验证链路 | 2–3 dB | 短时使用 |

对于 Ka 波段,建议在以上基础上 **额外增加 3 dB** 以应对降雨事件;Ku 波段可酌情增加 1–2 dB。`,
    created_at: '2026-06-10T09:02:42Z',
  },
]

// conv-003 终端兼容性问题排查
const CONV_003_MESSAGES = [
  {
    id: 'std3-u1', role: 'user', type: 'message',
    content: '我们的卫星终端在不同基线版本下表现不一致:V3.2 正常,V3.3 注册阶段偶发失败,V3.4 频繁掉线。能给个排查思路吗?',
    created_at: '2026-06-10T10:30:00Z',
  },
  {
    id: 'std3-a1', role: 'assistant', type: 'message',
    content: `## 终端兼容性排查思路

建议按"**由下至上、由静到动**"的顺序排查:

### 1. 抓取三个版本的注册信令

\`\`\`
Wireshark 过滤: gsmtap || sip || diameter
关注字段: Attach Request / Identity Response / Security Mode
\`\`\`

- 对比 V3.2 与 V3.3 在 Attach Accept 阶段返回的 **cause code**;
- V3.4 频繁掉线需要看 **RRC Release Request** 的原因(release cause = ?)。

### 2. 重点关注三类变更点

| 变更类型 | V3.2→V3.3 重点 | V3.3→V3.4 重点 |
| --- | --- | --- |
| 协议栈 | 鉴权算法切换 (Milenage→Tuak) | 新增 RRC Inactive |
| 射频 | 频段组合增加 n78 | 发射功率回退 3 dB |
| SIM | USIM 应用切换 | eSIM profile 切换 |

### 3. 复现实验

1. **同卡 + 同基站**:分别在 V3.2/V3.3/V3.4 上跑 100 次注册,统计成功率;
2. **同版本 + 不同卡**:排除 SIM 侧问题;
3. **抓空口 SNR/CQI**:V3.4 掉线前 5s 的 CQI 是否 < 6。

### 4. 已知坑

- V3.3 的 **TUAK 鉴权** 与老核心网存在兼容性问题,部分场景需要回退 Milenage;
- V3.4 的 **RRC Inactive** 在跨基站切换时可能丢失上下文,需要开启 RAN Notification Area Update。

如果需要,我可以提供一份详细的 test case 模板。`,
    created_at: '2026-06-10T10:30:20Z',
  },
]

// conv-004 AI 模型在轨更新流程咨询
const CONV_004_MESSAGES = [
  {
    id: 'std4-u1', role: 'user', type: 'message',
    content: '星载 AI 模型在轨更新 (OTAU) 一般包含哪些步骤?需要注意什么风险?',
    created_at: '2026-06-10T15:00:00Z',
  },
  {
    id: 'std4-a1', role: 'assistant', type: 'message',
    content: `## 星载 AI 模型在轨更新 (OTAU) 流程

典型的 OTAU 流程可分为 6 个阶段,每个阶段都有对应的回滚预案。

### 1. 地面段:模型打包与签名

- **模型格式**:ONNX / TFLite / 自定义 IR;
- **完整性保护**:SHA-256 摘要 + 私钥签名;
- **版本号与灰度策略**:rollout_id + canary_percentage。

### 2. 上行传输 (Uplink)

- 分片大小建议 **≤ 512 KB**,丢包后用 **ARQ + FEC** 重组;
- 上行窗口控制:每包 ACK 后再发下一片;
- 关键参数(MBIST 标志、entry point)需要 **冗余发送 3 次**。

### 3. 星上存储与校验

\`\`\`
/flash/otau/
  model_v2.bin          # 新模型
  model_v1.bin.bak      # 旧模型备份
  manifest.json         # 版本/签名/依赖
\`\`\`

校验失败立即停止,不进入下一步。

### 4. 热加载

- 推荐使用 **影子模式 (shadow mode)**:新旧模型并行推理,结果不一致时记录日志;
- 影子模式稳定运行 ≥ 24h 后,再切主模型。

### 5. 切换与回滚

- **黄金指标**:推理成功率、内存峰值、时延 P99 任一劣化 > 10%,自动回滚;
- 回滚通过把 model_v1.bin 重新映射到 entry point 完成,耗时 < 5s。

### 6. 遥测与确认

- 切换后持续上报 **30 分钟**的 inflight metric;
- 地面收到 "OTAU_SUCCESS" 后归档 manifest,关闭工单。

### 主要风险与缓解

| 风险 | 影响 | 缓解 |
| --- | --- | --- |
| 模型损坏 | 推理失败 | SHA-256 + 签名校验 |
| 内存超限 | OOM | 影子模式 + 内存预算告警 |
| 上下文不兼容 | 推理漂移 | manifest 中固化依赖版本 |
| 链路中断 | 更新半完成 | 支持断点续传 + 原子切换 |

如果需要,我可以提供一份 checklist 模板用于工单审批。`,
    created_at: '2026-06-10T15:00:25Z',
  },
]

// conv-005 网络安全防护建议
const CONV_005_MESSAGES = [
  {
    id: 'std5-u1', role: 'user', type: 'message',
    content: '我们正在搭建一个面向卫星地面站的零信任网络,有什么落地方案建议?',
    created_at: '2026-06-10T16:30:00Z',
  },
  {
    id: 'std5-a1', role: 'assistant', type: 'message',
    content: `## 卫星地面站零信任落地建议

零信任 (Zero Trust) 的核心是 **"never trust, always verify"**,针对地面站这种"高敏感 + 多协议 + 跨域互联"的场景,建议从以下 5 个层面入手。

### 1. 身份与设备 (Identity & Device)

- 所有运维 / 业务账户接入 **IAM + MFA**(TOTP 或 FIDO2);
- 设备入网前做 **TPM 远程证明 (Remote Attestation)**;
- 临时凭据有效期 ≤ 8 小时。

### 2. 网络微分段 (Micro-segmentation)

\`\`\`
[运维区]   ←→  [跳板机]   ←→  [基带设备区]
                            ↘
                          [核心网仿真区]
                            ↘
                          [业务测控区]
\`\`\`

- 东西向流量默认 **deny all**,按需开放;
- 不同安全域之间用 **L7 代理 + mTLS**,避免直接 IP 互通。

### 3. 数据面保护

- 链路敏感字段(信令、密钥)走 **IPsec / MACsec**;
- 日志全量上送 SIEM,**保留 180 天**;
- 关键配置文件使用 **透明加密 (TDE)**。

### 4. 持续验证 (Continuous Verification)

- 基于风险评分动态调整访问权限(信任分 < 60 自动降级);
- 异常行为(短时高频 SSH、横向移动)实时告警;
- 关键操作(版本回滚、模型更新)走 **4-eyes 审批**。

### 5. 应急响应

1. **预案**:基带异常 / 链路劫持 / 凭据泄露 各一份 runbook;
2. **演练**:每季度 1 次红蓝对抗;
3. **取证**:链路抓包、终端 EDR 日志、IAM 审计 三路同步。

### 推荐技术栈

| 类别 | 选型 |
| --- | --- |
| IAM | Keycloak / Okta |
| 微分段 | Cilium / Calico |
| SIEM | Elastic Security / Splunk |
| 蜜罐 | T-Pot + Cowrie |

如果需要,我可以进一步给出一个 PoC 阶段的实施排期。`,
    created_at: '2026-06-10T16:30:30Z',
  },
]


/* ============================================================
 *  对外暴露:会话元数据 + 消息列表
 *  5 个会话(1 个 agent 模式 + 4 个 standard 模式)
 * ============================================================ */
export const MOCK_CONVERSATION_DATASETS = {
  /* —— conv-001: agent 模式(点击进入智能体问答模式)—— */
  'conv-001': {
    agent: AGENT_PY_DEBUGGER,
    status: 'success',
    title: 'Python 代码调试帮助',
    summary: '加载 Python 代码调试助手的 3 轮对话,含多步骤思考 / 进程面板 / 文件树',
    messages: AGENT_PY_MESSAGES,
  },

  /* —— conv-002 ~ conv-005: standard 模式(普通对话)—— */
  'conv-002': {
    agent: null,
    status: 'success',
    title: '卫星链路损耗计算方法',
    summary: '普通对话 - 2 轮卫星链路损耗相关问答',
    messages: CONV_002_MESSAGES,
  },
  'conv-003': {
    agent: null,
    status: 'success',
    title: '终端兼容性问题排查',
    summary: '普通对话 - 1 轮终端兼容性排查建议',
    messages: CONV_003_MESSAGES,
  },
  'conv-004': {
    agent: null,
    status: 'success',
    title: 'AI 模型在轨更新流程咨询',
    summary: '普通对话 - 1 轮 OTAU 流程咨询',
    messages: CONV_004_MESSAGES,
  },
  'conv-005': {
    agent: null,
    status: 'success',
    title: '网络安全防护建议',
    summary: '普通对话 - 1 轮零信任网络落地建议',
    messages: CONV_005_MESSAGES,
  },
}


/* ============================================================
 *  对外暴露:Sidebar 最近对话列表
 *  与 useMessages 中的 conv id 一一对应
 *  第一条是 agent 模式,其余是 standard 模式
 * ============================================================ */
export const MOCK_CONVERSATION_LIST = [
  { id: 'conv-001', title: 'Python 代码调试帮助',           status: 'success' }, // agent 模式
  { id: 'conv-002', title: '卫星链路损耗计算方法',          status: 'success' }, // standard
  { id: 'conv-003', title: '终端兼容性问题排查',            status: 'success' }, // standard
  { id: 'conv-004', title: 'AI 模型在轨更新流程咨询',       status: 'success' }, // standard
  { id: 'conv-005', title: '网络安全防护建议',              status: 'success' }, // standard
]


/* ============================================================
 *  工具函数
 * ============================================================ */

/**
 * 获取会话的元数据(含 agent 信息)
 * @param {string} conversationId
 * @returns {{ agent: object|null, status: string, title?: string, summary?: string }}
 */
export function getConversationMeta(conversationId) {
  return MOCK_CONVERSATION_DATASETS[conversationId] || { agent: null, status: 'empty' }
}

/**
 * 获取会话的消息列表
 * @param {string} conversationId
 * @returns {Array}
 */
export function getConversationMessages(conversationId) {
  return MOCK_CONVERSATION_DATASETS[conversationId]?.messages || []
}
