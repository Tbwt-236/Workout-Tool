"""Session-scoped persistence for FitQuest demo."""

from __future__ import annotations

import json
from datetime import date
from pathlib import Path
from typing import Any

import streamlit as st

from models import FeedItem, Task, User, default_daily_tasks
from utils.gamification import ensure_weekly_reset
from utils.mock_data import default_squad

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "fitquest_state.json"


def _default_user() -> User:
    """Fresh session default user."""
    return User(
        id="u_demo",
        name="高琪",
        total_xp=480,
        streak=6,
        total_steps=9850,
        achievements=["early_bird"],
    )


def init_session_state() -> None:
    if st.session_state.get("fq_boot"):
        ensure_daily_tasks_rotated()
        ensure_weekly_reset()
        return

    st.session_state.fq_boot = True
    st.session_state.fq_user = _default_user()
    st.session_state.fq_tasks_date = None
    st.session_state.fq_tasks = default_daily_tasks()
    st.session_state.fq_tasks_date = st.session_state.fq_tasks[0].id.split("_")[-1]
    st.session_state.fq_feed = [
        FeedItem("陈思远", "完成了「步数过万」", "2026-05-08T09:12:00"),
        FeedItem("李雨桐", "解锁勋章「早起鸟」", "2026-05-08T07:01:00"),
    ]
    st.session_state.fq_squad = default_squad()
    st.session_state.fq_week_tasks_done = 2
    st.session_state.fq_week_key = ""

    try_load_disk()
    ensure_daily_tasks_rotated()
    ensure_weekly_reset()

    # Onboarding flag — only set on truly fresh session (no disk data loaded)
    if not st.session_state.get("fq_onboarded"):
        st.session_state.fq_onboarded = True
        st.toast("👋 欢迎来到 FitQuest！去「任务中心」开始你的第一个挑战吧。", icon="⚡")


def ensure_daily_tasks_rotated() -> None:
    """If calendar day changed, refresh tasks."""
    today = date.today().isoformat()
    if st.session_state.get("fq_tasks_date") != today:
        st.session_state.fq_tasks = default_daily_tasks()
        st.session_state.fq_tasks_date = today


def reset_demo() -> None:
    """Clear local save and force fresh demo start."""
    try:
        if DATA_PATH.exists():
            DATA_PATH.unlink(missing_ok=True)
    except OSError:
        pass
    st.session_state.pop("fq_boot", None)
    st.session_state.pop("fq_onboarded", None)


def weekly_xp_proxy(user: User) -> int:
    """Score for leaderboard: blend XP and recent steps (demo)."""
    steps_bonus = min(400, user.total_steps // 200)
    return user.total_xp + steps_bonus


def try_load_disk() -> None:
    if not DATA_PATH.exists():
        return
    try:
        raw = json.loads(DATA_PATH.read_text(encoding="utf-8"))
        st.session_state.fq_user = User.from_dict(raw["user"])
        tasks_raw = raw.get("tasks", [])
        st.session_state.fq_tasks = (
            [Task.from_dict(t) for t in tasks_raw] if tasks_raw else default_daily_tasks()
        )
        st.session_state.fq_tasks_date = raw.get("tasks_date")
        st.session_state.fq_feed = [FeedItem.from_dict(f) for f in raw.get("feed", [])]
        st.session_state.fq_week_tasks_done = int(raw.get("week_tasks_done", 0))
        # Mark as onboarded if disk data exists (returning user)
        if raw.get("user"):
            st.session_state.fq_onboarded = True
    except (json.JSONDecodeError, KeyError, OSError, ValueError):
        pass


def save_disk() -> None:
    DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    payload: dict[str, Any] = {
        "user": st.session_state.fq_user.to_dict(),
        "tasks": [t.to_dict() for t in st.session_state.fq_tasks],
        "tasks_date": st.session_state.fq_tasks_date,
        "feed": [f.to_dict() for f in st.session_state.fq_feed[:50]],
        "week_tasks_done": st.session_state.fq_week_tasks_done,
    }
    DATA_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
