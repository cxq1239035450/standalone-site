# PawSupply 服务器部署

性能与缓存更新请参阅 [实施及部署手册](../docs/performance-cache-operations.md)：本次不改数据库结构，提供 `pnpm migrate:media-cache` 文件预检查与 `--apply` 预热；应用与 Nginx 必须使用同一媒体快照目录。

服务器：`38.76.170.123`。本次部署仅包含 standalone-site。

## 目录和服务

- 网站：`http://38.76.170.123/zh`，英文：`/en`，后台：`/admin`。
- 版本目录：`/opt/standalone-site/releases/20261015-01`。
- 当前版本软链接：`/opt/standalone-site/current`。
- 生产配置：`/opt/standalone-site/shared/site.env`，由 root 管理、pawsite 用户只读。
- 上传媒体：`/opt/standalone-site/shared/media`，跨版本持久保存。
- PostgreSQL：容器 `standalone-site-db`，数据目录 `shared/postgres`，仅监听 `127.0.0.1:5433`。
- 初始数据库备份：`/opt/standalone-site/shared/backups/initial.dump`。
- 应用：systemd 服务 `standalone-site`，以 pawsite 用户监听 `127.0.0.1:3000`。
- Nginx：`/etc/nginx/sites-available/standalone-site`，监听 80。

Node.js 22.23.3、pnpm 10.27.0；使用锁文件安装依赖。生产构建在 Linux 服务器完成，不上传 Windows node_modules 或构建缓存。运行时环境由 systemd EnvironmentFile 注入，构建时通过版本目录中的 `.env` 软链接读取。

当前 443 端口由已有 OpenVPN 使用，因此网站使用 HTTP。本次不变更 OpenVPN。配置 HTTPS 需要后续确定域名及可用的 TLS 入口。

## 日常操作

```sh
systemctl status standalone-site --no-pager
journalctl -u standalone-site -n 100 --no-pager
systemctl restart standalone-site
docker ps --filter name=standalone-site-db
nginx -t
```

后台沿用迁移前的网站账号；SSH 账号与网站后台账号不同。未配置邮件适配器，询盘保存到 CMS；启用邮件通知前应配置真实发信服务。

## 更新与回滚

1. 为每次发布创建新的 releases 子目录，上传源文件、锁文件和 vendor 包；排除 `.env`、node_modules、.next、.git、备份和本地部署暂存区。
2. 将版本目录的 `.env` 链接到 shared/site.env，public/media 链接到 shared/media。
3. 在该版本目录中以 pawsite 用户执行 `pnpm install --frozen-lockfile` 和 `pnpm build`。公开站点 URL 必须在构建前设置。
4. 涉及数据库结构变化时先备份，再审阅并应用 Payload 迁移；生产启动不启用自动 schema push。
5. 构建成功后将 current 指向新版本，重启 standalone-site 并检查中英文页面、后台、询盘、站点地图及日志。
6. 无不兼容数据库变更时，回滚 current 到上一版本并重启。不要删除 shared 数据目录。

数据库和媒体备份应一起保留。可执行 `deploy/backup.sh` 创建本地服务器备份；应另行复制到独立存储。未自动设置备份计划。

SSH 密码与生产密钥不写入本文件或版本控制。


## 本次验收（2026-10-15）

- Linux 生产构建与 TypeScript 检查通过；服务和数据库均已启用重启恢复。
- 公网中英文首页、产品、询盘、文章、搜索、后台登录页、图片、sitemap.xml、robots.txt、llms.txt 返回正常。
- canonical、站点地图与机器可读说明使用服务器地址，无 localhost 链接。
- 浏览器确认全部首页图片加载成功，后台登录页无控制台错误。
- 公网询盘 POST 返回 201；核对数据库中可选电话和 not-sure 数量正确保存，只清理本次专用 QA 记录。
- 匿名用户接口返回 403，`.env` 请求返回 404。
- 实际访问截图：site-live.png。
