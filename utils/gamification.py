"""XP, levels, streaks, and achievement evaluation."""

from __future__ import annotations

from datetime import date, datetime, timedelta

from models import ACHIEVEMENT_DEFS, User


def xp_needed_to_leave_level(level: int) -> int:
    """XP required to advance from this level to the next (level is 1-based)."""
    return max(1, level) ** 2 * 100


def compute_level_progress(total_xp: int) -> tuple[int, int, int]:
    """
    Returns (level, xp_into_current_level, xp_needed_for_next).
    Level starts at 1.

    Demo tuning: Lv.1 needs 100 XP; Lv.2 slot is 400 XP (total 100-499);
    at 500 enter Lv.3, then follows level²×100 rule.
    """
    if total_xp < 100:
        return 1, total_xp, 100
    if total_xp < 500:
        return 2, total_xp - 100, 400

    level = 3
    remaining = total_xp - 500
    while True:
        need = xp_needed_to_leave_level(level)
        if remaining >= need:
            remaining -= need
            level += 1
        else:
            return level, remaining, need


def add_xp(user: User, delta: int) -> User:
    if delta <= 0:
        return user
    user.total_xp += delta
    return user


def update_streak(user: User, today: date | None = None) -> User:
    today = today or date.today()
    iso = today.isoformat()
    if user.last_active_date is None:
        user.streak = 1
        user.last_active_date = iso
        return user
    last = date.fromisoformat(user.last_active_date)
    if last == today:
        return user
    if last == today - timedelta(days=1):
        user.streak += 1
    else:
        user.streak = 1
    user.last_active_date = iso
    return user


def register_early_morning(user: User, now: datetime | None = None) -> User:
    """If activity logged before 06:00, mark today's date."""
    now = now or datetime.now()
    if now.hour < 6:
        d = now.date().isoformat()
        if d not in user.early_morning_dates:
            user.early_morning_dates.append(d)
            user.early_morning_dates.sort()
    return user


def current_week_key(today: date | None = None) -> str:
    """Return year-week string like '2026-W19' for weekly counter reset."""
    today = today or date.today()
    iso = today.isocalendar()
    return f"{iso[0]}-W{iso[1]}"


def ensure_weekly_reset(week_key: str | None = None) -> None:
    """Reset fq_week_tasks_done if we're in a new week."""
    import streamlit as st

    if week_key is None:
        week_key = current_week_key()
    stored_key = st.session_state.get("fq_week_key", "")
    if stored_key != week_key:
        st.session_state.fq_week_tasks_done = 0
        st.session_state.fq_week_key = week_key


def _max_consecutive_early_days(sorted_dates: list[str]) -> int:
    if not sorted_dates:
        return 0
    best = 1
    cur = 1
    for i in range(1, len(sorted_dates)):
        a = date.fromisoformat(sorted_dates[i - 1])
        b = date.fromisoformat(sorted_dates[i])
        if (b - a).days == 1:
            cur += 1
            best = max(best, cur)
        else:
            cur = 1
    return best


def evaluate_achievements(user: User, tasks_completed_this_week: int) -> list[str]:
    """Return newly unlocked achievement ids (mutates user.achievements)."""
    unlocked: list[str] = []

    streak_early = _max_consecutive_early_days(user.early_morning_dates)
    if streak_early >= 3 and "early_bird" not in user.achievements:
        user.achievements.append("early_bird")
        unlocked.append("early_bird")

    if user.total_steps >= 100_000 and "sport_hero" not in user.achievements:
        user.achievements.append("sport_hero")
        unlocked.append("sport_hero")

    if tasks_completed_this_week >= 5 and "week_warrior" not in user.achievements:
        user.achievements.append("week_warrior")
        unlocked.append("week_warrior")

    return unlocked


def achievement_label(aid: str) -> str:
    return ACHIEVEMENT_DEFS.get(aid, aid)
