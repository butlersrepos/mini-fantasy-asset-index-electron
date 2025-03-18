import { app } from 'electron'
import { assert } from 'console'
import Store from 'electron-store'
import type { Asset, CachedData, CacheInfo } from '../types'

// const Store = require('electron-store').default
const fetch = require('electron-fetch').default

// Cache settings
const CACHE_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

// Store instance reference
let store: Store
let storePath: string
const ASSET_CACHE_NAME = 'asset-cache'

// Track if a fetch is already in progress to prevent duplicate requests
let fetchInProgress: Promise<Asset[]> | null = null

// Helper to get or create the store asynchronously
async function getStore(): Promise<Store> {
    if (store) {
        return store
    }

    try {
        store = new Store({
            name: ASSET_CACHE_NAME,
            clearInvalidConfig: true,

        })
        assert(store, 'Electron Store instance not created')
        storePath = await getCachePath()
        return store!
    } catch (error) {
        console.error('Error importing electron-store:', error)
        throw error
    }
}

// Get cache information for the UI
export async function getCacheInfo(): Promise<CacheInfo> {
    try {
        const store = await getStore()
        const cacheData = store.get('cacheData') as CachedData | undefined

        if (!cacheData) {
            return { exists: false, timestamp: null, assetCount: null }
        }

        return {
            exists: true,
            timestamp: cacheData.timestamp,
            assetCount: cacheData.assets.length
        }
    } catch (err) {
        console.error('Error getting cache info:', err)
        return { exists: false, timestamp: null, assetCount: null }
    }
}

// Get the path to the store data file (for opening in file explorer)
export async function getCachePath(): Promise<string> {
    try {
        // Ensure we have the store path
        if (!storePath) {
            const store = await getStore()
            storePath = store.path.substring(0, store.path.lastIndexOf('/'))
        }
        console.log({ storePath })
        return storePath
    } catch (err) {
        console.error('Error getting cache path:', err)
        return app.getPath('userData')
    }
}

// Initialize cache - now connects to store asynchronously
export async function initCache(): Promise<void> {
    try {
        const store = await getStore()
        console.log('Using Electron Store for cache at:', store.path)

        // Check if cache exists
        const cacheData = store.get('cacheData') as CachedData | undefined
        if (cacheData) {
            console.log(
                `Cache contains ${cacheData.assets?.length || 0} assets from ${new Date(cacheData.timestamp).toLocaleString()}`
            )
        } else {
            console.log('No cached data found')
        }
    } catch (err) {
        console.error('Error initializing cache:', err)
    }
}

// Delete cache and force a refetch
export async function deleteCacheAndRefetch(): Promise<Asset[]> {
    try {
        const store = await getStore()
        console.log('Deleting cached data')
        store.delete('cacheData')
    } catch (err) {
        console.error('Error deleting cache:', err)
    }

    // Force refetch data
    return await fetchAssetData(true)
}

// Single consolidated fetch method
export async function fetchAssetData(forceRefresh = false): Promise<Asset[]> {
    // If a fetch is already in progress, return that promise to avoid duplicate calls
    if (fetchInProgress && !forceRefresh) {
        console.log('A fetch is already in progress, reusing that request')
        return fetchInProgress
    }

    // Implementation of the actual fetch logic
    const doFetch = async (): Promise<Asset[]> => {
        try {
            const store = await getStore()

            const isDev = process.env.NODE_ENV === 'development'
            const isPackaged = app.isPackaged

            console.log(
                `fetchAssetData called - forceRefresh: ${forceRefresh}, isDev: ${isDev}, isPackaged: ${isPackaged}`
            )

            // Check if we have cached data
            let cachedData: CachedData | null = null
            if (!forceRefresh) {
                cachedData = (store.get('cacheData') as CachedData | undefined) || null
                if (cachedData) {
                    console.log(`Found cached data from: ${new Date(cachedData.timestamp).toLocaleString()}`)
                    console.log(`Cache contains ${cachedData.assets.length} assets`)

                    // Return cached data immediately unless explicitly forced to refresh
                    if (!forceRefresh) {
                        console.log('Using cached data (skipping network check)')
                        return cachedData.assets
                    }
                } else {
                    console.log('No cached data found in store')
                }
            } else {
                console.log('Cache is being bypassed due to force refresh')
            }

            // In dev mode, extend expiry time to prevent unnecessary fetches
            const effectiveCacheExpiry = isDev ? CACHE_EXPIRY * 7 : CACHE_EXPIRY // 7 days in dev mode

            // Primary URL
            const primaryUrl =
                'https://docs.google.com/spreadsheets/d/e/2PACX-1vRtDDaI5kVRkOUWqJb8GRksylMr-wsKKbKB6O4XQ1rhVs5weqq_7NZPltfsniDND5C17kFatv2mUtyp/pub?gid=0&single=true&output=tsv'

            const headers: HeadersInit = {
                accept: '*/*',
                'accept-language': 'en-US,en;q=0.9',
                Referer: 'https://www.minifantasy.net/',
                'user-agent':
                    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36'
            }

            // Add conditional headers if we have cached data
            if (cachedData) {
                if (cachedData.etag) {
                    headers['If-None-Match'] = cachedData.etag
                }
                if (cachedData.lastModified) {
                    headers['If-Modified-Since'] = cachedData.lastModified
                }
            }

            try {
                console.log('Checking if document has been modified...')
                const headResponse = await fetch(primaryUrl, {
                    method: 'HEAD',
                    headers: headers
                })

                console.log('HEAD response status:', headResponse.status)

                // Check if content hasn't changed (304 Not Modified)
                if (headResponse.status === 304 && cachedData) {
                    console.log('Document not modified, using cached data')
                    return cachedData.assets
                }

                // Check if cache is still fresh and we don't have a definitive 304
                if (cachedData && Date.now() - cachedData.timestamp < effectiveCacheExpiry) {
                    // Google Docs doesn't reliably return 304, so we'll use time-based expiry as well
                    console.log('Cache is still fresh, using cached data')
                    return cachedData.assets
                }

                // If we reach here, we need to fetch new data
                console.log('Fetching new data...')
                const response = await fetch(primaryUrl, {
                    headers: headers
                })

                console.log('Response status:', response.status)

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`)
                }

                // Get headers for caching
                const etag = response.headers.get('etag') || ''
                const lastModified = response.headers.get('last-modified') || ''

                // Get the data
                const tsvData = await response.text()
                console.log('TSV data received')

                // Parse the data
                const assets = parseTsvToAssets(tsvData)

                // Save to cache using electron-store
                const newCacheData: CachedData = {
                    assets: assets,
                    etag: etag,
                    lastModified: lastModified,
                    timestamp: Date.now()
                }

                try {
                    store.set('cacheData', newCacheData)
                    console.log('Data saved to electron-store cache')
                } catch (err) {
                    console.error('Error writing to electron-store:', err)
                }

                return assets
            } catch (error) {
                console.error('Error fetching asset data:', error)

                // If fetch failed but we have cached data, use it as a fallback
                if (cachedData) {
                    console.log('Using cached data as fallback after fetch error')
                    return cachedData.assets
                }

                throw error
            }
        } catch (err) {
            console.error('Error in fetchAssetData:', err)
            throw err
        }
    }

    try {
        // Store the promise so it can be reused if another request comes in
        fetchInProgress = doFetch()
        const result = await fetchInProgress
        return result
    } finally {
        // Clear the in-progress flag when done
        fetchInProgress = null
    }
}

// Function to parse TSV data to Asset objects
function parseTsvToAssets(tsvData: string): Asset[] {
    const lines = tsvData.split('\n')
    if (lines.length <= 1) {
        throw new Error('No data found in TSV response')
    }

    const headers = lines[0].split('\t')
    console.log('Headers found:', headers)

    const nameIndex = headers.findIndex((h) => h.toLowerCase().includes('name'))
    const typeIndex = headers.findIndex((h) => h.toLowerCase().includes('type'))
    const packIndex = headers.findIndex((h) => h.toLowerCase().includes('pack'))
    const linkIndex = headers.findIndex(
        (h) => h.toLowerCase().includes('link') || h.toLowerCase().includes('url')
    )
    const tagsIndex = headers.findIndex((h) => h.toLowerCase().includes('tags'))

    console.log(
        'Column indexes - Name:',
        nameIndex,
        'Type:',
        typeIndex,
        'Pack:',
        packIndex,
        'Link:',
        linkIndex,
        'Tags:',
        tagsIndex
    )

    if (nameIndex === -1 || typeIndex === -1 || packIndex === -1 || linkIndex === -1) {
        console.warn('Some columns were not found in the headers')
    }

    const assets = lines
        .slice(1)
        .filter((line) => line.trim() !== '')
        .map((line) => {
            const values = line.split('\t')
            return {
                name: nameIndex >= 0 ? values[nameIndex] || 'Unknown' : 'Unknown',
                type: typeIndex >= 0 ? values[typeIndex] || 'Unknown' : 'Unknown',
                assetPack: packIndex >= 0 ? values[packIndex] || 'Unknown' : 'Unknown',
                link: linkIndex >= 0 ? values[linkIndex] || '#' : '#',
                tags: tagsIndex >= 0 
                    ? (values[tagsIndex] || '')
                        .split(',')
                        .map(tag => tag.trim())
                        .filter(tag => tag !== '')
                    : []
            }
        })

    console.log(`Parsed ${assets.length} assets from TSV data`)
    return assets
}
