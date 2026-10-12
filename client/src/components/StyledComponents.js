import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import { Heading, Text } from '@radix-ui/themes';

// Constants
export const DIM_COLOR = '#4A4A4A';
export const ACCENT_COLOR = 'hsl(192, 91%, 36%)';

// Keyframes
const shimmer = keyframes`
  0% { background-position: 120% 0; }
  50% { background-position: 60% 0; }
  100% { background-position: 20% 0; }
`;

// Styled Components

// Logo
export const Logo = styled.span`
  font-family: 'Caveat', cursive;
  color: white;
  font-weight: 700;
  font-size: 2rem;
  -webkit-text-stroke: 1.5px ${ACCENT_COLOR};
`;

// Filter Menu
export const FilterMenu = styled.div`
  @media (max-width: 767px) {
    max-height: ${props => props.$isOpen ? '300px' : '0'};
    overflow: hidden;
    transition: max-height 0.3s ease-in-out;
    padding-left: 1rem;
  }
`;

// Fancy Button
export const FancyButton = styled.button`
  background-color: white;
  color: ${DIM_COLOR};
  border: 1px solid ${ACCENT_COLOR};
  border-radius: 16px;
  padding: 0.3rem 0.8rem;
  font-weight: 500;
  font-size: 0.75rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  z-index: 1;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 0;
    height: 100%;
    background-color: ${ACCENT_COLOR};
    transition: all 0.3s ease;
    z-index: -1;
  }

  &:hover {
    color: white;
    &::before {
      width: 100%;
    }
  }

  &:active {
    transform: scale(0.95);
  }

  @media (min-width: 768px) {
    font-size: 0.875rem;
  }
`;

// Mobile Fancy Button
export const MobileFancyButton = styled(FancyButton)`
  width: auto;
  font-size: 0.75rem;
  padding: 0.25rem 0.6rem;
`;

// Animated Link
export const AnimatedLink = styled(Link)`
  color: ${props => props.$dimColor};
  text-decoration: none;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 2px;
    bottom: -4px;
    left: 0;
    background-color: ${ACCENT_COLOR};
    transform: scaleX(${props => props.$isActive ? 1 : 0});
    transform-origin: bottom left;
    transition: transform 0.3s ease-out;
  }
`;

// Shimmering Heading
export const ShimmeringHeading = styled(Heading)`
  background: linear-gradient(
    90deg,
    #0e7490 0%,
    #0e7490 45%,
    #22d3ee 50%,
    #0e7490 55%,
    #0e7490 100%
  );
  background-size: 200% auto;
  color: transparent;
  -webkit-background-clip: text;
  background-clip: text;
  animation: ${shimmer} 4s linear infinite;
`;
