'use client'
import React, {useEffect, useTransition} from 'react'
import {createPortal} from 'react-dom'
import {useRouter} from 'next/navigation'
import {LoaderCircle} from 'lucide-react'
import {recordRefreshEvent, refreshRecordList} from './refresh'
import './modal.css'
import {useConfig, useDocumentDrawer, useListQuery, useTableColumns} from '@payloadcms/ui'
export default function ListModals({slug}:{slug:string}) {
 const {config}=useConfig()
 const {columns,setActiveColumns}=useTableColumns()
 const {data}=useListQuery()
 const router=useRouter()
 const [pending,startTransition]=useTransition()
 useEffect(()=>{
  const refresh=(event:Event)=>{
   const detail=(event as CustomEvent<{slug:string;operation:string}>).detail
   if(detail.slug!==slug)return
   startTransition(()=>{
    const url=new URL(window.location.href)
    const page=Number(url.searchParams.get('page')||1)
    if(detail.operation==='delete'&&data?.docs.length===1&&page>1){
     url.searchParams.set('page',String(page-1))
     router.replace(`${url.pathname}${url.search}${url.hash}`,{scroll:false})
    }
    // Query refinement does not fetch when filters are unchanged. Always
    // request fresh server-rendered rows, totals and pagination after writes.
    router.refresh()
   })
  }
  window.addEventListener(recordRefreshEvent,refresh)
  return ()=>window.removeEventListener(recordRefreshEvent,refresh)
 },[slug,data?.docs.length,router])
 const [Drawer,,{openDrawer,closeDrawer}]=useDocumentDrawer({collectionSlug:slug})
 useEffect(()=>{
  const active=columns.filter(c=>c.active).map(c=>c.accessor)
  if(active.at(-1)!=='recordActions') void setActiveColumns([...active.filter(c=>c!=='recordActions'),'recordActions'])
 },[columns,setActiveColumns])
 useEffect(()=>{
  const click=(event:MouseEvent)=>{
   const link=(event.target as Element).closest('a')
   if(!link || link.origin!==location.origin) return
   const prefix=`${config.routes.admin}/collections/${slug}/`
   if(!link.pathname.startsWith(prefix))return
   const id=decodeURIComponent(link.pathname.slice(prefix.length))
   if(!id || id.includes('/'))return
   event.preventDefault();event.stopPropagation()
   if(id==='create')openDrawer()
   else window.dispatchEvent(new CustomEvent('record-detail',{detail:{slug,id}}))
  }
  document.addEventListener('click',click,true)
  return ()=>document.removeEventListener('click',click,true)
 },[slug,config.routes.admin,openDrawer])
 return <>
  <Drawer redirectAfterCreate={false} redirectAfterDelete={false} onSave={()=>{closeDrawer();refreshRecordList(slug,'create')}} />
  {pending && createPortal(<div className="record-list-refresh" role="status" aria-live="polite" aria-busy="true"><LoaderCircle className="record-spinner" size={20}/><span>正在刷新列表…</span></div>,document.body)}
 </>
}
