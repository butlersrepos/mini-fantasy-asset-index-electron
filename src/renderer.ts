interface Asset {
    name: string;
    type: string;
    assetPack: string;
    link: string;
}

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input') as HTMLInputElement;
    const typeFilter = document.getElementById('type-filter') as HTMLSelectElement;
    const packFilter = document.getElementById('pack-filter') as HTMLSelectElement;
    const assetTableBody = document.getElementById('asset-table-body') as HTMLTableSectionElement;
    const loadingIndicator = document.getElementById('loading-indicator') as HTMLDivElement;
    const errorMessage = document.getElementById('error-message') as HTMLDivElement;
    
    let assets: Asset[] = [];
    
    // Load assets when page is loaded
    loadAssets();
    
    // Add event listeners for filters
    searchInput.addEventListener('input', filterAssets);
    typeFilter.addEventListener('change', filterAssets);
    packFilter.addEventListener('change', filterAssets);
    
    // Function to load assets from the API
    async function loadAssets() {
        try {
            showLoading(true);
            const data = await window.electronAPI.fetchAssetData();
            
            if ('error' in data) {
                showError(data.error);
                return;
            }
            
            assets = data;
            populateFilters();
            renderAssets(assets);
            showLoading(false);
        } catch (error) {
            showError(error instanceof Error ? error.message : String(error));
        }
    }
    
    // Function to populate filter dropdowns
    function populateFilters() {
        // Get unique types
        const types = [...new Set(assets.map(asset => asset.type))].sort();
        
        // Clear existing options (except "All Types")
        typeFilter.innerHTML = '<option value="">All Types</option>';
        
        // Add options for each type
        types.forEach(type => {
            if (type && type.trim() !== '') {
                const option = document.createElement('option');
                option.value = type.toLowerCase();
                option.textContent = type;
                typeFilter.appendChild(option);
            }
        });
        
        // Get unique asset packs
        const packs = [...new Set(assets.map(asset => asset.assetPack))].sort();
        
        // Clear existing options (except "All Asset Packs")
        packFilter.innerHTML = '<option value="">All Asset Packs</option>';
        
        // Add options for each pack
        packs.forEach(pack => {
            if (pack && pack.trim() !== '') {
                const option = document.createElement('option');
                option.value = pack.toLowerCase();
                option.textContent = pack;
                packFilter.appendChild(option);
            }
        });
    }
    
    // Helper function to get selected values from multi-select
    function getSelectedValues(select: HTMLSelectElement): string[] {
        return Array.from(select.selectedOptions).map(option => option.value.toLowerCase());
    }
    
    // Function to filter assets based on search and filters
    function filterAssets() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedTypes = getSelectedValues(typeFilter);
        const selectedPacks = getSelectedValues(packFilter);
        
        // If "All Types" or nothing is selected, include all types
        const includeAllTypes = selectedTypes.length === 0 || selectedTypes.includes('');
        
        // If "All Asset Packs" or nothing is selected, include all packs
        const includeAllPacks = selectedPacks.length === 0 || selectedPacks.includes('');
        
        const filteredAssets = assets.filter(asset => {
            // Check if asset matches search term
            const matchesSearch = searchTerm === '' || 
                asset.name.toLowerCase().includes(searchTerm) || 
                asset.type.toLowerCase().includes(searchTerm) ||
                asset.assetPack.toLowerCase().includes(searchTerm);
            
            // Check if asset matches any of the selected types (or all if none selected)
            const matchesType = includeAllTypes || 
                selectedTypes.includes(asset.type.toLowerCase());
            
            // Check if asset matches any of the selected packs (or all if none selected)
            const matchesPack = includeAllPacks || 
                selectedPacks.includes(asset.assetPack.toLowerCase());
            
            return matchesSearch && matchesType && matchesPack;
        });
        
        renderAssets(filteredAssets);
    }
    
    // Function to render assets in the table
    function renderAssets(assetsToRender: Asset[]) {
        // Clear existing rows
        assetTableBody.innerHTML = '';
        
        // Create new rows
        assetsToRender.forEach(asset => {
            const row = document.createElement('tr');
            
            // Add name cell
            const nameCell = document.createElement('td');
            nameCell.textContent = asset.name;
            row.appendChild(nameCell);
            
            // Add type cell
            const typeCell = document.createElement('td');
            typeCell.textContent = asset.type;
            row.appendChild(typeCell);
            
            // Add asset pack cell
            const packCell = document.createElement('td');
            packCell.textContent = asset.assetPack;
            row.appendChild(packCell);
            
            // Add link cell
            const linkCell = document.createElement('td');
            if (asset.link && asset.link !== '#') {
                const link = document.createElement('a');
                link.href = asset.link;
                link.textContent = 'View';
                link.target = '_blank';
                linkCell.appendChild(link);
            } else {
                linkCell.textContent = 'N/A';
            }
            row.appendChild(linkCell);
            
            // Add row to table
            assetTableBody.appendChild(row);
        });
    }
    
    // Function to show/hide loading indicator
    function showLoading(show: boolean) {
        loadingIndicator.classList.toggle('hidden', !show);
        errorMessage.classList.add('hidden');
    }
    
    // Function to show error message
    function showError(message: string) {
        loadingIndicator.classList.add('hidden');
        errorMessage.textContent = `Error: ${message}`;
        errorMessage.classList.remove('hidden');
    }
});
