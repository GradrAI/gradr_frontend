import React from 'react';

interface FilterTabsProps {
  activeType: string;
  onTypeChange: (type: string) => void;
}

const FilterTabs: React.FC<FilterTabsProps> = ({ activeType, onTypeChange }) => {
  const tabs = [
    { label: 'All', value: '' },
    { label: 'Articles', value: 'article' },
    { label: 'Changelog', value: 'changelog' },
    { label: 'Product Updates', value: 'product-update' },
    { label: 'Hot Features', value: 'hot-feature' },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
      {tabs.map((tab) => (
        <button
          key={tab.label}
          onClick={() => onTypeChange(tab.value)}
          className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 border-2 ${
            activeType === tab.value
              ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105'
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default FilterTabs;
