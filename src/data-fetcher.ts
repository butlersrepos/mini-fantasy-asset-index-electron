import axios, { AxiosRequestConfig } from 'axios';
import { Asset } from './types';

async function fetchAssetData(): Promise<Asset[]> {
    try {
        // Use the provided Google Doc URL and headers
        const url = "https://doc-10-80-sheets.googleusercontent.com/pub/54bogvaave6cua4cdnls17ksc4/nfi7c6knertlep8ef4vi7d8efo/1741700830000/118296963740101347992/*/e@2PACX-1vRtDDaI5kVRkOUWqJb8GRksylMr-wsKKbKB6O4XQ1rhVs5weqq_7NZPltfsniDND5C17kFatv2mUtyp?gid=0&single=true&output=tsv";

        const headers: Record<string, string> = {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9",
            "cache-control": "no-cache",
            "pragma": "no-cache",
        };

        const config: AxiosRequestConfig = { headers };
        const response = await axios.get(url, config);

        // Process the TSV data into the format we need
        const processedData = parseTsvData(response.data);
        return processedData;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

interface RawAssetItem {
    [key: string]: string;
}

function parseTsvData(tsvString: string): Asset[] {
    // Split the TSV string into rows
    const rows = tsvString.trim().split('\n');

    if (rows.length <= 1) {
        return [];
    }

    // Extract the header row to use as keys
    const headers = rows[0].split('\t');

    // Map the remaining rows to objects
    return rows.slice(1).map(row => {
        const values = row.split('\t');
        const item: RawAssetItem = {};

        headers.forEach((header, index) => {
            // Skip empty cells
            if (values[index]) {
                item[header.trim()] = values[index].trim();
            }
        });

        // Map the raw data to our expected asset structure
        return {
            name: item.Name || item.name || 'Unknown',
            type: item.Type || item.type || item.Category || item.category || 'Unspecified',
            assetPack: item['Asset Pack'] || item.assetPack || item.Pack || item.pack || 'Unknown',
            link: item.Link || item.link || item.URL || item.url || '#'
        };
    });
}

export {
    fetchAssetData
};
