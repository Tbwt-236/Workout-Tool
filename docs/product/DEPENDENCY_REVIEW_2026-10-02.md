# 2026-10-02 依赖风险复核

本轮执行 `npm audit --json`，结果为15项传播告警：11 moderate、4 high、0 critical；不是15个互相独立的漏洞。三个根问题如下。Expo Doctor的21/21仅证明其工程检查通过，不代表安全审计通过。

| 根依赖 | 证据及当前影响 | 处理 |
| --- | --- | --- |
| node-forge 1.4.0 | [GHSA-86w9-cpqp-85rv](https://github.com/advisories/GHSA-86w9-cpqp-85rv)：官方当前无已发布修复版。4个high来自该问题向上层传播；Expo CLI证书工具链包含验签调用。当前业务源码无直接引用，没有EAS projectId或更新签名配置。 | 本地Android合成数据开发可继续；不引入远程签名/自定义证书输入。保留风险，签名、EAS、发布前重新检查。不能用未合并密码学补丁或降级Expo冒充修复。 |
| decode-uri-component 0.2.2 | [GHSA-vcc3-ghjq-m6fr](https://github.com/advisories/GHSA-vcc3-ghjq-m6fr)：错误百分号编码可能造成指数级解码。Router→query-string是运行时路径。修复0.5.0采用ESM，当前query-string以CommonJS直接调用。 | 保留当前原生路径白名单及实际Router恶意冷/热链接回归；不直接跨模块系统override。新增Web、通知或任意链接参数时重新审查；限制当前入口不等于依赖已修复。 |
| uuid 7.0.3 | [GHSA-w5hq-g745-h8pq](https://github.com/advisories/GHSA-w5hq-g745-h8pq)：v3/v5/v6外部缓冲区边界问题。当前xcode库只使用无参数v4。 | 当前调用不匹配漏洞触发方式；暂不为了告警计数跨大版覆盖。若后续升级，独立验证Xcode项目读写与ID生成及iOS prebuild。 |

已按官方版本检查更新同SDK57补丁（Expo57.0.26、constants57.0.20、linking57.0.11、router57.0.24），并为已批准浅色主题增加system-ui57.0.4。升级后audit仍为15项，未关闭上述根问题。没有执行`npm audit fix --force`、没有隐藏告警或安装未发布分支。

审查依据包括锁文件、实际依赖链、Expo CLI证书路径、`xcode/lib/pbxProject.js`的v4调用、官方npm元数据和上述公告。独立只读审查已完成风险分析；发布仍需结合实际渠道、签名方式和当时上游版本再判断。

日志：`/Users/qqqq/Documents/Codex/2026-09-12/gen/work/app-cycle-2026-10-02/dependency-audit.json`（升级前）与`sdk-patch-audit.txt`（升级后）。不把风险记录当作用户接受生产风险。

## 本步学习验收

目标L2：区分根漏洞、传播计数、实际调用暴露与兼容修复。练习：解释为何4个high不等于4个独立漏洞，以及为什么不能把Expo降级到很旧版本来追求audit归零。汇报口径：“工程兼容检查已恢复，依赖风险按实际调用范围登记，未声称上游漏洞消失。”未掌握时对照风险表与audit依赖链复述；学习待本人演示。
