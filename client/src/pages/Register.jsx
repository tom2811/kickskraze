import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from "../contexts/AuthContext";
import { Container, Heading, Text, TextField, Flex, Box } from '@radix-ui/themes';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { DIM_COLOR, FancyButton } from '../components/StyledComponents';
import LoadingSpinner from "../components/common/LoadingSpinner";

// Minimum password length requirement
const MIN_PASSWORD_LENGTH = 6;

function Register() {
  // State management for form fields and UI
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Hooks
  const { register } = useAuth();
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
    setError('');

    // Validate form inputs
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      await register(formData.email, formData.password);
      navigate('/');
    } catch (error) {
      handleRegistrationError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Form validation
  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return false;
    }
    if (formData.password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
      return false;
    }
    return true;
  };

  // Handle registration errors
  const handleRegistrationError = (error) => {
    switch (error.code) {
      case 'auth/email-already-in-use':
        setError('Email is already in use');
        break;
      case 'auth/invalid-email':
        setError('Invalid email address');
        break;
      default:
        setError('Failed to create an account. Please try again.');
    }
  };

  return (
    <Container size="2" className="mt-20 px-4 sm:px-0">
      <Flex direction="column" align="center" gap="6">
        <Heading size="8" className="text-center" style={{ color: DIM_COLOR }}>
          Create Account
        </Heading>
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
              <InputField
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm Password"
                icon={<FaLock color={DIM_COLOR} />}
              />
              <FancyButton type="submit" className="w-full py-2 text-sm" disabled={isLoading}>
                {isLoading ? <LoadingSpinner /> : "Register"}
              </FancyButton>
            </Flex>
          </form>
        </Box>
        <Text size="2" style={{ color: DIM_COLOR }}>
          Already have an account? <Link to="/login" className="text-cyan-600 hover:underline">Log in</Link>
        </Text>
      </Flex>
    </Container>
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

export default Register;
