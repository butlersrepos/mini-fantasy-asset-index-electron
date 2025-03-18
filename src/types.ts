export interface Asset {
    name: string
    type: string
    assetPack: string,
    patreonPack: string,
    link: string
    tags: string[]  // Add the tags array property
    itch: boolean,
    unity: boolean,
    patreon: boolean,
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