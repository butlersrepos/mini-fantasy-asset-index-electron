import React, { useState, useEffect } from 'react';
import Filters from './components/Filters';
import AssetTable from './components/AssetTable';
import { Asset } from '../services/assetService';

declare global {
    interface Window {
        electronAPI: {
            fetchAssetData: () => Promise<Asset[] | { error: string }>;
        }
    }
}

const App: React.FC = () => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [selectedPacks, setSelectedPacks] = useState<string[]>([]);

    // Load assets when component mounts
    useEffect(() => {
        const loadAssets = async () => {
            try {
                setLoading(true);
                const data = await window.electronAPI.fetchAssetData();

                if ('error' in data) {
                    setError(data.error);
                    setLoading(false);
                    return;
                }

                setAssets(data);
                setFilteredAssets(data);
                setLoading(false);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : String(err));
                setLoading(false);
            }
        };

        loadAssets();
    }, []);

    // Filter assets when filters change
    useEffect(() => {
        const filterAssets = () => {
            const searchLower = searchTerm.toLowerCase();
            const includeAllTypes = selectedTypes.length === 0 || selectedTypes.includes('');
            const includeAllPacks = selectedPacks.length === 0 || selectedPacks.includes('');

            const filtered = assets.filter(asset => {
                // Check if asset matches search term
                const matchesSearch = searchTerm === '' ||
                    asset.name.toLowerCase().includes(searchLower) ||
                    asset.type.toLowerCase().includes(searchLower) ||
                    asset.assetPack.toLowerCase().includes(searchLower);

                // Check if asset matches any of the selected types (or all if none selected)
                const matchesType = includeAllTypes ||
                    selectedTypes.includes(asset.type.toLowerCase());

                // Check if asset matches any of the selected packs (or all if none selected)
                const matchesPack = includeAllPacks ||
                    selectedPacks.includes(asset.assetPack.toLowerCase());

                return matchesSearch && matchesType && matchesPack;
            });

            setFilteredAssets(filtered);
        };

        filterAssets();
    }, [assets, searchTerm, selectedTypes, selectedPacks]);

    // Get unique values for dropdowns
    const types = [...new Set(assets.map(asset => asset.type))].sort();
    const packs = [...new Set(assets.map(asset => asset.assetPack))].sort();

    return (
        <div className="asset-index">
            <header>
                <h1>Welcome To The Minifantasy Asset Index</h1>
                <img
                    src="/assets/builders.gif"
                    alt="Minifantasy style gif of humans building a structure foundations with various tools and materials."
                />
                <Filters
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    types={types}
                    selectedTypes={selectedTypes}
                    onTypeChange={setSelectedTypes}
                    packs={packs}
                    selectedPacks={selectedPacks}
                    onPackChange={setSelectedPacks}
                />
            </header>

            <main>
                {loading && <div className="loading-indicator">Loading assets...</div>}
                {error && <div className="error-message">Error: {error}</div>}
                {!loading && !error && (
                    <AssetTable assets={filteredAssets} />
                )}
            </main>
        </div>
    );
};

export default App;
