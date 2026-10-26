# 本地验证的 Site Insights 接入包

这些 tgz 来自相邻独立仓库 `../site-insights`，不是 workspace 链接，不依赖本机绝对路径。提交/复制此网站时应一起保留这些包及锁文件。正式发布到 npm 私有或公共仓库后可替换为版本依赖。

配置：`src/integrations/insights/plugin.ts`（后台）和 `Client.tsx`（前台）。两个开关默认关闭。只读令牌不使用 `NEXT_PUBLIC_` 前缀。

后台卸载：移除 `src/plugins/index.ts` 末尾注册和 import、插件配置文件、payload-plugin 依赖。前台不受影响。

前台卸载：移除前台 layout 中的 `SiteInsights` 与 import，再移除 Client 文件和 browser-sdk 依赖。只读后台投影不受影响。

两侧均卸载后可删除 contracts 依赖和 pnpm override。本地询盘 CustomEvent 不采集内容、不发网络请求，没有监听器时无操作，也可按需移除。无数据库字段或迁移需要回滚。
