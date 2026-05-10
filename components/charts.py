"""折线图与雷达图（浅色画布、透明背景）。"""

from __future__ import annotations

import plotly.graph_objects as go
import streamlit as st

from config import COLORS

_GRID = "rgba(71, 85, 105, 0.25)"
_TICK = COLORS["muted"]

_CHART_CFG = {
    "displayModeBar": True,
    "displaylogo": False,
    "modeBarButtonsToRemove": ["lasso2d", "select2d"],
    "toImageButtonOptions": {"format": "png"},
}


def _light_layout(fig: go.Figure, height: int = 360) -> go.Figure:
    fig.update_layout(
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        font=dict(color=_TICK, size=13),
        margin=dict(l=24, r=24, t=32, b=24),
        height=height,
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
    )
    return fig


def render_weekly_steps_line(dates: list[str], values: list[int], height: int = 320) -> None:
    fig = go.Figure()
    fig.add_trace(
        go.Scatter(
            x=dates,
            y=values,
            mode="lines+markers",
            name="步数",
            line=dict(color=COLORS["accent"], width=3),
            marker=dict(size=9, color=COLORS["accent2"]),
            fill="tozeroy",
            fillcolor="rgba(255, 81, 0, 0.14)",
        )
    )
    fig.update_xaxes(
        type="category",
        showgrid=True,
        gridcolor=_GRID,
        zeroline=False,
        linecolor=_GRID,
        tickfont=dict(color=_TICK, size=12),
    )
    fig.update_yaxes(
        gridcolor=_GRID,
        zeroline=False,
        linecolor=_GRID,
        tickfont=dict(color=_TICK, size=12),
    )
    _light_layout(fig, height=height)
    st.plotly_chart(
        fig,
        use_container_width=True,
        config=_CHART_CFG,
        key="weekly_steps_line",
    )


def render_ability_radar(indicators: list[str], values: list[int], height: int = 400) -> None:
    fig = go.Figure()
    fig.add_trace(
        go.Scatterpolar(
            r=values + [values[0]],
            theta=indicators + [indicators[0]],
            fill="toself",
            fillcolor="rgba(5, 150, 105, 0.2)",
            line=dict(color=COLORS["accent"], width=2),
            name="本周画像",
        )
    )
    fig.update_layout(
        polar=dict(
            bgcolor="rgba(248, 250, 252, 0.85)",
            radialaxis=dict(
                visible=True,
                range=[0, 100],
                gridcolor=_GRID,
                linecolor=_GRID,
                tickfont=dict(color=_TICK, size=11),
            ),
            angularaxis=dict(
                rotation=90,
                direction="counterclockwise",
                gridcolor=_GRID,
                linecolor=_GRID,
                tickfont=dict(color=_TICK, size=11),
            ),
        ),
        showlegend=False,
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        font=dict(color=_TICK, size=13),
        margin=dict(l=48, r=48, t=32, b=32),
        height=height,
    )
    st.plotly_chart(
        fig,
        use_container_width=True,
        config=_CHART_CFG,
        key="ability_radar",
    )
