"""Mock leaderboard, squad, and chart seed data."""

from __future__ import annotations

import random
from dataclasses import dataclass
from datetime import date, timedelta

from models import SquadChallenge, Task


@dataclass
class LeaderRow:
    rank: int
    name: str
    weekly_score: int
    is_me: bool = False


def mock_weekly_leaderboard(my_name: str, my_weekly: int) -> list[LeaderRow]:
    """Generate leaderboard with user's actual score properly ranked."""
    # Seed per day so rankings are stable within a session
    random.seed(int(date.today().isoformat().replace("-", "")))

    # Mock competitors scattered above and below the user's real score
    base_offset = my_weekly - 600 if my_weekly > 600 else 0
    competitors = [
        ("陈思远", base_offset + random.randint(700, 900)),
        ("李雨桐", base_offset + random.randint(500, 700)),
        ("王浩然", base_offset + random.randint(300, 500)),
        ("赵子墨", base_offset + random.randint(100, 350)),
        ("林晓北", base_offset + random.randint(-50, 200)),
        ("周可欣", base_offset + random.randint(-250, -50)),
        ("韩东君", base_offset + random.randint(-400, -200)),
    ]
    rows = [LeaderRow(0, n, s, False) for n, s in competitors]
    # User row
    rows.append(LeaderRow(0, my_name or "我", my_weekly, True))
    rows.sort(key=lambda r: r.weekly_score, reverse=True)
    for i, r in enumerate(rows, start=1):
        r.rank = i
    return rows


def default_squad() -> SquadChallenge:
    return SquadChallenge(name="宿舍小队 · 本周合计步数挑战", current=38_200, goal=50_000)


def last_n_days_steps(n: int, user_weekly: dict[str, int]) -> tuple[list[str], list[int]]:
    """Merge user weekly_steps with gentle mock fill for last n days."""
    out_dates: list[str] = []
    out_vals: list[int] = []
    today = date.today()
    for i in range(n - 1, -1, -1):
        day = today - timedelta(days=i)
        iso = day.isoformat()
        v = int(user_weekly.get(iso, 0))
        if v == 0:
            v = 4000 + (i % 4) * 800 + (hash(iso) % 1200)
        out_dates.append(f"{day.month}/{day.day}")
        out_vals.append(v)
    return out_dates, out_vals


def radar_dimensions_from_tasks(tasks: list[Task]) -> tuple[list[str], list[int]]:
    """Compute radar dimensions from actual completed task types, not just ratio."""
    # Baseline scores for each dimension
    cardio = 35
    strength = 30
    flexibility = 30
    routine = 30
    consistency = 40

    for task in tasks:
        if not task.completed:
            continue
        title_lower = task.title.lower()
        # Map task content to dimensions
        if "跑" in title_lower or "有氧" in title_lower or "步" in title_lower:
            cardio += 15
            consistency += 5
        elif "拉伸" in title_lower or "柔韧" in title_lower:
            flexibility += 20
            routine += 10
        elif "晨" in title_lower or "早" in title_lower:
            routine += 15
            cardio += 5
        elif "打卡" in title_lower or "记录" in title_lower:
            consistency += 10
            routine += 5
        # Generic boost from any completed task
        consistency += 5

    return (
        ["有氧", "力量", "柔韧", "作息规律", "训练一致性"],
        [
            min(100, cardio),
            min(100, strength),
            min(100, flexibility),
            min(100, routine),
            min(100, consistency),
        ],
    )
