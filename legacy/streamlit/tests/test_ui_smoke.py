"""UI 冒烟：用 Streamlit AppTest 跑 app.py，断言明亮主题与主页结构存在。"""

from __future__ import annotations

from pathlib import Path

import pytest
from streamlit.testing.v1 import AppTest

_ROOT = Path(__file__).resolve().parent.parent
_APP = str(_ROOT / "app.py")


@pytest.fixture
def app() -> AppTest:
    at = AppTest.from_file(_APP)
    at.run(timeout=60)
    return at


def test_main_title_and_native_metrics(app: AppTest) -> None:
    joined = "\n".join(m.value for m in app.markdown if m.value)
    assert "FitQuest" in joined
    assert app.metric
    labels = [m.label for m in app.metric]
    assert any("当前等级" in (lbl or "") for lbl in labels)


def test_sidebar_nav_personal_home_default(app: AppTest) -> None:
    assert app.sidebar.radio
    opts = list(app.sidebar.radio[0].options)
    assert any("个人主页" in opt for opt in opts)
    assert any("任务中心" in opt for opt in opts)
    assert any("排行榜" in opt for opt in opts)
    assert any("数据分析" in opt for opt in opts)


def test_home_xp_medals_and_week_compare_metrics(app: AppTest) -> None:
    body = "\n".join(m.value for m in app.markdown if m.value)
    assert "勋章墙" in body
    assert "数据速览" in body
    assert app.metric
    labels = [m.label for m in app.metric]
    assert any("经验值" in (lbl or "") for lbl in labels)
    assert any("本周消耗" in (lbl or "") for lbl in labels)
    assert any("本周步数" in (lbl or "") for lbl in labels)
    assert any("活跃时长" in (lbl or "") for lbl in labels)


def test_navigate_to_analytics_no_vendor_caption(app: AppTest) -> None:
    # Find and select the analytics radio option (now has emoji prefix)
    opts = list(app.sidebar.radio[0].options)
    analytics_opt = next((o for o in opts if "数据分析" in o), opts[-1])
    app.sidebar.radio[0].set_value(analytics_opt)
    app.run(timeout=60)
    body = "\n".join(m.value for m in app.markdown if m.value)
    assert "能力雷达" in body
    assert "图表使用" not in body
    assert "streamlit-echarts" not in body


def test_repo_has_no_vendor_chart_strings() -> None:
    """业务代码中不出现图表栈说明类文案（tests 目录除外）。"""
    vendor = ("图表使用 Plotly", "streamlit-echarts", "若需 ECharts")
    skip_dirs = {"tests", ".venv", "__pycache__"}
    for path in _ROOT.rglob("*.py"):
        if any(part in skip_dirs for part in path.parts):
            continue
        text = path.read_text(encoding="utf-8")
        for needle in vendor:
            assert needle not in text, f"{path} contains {needle!r}"
