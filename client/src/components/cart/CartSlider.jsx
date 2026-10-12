import React, { useEffect, useState, useRef } from "react";
import { Box, Flex, Text, Button, IconButton } from "@radix-ui/themes";
import { FaPlus, FaMinus, FaTimes } from "react-icons/fa";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import { DIM_COLOR } from "../StyledComponents";
import ThankYouModal from "./ThankYouModal";

const CartSlider = () => {
  const {
    cartItems,
    isCartOpen,
    toggleCart,
    updateQuantity,
    removeFromCart,
    cartTotal,
    clearCart,
  } = useCart();
  const { currentUser } = useAuth();
  const [isThankYouModalOpen, setIsThankYouModalOpen] = useState(false);
  const cartRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        cartRef.current &&
        !cartRef.current.contains(event.target) &&
        isCartOpen
      ) {
        toggleCart();
      }
    };

    if (isCartOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCartOpen, toggleCart]);

  const handleCheckout = () => {
    setIsThankYouModalOpen(true);
  };

  const handleCloseThankYouModal = () => {
    setIsThankYouModalOpen(false);
    clearCart();
    toggleCart();
  };

  return (
    <>
      <Box
        ref={cartRef}
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50`}
        style={{
          transform: isCartOpen ? "translateX(0)" : "translateX(100%)",
          borderLeft: "1px solid #e5e7eb",
        }}
      >
        <Flex direction="column" className="h-full">
          <Flex justify="between" align="center" p="4">
            {currentUser && (
              <Text size="2" style={{ color: DIM_COLOR }}>
                {currentUser.email}
              </Text>
            )}
            <IconButton
              variant="ghost"
              onClick={toggleCart}
              className="text-cyan-500 hover:text-cyan-600 cursor-pointer"
            >
              <FaTimes size={20} />
            </IconButton>
          </Flex>
          <Box className="flex-grow overflow-y-auto p-4">
            {cartItems.length === 0 ? (
              <Flex justify="center" align="center" className="h-full">
                <Text className="text-gray-500">Your cart is empty</Text>
              </Flex>
            ) : (
              cartItems.map((item) => (
                <Flex
                  key={`${item._id}-${item.size}`}
                  className="mb-4 border-b pb-4"
                >
                  <Box className="w-1/4 mr-4">
                    <img
                      src={item.imgUrl}
                      alt={item.name}
                      className="w-full h-auto object-contain"
                    />
                  </Box>
                  <Flex direction="column" className="flex-grow">
                    <Flex justify="between">
                      <Flex direction="column">
                        <Text weight="bold" size="2">
                          {item.name}
                        </Text>
                        <Text size="1" style={{ color: DIM_COLOR }}>
                          {item.colorway}
                        </Text>
                        <Text size="1">Size: US {item.size}</Text>
                      </Flex>
                      <Button
                        variant="outline"
                        color="red"
                        onClick={() => removeFromCart(item._id, item.size)}
                        size="1"
                        className="text-xs self-start cursor-pointer"
                      >
                        Remove
                      </Button>
                    </Flex>
                    <Flex justify="between" align="center" mt="2">
                      <Flex align="center">
                        <IconButton
                          variant="outline"
                          onClick={() =>
                            updateQuantity(
                              item._id,
                              item.size,
                              item.quantity - 1
                            )
                          }
                          size="1"
                          className="w-5 h-5 p-0 cursor-pointer"
                        >
                          <FaMinus size={8} />
                        </IconButton>
                        <Text mx="2" size="2">
                          {item.quantity}
                        </Text>
                        <IconButton
                          variant="outline"
                          onClick={() =>
                            updateQuantity(
                              item._id,
                              item.size,
                              item.quantity + 1
                            )
                          }
                          size="1"
                          className="w-5 h-5 p-0 cursor-pointer"
                        >
                          <FaPlus size={8} />
                        </IconButton>
                      </Flex>
                      <Text weight="bold" size="2">
                        ${(item.price * item.quantity).toFixed(2)}
                      </Text>
                    </Flex>
                  </Flex>
                </Flex>
              ))
            )}
          </Box>
          <Box p="4" className="border-t">
            <Flex justify="between" align="center" mb="2">
              <Text size="3" weight="bold">
                Total:
              </Text>
              <Text size="3" weight="bold">
                ${cartTotal.toFixed(2)}
              </Text>
            </Flex>
            <Button
              className="w-full cursor-pointer"
              disabled={cartItems.length === 0}
              size="2"
              variant="outline"
              color="cyan"
              onClick={handleCheckout}
            >
              Checkout
            </Button>
          </Box>
        </Flex>
      </Box>

      <ThankYouModal
        isOpen={isThankYouModalOpen}
        onClose={handleCloseThankYouModal}
      />
    </>
  );
};

export default CartSlider;
