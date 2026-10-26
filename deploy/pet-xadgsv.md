# pet.xadgsv.com 部署记录

部署日期：2026-10-26。服务器：149.28.74.130，宝塔管理。

- 中文网站：https://pet.xadgsv.com/zh
- 英文网站：https://pet.xadgsv.com/en
- CMS 后台：https://pet.xadgsv.com/admin（沿用原数据库中的账号）
- 宝塔网站列表：`pet.xadgsv.com`，备注 PawSupply 宠物用品 B2B。
- 应用目录：`/opt/pet-site/releases/20261026`。
- Compose：`/opt/pet-site/compose.yml`，对应本目录 `compose.pet.yml`。
- 数据库：`pet-site-db-1`，PostgreSQL 16，无宿主机端口映射。
- 应用：`pet-site-app-1`，非 root 用户，监听宿主机 `127.0.0.1:3100`。
- 持久数据：`/opt/pet-site/shared/postgres`、`/opt/pet-site/shared/media`。
- 私有配置：`/opt/pet-site/.env`、`/opt/pet-site/shared/site.env`，权限 600。
- 初始备份：`/opt/pet-site/upload/database.dump`；来自恢复后的本地数据库，含 5 个产品、3 个行业模板。
- Nginx：`/www/server/panel/vhost/nginx/pet.xadgsv.com.conf`；代理配置位于其 `proxy/pet.xadgsv.com/` 子目录。
- Let's Encrypt 证书由宝塔签发管理，本次证书到期 2027-01-24；已开启 HTTP 跳转 HTTPS。保留宝塔验证路径以供续签。

## 维护

在宝塔终端执行：

```sh
cd /opt/pet-site
docker compose ps
docker compose logs --tail 100 app
docker compose restart app
```

备份数据库（文件保存在私有目录）：

```sh
cd /opt/pet-site
umask 077
mkdir -p shared/backups
docker compose exec -T db pg_dump -U pet_site -d pet_site -Fc --no-owner --no-acl > "shared/backups/database-$(date +%Y%m%d-%H%M%S).dump"
```

更新前备份数据库和 media，使用新的版本目录构建，修改 Compose 的应用挂载目录后重新创建应用容器。不要把源码、环境变量或数据库备份放入 `/www/wwwroot/pet.xadgsv.com`。

生产构建使用 Linux Node 22、pnpm 10.27.0 和锁文件；`NEXT_PUBLIC_SERVER_URL=https://pet.xadgsv.com` 在构建时注入。反向代理必须保留 `X-Forwarded-Proto $scheme` 和 `X-Forwarded-Host $host`，否则语言链接会错误使用 HTTP。

四款新增宠物用品为概念选品示例，保留页面中的样品和规格确认说明。邮件通知尚未配置，询盘通过 CMS 保存。

## 2026-10-26 内容更新

当前应用版本目录：`/opt/pet-site/releases/20261026-content`。
新增中国采购团队、数十家长期合作工厂及厦门港/天津港/广州港物流模块，中英文页面和 llms.txt 同步；更新默认 SEO 描述与 Organization 中国地址信息。

独立目录生产构建成功后切换应用容器，原版本 `/opt/pet-site/releases/20261026` 和 Compose 备份 `/opt/pet-site/compose.before-content.yml` 保留。数据库和上传目录继续共用。

上线验证：首页中英文、关于我们、采购方案、llms.txt、后台登录页与 Google 验证文件均返回 HTTP 200，港口文案已生效。
