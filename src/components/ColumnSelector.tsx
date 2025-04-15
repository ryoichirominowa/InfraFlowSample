// src/components/ColumnSelector.tsx
import React from "react";

interface ColumnSelectorProps {
  id: string;
  label: string;
  options: string[];
  selectedValue: string;
  setSelectedValue: (value: string) => void;
}

const ColumnSelector: React.FC<ColumnSelectorProps> = ({
  id,
  label,
  options,
  selectedValue,
  setSelectedValue,
}) => {
  return (
    <div className="mb-2">
      <p className="block font-bold mb-1">{label}</p>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {options.map((option) => (
          <label
            key={`${id}-${option}`}
            className="flex items-center space-x-1 cursor-pointer"
          >
            <input
              type="radio"
              name={id}
              value={option}
              checked={selectedValue === option}
              onChange={(e) => setSelectedValue(e.target.value)}
              className="cursor-pointer"
            />
            <span className="text-sm">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default ColumnSelector;
