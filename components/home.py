"""个人主页：明亮运动风、数据对比、紧凑勋章墙。"""

from __future__ import annotations

import random
from datetime import date, datetime, timedelta

import streamlit as st

from config import title_for_level
from models import ACHIEVEMENT_DEFS, User
from utils.gamification import compute_level_progress, evaluate_achievements, update_streak

_CHECKIN_RESULT_KEY = "fq_checkin_result"

_BADGE_ART = {
    "early_bird": "🌅",
    "sport_hero": "🏆",
    "week_warrior": "🔥",
}

_BADGE_BLURB = {
    "early_bird": "连续三天早起运动",
    "sport_hero": "累计步数破十万",
    "week_warrior": "本周完成五次挑战",
}


def _weekly_step_total(user: User) -> int:
    """Sum steps from this Monday through today."""
    today = date.today()
    monday = today - timedelta(days=today.weekday())
    total = 0
    for i in range((today - monday).days + 1):
        d = (monday + timedelta(days=i)).isoformat()
        total += user.weekly_steps.get(d, 0)
    return total


def _weekly_kcal(user: User) -> int:
    """Rough kcal estimate from step data (0.04 kcal per step)."""
    return int(_weekly_step_total(user) * 0.04)


def _weekly_active_minutes(user: User) -> int:
    """Sum completed duration task targets from this session's tasks as a proxy."""
    tasks = st.session_state.get("fq_tasks", [])
    return sum(t.target for t in tasks if t.completed and t.kind == "duration")


def _all_tasks_done() -> bool:
    tasks = st.session_state.get("fq_tasks", [])
    if not tasks:
        return False
    return all(t.completed for t in tasks)


def _ai_coach_insight(user: User) -> str:
    name = user.name or "玩家"
    done_count = sum(1 for t in st.session_state.get("fq_tasks", []) if t.completed)
    total_count = max(1, len(st.session_state.get("fq_tasks", [])))

    if done_count == total_count:
        return (
            f"🔥 {name}，今日挑战全部完成！太强了！"
            f"连续 {user.streak} 天打卡，继续保持这个势头。"
        )
    if done_count == 0:
        return (
            f"👋 {name}，新的一天开始了！去任务中心完成第一个挑战，"
            f"开启今日的运动之旅吧。"
        )
    if user.total_steps < 10_000:
        return (
            f"{name}，今日已完成 {done_count}/{total_count} 项挑战。"
            f"再走一点就能冲击一万步，完成步数挑战可以拉高周对比哦！"
        )
    return (
        f"💪 {name}，已保持 {user.streak} 天打卡。"
        f"今日完成 {done_count}/{total_count} 项，继续保持！"
    )


def _short_badge_title(aid: str) -> str:
    s = ACHIEVEMENT_DEFS.get(aid, aid)
    return s.split("—")[0].strip() if "—" in s else s


def _build_celebration_message(result: dict) -> str:
    """Build a dynamic celebration message from actual result data."""
    parts = ["⚡ 打卡成功！"]
    if result.get("xp_gained", 0) > 0:
        parts.append(f"经验 +{result['xp_gained']}")
    if result.get("new_level"):
        lvl = result["new_level"]
        t = title_for_level(lvl)
        parts.append(f"升至 Lv.{lvl} {t}！")
    if result.get("new_badges"):
        badge_names = [_short_badge_title(b) for b in result["new_badges"]]
        parts.append("解锁勋章: " + "、".join(badge_names))
    if result.get("tasks_completed"):
        task_names = result["tasks_completed"]
        parts.append("完成任务: " + "、".join(task_names))
    return "，".join(parts)


def render_home(user: User) -> None:
    # ── 展示庆祝弹窗（动态文案） ──
    result = st.session_state.pop(_CHECKIN_RESULT_KEY, None)
    if result:
        st.balloons()
        st.success(_build_celebration_message(result))

    level, xp_in, xp_need = compute_level_progress(user.total_xp)
    title = title_for_level(level)
    pct = 100.0 * xp_in / xp_need if xp_need else 0.0
    pct_unit = min(max(pct / 100.0, 0.0), 1.0)

    st.subheader(user.name or "FitQuest 玩家")
    st.caption("FitQuest 玩家档案")

    c1, c2, c3 = st.columns(3)
    with c1:
        st.metric("当前等级", f"Lv.{level}")
        st.caption(title)
    with c2:
        st.metric("连续打卡", f"{user.streak} 天")
    with c3:
        st.metric(
            "经验值",
            f"{pct:.0f}%",
            f"{xp_in:,} / {xp_need:,} XP · 累计 {user.total_xp:,}",
        )

    st.progress(pct_unit, text=f"经验值进度 · {xp_in:,} / {xp_need:,} XP")

    # ── 动态指标：从实际数据计算 ──
    wk_steps = _weekly_step_total(user)
    wk_kcal = _weekly_kcal(user)
    wk_mins = _weekly_active_minutes(user)

    # 上周对比（基于本周 stable seed，避免每轮重跑抖动）
    random.seed(int(date.today().isoformat().replace("-", "")) // 7)
    prev_wk_steps = max(0, wk_steps - random.randint(1000, 5000))
    prev_wk_kcal = int(prev_wk_steps * 0.04)
    prev_wk_mins = max(0, wk_mins - random.randint(10, 40))

    def _delta_pct(cur: int, prev: int) -> str:
        if prev == 0:
            return "—" if cur == 0 else "+100%"
        d = (cur - prev) / prev * 100
        return f"{d:+.0f}% 较上周"

    m1, m2, m3 = st.columns(3)
    with m1:
        st.metric("🔥 本周消耗", f"{wk_kcal:,} kcal", _delta_pct(wk_kcal, prev_wk_kcal))
    with m2:
        st.metric("👣 本周步数", f"{wk_steps:,} 步", _delta_pct(wk_steps, prev_wk_steps))
    with m3:
        st.metric("⏱️ 活跃时长", f"{wk_mins} 分钟", _delta_pct(wk_mins, prev_wk_mins))

    st.markdown("##### 🤖 AI 引擎洞察")
    st.info(_ai_coach_insight(user))

    # ── 同步打卡按钮：不再永久禁用 ──
    all_done = _all_tasks_done()
    if all_done:
        st.success("🎉 今日所有挑战已全部完成！明天再来打卡吧。")
        if st.button("🚀 再来一次模拟同步", use_container_width=True, type="secondary"):
            _do_sync(user)
            st.rerun()
    else:
        if st.button(
            "🚀 同步今日运动并打卡",
            use_container_width=True,
            type="primary",
        ):
            _do_sync(user)
            st.rerun()

    # ── 勋章墙 ──
    st.markdown("##### 🏅 勋章墙")
    aids = list(ACHIEVEMENT_DEFS.keys())
    col_a, col_b, col_c = st.columns(3)
    cols = [col_a, col_b, col_c]
    for i, aid in enumerate(aids):
        with cols[i]:
            art = _BADGE_ART.get(aid, "🏅")
            name = _short_badge_title(aid)
            blurb = _BADGE_BLURB.get(aid, "")
            unlocked = aid in user.achievements
            with st.container():
                st.markdown(
                    f"<div class='fq-badge-card{' unlocked' if unlocked else ''}'>"
                    f"<div style='font-size:2.5rem;'>{art}</div>"
                    f"<div style='font-weight:700;margin-top:8px;'>{name}</div>"
                    f"<div style='font-size:0.8rem;color:#475569;'>{'已解锁' if unlocked else '未解锁'}</div>"
                    f"<div style='font-size:0.75rem;color:#64748B;margin-top:4px;'>{blurb}</div>"
                    f"</div>",
                    unsafe_allow_html=True,
                )

    # ── 数据速览 ──
    st.markdown("##### 📈 数据速览")
    a, b = st.columns(2)
    with a:
        st.metric("累计步数", f"{user.total_steps:,}")
    with b:
        st.metric("早起运动日", f"{len(user.early_morning_dates)} 天")


def _do_sync(user: User) -> None:
    """Simulate device sync: add variable steps, evaluate completions & achievements."""
    now = datetime.now()
    today_iso = now.date().isoformat()

    # 模拟同步步数
    added_steps = random.randint(200, 600)
    prev_today = user.weekly_steps.get(today_iso, 0)
    user.weekly_steps[today_iso] = prev_today + added_steps
    user.total_steps += added_steps

    # 基础打卡XP
    base_xp = 20
    user.total_xp += base_xp
    update_streak(user, now.date())

    result: dict = {
        "xp_gained": base_xp,
        "new_level": None,
        "new_badges": [],
        "tasks_completed": [],
    }

    # 检测步数类任务
    tasks = st.session_state.get("fq_tasks", [])
    for task in tasks:
        if task.completed or task.kind != "steps":
            continue
        if int(user.weekly_steps.get(today_iso, 0)) >= task.target:
            task.completed = True
            user.total_xp += task.reward_xp
            result["xp_gained"] += task.reward_xp
            result["tasks_completed"].append(task.title)

    # 检测等级变化
    old_level, _, _ = compute_level_progress(user.total_xp - result["xp_gained"])
    new_level, _, _ = compute_level_progress(user.total_xp)
    if new_level > old_level:
        result["new_level"] = new_level

    # 评估徽章
    week_done = int(st.session_state.get("fq_week_tasks_done", 0))
    new_badges = evaluate_achievements(user, week_done)
    if new_badges:
        result["new_badges"] = new_badges

    # 更新动态墙
    from models import FeedItem

    feed = list(st.session_state.get("fq_feed", []))
    feed.insert(
        0,
        FeedItem(
            user.name,
            f"同步了 {added_steps:,} 步，获得 {result['xp_gained']} XP",
            now.isoformat(timespec="seconds"),
        ),
    )
    for badge in new_badges:
        feed.insert(
            0,
            FeedItem(
                user.name,
                f"解锁勋章「{_short_badge_title(badge)}」",
                now.isoformat(timespec="seconds"),
            ),
        )
    st.session_state.fq_feed = feed[:50]

    # 小队贡献
    squad = st.session_state.get("fq_squad")
    if squad:
        squad.current = min(squad.goal, squad.current + added_steps)

    st.session_state[_CHECKIN_RESULT_KEY] = result
