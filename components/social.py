"""社交：周榜、小队挑战、动态墙。"""

from __future__ import annotations

from datetime import date, datetime, timedelta

import streamlit as st

from config import COLORS
from models import FeedItem
from utils import storage
from utils.mock_data import mock_weekly_leaderboard


def _format_relative_time(ts_iso: str) -> str:
    """Convert ISO timestamp to human-readable relative time."""
    try:
        dt = datetime.fromisoformat(ts_iso)
    except (ValueError, TypeError):
        return ts_iso

    now = datetime.now()
    diff = now - dt

    if diff < timedelta(minutes=1):
        return "刚刚"
    if diff < timedelta(hours=1):
        mins = int(diff.total_seconds() // 60)
        return f"{mins} 分钟前"
    if diff < timedelta(hours=24) and dt.date() == now.date():
        return f"今天 {dt.strftime('%H:%M')}"
    if diff < timedelta(hours=48) and dt.date() == now.date() - timedelta(days=1):
        return f"昨天 {dt.strftime('%H:%M')}"
    if diff < timedelta(days=7):
        return f"{diff.days} 天前"
    return f"{dt.month}月{dt.day}日"


def render_social() -> None:
    user = st.session_state.fq_user
    squad = st.session_state.fq_squad
    score = storage.weekly_xp_proxy(user)

    st.subheader("本周能量榜")
    st.caption("排名基于周积分（XP + 步数加成），你的每次打卡都会影响排名。")

    rows = mock_weekly_leaderboard(user.name, score)
    for r in rows[:10]:
        me = "（你）" if r.is_me else ""
        medal = {1: "🥇", 2: "🥈", 3: "🥉"}.get(r.rank, "▫️")
        highlight = "background:#FFF7ED;border-radius:8px;padding:4px 8px;" if r.is_me else ""
        st.markdown(
            f"<div style='{highlight}margin:2px 0;'>"
            f"{medal} <strong>#{r.rank}</strong> "
            f"<code>{r.name}</code>{me} · "
            f"<strong>{r.weekly_score}</strong> 周积分"
            f"</div>",
            unsafe_allow_html=True,
        )

    st.divider()
    st.subheader(squad.name)
    pct = int(100 * squad.ratio)
    st.progress(squad.ratio)
    st.caption(f"{squad.current:,} / {squad.goal:,} 步 · {pct}%")
    st.markdown(
        f"<span style='color:{COLORS['muted']};'>"
        f"完成不同类型的任务会为宿舍小队贡献不同数量的步数进度。</span>",
        unsafe_allow_html=True,
    )

    st.divider()
    st.subheader("动态墙")
    feed: list[FeedItem] = st.session_state.fq_feed
    if not feed:
        st.info("暂无动态，去任务中心完成一条挑战吧。")
        return
    for item in feed[:20]:
        relative_time = _format_relative_time(item.ts_iso)
        st.markdown(
            f"<div class='fq-feed-item'>"
            f"<strong>{item.user_name}</strong> {item.text}"
            f"<div style='color:{COLORS['muted']};font-size:12px;margin-top:4px;'>{relative_time}</div>"
            f"</div>",
            unsafe_allow_html=True,
        )
