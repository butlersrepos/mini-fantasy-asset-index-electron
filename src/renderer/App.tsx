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
        <div className="min-h-screen bg-app-dark text-app-light p-6">
            <header className="mb-8">
                <h1 className="text-3xl font-bold mb-6 text-center">
                    Welcome To The Minifantasy Asset Index
                </h1>
                <div className="flex justify-center mb-6">
                    <img
                        src="/assets/builders.gif"
                        alt="Minifantasy style gif of humans building"
                        className="rounded-lg shadow-lg max-w-sm"
                    />
                </div>
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
                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                )}
                {error && (
                    <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
                        <p>Error: {error}</p>
                    </div>
                )}
                {!loading && !error && (
                    <AssetTable assets={filteredAssets} />
                )}
            </main>
        </div>
    );
};

export default App;
