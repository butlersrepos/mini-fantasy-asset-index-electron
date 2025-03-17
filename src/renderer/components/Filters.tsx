import React from 'react';

interface FiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  types: string[];
  selectedTypes: string[];
  onTypeChange: (types: string[]) => void;
  packs: string[];
  selectedPacks: string[];
  onPackChange: (packs: string[]) => void;
}

const Filters: React.FC<FiltersProps> = ({
  searchTerm,
  onSearchChange,
  types,
  selectedTypes,
  onTypeChange,
  packs,
  selectedPacks,
  onPackChange
}) => {
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  // Handle type filter change
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions).map(option => option.value.toLowerCase());
    onTypeChange(selected);
  };

  // Handle pack filter change
  const handlePackChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions).map(option => option.value.toLowerCase());
    onPackChange(selected);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="col-span-1">
        <label className="block text-sm font-medium mb-2" htmlFor="search-input">
          Search
        </label>
        <input
          id="search-input"
          type="text" 
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search assets..."
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <div className="col-span-1">
        <label className="block text-sm font-medium mb-2" htmlFor="type-filter">
          Asset Types
        </label>
        <select
          id="type-filter"
          multiple
          value={selectedTypes}
          onChange={handleTypeChange}
          size={5}
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Types</option>
          {types.map(type => (
            <option key={type} value={type.toLowerCase()}>{type}</option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-400">Hold Ctrl/Cmd for multiple</p>
      </div>
      
      <div className="col-span-1">
        <label className="block text-sm font-medium mb-2" htmlFor="pack-filter">
          Asset Packs
        </label>
        <select
          id="pack-filter"
          multiple
          value={selectedPacks}
          onChange={handlePackChange}
          size={5}
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Asset Packs</option>
          {packs.map(pack => (
            <option key={pack} value={pack.toLowerCase()}>{pack}</option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-400">Hold Ctrl/Cmd for multiple</p>
      </div>
    </div>
  );
};

export default Filters;
