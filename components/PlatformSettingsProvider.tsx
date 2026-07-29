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
    return (
        <PlatformSettingsContext.Provider value={query.data || DEFAULT_PUBLIC_SETTINGS}>
            {children}
        </PlatformSettingsContext.Provider>
    )
}

export const usePlatformSettings = () => useContext(PlatformSettingsContext)
