# 鲜联集采项目说明

## 项目介绍

鲜联集采（FreshConnect）是一个面向餐饮企业、商超、团餐和农产品供应商的 B2B 批发采购平台。项目使用 Next.js 16 与 Payload CMS 构建，将多语言营销站、内容管理后台、企业采购内容和搜索能力整合在同一个应用中。

当前首页以“源头直采、标准化品控、冷链履约”为核心叙事，即使本地数据库尚未启动，也可以依赖静态翻译内容完成页面编译和 UI 开发；Header、Footer、文章、页面等内容仍可在 PostgreSQL 与 Payload 启动后由 CMS 管理。

## 主要能力

- 中英文国际化站点：`/zh` 与 `/en`
- B2B 农产品首页模板
- Payload CMS 管理后台与 REST/GraphQL API
- 页面、文章、媒体、分类、Header 和 Footer 内容管理
- 草稿、预览、重定向、SEO、搜索与表单插件
- PostgreSQL 数据存储和 Sharp 图片处理
- Docker、本地 Node.js 与 Vercel 部署基础

## 首页模板

首页入口：`src/app/[locale]/(frontend)/page.tsx`

首页展示组件：`src/components/HomePageSections/index.tsx`

当前包含以下模块：

1. Hero：平台定位、主次行动入口和供应看板
2. 核心数据：供应商、SKU、客户和覆盖城市
3. 商品品类：蔬菜、水果、肉禽蛋品、水产海鲜
4. 平台优势：源头认证、标准化品控、冷链运输、准时履约
5. 采购流程：企业认证、选品询价、确认订单、冷链交付
6. CTA：引导企业获取采购方案

首页文案全部来自 `messages/zh.json` 和 `messages/en.json` 的 `home` 命名空间。

## 技术栈

| 类型 | 技术 |
| --- | --- |
| Web 框架 | Next.js 16.3、React 19、App Router |
| 语言 | TypeScript |
| 样式 | Tailwind CSS 4 |
| 国际化 | next-intl 4 |
| CMS | Payload CMS 3.88 |
| 数据库 | PostgreSQL、`@payloadcms/db-postgres` |
| 富文本 | Payload Lexical Editor |
| UI | Radix UI、Lucide React |
| 测试 | Vitest、Playwright |
| 包管理 | pnpm |

## 路由设计

```text
src/app/
├── [locale]/
│   └── (frontend)/
│       ├── layout.tsx                  # 国际化前台根布局
│       ├── page.tsx                    # 首页
│       ├── [slug]/page.tsx             # Payload 自定义页面
│       ├── posts/
│       │   ├── page.tsx                # 文章列表
│       │   ├── [slug]/page.tsx         # 文章详情
│       │   └── page/[pageNumber]/      # 文章分页
│       └── search/page.tsx             # 搜索
├── (payload)/
│   ├── admin/                           # /admin
│   └── api/                             # /api、GraphQL
└── (frontend)/
    ├── next/                            # Preview、Seed 等系统端点
    └── (sitemaps)/                      # Sitemap route handlers
```

圆括号目录是 Next.js Route Group，不会出现在 URL 中；`[locale]` 是实际 URL 动态段。前台页面必须位于 `[locale]` 下，Payload 后台、API、预览和 sitemap 不添加语言前缀。

## 国际化结构

```text
src/i18n/
├── routing.ts       # locales、defaultLocale
├── navigation.ts    # 国际化 Link 和 Router
└── request.ts       # 按请求加载翻译

messages/
├── zh.json
└── en.json

src/proxy.ts         # next-intl 路由代理
```

默认语言为中文。访问 `/` 时由 next-intl 跳转到 `/zh`，英文站点使用 `/en`。

## 核心源码结构

```text
src/
├── app/                    # Next.js 路由
├── access/                 # Payload 访问控制
├── blocks/                 # Payload 页面布局块
├── collections/            # Pages、Posts、Media、Users、Categories
├── components/             # 通用组件和首页模板
├── endpoints/              # Seed 等服务端端点
├── fields/                 # Payload 可复用字段
├── Footer/                 # Footer Global 与组件
├── Header/                 # Header Global 与组件
├── heros/                  # Payload Hero 渲染器
├── hooks/                  # Payload/应用 Hooks
├── i18n/                   # next-intl 配置
├── plugins/                # Payload 插件配置
├── providers/              # Theme 等 React Provider
├── search/                 # Payload 搜索同步与组件
├── utilities/              # 数据、URL、SEO、预览工具
├── payload.config.ts       # Payload 主配置
└── payload-types.ts        # Payload 自动生成类型
```

## Payload 内容模型

- `Pages`：可视化页面及布局块
- `Posts`：文章、草稿、分类和 SEO
- `Media`：图片与媒体资源
- `Categories`：内容分类
- `Users`：后台用户与认证
- `Header` / `Footer`：全站导航与页脚全局配置

服务端代表用户调用 Payload Local API 时，应显式设置 `overrideAccess: false`；Hook 内嵌套写操作需要传递原始 `req`，以维持事务一致性。

## 本地开发

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

至少需要：

```env
DATABASE_URL=postgresql://payload:payload@127.0.0.1:5432/payload
PAYLOAD_SECRET=replace-with-a-long-random-secret
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

### 3. 启动 PostgreSQL

```bash
docker compose up -d postgres
```

请以 `docker-compose.yml` 中实际的 service 名称为准。

### 4. 启动开发服务器

```bash
pnpm dev
```

访问地址：

- 中文首页：`http://localhost:3000/zh`
- 英文首页：`http://localhost:3000/en`
- Payload 后台：`http://localhost:3000/admin`

## 常用命令

```bash
pnpm dev                 # 开发服务器
pnpm build               # 生产构建
pnpm start               # 启动生产构建
pnpm generate:types      # 生成 Payload 类型
pnpm generate:importmap  # 生成 Payload Admin import map
pnpm test:int            # 集成测试
pnpm test:e2e            # E2E 测试
```

不要同时运行 `next dev` 与 `next build`，两者会同时写入 `.next`，可能导致 Turbopack 增量缓存异常。

## 当前开发注意事项

- 完整构建会访问 PostgreSQL，因为文章和页面路由使用 `generateStaticParams` 查询 Payload。
- 数据库未启动时，TypeScript 和首页 UI 仍可开发，但完整 `pnpm build` 会在收集页面数据阶段失败。
- 修改 App Router 目录结构后应重启开发服务器；如 Turbopack 仍引用旧路由，可停止服务器后清理 `.next`。
- 新增 Payload 字段或集合后运行 `pnpm generate:types`。

## 后续建议

1. 将首页品类和经营数据逐步迁移为 Payload Global 或 Collection 配置。
2. 新增商品、供应商、询价单和采购订单集合。
3. 为首页 CTA 接入 Payload Form Builder。
4. 补充多语言 SEO alternate links 和 locale sitemap。
5. 为首页、语言切换和采购流程增加 Playwright E2E 测试。
