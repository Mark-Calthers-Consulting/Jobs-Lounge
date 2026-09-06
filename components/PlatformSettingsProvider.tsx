'use client'

import { createContext, useContext } from 'react'

import {
    DEFAULT_PUBLIC_SETTINGS,
    usePublicPlatformSettings,
} from '@/hooks/useSettings'
import type { PublicPlatformSettings } from '@/types/types'

const PlatformSettingsContext = createContext<PublicPlatformSettings>(DEFAULT_PUBLIC_SETTINGS)

export const PlatformSettingsProvider = ({ children }: { children: React.ReactNode }) => {
    const query = usePublicPlatformSettings()
    const settings = query.data
        ? { ...DEFAULT_PUBLIC_SETTINGS, ...query.data }
        : DEFAULT_PUBLIC_SETTINGS
    return (
        <PlatformSettingsContext.Provider value={settings}>
            {children}
        </PlatformSettingsContext.Provider>
    )
}

export const usePlatformSettings = () => useContext(PlatformSettingsContext)
