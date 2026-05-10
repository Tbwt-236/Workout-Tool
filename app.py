"""FitQuest — 游戏化运动激励工具（Streamlit 主入口）。"""

from __future__ import annotations

import streamlit as st

from components import analytics, home, social, tasks
from config import title_for_level
from utils import storage
from utils.gamification import compute_level_progress


def _inject_css() -> None:
    st.markdown(
        """
        <style>
        /* Metric 数字加大加粗 */
        div[data-testid="stMetricValue"] {
            font-weight: 900 !important;
            font-size: 2.5rem !important;
        }
        /* 隐藏顶部菜单和底部水印 */
        #MainMenu {visibility: hidden;}
        footer {visibility: hidden;}

        /* 卡片容器 */
        .fq-card {
            background: #FFFFFF;
            border: 1px solid #CBD5E1;
            border-radius: 12px;
            padding: 16px 20px;
            margin-bottom: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }

        /* 勋章卡片 */
        .fq-badge-card {
            background: #FFFFFF;
            border: 1px solid #CBD5E1;
            border-radius: 12px;
            padding: 20px 12px;
            text-align: center;
            transition: border-color 0.2s;
        }
        .fq-badge-card.unlocked {
            border-color: #FF5100;
            box-shadow: 0 0 0 1px rgba(255,81,0,0.2);
        }

        /* 任务行 */
        .fq-task-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 6px 0;
        }

        /* 动态墙条目 */
        .fq-feed-item {
            padding: 10px 0;
            border-bottom: 1px solid #CBD5E1;
        }

        /* 小节标题 */
        .fq-section-title {
            font-weight: 700;
            font-size: 1.05rem;
            color: #0F172A;
            margin-bottom: 8px;
        }

        /* 侧边栏分组间距 */
        section[data-testid="stSidebar"] .stMarkdown {
            margin-bottom: 0.25rem;
        }
        </style>
        """,
        unsafe_allow_html=True,
    )


def _on_nickname_change() -> None:
    """Callback: update user name directly without rerun."""
    nick = st.session_state.get("fq_nick_input", "")
    st.session_state.fq_user.name = (nick or "").strip() or "FitQuest 玩家"


@st.dialog("⚠️ 确认重置")
def _confirm_reset_dialog() -> None:
    st.markdown("这将**清除所有本地数据**并恢复演示初始状态。此操作不可撤销。")
    c1, c2 = st.columns(2)
    with c1:
        if st.button("确认重置", type="primary", use_container_width=True):
            storage.reset_demo()
            st.rerun()
    with c2:
        if st.button("取消", use_container_width=True):
            st.rerun()


def main() -> None:
    st.set_page_config(
        page_title="FitQuest · 游戏化运动激励",
        page_icon="⚡",
        layout="wide",
        initial_sidebar_state="expanded",
    )
    _inject_css()
    storage.init_session_state()
    user = st.session_state.fq_user

    level, xp_in, xp_need = compute_level_progress(user.total_xp)
    title = title_for_level(level)

    # ── 侧边栏：分区组织 ──
    with st.sidebar:
        st.markdown("### ⚡ FitQuest")
        st.caption("大学生游戏化运动激励 · 演示版")
        st.divider()

        # 导航区
        st.markdown("##### 📍 导航")
        page = st.radio(
            "导航",
            ["🏠 个人主页", "📋 任务中心", "🏆 排行榜", "📊 数据分析"],
            label_visibility="collapsed",
        )
        # strip emoji prefix for page routing
        page_clean = page.split(" ", 1)[1] if " " in page else page

        st.divider()

        # 个人设置区
        st.markdown("##### ⚙️ 个人设置")
        st.text_input(
            "显示昵称",
            value=user.name,
            max_chars=20,
            key="fq_nick_input",
            on_change=_on_nickname_change,
        )
        st.caption("修改后自动保存，用于排行榜与动态墙展示。")

        st.divider()

        # 数据管理区
        st.markdown("##### 💾 数据管理")
        c_save, c_reset = st.columns(2)
        with c_save:
            if st.button("💾 保存进度", use_container_width=True):
                storage.save_disk()
                st.toast("已保存到本地", icon="💾")
        with c_reset:
            if st.button("🔄 重置数据", use_container_width=True):
                _confirm_reset_dialog()

    # ── 主内容区 ──
    st.title("⚡ FitQuest")
    st.caption(f"Lv.{level} · {title} · 连续 {user.streak} 天")

    if page_clean == "个人主页":
        home.render_home(user)
    elif page_clean == "任务中心":
        tasks.render_tasks()
    elif page_clean == "排行榜":
        social.render_social()
    else:
        analytics.render_analytics()


if __name__ == "__main__":
    main()
