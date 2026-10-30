import { APIError, type Endpoint } from 'payload'
import { canonicalDetails, llmsEntries, llmsText, loadDiscovery } from '@/utilities/discovery'
import { contentSources, robotsText, settingsWarnings, sitemapText, xmlEscape, type DiscoverySource } from '@/utilities/discoveryRules'

export const seoEndpoints: Endpoint[] = [{
  path:'/seo/preview', method:'get',
  handler:async req => {
    if (!req.user) throw new APIError('请先登录后查看 SEO 配置。',401)
    const params = new URL(req.url!).searchParams
    const type = params.get('type') || 'sitemap'
    if (!['sitemap','robots','llms','canonical'].includes(type)) throw new APIError('未知预览类型。',400)
    const draft = params.get('mode') === 'draft'
    let lang = params.get('lang') || undefined
    if (params.get('language')) {
      const language = await req.payload.findByID({collection:'languages',id:Number(params.get('language')),depth:0,req,overrideAccess:false})
      lang = language.code
    }
    // Canonical alternatives must inspect all enabled languages, even when the
    // requested page belongs to one locale.
    const data = await loadDiscovery({payload:req.payload,draft,user:req.user,lang:type === 'canonical' ? undefined : lang,audit:true,rulesOnly:type==='robots'})
    const warnings = settingsWarnings(data.settings)
    if (draft) warnings.push('预览已保存的 SEO 草稿；公开内容链接仍只使用已发布翻译。未保存的表单修改不包含在此预览中。')
    let text: string
    let entries = data.entries
    if (type === 'sitemap') text = sitemapText(entries)
    else if (type === 'robots') text = robotsText(data.settings,data.origin)
    else if (type === 'llms') {
      const output = llmsText(data)
      entries = llmsEntries(data)
      text = output ?? '当前配置关闭 llms.txt，公开访问返回 404。'
      if (output === null) warnings.push('llms.txt 当前未发布。')
    } else {
      const source = params.get('source')
      if (source && !contentSources.includes(source as DiscoverySource)) throw new APIError('不支持的内容类型。',400)
      try {
        const details = await canonicalDetails(data,{lang,path:params.get('path') || '',source:source as DiscoverySource || undefined,id:Number(params.get('id')) || undefined,draft,user:req.user})
        text = [`<link rel="canonical" href="${xmlEscape(details.canonical)}" />`,...Object.entries(details.alternates).map(([locale,url])=>`<link rel="alternate" hreflang="${xmlEscape(locale)}" href="${xmlEscape(url)}" />`),`<meta name="robots" content="${details.noIndex ? 'noindex' : 'index'}, follow" />`].join('\n')
        entries = entries.filter(entry=>entry.url===details.url)
        if (details.fixedRoute) warnings.push('该页面路径由系统固定页面接管。当前预览显示实际页面规则；此内容记录的 canonical 和 noindex 设置不会覆盖该固定页面。')
        if (details.preparing) warnings.push('此语言尚未启用；这里只显示编辑预览，前台页面仍不可访问。')
      } catch(error) { throw new APIError(error instanceof Error ? error.message : '无法读取页面。',400) }
    }
    return Response.json({text,entries,warnings,languages:data.allLanguages.map(({code,label})=>({code,label}))},{headers:{'Cache-Control':'private, no-store'}})
  },
}]
