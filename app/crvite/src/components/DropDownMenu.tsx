import React, { useEffect, useState } from 'react';

interface DropDownMenuProps {
  options: string[];
  onSelect: (option: string) => void;
  default_selection: string;
  default_text: string;
}


export const DropDownMenu: React.FC<DropDownMenuProps> = ({ options, onSelect, default_selection, default_text }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(default_selection);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
    onSelect(option);
    setIsOpen(false);
  };

  // Refreshes the list when options or default_selection changes
  useEffect(() => {
    if (!options.includes(selectedOption)) {
      setSelectedOption(default_selection || options[0] || '');
    }
  }, [default_selection, options]);

  return (
    <div className="dropdown">
      <button onClick={toggleDropdown} className="dropdown-toggle">
        {selectedOption || default_text}
      </button>
      {isOpen && (
        <ul className="dropdown-menu">
          {options.map((option, index) => (
            <li
              key={index}
              onClick={() => handleOptionClick(option)}
              className="dropdown-item"
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
