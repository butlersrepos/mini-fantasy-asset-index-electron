import React, { useState, useEffect, useRef } from 'react';
import Filters from './components/Filters.jsx';
import AssetTable from './components/AssetTable.jsx';
import Settings from './components/Settings.jsx';

import buildersGif from './assets/builders.gif';
import { Asset } from '../types.js';

declare global {
    interface Window {
        electronAPI: {
            fetchAssetData: () => Promise<Asset[] | { error: string }>;
            getCacheInfo: () => Promise<{ exists: boolean, timestamp: number | null, assetCount: number | null }>;
            deleteCacheAndRefetch: () => Promise<Asset[] | { error: string }>;
            openCacheDirectory: () => Promise<{ success: boolean } | { error: string }>;
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
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    // Use ref to track if assets have been loaded
    const assetsLoadedRef = useRef(false);

    // Load assets when component mounts (only once)
    useEffect(() => {
        console.log('App: Component mounted, assetsLoaded:', assetsLoadedRef.current);

        // Only fetch if we haven't already loaded assets
        if (!assetsLoadedRef.current) {
            loadAssets();
            assetsLoadedRef.current = true;
        }

        return () => {
            console.log('App: Component unmounting');
        };
    }, []);

    const loadAssets = async () => {
        console.log("App: Starting to load assets");
        try {
            console.log("App: Loading assets from cache or network");
            setLoading(true);
            const data = await window.electronAPI.fetchAssetData();

            if ('error' in data) {
                console.error(`App: Failed to load assets: ${data.error}`);
                setError(data.error);
                setLoading(false);
                return;
            }

            console.log(`App: Received ${data.length} assets`);
            setAssets(data);
            setFilteredAssets(data);
            setLoading(false);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
            setLoading(false);
        }
    };

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

    // Reset to first page when filters or items per page changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedTypes, selectedPacks, itemsPerPage]);

    // Get unique values for dropdowns
    const types = [...new Set(assets.map(asset => asset.type))].sort();
    const packs = [...new Set(assets.map(asset => asset.assetPack))].sort();

    const handleSettingsClick = () => {
        setIsSettingsOpen(true);
    };

    const handleCloseSettings = () => {
        setIsSettingsOpen(false);
    };

    return (
        <div className="min-h-screen bg-app-dark text-app-light p-6">
            {/* Settings Button */}
            <div className="absolute top-6 right-6">
                <button
                    onClick={handleSettingsClick}
                    className="text-gray-300 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-700"
                    title="Settings"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
            </div>

            <header className="mb-8">
                <h1 className="text-3xl font-bold mb-6 text-center">
                    Welcome To The MiniFantasy Asset Index
                </h1>
                <div className="flex justify-center mb-6">
                    <img
                        src={buildersGif}
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
                    <AssetTable
                        assets={filteredAssets}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        itemsPerPage={itemsPerPage}
                        setItemsPerPage={setItemsPerPage}
                    />
                )}
            </main>

            {/* Settings Sidebar */}
            <Settings
                isOpen={isSettingsOpen}
                onClose={handleCloseSettings}
                onRefetch={loadAssets}
            />

            {/* Backdrop for settings sidebar */}
            {isSettingsOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={handleCloseSettings}
                ></div>
            )}
        </div>
    );
};

export default App;
