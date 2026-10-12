import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Container,
  Heading,
  Text,
  TextField,
  Button,
  Flex,
  Box,
} from "@radix-ui/themes";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { DIM_COLOR, FancyButton } from "../components/StyledComponents";
import ForgotPassword from "../components/auth/ForgotPassword";
import LoadingSpinner from "../components/common/LoadingSpinner";

function Login() {
  // State management for form fields and UI
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Hooks
  const { login } = useAuth();
  const navigate = useNavigate();

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await login(formData.email, formData.password);
      navigate("/");
    } catch (error) {
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle authentication errors
  const handleAuthError = (error) => {
    switch (error.code) {
      case "auth/invalid-credential":
        setError("Invalid email or password. Please try again.");
        break;
      case "auth/too-many-requests":
        setError("Too many failed login attempts. Please try again later.");
        break;
      case "auth/network-request-failed":
        setError("Network error. Please check your internet connection.");
        break;
      default:
        setError("An error occurred during login. Please try again.");
    }
  };

  // Toggle forgot password component
  const handleForgotPasswordClick = () => {
    setShowForgotPassword(true);
    setError("");
  };

  return (
    <Container size="2" className="mt-20 px-4 sm:px-0">
      <Flex direction="column" align="center" gap="6">
        <Heading size="8" className="text-center" style={{ color: DIM_COLOR }}>
          Welcome Back
        </Heading>
        {showForgotPassword ? (
          <ForgotPassword onClose={() => setShowForgotPassword(false)} />
        ) : (
          <LoginForm
            formData={formData}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            error={error}
            isLoading={isLoading}
            handleForgotPasswordClick={handleForgotPasswordClick}
          />
        )}
        <Text size="2" style={{ color: DIM_COLOR }}>
          Don't have an account?{" "}
          <Link to="/register" className="text-cyan-600 hover:underline">
            Sign up
          </Link>
        </Text>
      </Flex>
    </Container>
  );
}

// Login form component
function LoginForm({ formData, handleInputChange, handleSubmit, error, isLoading, handleForgotPasswordClick }) {
  return (
    <>
      {error && <Text color="red" size="2">{error}</Text>}
      <Box className="w-full max-w-sm">
        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap="4">
            <InputField
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email"
              icon={<FaEnvelope color={DIM_COLOR} />}
            />
            <InputField
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Password"
              icon={<FaLock color={DIM_COLOR} />}
            />
            <Flex direction="column" gap="2">
              <FancyButton type="submit" className="w-full py-2 text-sm" disabled={isLoading}>
                {isLoading ? <LoadingSpinner /> : "Log In"}
              </FancyButton>
              <Flex justify="end">
                <Button
                  variant="ghost"
                  onClick={handleForgotPasswordClick}
                  className="text-xs"
                  style={{ color: DIM_COLOR }}
                >
                  Forgot Password?
                </Button>
              </Flex>
            </Flex>
          </Flex>
        </form>
      </Box>
    </>
  );
}

// Reusable input field component
function InputField({ type, name, value, onChange, placeholder, icon }) {
  return (
    <TextField.Root>
      <TextField.Slot>
        {icon}
      </TextField.Slot>
      <TextField.Input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className="custom-textfield"
      />
    </TextField.Root>
  );
}

export default Login;
