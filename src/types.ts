export interface Asset {
    name: string
    type: string
    assetPack: string
    link: string
}

// Interface for cached data
export interface CachedData {
    assets: Asset[]
    etag: string
    lastModified: string
    timestamp: number
}

export interface CacheInfo {
    exists: boolean
    timestamp: number | null
    assetCount: number | null
}