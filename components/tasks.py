"""任务大厅：每日挑战与完成逻辑。"""

from __future__ import annotations

from datetime import date, datetime

import streamlit as st

from models import FeedItem, Task, User
from utils import storage
from utils.gamification import (
    add_xp,
    evaluate_achievements,
    register_early_morning,
    update_streak,
)


def _complete_task(user: User, task: Task, now: datetime) -> list[str]:
    """Apply rewards and streak; returns newly unlocked achievement ids."""
    if task.completed:
        return []
    task.completed = True
    add_xp(user, task.reward_xp)
    update_streak(user, now.date())
    register_early_morning(user, now)

    today = now.date().isoformat()
    if task.kind == "steps":
        pass
    else:
        user.weekly_steps[today] = user.weekly_steps.get(today, 0) + 2000

    st.session_state.fq_week_tasks_done = int(st.session_state.get("fq_week_tasks_done", 0)) + 1
    feed = list(st.session_state.fq_feed)
    feed.insert(
        0,
        FeedItem(user.name, f"完成了「{task.title}」", now.isoformat(timespec="seconds")),
    )
    st.session_state.fq_feed = feed[:50]

    squad = st.session_state.fq_squad
    contribution = _squad_contribution(task)
    squad.current = min(squad.goal, squad.current + contribution)

    new_badges = evaluate_achievements(user, int(st.session_state.fq_week_tasks_done))
    for badge in new_badges:
        feed2 = list(st.session_state.fq_feed)
        feed2.insert(
            0,
            FeedItem(
                user.name,
                f"解锁勋章「{_badge_title(badge)}」",
                now.isoformat(timespec="seconds"),
            ),
        )
        st.session_state.fq_feed = feed2[:50]
    return new_badges


def _squad_contribution(task: Task) -> int:
    """Variable squad step contribution based on task type and difficulty."""
    if task.kind == "steps":
        return task.target // 8
    elif task.kind == "duration":
        return task.target * 60
    else:
        return 800


def _badge_title(aid: str) -> str:
    from models import ACHIEVEMENT_DEFS

    s = ACHIEVEMENT_DEFS.get(aid, aid)
    return s.split("—")[0].strip() if "—" in s else s


def render_tasks() -> None:
    storage.ensure_daily_tasks_rotated()
    tasks: list[Task] = st.session_state.fq_tasks
    user: User = st.session_state.fq_user

    st.subheader("今日挑战")
    st.caption("完成后获得经验值；步数类任务会计入累计步数与宿舍小队进度。")

    today_iso = date.today().isoformat()
    done_count = sum(1 for t in tasks if t.completed)
    total_count = len(tasks)

    # 总体进度
    st.progress(
        done_count / max(1, total_count),
        text=f"今日进度: {done_count}/{total_count} 项已完成",
    )
    st.divider()

    # 已完成的任务放到折叠区
    pending_tasks = [t for t in tasks if not t.completed]
    completed_tasks = [t for t in tasks if t.completed]

    for task in pending_tasks:
        with st.container():
            st.markdown(
                f"<div class='fq-card'>"
                f"<strong>{task.title}</strong>"
                f"<span style='color:#475569;margin-left:12px;'>+{task.reward_xp} XP</span>"
                f"</div>",
                unsafe_allow_html=True,
            )

            if task.kind == "steps":
                today_steps = int(user.weekly_steps.get(today_iso, 0))
                pct = min(1.0, today_steps / task.target) if task.target else 0
                st.progress(pct, text=f"进度: {today_steps:,} / {task.target:,} 步")
                c1, c2 = st.columns([1, 1])
                with c1:
                    add = st.number_input(
                        "追加步数",
                        min_value=0,
                        max_value=10_000,
                        value=0,
                        step=500,
                        key=f"add_{task.id}",
                    )
                with c2:
                    quick_cols = st.columns(3)
                    with quick_cols[0]:
                        if st.button("+500步", key=f"q500_{task.id}", use_container_width=True):
                            st.session_state[f"add_{task.id}"] = (
                                st.session_state.get(f"add_{task.id}", 0) + 500
                            )
                            st.rerun()
                    with quick_cols[1]:
                        if st.button("+1000步", key=f"q1k_{task.id}", use_container_width=True):
                            st.session_state[f"add_{task.id}"] = (
                                st.session_state.get(f"add_{task.id}", 0) + 1000
                            )
                            st.rerun()
                    with quick_cols[2]:
                        if st.button("+3000步", key=f"q3k_{task.id}", use_container_width=True):
                            st.session_state[f"add_{task.id}"] = (
                                st.session_state.get(f"add_{task.id}", 0) + 3000
                            )
                            st.rerun()

                if st.button("✅ 提交步数", key=f"submit_{task.id}", type="primary"):
                    now = datetime.now()
                    prev = user.weekly_steps.get(today_iso, 0)
                    new_total = prev + int(add)
                    user.weekly_steps[today_iso] = new_total
                    user.total_steps += int(add)
                    if new_total >= task.target:
                        new_badges = _complete_task(user, task, now)
                        if new_badges:
                            st.toast("新勋章解锁！", icon="🏅")
                        st.success("步数目标已达成，经验值已发放。")
                        storage.save_disk()
                        st.rerun()
                    else:
                        st.warning(f"距离目标还差 {task.target - new_total:,} 步，继续加油！")

            elif task.kind == "duration":
                c1, c2 = st.columns([1, 1])
                with c1:
                    mins = st.number_input(
                        "完成分钟数",
                        min_value=0,
                        max_value=180,
                        value=0,
                        step=5,
                        key=f"mins_{task.id}",
                    )
                with c2:
                    st.caption(f"目标: {task.target} 分钟")
                    if st.button("✅ 记录时长", key=f"btn_{task.id}", type="primary"):
                        now = datetime.now()
                        if int(mins) >= task.target:
                            new_badges = _complete_task(user, task, now)
                            if new_badges:
                                st.toast("新勋章解锁！", icon="🏅")
                            st.success("训练已记录。")
                            storage.save_disk()
                            st.rerun()
                        else:
                            st.warning(f"还差 {task.target - int(mins)} 分钟，未达到目标时长。")

            else:  # checkin
                if st.button("✅ 一键打卡", key=f"btn_{task.id}", type="primary"):
                    now = datetime.now()
                    new_badges = _complete_task(user, task, now)
                    if new_badges:
                        st.toast("新勋章解锁！", icon="🏅")
                    st.success("今日打卡成功。")
                    storage.save_disk()
                    st.rerun()

            st.divider()

    # 已完成任务折叠展示
    if completed_tasks:
        with st.expander(f"✅ 已完成 ({len(completed_tasks)} 项)", expanded=False):
            for task in completed_tasks:
                st.markdown(
                    f"<div style='padding:6px 0;color:#475569;'>"
                    f"✅ <s>{task.title}</s> <span style='color:#059669;'>+{task.reward_xp} XP</span>"
                    f"</div>",
                    unsafe_allow_html=True,
                )
