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
    <div className="filters">
      <div className="filter-container" style={{ flex: 1 }}>
        <label className="filter-label" htmlFor="search-input">Search</label>
        <input
          id="search-input"
          type="text" 
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search assets..."
        />
      </div>
      
      <div className="filter-container">
        <label className="filter-label" htmlFor="type-filter">Asset Types</label>
        <select
          id="type-filter"
          multiple
          value={selectedTypes}
          onChange={handleTypeChange}
          size={5}
        >
          <option value="">All Types</option>
          {types.map(type => (
            <option key={type} value={type.toLowerCase()}>{type}</option>
          ))}
        </select>
        <span className="helper-text">Hold Ctrl/Cmd for multiple</span>
      </div>
      
      <div className="filter-container">
        <label className="filter-label" htmlFor="pack-filter">Asset Packs</label>
        <select
          id="pack-filter"
          multiple
          value={selectedPacks}
          onChange={handlePackChange}
          size={5}
        >
          <option value="">All Asset Packs</option>
          {packs.map(pack => (
            <option key={pack} value={pack.toLowerCase()}>{pack}</option>
          ))}
        </select>
        <span className="helper-text">Hold Ctrl/Cmd for multiple</span>
      </div>
    </div>
  );
};

export default Filters;
