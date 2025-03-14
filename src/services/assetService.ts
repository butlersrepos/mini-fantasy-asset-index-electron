import fetch from 'electron-fetch';
import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

// Interface for assets
export interface Asset {
    name: string;
    type: string;
    assetPack: string;
    link: string;
}

// Interface for cached data
interface CachedData {
    assets: Asset[];
    etag: string;
    lastModified: string;
    timestamp: number;
}

// Cache info interface for the UI
export interface CacheInfo {
    exists: boolean;
    timestamp: number | null;
    assetCount: number | null;
}

// Cache settings
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
let cacheDir: string;
let cacheFilePath: string;

// Keep track if we've already initialized
let isInitialized = false;

// Initialize cache directory
export function initCache(): void {
    // Prevent multiple initializations
    if (isInitialized) {
        console.log('Cache already initialized, skipping');
        return;
    }

    // Get user data directory from electron app
    const userDataPath = app.getPath('userData');
    cacheDir = path.join(userDataPath, 'cache');
    cacheFilePath = path.join(cacheDir, 'asset-data.json');

    console.log('Cache directory initialized at:', cacheDir);
    console.log('Cache file path:', cacheFilePath);

    // Create cache directory if it doesn't exist
    if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
        console.log('Created cache directory');
    }

    // Check if cache file exists
    if (fs.existsSync(cacheFilePath)) {
        console.log('Cache file exists');
        try {
            // Verify cache is valid JSON
            const content = fs.readFileSync(cacheFilePath, 'utf8');
            const parsed = JSON.parse(content);
            console.log(`Cache contains ${parsed.assets?.length || 0} assets from ${new Date(parsed.timestamp).toLocaleString()}`);
        } catch (err) {
            console.error('Cache file exists but is corrupted:', err);
        }
    } else {
        console.log('Cache file does not exist');
    }

    isInitialized = true;
}

// Get the path to the cache directory
export function getCachePath(): string {
    if (!cacheDir) {
        initCache();
    }

    return cacheDir;
}

// Get cache information for the UI
export function getCacheInfo(): CacheInfo {
    if (!cacheDir) {
        initCache();
    }

    if (!fs.existsSync(cacheFilePath)) {
        return { exists: false, timestamp: null, assetCount: null };
    }

    try {
        const cacheContent = fs.readFileSync(cacheFilePath, 'utf8');
        const cachedData = JSON.parse(cacheContent) as CachedData;
        return {
            exists: true,
            timestamp: cachedData.timestamp,
            assetCount: cachedData.assets.length
        };
    } catch (err) {
        console.error('Error reading cache info:', err);
        return { exists: false, timestamp: null, assetCount: null };
    }
}

// Delete cache and force a refetch
export async function deleteCacheAndRefetch(): Promise<Asset[]> {
    if (!cacheDir) {
        initCache();
    }

    // Delete cache file if it exists
    if (fs.existsSync(cacheFilePath)) {
        try {
            fs.unlinkSync(cacheFilePath);
            console.log('Cache file deleted');
        } catch (err) {
            console.error('Error deleting cache file:', err);
        }
    }

    // Force refetch data
    return await fetchAssetData(true);
}

// Single consolidated fetch method
export async function fetchAssetData(forceRefresh = false): Promise<Asset[]> {
    const isDev = process.env.NODE_ENV === 'development';
    const isPackaged = app.isPackaged;

    console.log(`fetchAssetData called - forceRefresh: ${forceRefresh}, isDev: ${isDev}, isPackaged: ${isPackaged}`);

    // Initialize cache if not already done
    if (!isInitialized) {
        initCache();
    }

    // Check if we have cached data
    let cachedData: CachedData | null = null;
    try {
        console.log(`cacheFilePath: ${cacheFilePath}, exists: ${fs.existsSync(cacheFilePath)}, dirstats: ${fs.accessSync(cacheDir)}`);
    } catch (e: unknown) {
        console.log(`error: ${e && typeof e == 'object' && 'message' in e ? e.message : e}`);
    }
    if (!forceRefresh && fs.existsSync(cacheFilePath)) {
        try {
            const cacheContent = fs.readFileSync(cacheFilePath, 'utf8');
            cachedData = JSON.parse(cacheContent);
            if (cachedData) {
                console.log(`Found cached data from: ${new Date(cachedData.timestamp).toLocaleString()}`);
                console.log(`Cache contains ${cachedData.assets.length} assets`);

                // Return cached data immediately unless explicitly forced to refresh
                if (!forceRefresh) {
                    console.log('Using cached data (skipping network check)');
                    return cachedData.assets;
                }
            }
        } catch (err) {
            console.error('Error reading cache file:', err);
        }
    } else {
        console.log(`Cache is being bypassed. forceRefresh=${forceRefresh}, exists=${fs.existsSync(cacheFilePath)}, cacheFilePath=${cacheFilePath}`);
    }

    // In dev mode with cache, extend expiry time to prevent unnecessary fetches during development
    const effectiveCacheExpiry = isDev ? CACHE_EXPIRY * 7 : CACHE_EXPIRY; // 7 days in dev mode

    // Primary URL
    const primaryUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRtDDaI5kVRkOUWqJb8GRksylMr-wsKKbKB6O4XQ1rhVs5weqq_7NZPltfsniDND5C17kFatv2mUtyp/pub?gid=0&single=true&output=tsv";

    const headers: HeadersInit = {
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9",
        "Referer": "https://www.minifantasy.net/",
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36"
    };

    // Add conditional headers if we have cached data
    if (cachedData) {
        if (cachedData.etag) {
            headers['If-None-Match'] = cachedData.etag;
        }
        if (cachedData.lastModified) {
            headers['If-Modified-Since'] = cachedData.lastModified;
        }
    }

    try {
        console.log('Checking if document has been modified...');
        const headResponse = await fetch(primaryUrl, {
            method: 'HEAD',
            headers: headers
        });

        console.log('HEAD response status:', headResponse.status);

        // Check if content hasn't changed (304 Not Modified)
        if (headResponse.status === 304 && cachedData) {
            console.log('Document not modified, using cached data');
            return cachedData.assets;
        }

        // Check if cache is still fresh and we don't have a definitive 304
        if (cachedData && (Date.now() - cachedData.timestamp) < effectiveCacheExpiry) {
            // Google Docs doesn't reliably return 304, so we'll use time-based expiry as well
            console.log('Cache is still fresh, using cached data');
            return cachedData.assets;
        }

        // If we reach here, we need to fetch new data
        console.log('Fetching new data...');
        const response = await fetch(primaryUrl, {
            headers: headers
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Get headers for caching
        const etag = response.headers.get('etag') || '';
        const lastModified = response.headers.get('last-modified') || '';

        // Get the data
        const tsvData = await response.text();
        console.log('TSV data received');

        // Parse the data
        const assets = parseTsvToAssets(tsvData);

        // Save to cache
        const newCacheData: CachedData = {
            assets: assets,
            etag: etag,
            lastModified: lastModified,
            timestamp: Date.now()
        };

        try {
            fs.writeFileSync(cacheFilePath, JSON.stringify(newCacheData));
            console.log(`Data saved to cache: ${cacheFilePath}`);
        } catch (err) {
            console.error('Error writing to cache:', err);
        }

        return assets;
    } catch (error) {
        console.error('Error fetching asset data:', error);

        // If fetch failed but we have cached data, use it as a fallback
        if (cachedData) {
            console.log('Using cached data as fallback after fetch error');
            return cachedData.assets;
        }

        throw error;
    }
}

// Function to parse TSV data to Asset objects
function parseTsvToAssets(tsvData: string): Asset[] {
    const lines = tsvData.split('\n');
    if (lines.length <= 1) {
        throw new Error('No data found in TSV response');
    }

    const headers = lines[0].split('\t');
    console.log('Headers found:', headers);

    const nameIndex = headers.findIndex(h => h.toLowerCase().includes('name'));
    const typeIndex = headers.findIndex(h => h.toLowerCase().includes('type'));
    const packIndex = headers.findIndex(h => h.toLowerCase().includes('pack'));
    const linkIndex = headers.findIndex(h => h.toLowerCase().includes('link') || h.toLowerCase().includes('url'));

    console.log('Column indexes - Name:', nameIndex, 'Type:', typeIndex, 'Pack:', packIndex, 'Link:', linkIndex);

    if (nameIndex === -1 || typeIndex === -1 || packIndex === -1 || linkIndex === -1) {
        console.warn('Some columns were not found in the headers');
    }

    const assets = lines.slice(1)
        .filter(line => line.trim() !== '')
        .map(line => {
            const values = line.split('\t');
            return {
                name: nameIndex >= 0 ? values[nameIndex] || 'Unknown' : 'Unknown',
                type: typeIndex >= 0 ? values[typeIndex] || 'Unknown' : 'Unknown',
                assetPack: packIndex >= 0 ? values[packIndex] || 'Unknown' : 'Unknown',
                link: linkIndex >= 0 ? values[linkIndex] || '#' : '#'
            };
        });

    console.log(`Parsed ${assets.length} assets from TSV data`);
    return assets;
}
