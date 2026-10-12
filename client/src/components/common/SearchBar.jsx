import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Flex } from "@radix-ui/themes";
import { FaSearch } from "react-icons/fa";
import { getAllSneakers } from "../../services/api";

const SearchBar = ({
  className,
  style,
  inputClassName,
  placeholderClassName,
  isCartOpen,
}) => {
  // State for managing search functionality
  const [searchTerm, setSearchTerm] = useState("");
  const [matchedItems, setMatchedItems] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Hooks for navigation and location
  const navigate = useNavigate();
  const location = useLocation();

  // Refs for managing DOM elements
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Effect for fetching matched items based on search term
  useEffect(() => {
    const fetchMatchedItems = async () => {
      if (searchTerm.length > 0) {
        try {
          const { sneakers } = await getAllSneakers(1, 100, "", "default", "");
          const filteredSneakers = sneakers
            .filter((sneaker) =>
              sneaker.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .slice(0, 5);
          setMatchedItems(filteredSneakers);
          setShowDropdown(true);
        } catch (error) {
          console.error("Error fetching matched items:", error);
        }
      } else {
        setMatchedItems([]);
        setShowDropdown(false);
      }
    };

    // Debounce search to avoid excessive API calls
    const debounce = setTimeout(fetchMatchedItems, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  // Effect for handling clicks outside the search component
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handler for input changes
  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setSelectedIndex(-1);
  };

  // Handler for selecting an item from the dropdown
  const handleItemSelection = (sneaker) => {
    setSearchTerm("");
    setMatchedItems([]);
    setShowDropdown(false);
    navigate(`/store?exactId=${encodeURIComponent(sneaker._id)}`);
  };

  // Handler for keyboard navigation in the dropdown
  const handleKeyDown = (e) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < matchedItems.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < matchedItems.length) {
          handleItemSelection(matchedItems[selectedIndex]);
        } else if (searchTerm.trim()) {
          handleSearch();
        }
        break;
      default:
        break;
    }
  };

  // Handler for initiating a search
  const handleSearch = () => {
    if (
      searchTerm.trim() &&
      searchTerm !== new URLSearchParams(location.search).get("search")
    ) {
      setShowDropdown(false);
      const currentSort =
        new URLSearchParams(location.search).get("sort") || "default";
      const currentBrands =
        new URLSearchParams(location.search).get("brands") || "";
      navigate(
        `/store?search=${encodeURIComponent(
          searchTerm.trim()
        )}&sort=${currentSort}&brands=${currentBrands}`,
        { replace: true }
      );
    }
  };

  // Render the search bar and dropdown
  return (
    <Box ref={searchRef} className={`relative z-20 w-full ${className}`} style={style}>
      <Flex 
        className={`relative w-full custom-searchbar ${isCartOpen ? 'search-bar-dimmed' : ''}`}
        align="center"
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="Find your favorite kicks..."
          className={`w-full pr-10 pl-3 py-1.5 md:py-[0.15rem] lg:py-1.5 rounded-md border border-gray-300 focus:outline-none text-sm ${
            showDropdown && matchedItems.length > 0 ? "rounded-b-none" : ""
          } ${inputClassName} ${placeholderClassName}`}
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        <FaSearch
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer hover:text-cyan-500 transition-colors duration-200 md:w-3 md:h-3 lg:w-4 lg:h-4"
          onClick={handleSearch}
        />
      </Flex>
      {showDropdown && matchedItems.length > 0 && (
        <Box className="absolute top-full left-0 right-0 bg-white border border-gray-300 border-t-0 rounded-b-md shadow-md z-[9999] max-h-[300px] overflow-y-auto">
          {matchedItems.map((sneaker, index) => (
            <Box 
              key={sneaker._id} 
              onClick={() => handleItemSelection(sneaker)}
              className={`py-2 cursor-pointer text-sm hover:bg-accent hover:text-white dropdown-item ${
                index === selectedIndex ? 'bg-accent text-white' : ''
              }`}
            >
              {sneaker.name}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

// PropTypes for type checking
SearchBar.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
  inputClassName: PropTypes.string,
  placeholderClassName: PropTypes.string,
  isCartOpen: PropTypes.bool,
};

export default SearchBar;
