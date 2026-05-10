# FitQuest 技术架构说明

## 概述

FitQuest 是一款面向大学生的游戏化运动激励工具，基于 **Streamlit** 构建单页 Web 应用。通过每日任务、经验值升级、勋章系统和社交排行榜等游戏化机制，激励用户坚持运动。

- **技术栈**: Python 3.10 + Streamlit + Plotly + Pandas
- **架构模式**: 组件化单页应用（无路由、无数据库，Session State 驱动）
- **数据持久化**: 本地 JSON 文件（`data/fitquest_state.json`）

---

## 目录结构

```
Workout Tool/
├── app.py                     # 主入口：页面路由、侧边栏、全局 CSS
├── config.py                  # 主题配色、等级称号配置
├── models.py                  # 数据模型：User / Task / FeedItem / SquadChallenge
├── requirements.txt           # 依赖声明
│
├── components/                # UI 组件层（每个文件对应一个页面）
│   ├── home.py                # 个人主页：指标面板、同步打卡、勋章墙
│   ├── tasks.py               # 任务中心：每日挑战展示与完成逻辑
│   ├── social.py              # 排行榜、小队挑战、动态墙
│   ├── analytics.py           # 数据分析：步数趋势图、能力雷达、智能小结
│   └── charts.py              # 图表封装：Plotly 折线图 & 雷达图
│
├── utils/                     # 工具 & 业务逻辑层
│   ├── gamification.py        # 升级公式、连续打卡、徽章评估、周计数器重置
│   ├── storage.py             # Session State 初始化、JSON 读写、演示数据注入
│   └── mock_data.py           # 排行榜模拟数据、步数曲线 mock、雷达维度计算
│
├── data/
│   └── fitquest_state.json    # 本地持久化存档
│
└── tests/
    └── test_ui_smoke.py       # Streamlit AppTest 冒烟测试
```

---

## 核心架构决策

### 1. Session State 作为唯一数据源

所有运行时状态存储在 `st.session_state` 中，以 `fq_` 前缀命名避免冲突：

| Key | 类型 | 说明 |
|-----|------|------|
| `fq_user` | `User` | 当前用户实例（dataclass） |
| `fq_tasks` | `list[Task]` | 今日任务列表 |
| `fq_tasks_date` | `str` | 任务所属日期（ISO），用于跨天轮换 |
| `fq_feed` | `list[FeedItem]` | 动态墙内容（最多 50 条） |
| `fq_squad` | `SquadChallenge` | 宿舍小队挑战进度 |
| `fq_week_tasks_done` | `int` | 本周已完成任务总数 |
| `fq_week_key` | `str` | ISO 周标识（如 `2026-W19`），用于重置检测 |
| `fq_boot` | `bool` | 会话启动标记，防止重复初始化 |
| `fq_onboarded` | `bool` | 是否已完成新手引导 |

### 2. 组件化页面路由

`app.py` 通过侧边栏 `st.radio` 选择页面，路由分发到对应组件：

```
st.radio("导航", ["🏠 个人主页", "📋 任务中心", "🏆 排行榜", "📊 数据分析"])
    → page_clean = "个人主页" → home.render_home(user)
    → page_clean = "任务中心" → tasks.render_tasks()
    → page_clean = "排行榜"   → social.render_social()
    → page_clean = "数据分析" → analytics.render_analytics()
```

每个组件文件暴露单一 `render_*()` 函数，自包含渲染逻辑，通过 `st.session_state` 读写共享数据。

### 3. 数据模型设计

```
User (dataclass)
├── id, name
├── total_xp: int          # 累计经验值
├── streak: int            # 连续打卡天数
├── last_active_date: str  # ISO 日期
├── total_steps: int       # 累计步数
├── achievements: list     # 已解锁勋章 ID
├── early_morning_dates: list  # 6:00 前记录运动的日期
└── weekly_steps: dict     # {ISO日期: 步数}

Task (dataclass)
├── id: str                # 含日期后缀，如 "steps_10k_2026-05-10"
├── title, kind, target, reward_xp, completed

FeedItem (dataclass)
├── user_name, text, ts_iso

SquadChallenge (dataclass)
├── name, current, goal    # ratio 属性返回完成百分比
```

### 4. 升级系统公式

```
Lv.1: 0–99 XP   (槽: 100 XP)
Lv.2: 100–499 XP (槽: 400 XP)
Lv.3+: 每级槽 = level² × 100 XP
```

等级称号循环：青铜跑者 → 白银战士 → 黄金骑士 → 铂金猎手 → 钻石之心 → 星耀先锋 → 王者之翼（封顶）

### 5. 勋章触发条件

| 勋章 | 条件 |
|------|------|
| 早起鸟 (early_bird) | 连续 3 天在 6:00 前记录运动 |
| 运动健将 (sport_hero) | 累计步数 ≥ 100,000 |
| 周常战士 (week_warrior) | 本周完成 ≥ 5 个每日挑战 |

---

## 关键交互流程

### 同步打卡流程（home.py → _do_sync）

```
用户点击 "🚀 同步今日运动并打卡"
  ├─ 模拟同步随机步数 (200–600)
  ├─ 更新 weekly_steps 和 total_steps
  ├─ 发放基础 20 XP + update_streak()
  ├─ 检测步数类任务是否达标 → 自动完成 + 奖励 XP
  ├─ 检测等级变化
  ├─ evaluate_achievements() → 检测新勋章
  ├─ 写入动态墙（2条：同步统计 + 勋章解锁）
  ├─ 更新小队进度
  └─ 设置 fq_checkin_result → rerun → home 展示庆祝弹窗
```

### 任务完成流程（tasks.py → _complete_task）

```
用户提交任务
  ├─ task.completed = True
  ├─ add_xp(user, task.reward_xp)
  ├─ update_streak()
  ├─ register_early_morning()  # 检测是否 6:00 前
  ├─ 非步数类任务: 自动追加 2000 步到今日步数
  ├─ fq_week_tasks_done += 1
  ├─ 写入动态墙 + 小队贡献（按任务类型差异化）
  ├─ evaluate_achievements()
  └─ save_disk() → 持久化
```

### 跨天 & 跨周逻辑

- **每日任务轮换** (`ensure_daily_tasks_rotated`): 检测 `fq_tasks_date` 是否等于今天，不同则重新生成 `default_daily_tasks()`
- **周计数器重置** (`ensure_weekly_reset`): 检测 `fq_week_key`（ISO 周），不同周则 `fq_week_tasks_done = 0`

---

## UI 样式策略

- **主题色**: `#FF5100`（活力橙），通过 `.streamlit/config.toml` 设置
- **CSS 类**: 定义在 `app.py` 的 `_inject_css()` 中，通过 `unsafe_allow_html=True` 注入
  - `.fq-card` — 白色卡片（圆角 12px + 浅阴影）
  - `.fq-badge-card` / `.fq-badge-card.unlocked` — 勋章卡片（未解锁灰色边框，已解锁橙色边框+光晕）
  - `.fq-feed-item` — 动态墙条目（底部分割线）
  - `.fq-section-title` — 页面小节标题
- **图表**: Plotly 浅色画布透明背景，主要折线图 + 雷达图

---

## 测试策略

`tests/test_ui_smoke.py` 使用 Streamlit 官方 `AppTest` 进行 UI 冒烟测试：

1. 主标题和 metric 组件存在性
2. 侧边栏导航选项完整性
3. 主页勋章墙、数据速览、指标面板存在性
4. 切换到数据分析页后内容校验
5. 全仓库扫描禁止出现第三方图表栈品牌文案

---

## 数据存储

- **格式**: JSON（`ensure_ascii=False` 保留中文, `indent=2` 可读）
- **路径**: `data/fitquest_state.json`
- **写入时机**: 每次完成任务后、手动保存按钮
- **读取时机**: 会话初始化时（`try_load_disk`），异常静默降级为默认演示数据
- **重置**: 删除本地 JSON + 清除 session state 标记，下次启动恢复演示数据
