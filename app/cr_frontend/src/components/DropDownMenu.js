import React, { useEffect, useState } from 'react';

export const DropDownMenu = ({ options, onSelect, default_selection, default_text }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(default_selection);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    onSelect(option);
    setIsOpen(false);
  };

  // Refreshes the lsit when options or default_selection changes
  useEffect(() => {
    if (!options.includes(selectedOption)) {
      setSelectedOption(default_selection || options[0] || null);
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
