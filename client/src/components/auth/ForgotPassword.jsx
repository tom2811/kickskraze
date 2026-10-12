import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { TextField, Button, Text, Flex, Box, Heading } from "@radix-ui/themes";
import { FaEnvelope } from "react-icons/fa";
import { DIM_COLOR, FancyButton } from "../StyledComponents";
import LoadingSpinner from "../common/LoadingSpinner";

function ForgotPassword({ onClose }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError("");
    try {
      await resetPassword(email);
      setMessage("Check your inbox for further instructions");
    } catch (error) {
      setError("Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className="w-full max-w-sm">
      <Heading
        size="6"
        className="text-center mb-6"
        style={{ color: DIM_COLOR }}
      >
        Reset Password
      </Heading>
      {message && (
        <Text color="green" size="2" className="mb-4 text-center">
          {message}
        </Text>
      )}
      {error && (
        <Text color="red" size="2" className="mb-4 text-center">
          {error}
        </Text>
      )}
      <form onSubmit={handleSubmit}>
        <Flex direction="column" gap="4">
          <TextField.Root>
            <TextField.Slot>
              <FaEnvelope color={DIM_COLOR} />
            </TextField.Slot>
            <TextField.Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="custom-textfield"
            />
          </TextField.Root>
          <Flex direction="column" gap="2">
            <FancyButton type="submit" className="w-full py-2 text-sm" disabled={isLoading}>
              {isLoading ? <LoadingSpinner /> : "Reset Password"}
            </FancyButton>
            <Flex justify="end">
              <Button
                variant="ghost"
                onClick={onClose}
                className="text-xs"
                style={{ color: DIM_COLOR }}
              >
                Back to Login
              </Button>
            </Flex>
          </Flex>
        </Flex>
      </form>
    </Box>
  );
}

export default ForgotPassword;
