import React from 'react';
import PropTypes from 'prop-types';

const SearchBar = ({ searchTerm, onSearchChange, onAddNew }) => {
  return (
    <div className="controls">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Rechercher par marque ou modèle..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <button onClick={onAddNew}>Ajouter</button>
    </div>
  );
};

// ✅ Validation des props
SearchBar.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  onAddNew: PropTypes.func,
};

export default SearchBar;
