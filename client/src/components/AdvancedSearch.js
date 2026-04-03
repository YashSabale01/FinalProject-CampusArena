import React, { useState } from 'react';

const AdvancedSearch = ({ onSearch, onReset }) => {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    dateFrom: '',
    dateTo: '',
    location: '',
    fees: '',
    availability: ''
  });

  const categories = ['Academic', 'Cultural', 'Sports', 'Technical', 'Social'];

  const handleChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      search: '',
      category: '',
      dateFrom: '',
      dateTo: '',
      location: '',
      fees: '',
      availability: ''
    };
    setFilters(resetFilters);
    onReset();
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Search events..."
          value={filters.search}
          onChange={(e) => handleChange('search', e.target.value)}
          className="border rounded px-3 py-2"
        />
        
        <select
          value={filters.category}
          onChange={(e) => handleChange('category', e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <input
          type="date"
          placeholder="From Date"
          value={filters.dateFrom}
          onChange={(e) => handleChange('dateFrom', e.target.value)}
          className="border rounded px-3 py-2"
        />

        <input
          type="date"
          placeholder="To Date"
          value={filters.dateTo}
          onChange={(e) => handleChange('dateTo', e.target.value)}
          className="border rounded px-3 py-2"
        />

        <input
          type="text"
          placeholder="Location"
          value={filters.location}
          onChange={(e) => handleChange('location', e.target.value)}
          className="border rounded px-3 py-2"
        />

        <select
          value={filters.fees}
          onChange={(e) => handleChange('fees', e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">All Events</option>
          <option value="free">Free Events</option>
          <option value="paid">Paid Events</option>
        </select>

        <select
          value={filters.availability}
          onChange={(e) => handleChange('availability', e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">All Events</option>
          <option value="available">Available</option>
          <option value="full">Full</option>
        </select>

        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default AdvancedSearch;