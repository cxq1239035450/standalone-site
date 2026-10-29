'use client'
import React, { createContext, useContext } from 'react'
export type PublicLanguage = {
  code: string
  label: string
  htmlLang?: string | null
  direction?: 'ltr' | 'rtl' | null
}
const LanguageContext = createContext<PublicLanguage[]>([])
export const useSiteLanguages = () => useContext(LanguageContext)
export function LanguageProvider({
  languages,
  children,
}: {
  languages: PublicLanguage[]
  children: React.ReactNode
}) {
  return <LanguageContext.Provider value={languages}>{children}</LanguageContext.Provider>
}
