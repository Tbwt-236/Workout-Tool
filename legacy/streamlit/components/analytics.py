"""数据分析：步数趋势、能力画像与小结。"""

from __future__ import annotations

import streamlit as st

from components.charts import render_ability_radar, render_weekly_steps_line
from config import COLORS
from models import User
from utils.gamification import compute_level_progress
from utils.mock_data import last_n_days_steps, radar_dimensions_from_tasks


def render_analytics() -> None:
    user: User = st.session_state.fq_user
    tasks = st.session_state.fq_tasks
    done = sum(1 for t in tasks if t.completed)

    dates, vals = last_n_days_steps(7, user.weekly_steps)
    inds, radar_vals = radar_dimensions_from_tasks(tasks)
    level, xp_in, xp_need = compute_level_progress(user.total_xp)

    st.markdown(
        '<div class="fq-section-title" style="margin-top:0;">近 7 天步数趋势</div>',
        unsafe_allow_html=True,
    )
    render_weekly_steps_line(dates, vals)

    st.divider()
    c1, c2 = st.columns([1.2, 1])
    with c1:
        st.markdown(
            '<div class="fq-section-title" style="margin-top:0;">能力雷达（本周画像）</div>',
            unsafe_allow_html=True,
        )
        render_ability_radar(inds, radar_vals)
    with c2:
        st.markdown(
            '<div class="fq-section-title" style="margin-top:0;">智能小结</div>',
            unsafe_allow_html=True,
        )
        total = max(1, len(tasks))
        ratio = done / total
        st.markdown(
            f"""
<div class="fq-card" style="line-height:1.7;color:{COLORS['text']};">
  <p>当前 <strong style="color:{COLORS['accent']};">Lv.{level}</strong>，今日任务完成度 <strong style="color:{COLORS['accent2']};">{int(ratio * 100)}%</strong>（{done}/{total}）。</p>
  <p>连续打卡 <strong>{user.streak}</strong> 天；累计步数 <strong>{user.total_steps:,}</strong>。</p>
  <p style="color:{COLORS['muted']};font-size:0.9rem;">提示：完成不同类型的任务可以全面提升「有氧」「柔韧」「作息规律」等维度。</p>
</div>
""",
            unsafe_allow_html=True,
        )
