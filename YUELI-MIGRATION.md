# Yueli Automation 本地迁移

分支：`yueliautomation`。技术栈沿用 Next.js 16、React 19、Payload CMS 3、PostgreSQL 16。

## 启动

本机双击 `D:\code\standalone-site\start-dev.cmd`，或在本目录执行 `pnpm dev --hostname localhost`（数据库需已启动）。

- 网站：http://localhost:3000/
- 后台：http://localhost:3000/admin
- PostgreSQL：localhost:5433，独立数据库 `yueliautomation`。
- 第一次进入后台时，由你创建管理员账号。
- 开发模式使用 Webpack，避免当前 Windows 环境中的 Turbopack 编译异常。

## D 盘环境

- Node.js：`D:\dev-tools\node22`
- pnpm：`D:\dev-tools\pnpm`；依赖缓存：`D:\dev-cache\pnpm`
- npm 缓存：`D:\dev-cache\npm`
- 项目依赖：`D:\code\standalone-site\node_modules`
- Docker Desktop：`D:\DockerDesktop`
- Docker WSL 数据盘（镜像、容器、卷）：`D:\DockerData`
- PostgreSQL 镜像归档：`D:\DockerImages\postgres-16-alpine.tar`

`.env` 含本地密钥，不提交。原数据库 `vegetable-and-fruit-wholesale` 保留；原环境文件备份在 `.backups/.env.before-yueli`。切换原分支时，应同时切换数据库配置。

## 已迁移内容

从 https://yueliautomation.com/ 的公开 WordPress / WooCommerce 接口采集：34 个产品、61 个分类、7 篇文章、9 个页面记录、149 个图片资源。图片转为本地 WebP，字体本地托管并附 OFL 许可。

首页、产品列表、产品详情、分类、关于、FAQ、博客和联系页使用现有技术栈重新实现。原产品 URL、分类层级 URL、文章日期 URL 保留。首页轮播、产品相册、筛选、搜索、分页和询盘接入本地应用。

后台的 Equipment Site 管理 logo、导航、轮播、联系信息、工厂图片、证书和关联询盘表单。产品与文章在原生集合中编辑。迁移记录的 WordPress migration 字段保留来源 ID、原 URL、参数和 HTML；技术参数表优先显示该 HTML，修改这部分内容时请编辑 contentHTML。清空 contentHTML 后，产品和文章使用原生富文本字段。页面正文编辑 Pages 的 migration.contentHTML。

## 可重复采集和导入

```powershell
pnpm migrate:yueli:collect
pnpm migrate:yueli:import
```

采集仅读取原站。公开快照保存在 `src/data/yueli.json`，图片在 `public/yueli-assets/`；原始响应与检查报告在忽略提交的 `.migration/`。

导入程序只允许写入 localhost / 127.0.0.1 上名为 `yueliautomation` 的数据库。默认保留已导入记录及人工修改。明确要用采集快照覆盖迁移内容时才执行：

```powershell
pnpm migrate:yueli:import --refresh
```

首次迁移到另一台电脑，需要先创建数据库，配置 `.env`，安装依赖后执行导入。不要对线上数据库运行该本地导入脚本。

## 原站数据与上线前事项

- 5 篇 2026-07-28 的文章没有公开正文，已保留原摘要；没有补写文章。可在后台补充真实正文。
- 原站 Products 和 Blog 页面 API 返回重复的 FAQ 内容，迁移使用真实产品及文章集合重建这两个列表。
- 原站示例页面和产品模板预览页保留，但设置 noindex。
- 询盘已接入 Payload form-submissions，匿名可提交，仅登录用户可读取。默认未配置 SMTP，表单不发邮件；请在正式上线前配置邮件适配器和收件规则。
- 本次只安装与迁移到本地，没有更改原站、DNS 或生产部署，也没有推送 GitHub。
- 上线时需设置正式 DATABASE_URL、PAYLOAD_SECRET、PREVIEW_SECRET、NEXT_PUBLIC_SERVER_URL，并在 Search Settings 更新 siteUrl、检查索引配置及备份策略。
- 本地验证产生一条标记为 LOCAL TEST ONLY 的测试询盘，可在后台识别。

## 本次验证

- TypeScript 类型检查通过；迁移数据、图片与 HTML 安全测试 4 项通过。
- 114 个原站/应用路由及站点文件检查完成；中文产品路径修复后复查通过。
- 浏览器验证首页轮播、设备相册、询盘成功状态；数据库核实询盘已保存。
- 后台首次创建管理员页面可访问；没有代你设置管理员密码。
- `pnpm build` 生产构建通过；生产服务核对首页、产品搜索、中文旧网址和后台。匿名读取询盘返回 403，缺少必填字段提交返回 400。
