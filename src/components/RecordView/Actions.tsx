'use client'
import React,{useEffect,useState} from 'react'
import {AlertTriangle, LoaderCircle, Pencil, Trash2, X} from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import {Button,useAuth,useConfig,useDocumentDrawer,useLocale} from '@payloadcms/ui'
import type {DefaultCellComponentProps} from 'payload'
import {refreshRecordList} from './refresh'
import {Fields} from './index'
import './modal.css'
export default function Actions({collectionSlug,rowData}:DefaultCellComponentProps) {
 const {config,getEntityConfig}=useConfig()
 const {permissions}=useAuth()
 const {code}=useLocale()
 const entity=getEntityConfig({collectionSlug})
 const [mode,setMode]=useState<'detail'|'delete'|null>(null)
 const [data,setData]=useState<Record<string,unknown>|null>(null)
 const [error,setError]=useState('')
 const [busy,setBusy]=useState(false)
 const [clearRelated,setClearRelated]=useState(false)
 const [Drawer,,{openDrawer,closeDrawer}]=useDocumentDrawer({collectionSlug,id:rowData.id})
 const refresh=(operation:'save'|'delete'='save')=>refreshRecordList(collectionSlug,operation)
 useEffect(()=>{
  const open=(event:Event)=>{const d=(event as CustomEvent).detail;if(d.slug===collectionSlug&&String(d.id)===String(rowData.id)){setData(null);setError('');setMode('detail')}}
  window.addEventListener('record-detail',open);return ()=>window.removeEventListener('record-detail',open)
 },[collectionSlug,rowData.id])
 useEffect(()=>{
  if(mode!=='detail')return
  const controller=new AbortController()
  fetch(`${config.routes.api}/${collectionSlug}/${rowData.id}?depth=1&draft=true&locale=${code||'zh'}&fallback-locale=none`,{signal:controller.signal}).then(async r=>{if(!r.ok)throw new Error('详情读取失败');setData(await r.json())}).catch(e=>{if(e.name!=='AbortError')setError(e.message)})
  return ()=>controller.abort()
 },[mode,collectionSlug,rowData.id,code,config.routes.api])
 const remove=async()=>{
  setBusy(true);setError('')
  try{const r=await fetch(`${config.routes.api}/${collectionSlug}/${rowData.id}${collectionSlug==='languages'&&clearRelated?'?clearRelated=true':''}`,{method:'DELETE'});const result=await r.json();if(!r.ok)throw new Error(result.errors?.map((e:{message:string})=>e.message).join('；')||'删除失败');setMode(null);refresh('delete')}
  catch(e){setError(e instanceof Error?e.message:'删除失败')}finally{setBusy(false)}
 }
 const allowed=permissions?.collections?.[collectionSlug]
 return <>
  <div className="record-actions">
   <Button type="button" buttonStyle="secondary" size="small" margin={false} icon={<Pencil size={14}/>} disabled={!allowed?.update} onClick={()=>openDrawer()}>编辑</Button>
   <Button type="button" buttonStyle="secondary" size="small" margin={false} className="record-delete-button" icon={<Trash2 size={14}/>} disabled={!allowed?.delete} onClick={()=>{setError('');setClearRelated(false);setMode('delete')}}>删除</Button>
  </div>
  <Drawer redirectAfterCreate={false} redirectAfterDelete={false} redirectAfterDuplicate={false} onSave={()=>refresh()} onDelete={()=>{closeDrawer();refresh('delete')}} />
  <Dialog.Root open={mode!==null} onOpenChange={open=>{if(!open&&!busy)setMode(null)}}>
   <Dialog.Portal><Dialog.Overlay className="record-overlay"/><Dialog.Content className={`record-modal ${mode==='delete'?'record-modal--delete':''}`} onEscapeKeyDown={e=>{if(busy)e.preventDefault()}} onPointerDownOutside={e=>{if(busy)e.preventDefault()}}>
    <div className="record-modal-heading">
     <div className="record-modal-title">{mode==='delete'&&<span className="record-danger-icon"><AlertTriangle size={22}/></span>}<Dialog.Title>{mode==='delete'?'删除这条记录？':'内容详情'}</Dialog.Title></div>
     <Dialog.Close className="record-icon-button" disabled={busy} aria-label="关闭弹窗"><X size={20}/></Dialog.Close>
    </div>
    <Dialog.Description className="record-description">{mode==='delete'?`即将删除「${String(rowData.label||rowData.title||rowData.name||rowData.id)}」。此操作无法直接恢复。`:'查看完整记录，点击编辑可修改内容。'}</Dialog.Description>
    {mode==='delete'&&collectionSlug==='languages'&&<div className="record-language-options">
      <p>默认清理该语言的前台文案、导航、SEO 配置及相关发布计划。</p>
      <label className={`record-clear-option ${clearRelated?'is-selected':''}`}>
       <input type="checkbox" checked={clearRelated} disabled={busy} onChange={e=>{setClearRelated(e.target.checked);setError('')}}/>
       <span><strong>同时清空该语言的关联内容</strong><small>删除该语言的商品、文章、分类等全部翻译，包含草稿、历史版本和发布计划。共享主体、库存、文件和其他语言内容保留。</small></span>
      </label>
    </div>}
    {error&&<div className="record-error" role="alert"><AlertTriangle size={16}/><span>{error}</span></div>}
    {mode==='detail'&&(data?<Fields fields={entity.fields} data={data}/>:!error&&<div className="record-content-loading" role="status" aria-busy="true"><LoaderCircle className="record-spinner" size={24}/><span>正在加载详情…</span></div>)}
    <div className="record-modal-footer">
     <Button type="button" buttonStyle="secondary" margin={false} disabled={busy} onClick={()=>setMode(null)}>{mode==='delete'?'取消':'关闭'}</Button>
     {mode==='delete'?<Button type="button" buttonStyle="error" className="record-confirm-delete" margin={false} disabled={busy} onClick={remove} icon={busy?<LoaderCircle className="record-spinner" size={16}/>:<Trash2 size={16}/>}>{busy?'正在删除…':clearRelated?'清空关联内容并删除':'确认删除'}</Button>:<Button type="button" margin={false} disabled={!allowed?.update} onClick={()=>{setMode(null);openDrawer()}} icon={<Pencil size={16}/>}>编辑</Button>}
    </div>
   </Dialog.Content></Dialog.Portal>
  </Dialog.Root>
 </>
}
