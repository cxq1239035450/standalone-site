// @vitest-environment node
import {describe,expect,it,vi,beforeEach} from 'vitest'
import type {Payload} from 'payload'
import type {SearchSetting,User} from '@/payload-types'
import {canonicalURL,robotsData,robotsText,sitemapText,settingsWarnings} from '@/utilities/discoveryRules'
const {reader,raw}=vi.hoisted(()=>({reader:{find:vi.fn(),findByID:vi.fn(),findGlobal:vi.fn()},raw:{find:vi.fn(),findGlobal:vi.fn()}}))
vi.mock('@payload-config',()=>({default:{}}))
vi.mock('@/i18n/content',()=>({createContentReader:()=>reader}))
vi.mock('@/utilities/searchSettings',()=>({siteOrigin:(value?:string)=>new URL(value||'https://example.com').origin}))
import {loadDiscovery,llmsEntries,llmsText,canonicalDetails} from '@/utilities/discovery'
import {seoEndpoints} from '@/i18n/seoEndpoints'

const settings = (override:Partial<SearchSetting>={})=>({id:1,siteName:'Example',siteUrl:'https://example.com',allowIndexing:true,allowCrawling:true,geo:{enabled:true},...override}) as SearchSetting
const language = (id:number,code:string)=>({id,code,label:code,enabled:true})
const user={id:1} as User
beforeEach(()=>{
  vi.clearAllMocks()
  raw.find.mockResolvedValue({docs:[language(1,'zh'),language(2,'en')]})
  raw.findGlobal.mockResolvedValue({defaultLanguage:1})
  reader.find.mockResolvedValue({docs:[]})
  reader.findGlobal.mockResolvedValue(settings())
})

describe('Discovery outputs and authenticated previews',()=>{
  it('keeps Yueli English and imported article URLs in SEO previews', async () => {
    const yueli = {...raw, collections:{'equipment-content':{}}}
    reader.find.mockImplementation(async({collection,locale})=>({docs:locale !== 'en' ? [] : collection === 'products'
      ? [{id:9,slug:'machine',title:'Machine',discovery:{}}]
      : collection === 'posts' ? [{id:10,slug:'news',title:'News',migration:{sourcePath:'/2026/03/01/news/'}}] : []}))
    const data = await loadDiscovery({payload:yueli as unknown as Payload})
    expect(data.entries.find(entry=>entry.id===9)?.url).toBe('https://example.com/product/machine')
    expect(data.entries.find(entry=>entry.id===10)?.url).toBe('https://example.com/2026/03/01/news/')
    expect(data.entries.some(entry=>entry.url.includes('/en/'))).toBe(false)
    reader.findByID.mockResolvedValue({id:9,slug:'machine',discovery:{}})
    expect((await canonicalDetails(data,{source:'products',id:9,lang:'en'})).canonical).toBe('https://example.com/product/machine')
  })
  it('separates crawl controls from indexing and preserves protected paths for named crawlers',()=>{
    const rule = settings({allowIndexing:false,robotsRules:[{userAgent:'ExampleBot',allow:'/catalog',disallow:'/private'}]})
    const text=robotsText(rule,'https://example.com')
    expect(text).toContain('User-Agent: *\nAllow: /\nAllow: /api/media/file/\nDisallow: /admin')
    expect(text).toContain('User-Agent: ExampleBot\nAllow: /catalog\nDisallow: /admin')
    expect(text).not.toContain('Sitemap:')
    expect(robotsText({...rule,allowCrawling:false},'https://example.com')).not.toContain('Allow:')
    expect(settingsWarnings({...rule,allowCrawling:false})).toHaveLength(1)
    expect(robotsData(settings(),'https://example.com').sitemap).toBe('https://example.com/sitemap.xml')
  })
  it('rejects unsafe canonical overrides and escapes sitemap XML',()=>{
    expect(canonicalURL('https://example.com/zh/a','javascript:alert(1)')).toBe('https://example.com/zh/a')
    expect(canonicalURL('https://example.com/zh/a','https://user:pass@example.com/a')).toBe('https://example.com/zh/a')
    expect(canonicalURL('https://example.com/zh/a','https://example.com/zh/b')).toBe('https://example.com/zh/b')
    expect(sitemapText([{url:'https://example.com/zh/a&b',canonical:'',language:'zh',source:'pages',title:'test',included:true,eligible:true,reason:''}])).toContain('a&amp;b')
  })
  it('excludes non-self canonicals/noindex and does not read content drafts for SEO draft previews',async()=>{
    reader.find.mockImplementation(async({collection,locale})=>({docs:collection==='products'&&locale==='zh' ? [
      {id:1,slug:'public',title:'公开',discovery:{},updatedAt:'2026-10-30T00:00:00Z'},
      {id:2,slug:'hidden',title:'隐藏',discovery:{noIndex:true}},
      {id:3,slug:'duplicate',title:'重复',discovery:{canonicalUrl:'https://example.com/zh/products/public'}},
    ]:[]}))
    const data=await loadDiscovery({payload:raw as unknown as Payload,draft:true,user})
    expect(data.entries.find(row=>row.id===1)?.included).toBe(true)
    expect(data.entries.find(row=>row.id===2)?.reason).toBe('内容设置 noindex')
    expect(data.entries.find(row=>row.id===3)?.reason).toBe('canonical 指向其他地址')
    expect(data.entries.filter(row=>row.language==='en'&&row.id)).toHaveLength(0)
    expect(reader.find.mock.calls.every(([args])=>args.draft===false)).toBe(true)
    expect(reader.findGlobal.mock.calls.every(([args])=>args.draft===true)).toBe(true)
    expect(raw.find.mock.calls[0][0]).toMatchObject({where:{enabled:{equals:true}},overrideAccess:false})
    const published=await loadDiscovery({payload:raw as unknown as Payload})
    expect(sitemapText(published.entries)).not.toContain('/duplicate')
  })
  it('uses each language own published text and resolves only eligible recommended content',async()=>{
    reader.findGlobal.mockImplementation(async({locale})=>settings({geo:{enabled:true,summary:locale==='en'?'English summary':'中文简介',sections:[{title:'精选',links:[
      {label:'公开推荐',content:{relationTo:'products',value:1}},
      {label:'草稿泄漏',content:{relationTo:'products',value:99}},
      {label:'禁止索引泄漏',content:{relationTo:'products',value:2}},
    ]}]}}))
    reader.find.mockImplementation(async({collection,locale})=>({docs:collection==='products'&&locale==='zh' ? [
      {id:1,slug:'public',title:'公开',discovery:{}}, {id:2,slug:'hidden',title:'隐藏',discovery:{noIndex:true}},
    ]:[]}))
    const data=await loadDiscovery({payload:raw as unknown as Payload})
    const text=llmsText(data)!
    expect(text).toContain('中文简介')
    expect(text).toContain('English summary')
    expect(text).toContain('[公开推荐](https://example.com/zh/products/public)')
    expect(text).not.toContain('草稿泄漏')
    expect(text).not.toContain('禁止索引泄漏')
    expect(text).not.toContain('/en/products/public')
    expect(llmsEntries(data).find(entry=>entry.id===1)?.included).toBe(true)
    expect(llmsEntries(data).find(entry=>entry.id===2)?.included).toBe(false)
    expect(llmsText({...data,settings:settings({geo:{enabled:false}})})).toBeNull()
  })
  it('filters canonical alternates for custom pages and previews preparing-language drafts without publishing them',async()=>{
    reader.find.mockImplementation(async({collection,locale})=>({docs:collection==='pages'&&locale==='zh' ? [{id:7,slug:'custom',title:'中文',discovery:{}}]:[]}))
    reader.findByID.mockResolvedValue({id:7,slug:'custom',title:'未发布日语',discovery:{canonicalUrl:'https://example.com/ja/canonical'}})
    const data=await loadDiscovery({payload:raw as unknown as Payload})
    const current=await canonicalDetails(data,{lang:'zh',path:'/custom'})
    expect(current.alternates).toEqual({zh:'https://example.com/zh/custom','x-default':'https://example.com/zh/custom'})
    raw.find.mockResolvedValue({docs:[{...language(3,'ja'),enabled:false}]})
    const draft=await canonicalDetails(data,{lang:'ja',source:'pages',id:7,draft:true,user})
    expect(draft.preparing).toBe(true)
    expect(draft.canonical).toBe('https://example.com/ja/canonical')
    expect(draft.alternates.ja).toBeUndefined()
    expect(reader.findByID).toHaveBeenCalledWith(expect.objectContaining({draft:true,user,locale:'ja'}))
  })
  it.each(['home','products','posts','contact','search'])('previews actual fixed-route metadata for the reserved pages document %s',async(slug)=>{
    reader.findByID.mockResolvedValue({id:12,slug,title:'旧页面',discovery:{canonicalUrl:'https://wrong.example/override',noIndex:true}})
    const path = slug === 'home' ? '' : `/${slug}`
    const data=await loadDiscovery({payload:raw as unknown as Payload})
    const details=await canonicalDetails(data,{lang:'zh',source:'pages',id:12,draft:true,user})
    expect(details).toMatchObject({fixedRoute:true,canonical:`https://example.com/zh${path}`,noIndex:slug==='search'})
    expect(details.alternates).toEqual(slug==='search'?{}:{zh:`https://example.com/zh${path}`,en:`https://example.com/en${path}`,'x-default':`https://example.com/zh${path}`})
    const response=await seoEndpoints[0].handler({user,payload:raw,url:'https://example.com/api/seo/preview?type=canonical&source=pages&id=12&lang=zh&mode=draft'} as never)
    const preview=await response.json()
    expect(preview.text).not.toContain('wrong.example')
    expect(preview.warnings).toContain('该页面路径由系统固定页面接管。当前预览显示实际页面规则；此内容记录的 canonical 和 noindex 设置不会覆盖该固定页面。')
  })
  it('requires authentication and does not enumerate content for robots preview',async()=>{
    const handler=seoEndpoints[0].handler
    await expect(handler({user:null} as never)).rejects.toMatchObject({status:401})
    const response=await handler({user,payload:raw,url:'https://example.com/api/seo/preview?type=robots'} as never)
    expect(response.headers.get('Cache-Control')).toBe('private, no-store')
    expect((await response.json()).text).toContain('User-Agent: *')
    expect(reader.find).not.toHaveBeenCalled()
  })
})
