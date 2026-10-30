# Yueli Automation 宝塔部署

本说明只适用于服务器 `149.28.74.130` 上的 Yueli 站点。`deploy/README.md` 描述的是另一台服务器上的 PawSupply，不应套用其中的目录、服务名和端口。

## 发布状态

2026-10-30 已完成正式域名切换。发布分支为 `origin/yueliautomation`，准确运行提交以服务器 `current-commit.txt` 为准；数据库和媒体已恢复，Google Search Console 已成功处理新 sitemap。GA4 按用户要求暂不启用。

当前域名分工：

| 地址 | 应用 | 入口 |
| --- | --- | --- |
| `https://yueliautomation.com` | Next.js + Payload 新站 | 宝塔 Nginx → `127.0.0.1:3120` |
| `https://demo.yueliautomation.com` | 原 WordPress 站 | 宝塔 Nginx + PHP 8.2 |

两站分别使用 PostgreSQL 和原 WordPress 数据库。WordPress 文件继续位于 `/www/wwwroot/yueliautomation.com`；域名迁移不需要重建原数据库或移动该目录。主域切换后，该目录仍是 demo 的真实站点根目录，不能删除或覆盖。

## 新站运行环境

| 项目 | 实际配置 |
| --- | --- |
| 部署根目录 | `/opt/yueli-site` |
| Compose 文件 / 项目名 | `/opt/yueli-site/compose.yml` / `yueli-site` |
| 应用容器 / 服务名 | `yueli-site-app-1` / `app` |
| 数据库容器 / 服务名 | `yueli-site-db-1` / `db` |
| 应用端口 | 宿主 `127.0.0.1:3120` → 容器 `3000` |
| 运行时镜像 | 已有 `pet-site-runtime:20261026` |
| Node.js / pnpm | `22.23.4` / `10.27.0` |
| PostgreSQL | `postgres:16-alpine`，不映射宿主端口 |
| PostgreSQL 库 / 用户 | `yueliautomation` / `yueli` |
| 当前版本目录 | `/opt/yueli-site/releases/20261030-seo-mail` |
| 实际代码版本记录 | `/opt/yueli-site/current-commit.txt` |
| 持久媒体 / 数据 | `/opt/yueli-site/shared/media` / `shared/postgres` |
| 私有运行配置 | `/opt/yueli-site/shared/site.env`、`shared/db.env` |

应用以 UID/GID `1000:1000` 运行，版本目录挂载为 `/app`，共享媒体挂载为 `/app/public/media`。应用和数据库设置了 `restart: unless-stopped`。运行镜像也用于其他项目；更新本项目不能删除、重打标签或覆盖该共享镜像。

`current` 软链接用于识别版本；**Compose 实际绑定的是具体 releases 目录**。只修改软链接不会切换运行中的代码。

生产 `site.env` 的 `NEXT_PUBLIC_SERVER_URL` 与数据库 `search_settings.site_url` 均应为 `https://yueliautomation.com`，`ENABLE_DYNAMIC_CONTENT=true`。前者还用于 Payload `serverURL`、CORS 与构建，后者用于 canonical、结构化数据、sitemap、robots 和 llms.txt。不要只改其中一个。生产配置文件、数据库转储和备份不进入 Git，也不放入 Web 根目录。

## 数据库基线

本次部署恢复的是已完成动态多语言迁移及英文发布的完整数据库，共 206 张 public 基础表；英文已发布 34 个产品、7 篇文章、9 个页面。中文默认语言与原草稿状态保持不变。这些数量是本次恢复基准，后续正常编辑可能改变数量。

`payload.config.ts` 使用 `push: false`，迁移目录为 `src/migrations/yueli`。既有迁移记录包含 `dev` 历史记录和已核对的 Yueli 增量基线。**禁止重跑通用初始化迁移、清空迁移记录，或用开发模式 schema push 修复生产库。** 完整恢复的数据库不需要再执行本次语言迁移。

后续发布若包含新结构迁移，先核对实际库的 `payload_migrations` 与结构，再备份并在独立副本验证，只执行尚未应用且经审核的增量。多个分支连接同一数据库时，只迁移一次。

```sh
docker compose -f /opt/yueli-site/compose.yml exec -T db \
  psql -U yueli -d yueliautomation -v ON_ERROR_STOP=1 \
  -c 'SELECT name, batch FROM payload_migrations ORDER BY id;'
```

## 日常检查

```sh
docker compose -f /opt/yueli-site/compose.yml ps
docker compose -f /opt/yueli-site/compose.yml logs --tail=100 app
docker compose -f /opt/yueli-site/compose.yml exec -T db \
  pg_isready -U yueli -d yueliautomation
curl -fsSI http://127.0.0.1:3120/
curl -fsSI https://yueliautomation.com/
nginx -t
```

应用环境变量改变后，需要重新创建应用容器，单纯 `restart` 不会重新加载 Compose 的 `env_file`：

```sh
docker compose -f /opt/yueli-site/compose.yml up -d --no-deps --force-recreate app
```

不要执行无范围的 Docker 清理、全局停止容器或 `docker compose down -v`；同机还运行其他站点。

## 备份

数据库、上传媒体、运行配置、当前代码版本和 Nginx 配置应作为同一批发布资料保留。需要一致的数据库与上传文件快照时，先暂停后台写入、上传及相关定时任务；备份窗口结束后恢复。`pg_dump` 自身提供数据库一致性快照，但不能自动保证跨数据库与文件的同一时刻状态。

以下为服务器上的新站备份示例，不输出密码：

```sh
set -eu
umask 077
base=/opt/yueli-site
backup="$base/backups/release-$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$backup"
docker compose -f "$base/compose.yml" exec -T db \
  pg_dump -U yueli -d yueliautomation --format=custom > "$backup/database.dump"
tar -C "$base/shared" -cf "$backup/media.tar" media
cp -p "$base/compose.yml" "$backup/compose.yml"
cp -p "$base/shared/site.env" "$backup/site.env"
cp -p "$base/shared/db.env" "$backup/db.env"
readlink -f "$base/current" > "$backup/release-path.txt"
sha256sum "$backup/database.dump" "$backup/media.tar" > "$backup/SHA256SUMS"
```

另保存当前 `current-commit.txt` 和本次涉及的宝塔 Nginx、伪静态、证书配置。私有配置保持仅管理员可读。备份应复制到独立存储，并在独立 PostgreSQL 16 实例恢复验证；不要用覆盖线上数据库的方式验证备份，也不要在运行时直接复制 `shared/postgres` 充当逻辑备份。

原 WordPress 已有备份 `/opt/yueli-site/backups/wordpress-before-20261030`，含 SQL、站点文件 tar、Nginx 与伪静态配置；SQL 已在隔离 MySQL 副本恢复，88 张表核对通过。正式改域名前已追加 `wordpress-cutover.sql`，调整相对导航前又追加 `wordpress-before-relative-links.sql`。

## 后续代码更新

1. 记录当前代码提交、Compose 挂载路径和版本目录，完成上述备份。每次发布创建新的 `releases/<日期-提交>` 目录，保留上一版。
2. 上传已提交源码、`pnpm-lock.yaml`、`vendor/` 本地依赖包和公共静态文件。排除 `.env`、`.git`、`.backups`、`.deployment`、Windows `node_modules`、`.next`。共享媒体继续由单独挂载提供；不要用发布包覆盖现有上传文件。
3. 以现有 Linux 运行镜像安装锁定依赖并构建。构建前加载正确生产环境，并确保版本目录 UID/GID 为 `1000:1000`。可用 Compose 一次性容器覆盖 `/app` 挂载到新版本目录，执行 `pnpm install --frozen-lockfile && pnpm build`；此时正式 app 仍运行旧目录。不要直接在运行中的版本目录构建或替换依赖。
4. 若涉及数据库迁移，按前述独立副本流程验证，安排写入暂停窗口后应用。代码发布不等于需要再次搬迁全部内容。
5. 构建成功后，备份并修改 Compose 中 app 的 `/app` 绑定目录；同步 `current` 软链接及 `current-commit.txt`，执行 `up -d --no-deps --force-recreate app`。共享媒体、数据库挂载保持原位置。
6. 先检查 `127.0.0.1:3120`，再检查公网 HTTPS、页面、后台、媒体、SEO 输出及日志。失败时按下面步骤回滚。

`NEXT_PUBLIC_*` 变量会参与前端构建，修改正式 URL 后应重建。`GA_MEASUREMENT_ID` 和 `GOOGLE_SITE_VERIFICATION` 为服务端读取，修改后重新创建应用容器即可。

## WordPress 改域与 Nginx

正式切换前，先验证新应用、demo DNS、demo HTTPS 证书及 PHP 路由。WordPress 的站点地址和库内引用需通过支持 PHP 序列化数据的 WP-CLI `search-replace` 处理：先 dry-run、核对范围，再执行；跳过 GUID 列，不使用普通 SQL 字符串替换。确认目标为 `/www/wwwroot/yueliautomation.com` 及其实际连接数据库，保留原库。

主域 Nginx 切换为反向代理 `127.0.0.1:3120`，传递原始 Host、协议及客户端转发头；demo 使用原 WordPress 根目录与 PHP 8.2 伪静态。修改前保存目标站点配置，执行 `nginx -t` 成功后再平滑 reload。不要改动其他域名的配置。

demo 作为旧站副本应输出 `noindex`，避免与正式域名产生重复索引；同时核对 WordPress 的搜索引擎可见性配置。`noindex` 不是身份认证或访问限制。主域 sitemap 只包含主域可公开页面，不能加入 demo URL。证书继续由宝塔管理并保持续签，不在代码部署时覆盖证书或私钥。

## 回滚

**应用代码回滚：** 若数据库仍与上一版兼容，恢复上一版 Compose 的 app 挂载路径，恢复对应 `current` / `current-commit.txt`，重新创建 app 容器。不要恢复旧数据库来代替普通代码回滚，否则会丢失上线后的新内容和询盘。

**恢复 WordPress 为主站：** 暂停两站写入并分别追加备份；先评估 demo 上是否已发生新编辑。通过 WP-CLI dry-run 后将 demo 域名引用改回主域，保留 GUID，检查 home/siteurl；恢复已备份的主域 WordPress Nginx/伪静态配置，处理 demo 绑定，`nginx -t` 成功后 reload。保留 Next 应用、PostgreSQL、媒体和备份，便于排障及再次上线。

**不兼容数据库迁移回滚：** 先在独立库恢复发布前备份并验证，再协调应用版本和数据库连接切换；同时处理迁移后新写入的数据。不得直接导入旧转储覆盖仍在服务的库。WordPress 与 Payload 的恢复分别进行，不能混用两者转储。

## Google 与搜索发现

- 正式 canonical、sitemap、robots、llms.txt 使用 `https://yueliautomation.com`；后台保持 `noindex, nofollow`，已关闭无用途的动态后台分享图。
- Search Console 的 `https://yueliautomation.com/` URL 前缀属性已验证；公开验证文件 `public/google4c5577385832e111.html` 与用户提供的文件一致。已提交 `https://yueliautomation.com/sitemap.xml`，Google 于 2026-10-30 显示成功处理，发现 106 个页面。既有 WordPress sitemap 提交记录保留。
- 本次用户选择暂时跳过 GA4。代码已支持 `GA_MEASUREMENT_ID`，未配置时不会加载 Google Analytics。
- 后续接入真实 GA4 Web 数据流时，在 Enhanced measurement 中关闭自动 history-based pageviews 及自动 form interactions。本站会发送一次初始 `page_view` 和每次前端路由变化的 `page_view`，避免重复；页面及 referrer URL 去掉查询参数和 hash，不发送询盘内容。禁用广告个性化与 Google signals。
- GA 只在生产环境且浏览器 origin 与正式站点 origin 相同的情况下运行；接入后用 GA Realtime / DebugView 核对首次与切页事件。后台、localhost 和 demo 不应计入正式站统计。

## 2026-10-30 SEO 与询盘邮件增量发布

本次候选源码起点为 `0507110`，包含 main 的 SEO 发现、询盘邮件、按表单转发及完整询盘标签同步。发布分支为 `yueliautomation`。

三个已审核增量按顺序执行：`20261030_050000_seo_discovery`、`20261030_060000_inquiry_mail_notifications`、`20261030_070000_form_mail_routing`。保留 `dev/-1` 和四条已验证基线，禁止重跑通用初始化或 schema push。

`src/scripts/migrate-yueli-release.ts` 要求明确目标库、非空备份文件、已验证的四条基线，只接受三个全部待迁移或全部已迁移状态。三个增量及真实完成记录在同一事务写入，失败回滚，重复执行不产生变更。此工具仅适用于本批发布，后续新增迁移需重新审核。

独立验证库为 `yueli_seo_mail_check_20261030`，仅通过 Docker 内网访问。副本环境关闭邮件调度、SMTP 凭据、Matomo、GA 和 Insights。候选应用只绑定回环地址 `127.0.0.1:3121`；验收后移除测试容器，保留验证库和报告。

首次恢复验证备份为 `/opt/yueli-site/backups/seo-mail-20261030T142230Z`，媒体恢复后 701 个文件 SHA256 一致。正式迁移前暂停主站写入并另作最终备份，路径记录在 `/opt/yueli-site/seo-mail-production-backup-path.txt`。

在候选源码挂载为 `/app`、私有备份挂载为 `/release-backup` 的 Linux 一次性容器执行，环境来自对应目标库的私有配置：

```sh
node deploy/scripts/audit-database.mjs before /release-backup/before.json
pnpm exec tsx src/scripts/migrate-yueli-release.ts --database=目标库名 --backup=/release-backup/database.dump
pnpm exec tsx src/scripts/migrate-yueli-release.ts --database=目标库名 --backup=/release-backup/database.dump --apply
node deploy/scripts/audit-database.mjs after /release-backup/before.json
pnpm exec tsx src/scripts/verify-yueli-release.ts
```

审计工具逐表比较原始列投影、记录数、数据哈希，覆盖关联、翻译、版本、草稿和询盘，只保存哈希与数量，不保存内容或凭据。新增迁移记录单独核对。

副本结果：原 206 张表数据保持；模型 1,979 列存在；英文发布 34 产品、7 文章、9 页面；匿名表单无邮件字段，匿名访问邮件配置和投递记录被拒绝；重复迁移无变更。Linux 锁定依赖安装和生产构建通过。本地 `pnpm exec vitest run --config vitest.config.mts --maxWorkers=2` 全量通过：42 文件、182 测试。默认高并发曾导致 34 产品 HTML 比对超时，降低并发后完整复测通过，未放宽断言。

邮件全局开关和 `INQUIRY_EMAIL_AUTORUN` 保持关闭，未发送真实测试邮件。主站 Matomo 继续使用 Site ID 1，demo 保持关闭，历史统计保留。GA4 按用户要求暂不启用。

服务器日志：`/opt/yueli-site/seo-mail-copy.log`、`seo-mail-build.log`、`seo-mail-http.log`、`seo-mail-production.log`。正式库前后审计报告在最终备份目录；本地匿名 HTTP 最终报告在忽略目录 `.deployment/production-seo-mail-final.json`。数据库、配置、私有报告不提交 Git。
正式库已于 2026-10-30 14:49 UTC 完成三项增量，迁移前完整备份为 `/opt/yueli-site/backups/seo-mail-production-20261030T144919Z`。该数据库备份已恢复到独立库 `yueli_release_restore_20261030`，恢复无错误。正式库原 206 表数据哈希不变，模型字段和发布内容读取、匿名权限、幂等复跑全部通过；数据库迁移后自动恢复原应用，随后切换候选代码。