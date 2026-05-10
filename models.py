"""Core data structures for FitQuest."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date
from typing import Any


@dataclass
class User:
    id: str
    name: str
    total_xp: int = 0
    streak: int = 0
    last_active_date: str | None = None  # ISO YYYY-MM-DD
    total_steps: int = 0
    achievements: list[str] = field(default_factory=list)
    # Dates (ISO) on which user logged activity before 06:00 local time
    early_morning_dates: list[str] = field(default_factory=list)
    weekly_steps: dict[str, int] = field(default_factory=dict)  # ISO date -> steps that day

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "total_xp": self.total_xp,
            "streak": self.streak,
            "last_active_date": self.last_active_date,
            "total_steps": self.total_steps,
            "achievements": list(self.achievements),
            "early_morning_dates": list(self.early_morning_dates),
            "weekly_steps": dict(self.weekly_steps),
        }

    @classmethod
    def from_dict(cls, d: dict[str, Any]) -> User:
        return cls(
            id=d["id"],
            name=d["name"],
            total_xp=int(d.get("total_xp", 0)),
            streak=int(d.get("streak", 0)),
            last_active_date=d.get("last_active_date"),
            total_steps=int(d.get("total_steps", 0)),
            achievements=list(d.get("achievements", [])),
            early_morning_dates=list(d.get("early_morning_dates", [])),
            weekly_steps={k: int(v) for k, v in d.get("weekly_steps", {}).items()},
        )


@dataclass
class Task:
    id: str
    title: str
    kind: str  # "steps" | "duration" | "checkin"
    target: int  # steps count or minutes
    reward_xp: int
    completed: bool = False

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "title": self.title,
            "kind": self.kind,
            "target": self.target,
            "reward_xp": self.reward_xp,
            "completed": self.completed,
        }

    @classmethod
    def from_dict(cls, d: dict[str, Any]) -> Task:
        return cls(
            id=d["id"],
            title=d["title"],
            kind=d["kind"],
            target=int(d["target"]),
            reward_xp=int(d["reward_xp"]),
            completed=bool(d.get("completed", False)),
        )


@dataclass
class FeedItem:
    user_name: str
    text: str
    ts_iso: str

    def to_dict(self) -> dict[str, Any]:
        return {"user_name": self.user_name, "text": self.text, "ts_iso": self.ts_iso}

    @classmethod
    def from_dict(cls, d: dict[str, Any]) -> FeedItem:
        return cls(user_name=d["user_name"], text=d["text"], ts_iso=d["ts_iso"])


@dataclass
class SquadChallenge:
    name: str
    current: int
    goal: int

    @property
    def ratio(self) -> float:
        if self.goal <= 0:
            return 0.0
        return min(1.0, self.current / self.goal)


# Achievement ids used in logic and UI
ACHIEVEMENT_DEFS: dict[str, str] = {
    "early_bird": "早起鸟 — 连续 3 天在 6:00 前记录运动",
    "sport_hero": "运动健将 — 累计步数达到 10 万",
    "week_warrior": "周常战士 — 本周完成 5 个每日挑战",
}


def default_daily_tasks(today: date | None = None) -> list[Task]:
    """Fresh daily task set (ids stable per day for session)."""
    today = today or date.today()
    suffix = today.isoformat()
    return [
        Task(
            id=f"morning_run_{suffix}",
            title="晨跑 3 公里（或等效 25 分钟有氧）",
            kind="duration",
            target=25,
            reward_xp=40,
        ),
        Task(
            id=f"steps_10k_{suffix}",
            title="步数过万",
            kind="steps",
            target=10_000,
            reward_xp=35,
        ),
        Task(
            id=f"stretch_{suffix}",
            title="晚间拉伸 10 分钟",
            kind="duration",
            target=10,
            reward_xp=20,
        ),
        Task(
            id=f"hydrate_{suffix}",
            title="运动打卡（今日任意一次记录）",
            kind="checkin",
            target=1,
            reward_xp=15,
        ),
    ]
