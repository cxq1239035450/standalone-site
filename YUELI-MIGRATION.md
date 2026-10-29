# Yueli Automation 本地迁移

分支：`yueliautomation`。技术栈沿用 Next.js 16、React 19、Payload CMS 3、PostgreSQL 16。

## 启动

本机双击 `D:\code\yueliautomation\start-dev.cmd`，或在本目录执行 `pnpm dev --hostname localhost`（数据库需已启动）。

- 网站：http://localhost:3000/
- 后台：http://localhost:3000/admin
- PostgreSQL：localhost:5433，独立数据库 `yueliautomation`。
- 第一次进入后台时，由你创建管理员账号。
- 开发模式使用 Webpack，避免当前 Windows 环境中的 Turbopack 编译异常。

## D 盘环境

- Node.js：`D:\dev-tools\node22`
- pnpm：`D:\dev-tools\pnpm`；依赖缓存：`D:\dev-cache\pnpm`
- npm 缓存：`D:\dev-cache\npm`
- 项目依赖：`D:\code\yueliautomation\node_modules`
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
- 迁移代码已按要求提交并推送到 GitHub 的 `yueliautomation` 分支（`67f460f`）；没有更改原站、DNS 或生产部署。后续网站结构优化的本地改动尚未提交推送。
- 上线时需设置正式 DATABASE_URL、PAYLOAD_SECRET、PREVIEW_SECRET、NEXT_PUBLIC_SERVER_URL，并在 Search Settings 更新 siteUrl、检查索引配置及备份策略。
- 本地验证产生一条标记为 LOCAL TEST ONLY 的测试询盘，可在后台识别。

## 本次验证

- TypeScript 类型检查通过；迁移数据、图片与 HTML 安全测试 4 项通过。
- 114 个原站/应用路由及站点文件检查完成；中文产品路径修复后复查通过。
- 浏览器验证首页轮播、设备相册、询盘成功状态；数据库核实询盘已保存。
- 后台首次创建管理员页面可访问；没有代你设置管理员密码。
- `pnpm build` 生产构建通过；生产服务核对首页、产品搜索、中文旧网址和后台。匿名读取询盘返回 403，缺少必填字段提交返回 400。

## 网站结构优化（参考 Minghang 架构分析）

本次借鉴采购决策路径，按 Yueli 实际设备目录组织内容：

```text
Home
├─ Products → 原分类 URL → 原产品 URL
├─ Solutions
│  ├─ drilling-tapping-machining
│  ├─ valve-faucet-production
│  └─ custom-equipment-projects
├─ Manufacturing → 工厂照片、公开证书、项目核对清单
├─ Resources
│  ├─ prepare-equipment-rfq
│  ├─ machine-selection-checklist
│  ├─ acceptance-and-delivery
│  ├─ Blog（保留 /blog 和文章原日期 URL）
│  └─ FAQ（保留 /faq）
├─ About Us
└─ Contact → 主题预填询盘与后续沟通步骤
```

新增内容在后台 **Solutions & buying guides** 集合维护，支持草稿和发布；分类的 **Buyer guidance** 字段维护采购摘要、选型说明和相关指南。内部 editorialNotes 不向匿名 API 返回。指南为采购准备内容，不代表设备性能或客户成果承诺。未新增缺少资料支持的客户案例、评价、认证或产能数字。

另一台电脑导入迁移数据后，再执行：

```powershell
pnpm migrate:yueli:architecture
```

脚本只允许本地 `yueliautomation` 数据库。重复执行保留已存在的指南和人工修改，仅创建缺失内容、补充空白分类采购说明；旧版导航会升级为新的六项导航。修改数据库结构前的本机备份在 `.backups/yueli-before-structure.dump`，不提交。

SEO/GEO 实现包括：可见面包屑与 BreadcrumbList 使用同一数据，Organization 与 WebSite 使用稳定 @id，文章出版者关联企业实体，新方案与指南进入 sitemap 和 llms.txt。产品列表分页采用自身规范 URL；搜索/筛选参数和无产品分类设置 noindex，robots 允许读取这些标记并抓取媒体图片，保留后台/API 的通用抓取限制。`/home` 永久重定向到 `/`，旧产品、文章和分类地址保留。

规范参考：[Google AI 搜索说明](https://developers.google.com/search/docs/appearance/ai-features)、[BreadcrumbList](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb)。结构化内容和标记不保证排名或 AI 引用；正式上线后的效果需使用实际搜索与询盘数据评估。

结构优化验证：7 项针对性测试、TypeScript、ESLint 和生产构建通过；123 个原有/新增页面及分页筛选入口回归无失败，新页面均包含在站点地图中。匿名接口不会返回内部编辑备注。浏览器检查桌面导航、390px 手机布局、菜单收起和询盘主题预填。生产服务验证新页面、后台、媒体抓取规则，以及无效分页/不存在内容的 not-found 与 noindex 标记。

## 2026-10-28 原站整站还原

已执行 `git fetch origin` 和 `git pull --ff-only origin main`，远端主分支为 `fe5435c`，当前迁移分支已包含该提交。保留本地原有未提交工作，本轮差异快照保存在 `.backups/before-replica.patch`，数据库完整备份在 `.backups/yueli-before-replica.dump`。

以原站浏览器实际可见内容为准，恢复六项导航、三列页脚、五张机器轮播的图层、原首页八个区块、工艺视频、四张工厂照片、16 张证书、FAQ 图片和两种联系二维码。关于、FAQ、联系和博客页保留原版 HTML 与样式，页面正文仍在 Payload Pages 的 `migration.contentHTML` 编辑；联系页表单由 React 接入 Payload，保留产品/项目预填。产品列表恢复原站顺序、四列卡片和 `?product-page=2/3` 分页，产品原始参数、折叠规格和详情样式保留。

最新快照：34 产品、61 产品分类、7 文章、9 页面、6 文章分类、24 标签，152 个素材全部下载成功，含 9.51 MB 视频和无损二维码。原 FAQ 外链图片需要来源 Referer 与浏览器请求头，采集器已处理，后续显示使用本地文件。原站使用的 Barlow 与 Inter 字体均在 `public/yueli-fonts/` 本地托管，并保存各自 OFL 许可。

文章旧日期网址、产品及层级分类网址继续保留；补齐 `/category/[slug]`、`/tag/[slug]`，29 个非空文章归档进入 sitemap。既有 Solutions、Manufacturing、Resources 内容及 URL 保留，主导航和首页按原站还原。

新增产品 Description / Reviews 标签页采用开源 [Radix Tabs](https://www.radix-ui.com/primitives/docs/components/tabs)，其余轮播、表单、FAQ 与菜单优先复用现有组件和原生交互。评价在后台 **设备评价审核 / Equipment reviews** 中处理：访客提交强制待审核，管理员发布后公开；邮箱仅后台可见，评分必须为 1–5 的整数。

复刻布局的独立采集/导入命令：

```powershell
pnpm migrate:yueli:collect
pnpm migrate:yueli:collect-layouts
pnpm migrate:yueli:import --refresh-site
pnpm migrate:yueli:import --refresh-product-layouts
pnpm migrate:yueli:import-layouts
pnpm migrate:yueli:import-taxonomies
pnpm migrate:yueli:verify
```

产品与页面的局部导入分别备份旧迁移字段到 `.backups/`，只修改明确选中的呈现内容；不改产品标题、相册、原生富文本字段或其他人工修改。分类/标签导入另存分类及文章关联备份。所有导入继续限制为本机独立 `yueliautomation` 数据库。

文章分类与标签已接入后台 Categories，按“产品分类 / 文章分类 / 文章标签”区分，Posts 的真实分类、标签关联驱动前台归档、文章侧栏和 sitemap。61 个产品分类的原 slug 保留，跨用途重名使用组合唯一索引区分；分类改名、关联清空、新增文章均已验证实时生效。`import-taxonomies` 默认保留非空人工关联，重复执行不改写现有内容。

所有已采集的本域图片、视频及二维码旧 `/wp-content/` 地址均永久跳转到本地副本，7 个旧 WordPress sitemap 入口永久跳转到新站点地图。采集器保留轮播参数列表结构和原 CSS 选择器权重，TA-12 三行参数、橙字、按钮边框与自适应蓝色底板已核对。

本轮验证：35 项专项测试、TypeScript 和相关 ESLint 通过；生产构建通过。154 个页面/归档/站点入口和 151 个本域旧素材链接的生产服务检查均无失败。浏览器验证桌面页面、390px 手机断点、六项菜单、产品预填与询盘提交，数据库确认新增一条标记 **LOCAL TEST ONLY - migration 2026-10-28** 的测试询盘。评价另外通过 9 项本地 REST 权限/评分/隐私校验；分类/标签通过实际后台数据变更验证。所有临时评价、分类与文章测试内容已清除。入口与旧素材网址的最终结果见 `.migration/replica-route-report.json`、`.migration/replica-asset-url-report.json`。

原站联系页正文仍使用 Ximei Village 地址、页脚使用 Maosheng Road 地址，本轮按两个页面原文保留。源码是英文；本机 Chrome 自动翻译会改写显示文字和 DOM，英文原文是视觉核对基准。当前仍为本地迁移预览，原站和 DNS 未改动；正式替换线上前需配置生产数据库、密钥、站点地址、SMTP 和邮件收件规则。

## 2026-10-28 内页显示修复

用户反馈后发现，上一轮网址响应检查未覆盖翻译状态下的页面可见性：Chrome 自动翻译替换文字节点后，React 客户端切页可能触发 `removeChild` 异常；博客迁入样式还包含 `.yb-blog { display: none }`，依赖新站没有的 WordPress `body.blog` 类。

前台内部链接改为原生整页跳转，博客显示规则和采集脚本同步修复；补充 `/equipment` 到 `/products` 的旧入口重定向。页脚定位、电话和邮箱统一使用已有开源 Lucide SVG 图标，明确固定为 24×24px；修正旧导航样式覆盖导致的深色链接，恢复浅色文字。Payload 后台导航不受此调整影响。

在自动翻译开启的 Chrome 中实际点击主导航，确认首页、产品目录、关于、博客、FAQ、联系页和 TA-12 产品详情正文可见，联系页表单存在，页脚三个 SVG 均为 24×24px。新增无 WordPress body 类时正文仍显示的回归检查；17 项专项测试、相关文件 ESLint 和生产构建通过。全项目 lint 仍有 5 个其他组件的既有 `set-state-in-effect` 错误。更新后的生产预览运行于 `http://localhost:3002`；可见性截图保存在 `.migration/fixed-blog-visible.jpg`。

## 2026-10-28 产品详情与 FAQ 截图调整

产品详情统一使用左侧章节导航、右侧技术正文的两栏布局，包含产品概述、技术范围、主要特点、应用和询价清单。优先复用已有 Radix Tabs 和原生 details 折叠表格；使用开源 htmlparser2 在服务端整理现有 CMS HTML，无须修改或重新导入产品记录。保留各型号参数、单位与多列表头，缺少固定参数的定制设备继续显示资料说明。原先错误指向首页的章节锚点修为当前页面跳转。手机端导航换行，参数表在内容宽度内显示。

FAQ 分类标题居中，问题文字和右侧圆形图标垂直对齐，圆内加减号使用居中的线条绘制。样式独立存于 `source-faq-overrides.css`，避免后续采集覆盖。主导航移除选中文字的下划线，保留橙色底部指示线。

专项检查对比了 34 个产品的每个参数单元格与五个章节锚点，另覆盖多列车床参数和无固定参数设备。浏览器验证桌面与 390px 手机布局、折叠与键盘展开、章节跳转、FAQ 展开和导航选中样式。截图位于 `.migration/product-detail-reference.jpg`、`.migration/product-detail-mobile.jpg` 和 `.migration/faq-centered.jpg`。
