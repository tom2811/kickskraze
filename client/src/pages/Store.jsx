import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Container,
  Heading,
  Flex,
  Box,
  Checkbox,
  Text,
  Grid,
  Button,
  Select,
  Badge,
} from "@radix-ui/themes";
import { FaChevronLeft, FaChevronRight, FaChevronDown } from "react-icons/fa";
import { getAllSneakers, getSneakerById } from "../services/api";
import SneakerCard from "../components/product/SneakerCard";
import { FilterMenu } from "../components/StyledComponents";
import { DIM_COLOR } from "../components/StyledComponents";
import { SneakerCardSkeleton } from "../components/skeletons/Skeletons";

const ITEMS_PER_PAGE = 12;

function Store() {
  // State management for the Store component
  const [state, setState] = useState({
    sneakers: [],
    brands: [],
    loading: true,
    error: null,
    currentPage: 1,
    totalPages: 0,
    selectedBrands: [],
    sortOrder: "default",
    totalSneakers: 0,
    isFilterOpen: false,
    searchQuery: "",
    exactId: null,
    selectedSneakerName: "",
    isInitialLoad: true,
    brandsLoading: true,
  });

  const location = useLocation();
  const navigate = useNavigate();
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const loadedImagesCount = useRef(0);

  // Helper function to update state
  const updateState = (newState) =>
    setState((prevState) => ({ ...prevState, ...newState }));

  // Effect to handle URL parameters and update state accordingly
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const newState = {
      searchQuery: params.get("search") || "",
      exactId: params.get("exactId") || null,
      currentPage: parseInt(params.get("page")) || 1,
      selectedBrands: params.get("brands")
        ? params.get("brands").split(",")
        : [],
      sortOrder: params.get("sort") || "default",
      isInitialLoad: false,
    };

    if (newState.exactId) {
      newState.selectedBrands = [];
      newState.sortOrder = "default";
    }

    updateState(newState);
  }, [location.search]);

  // Function to fetch sneakers based on current state
  const fetchSneakers = useCallback(async () => {
    if (state.isInitialLoad) return;

    updateState({ loading: true, error: null });
    try {
      let data;
      if (state.exactId) {
        const sneaker = await getSneakerById(state.exactId);
        data = { sneakers: [sneaker], totalPages: 1, totalSneakers: 1 };
        updateState({ selectedSneakerName: sneaker.name });
      } else {
        const brandsParam = state.selectedBrands.join(",");
        data = await getAllSneakers(
          state.currentPage,
          ITEMS_PER_PAGE,
          brandsParam,
          state.sortOrder,
          state.searchQuery
        );
      }
      updateState({
        sneakers: data.sneakers,
        totalPages: data.totalPages,
        totalSneakers: data.totalSneakers,
      });
    } catch (err) {
      console.error("Error fetching sneakers:", err);
      updateState({
        error: "Failed to fetch sneakers. Please try again later.",
        exactId: state.exactId ? null : state.exactId,
      });
    } finally {
      setTimeout(() => {
        updateState({ loading: false });
      }, 1000);
    }
  }, [
    state.currentPage,
    state.selectedBrands,
    state.sortOrder,
    state.searchQuery,
    state.exactId,
    state.isInitialLoad,
  ]);

  // Effect to trigger sneaker fetching when relevant state changes
  useEffect(() => {
    if (!state.isInitialLoad) {
      fetchSneakers();
    }
  }, [fetchSneakers, state.isInitialLoad]);

  // Effect to fetch all brands on component mount
  useEffect(() => {
    const fetchBrands = async () => {
      updateState({ brandsLoading: true });
      try {
        const { sneakers } = await getAllSneakers(1, 1000);
        const uniqueBrands = [
          ...new Set(sneakers.map((sneaker) => sneaker.brand)),
        ];
        updateState({ brands: uniqueBrands, brandsLoading: false });
      } catch (error) {
        console.error("Error fetching brands:", error);
        updateState({ brandsLoading: false });
      }
    };

    fetchBrands();
  }, []);

  // Effect to update URL based on current state
  useEffect(() => {
    if (!state.isInitialLoad) {
      const params = new URLSearchParams();
      if (state.searchQuery) params.set("search", state.searchQuery);
      if (state.exactId) params.set("exactId", state.exactId);
      if (state.currentPage !== 1)
        params.set("page", state.currentPage.toString());
      if (state.selectedBrands.length > 0)
        params.set("brands", state.selectedBrands.join(","));
      if (state.sortOrder !== "default") params.set("sort", state.sortOrder);

      navigate(`/store?${params.toString()}`, { replace: true });
    }
  }, [
    state.searchQuery,
    state.exactId,
    state.currentPage,
    state.selectedBrands,
    state.sortOrder,
    navigate,
    state.isInitialLoad,
  ]);

  // Handler for brand selection
  const handleBrandChange = (brand) => {
    updateState({
      selectedBrands:
        brand === "All Items"
          ? []
          : state.selectedBrands.includes(brand)
          ? state.selectedBrands.filter((b) => b !== brand)
          : [...state.selectedBrands, brand],
      currentPage: 1,
      exactId: null,
      searchQuery: "",
    });
  };

  // Handler for sort order change
  const handleSortChange = (value) => {
    updateState({ sortOrder: value, currentPage: 1 });
  };

  // Toggle filter menu visibility
  const toggleFilter = () => updateState({ isFilterOpen: !state.isFilterOpen });

  const handleImageLoad = useCallback(() => {
    loadedImagesCount.current += 1;
    if (loadedImagesCount.current === state.sneakers.length) {
      setImagesLoaded(true);
    }
  }, [state.sneakers.length]);

  // Reset loadedImagesCount and imagesLoaded when sneakers change
  useEffect(() => {
    loadedImagesCount.current = 0;
    setImagesLoaded(false);
  }, [state.sneakers]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <Container className="py-4 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
      <Flex direction="column" className="md:flex-row md:gap-2 lg:gap-4">
        <FilterSection
          brands={state.brands}
          selectedBrands={state.selectedBrands}
          isFilterOpen={state.isFilterOpen}
          handleBrandChange={handleBrandChange}
          toggleFilter={toggleFilter}
          brandsLoading={state.brandsLoading}
        />
        <MainContent
          state={state}
          handleSortChange={handleSortChange}
          updateState={updateState}
          imagesLoaded={imagesLoaded}
          onImageLoad={handleImageLoad}
          scrollToTop={scrollToTop}
        />
      </Flex>
    </Container>
  );
}

// Component for rendering filter section
function FilterSection({
  brands,
  selectedBrands,
  isFilterOpen,
  handleBrandChange,
  toggleFilter,
  brandsLoading,
}) {
  return (
    <Box className="w-full md:w-1/4 lg:w-2/12 mb-4 md:mb-0">
      {/* Mobile filter */}
      <Flex justify="center" align="center" className="sm:hidden pb-2">
        <Flex align="center" className="relative">
          <Heading size="1" className="text-gray-600 mr-3">
            Filter Items
          </Heading>
          <Button
            variant="ghost"
            onClick={toggleFilter}
            className="p-0 text-cyan-500"
          >
            <FaChevronDown
              className={`transition-transform duration-300 ${
                isFilterOpen ? "transform rotate-180" : ""
              }`}
            />
          </Button>
        </Flex>
      </Flex>
      {/* Desktop filter */}
      <Heading
        size={{ initial: "1", sm: "2", lg: "3" }}
        mb="2"
        mt="1"
        className="text-gray-600 hidden sm:block"
      >
        Filter Items
      </Heading>

      {/* Filter Menu */}
      <FilterMenu $isOpen={isFilterOpen}>
        {brandsLoading ? (
          <Text size="2" className="text-gray-500">
            Loading brands...
          </Text>
        ) : (
          <Flex direction="column" gap="1" className="sm:pl-0">
            {/* All Items Checkbox */}
            <Flex
              align="center"
              className="cursor-pointer hover:bg-gray-100 rounded-md p-1"
            >
              <Checkbox
                checked={selectedBrands.length === 0}
                onCheckedChange={() => handleBrandChange("All Items")}
                color="cyan"
                size="1"
              />
              <Text
                ml="2"
                size={{ initial: "1", lg: "2" }}
                className="sm:text-xs lg:text-sm"
              >
                All Items
              </Text>
            </Flex>
            {/* Brand Checkboxes */}
            {brands.map((brand) => (
              <Flex
                key={brand}
                align="center"
                className="cursor-pointer hover:bg-gray-100 rounded-md p-1"
              >
                <Checkbox
                  checked={selectedBrands.includes(brand)}
                  onCheckedChange={() => handleBrandChange(brand)}
                  color="cyan"
                  size="1"
                />
                <Text
                  ml="2"
                  size={{ initial: "1", lg: "2" }}
                  className="sm:text-xs lg:text-sm"
                >
                  {brand}
                </Text>
              </Flex>
            ))}
          </Flex>
        )}
      </FilterMenu>
    </Box>
  );
}

// Component for rendering main content (sneaker grid, pagination)
function MainContent({ state, handleSortChange, updateState, imagesLoaded, onImageLoad, scrollToTop }) {
  return (
    <Box className="w-full md:w-3/4 lg:w-10/12">
      <Flex justify="between" align="center" mb="2" wrap="wrap" gap="2">
        <Text
          size={{ initial: "1", lg: "2" }}
          className="text-gray-600 md:text-xs lg:text-sm"
        >
          {state.exactId
            ? `Showing: ${state.selectedSneakerName}`
            : state.searchQuery
            ? `Search results for "${state.searchQuery}"`
            : `Total sneakers found: ${state.totalSneakers}`}
        </Text>
        {/* Selected brands badges (hidden on mobile) */}
        <Flex
          gap="1"
          align="center"
          wrap="wrap"
          className="max-w-full hidden md:flex"
        >
          {state.selectedBrands.slice(0, 3).map((brand) => (
            <Badge
              key={brand}
              variant="soft"
              radius="full"
              color="cyan"
              size="1"
              className="md:text-xs lg:text-sm"
            >
              {brand}
            </Badge>
          ))}
          {state.selectedBrands.length > 3 && (
            <Badge
              variant="soft"
              radius="full"
              color="cyan"
              size="1"
              className="md:text-xs lg:text-sm"
            >
              +{state.selectedBrands.length - 3} more
            </Badge>
          )}
        </Flex>
        {/* Sort Dropdown */}
        <Select.Root value={state.sortOrder} onValueChange={handleSortChange}>
          <Select.Trigger
            color="cyan"
            className={`cursor-pointer text-xs md:text-sm lg:text-sm`}
            style={{ color: DIM_COLOR }}
            size="2"
          />
          <Select.Content
            color="cyan"
            className="text-xs md:text-sm lg:text-sm"
          >
            <Select.Item value="default" className="cursor-pointer">
              Sort: Featured
            </Select.Item>
            <Select.Item value="highToLow" className="cursor-pointer">
              Price: High to Low
            </Select.Item>
            <Select.Item value="lowToHigh" className="cursor-pointer">
              Price: Low to High
            </Select.Item>
          </Select.Content>
        </Select.Root>
      </Flex>

      {/* Sneaker Grid */}
      <Grid
        columns={{ initial: "1", sm: "2", lg: "3" }}
        gap={{ initial: "2", md: "3", lg: "4" }}
      >
        {state.loading
          ? Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
              <SneakerCardSkeleton key={index} />
            ))
          : state.sneakers.map((sneaker) => (
              <SneakerCard 
                key={sneaker.id} 
                sneaker={sneaker} 
                onLoad={onImageLoad}
              />
            ))}
      </Grid>

      {/* Pagination */}
      <Flex justify="center" mt="4">
        <Flex align="center" gap="2">
          <Button
            onClick={() => {
              updateState({ currentPage: Math.max(state.currentPage - 1, 1) });
              scrollToTop();
            }}
            disabled={state.currentPage === 1}
            variant="soft"
            color="cyan"
            size="1"
            className="cursor-pointer md:text-xs lg:text-sm"
          >
            <FaChevronLeft />
          </Button>
          <Text size="1" className="text-gray-600 md:text-xs lg:text-sm">
            Page {state.currentPage} of {state.totalPages}
          </Text>
          <Button
            onClick={() => {
              updateState({
                currentPage: Math.min(state.currentPage + 1, state.totalPages),
              });
              scrollToTop();
            }}
            disabled={state.currentPage === state.totalPages}
            variant="soft"
            color="cyan"
            size="1"
            className="cursor-pointer md:text-xs lg:text-sm"
          >
            <FaChevronRight />
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
}

export default Store;
