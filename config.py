"""FitQuest theme, titles, and static game configuration."""

# 高对比「阳光运动」：底色略提亮、正文与边框加深，保证可读性
COLORS = {
    "bg": "#F8FAFC",
    "surface": "#FFFFFF",
    "border": "#CBD5E1",
    "text": "#0F172A",
    "muted": "#475569",
    "accent": "#FF5100",
    "accent2": "#059669",
    "success": "#059669",
    "warning": "#D97706",
}

# Level titles: index = level - 1 (cap at last)
LEVEL_TITLES = [
    "青铜跑者",
    "白银战士",
    "黄金骑士",
    "铂金猎手",
    "钻石之心",
    "星耀先锋",
    "王者之翼",
]


def title_for_level(level: int) -> str:
    idx = max(0, min(level - 1, len(LEVEL_TITLES) - 1))
    return LEVEL_TITLES[idx]
