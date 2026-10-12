import React, { useState, useEffect } from "react";
import {
  Card,
  Flex,
  Box,
  Text,
  Button,
  Select,
  Tooltip,
  AspectRatio,
} from "@radix-ui/themes";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { SneakerCardSkeleton } from "../skeletons/Skeletons";

// Generate sizes from US 4 to US 15
const AVAILABLE_SIZES = Array.from({ length: 12 }, (_, i) => i + 4);

function SneakerCard({ sneaker, onLoad }) {
  const { currentUser } = useAuth();
  const { addToCart, isItemInCart, toggleCart } = useCart();
  const navigate = useNavigate();

  const [selectedSize, setSelectedSize] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);

  // Load sneaker image
  useEffect(() => {
    const img = new Image();
    img.src = sneaker.imgUrl;
    img.onload = onLoad;
  }, [sneaker.imgUrl, onLoad]);

  // Handle adding item to cart
  const handleAddToCart = () => {
    if (selectedSize) {
      addToCart({ ...sneaker, size: selectedSize });
      setShowTooltip(false);
    } else {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 1000);
    }
  };

  // Handle viewing cart
  const handleViewCart = () => {
    toggleCart();
  };

  const isInCart = selectedSize && isItemInCart(sneaker._id, selectedSize);

  // Show skeleton while image is loading
  if (!onLoad) {
    return <SneakerCardSkeleton />;
  }

  return (
    <Card className="overflow-hidden shadow-sm">
      {/* Sneaker Image */}
      <AspectRatio ratio={4 / 3} className="mb-2">
        <img
          src={sneaker.imgUrl}
          alt={sneaker.name}
          className="object-cover w-[70%] h-[70%] sm:w-3/4 sm:h-3/4 lg:w-2/3 lg:h-2/3 xl:w-3/4 xl:h-3/4 mx-auto"
          onLoad={onLoad}
        />
      </AspectRatio>

      {/* Sneaker Details */}
      <Box className="p-2 md:p-3 bg-white">
        <Flex direction="column" gap="1">
          {/* Brand */}
          <Text
            size={{ initial: "1", lg: "2" }}
            weight="bold"
            className="text-gray-500 uppercase tracking-wide truncate"
          >
            {sneaker.brand}
          </Text>

          {/* Sneaker Name */}
          <Text
            as="h3"
            size={{ initial: "2", lg: "3" }}
            weight="bold"
            className="truncate"
            title={sneaker.name}
          >
            {sneaker.name}
          </Text>

          {/* Colorway */}
          <Text
            size={{ initial: "1", lg: "2" }}
            className="text-gray-600 truncate"
            title={sneaker.colorway}
          >
            {sneaker.colorway}
          </Text>

          {/* Price */}
          <Text
            size={{ initial: "3", lg: "4" }}
            weight="bold"
            className="text-cyan-700"
          >
            ${sneaker.price}
          </Text>

          {/* Add to Cart Section */}
          {currentUser ? (
            <Flex gap="2" align="center">
              {/* Size Selector */}
              <Select.Root value={selectedSize} onValueChange={setSelectedSize}>
                <Select.Trigger
                  placeholder="Size"
                  color="cyan"
                  className="cursor-pointer"
                  size="1"
                />
                <Select.Content color="cyan">
                  {AVAILABLE_SIZES.map((size) => (
                    <Select.Item
                      key={size}
                      value={size.toString()}
                      className="cursor-pointer"
                    >
                      US {size}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>

              {/* Add to Cart / View in Cart Button */}
              <Tooltip content="Please select a size first" open={showTooltip}>
                <Button
                  onClick={isInCart ? handleViewCart : handleAddToCart}
                  size="2"
                  className="flex-grow truncate cursor-pointer"
                  variant="outline"
                  color="cyan"
                >
                  {isInCart ? "View in Cart" : "Add to Cart"}
                </Button>
              </Tooltip>
            </Flex>
          ) : (
            // Login to Purchase Button (for non-logged in users)
            <Button
              size="2"
              className="mt-2 w-full cursor-pointer"
              disabled={!currentUser}
            >
              Login to Purchase
            </Button>
          )}
        </Flex>
      </Box>
    </Card>
  );
}

export default SneakerCard;
