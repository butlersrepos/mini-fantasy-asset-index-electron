import fetch from 'electron-fetch';

// Interface for assets
export interface Asset {
    name: string;
    type: string;
    assetPack: string;
    link: string;
}

// Single consolidated fetch method
export async function fetchAssetData(): Promise<Asset[]> {
    // Primary URL
    const primaryUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRtDDaI5kVRkOUWqJb8GRksylMr-wsKKbKB6O4XQ1rhVs5weqq_7NZPltfsniDND5C17kFatv2mUtyp/pub?gid=0&single=true&output=tsv";
    // Backup URL (slightly different format)
    const backupUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRtDDaI5kVRkOUWqJb8GRksylMr-wsKKbKB6O4XQ1rhVs5weqq_7NZPltfsniDND5C17kFatv2mUtyp/pub?output=tsv&gid=0";
    
    const headers = {
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9",
        "Referer": "https://www.minifantasy.net/",
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36"
    };

    // Try primary URL first
    try {
        console.log('Attempting to fetch from primary URL...');
        const response = await fetch(primaryUrl, {
            redirect: 'follow',
            headers: headers
        });

        console.log('Primary URL response status:', response.status);
        
        if (response.ok) {
            const tsvData = await response.text();
            console.log('TSV data received from primary URL');
            return parseTsvToAssets(tsvData);
        }
    } catch (primaryError) {
        console.error('Error with primary URL:', primaryError);
    }
    
    // If we reach here, the primary URL failed, try the backup URL
    console.log('Attempting to fetch from backup URL...');
    const response = await fetch(backupUrl, {
        headers: headers
    });
    
    console.log('Backup URL response status:', response.status);
    
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const tsvData = await response.text();
    console.log('TSV data received from backup URL');
    return parseTsvToAssets(tsvData);
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
