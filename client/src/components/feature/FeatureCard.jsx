import React from 'react';
import { Box, Text, Flex } from '@radix-ui/themes';
import { motion } from 'framer-motion';

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className="feature-card bg-white rounded-lg shadow-md p-6 transition-all duration-300"
    >
      <Flex align="center" gap="4">
        <Box className="feature-card-icon text-cyan-600">
          <Icon size={32} />
        </Box>
        <Box>
          <Text as="h3" size="4" weight="bold" className="feature-card-title mb-2">
            {title}
          </Text>
          <Text as="p" size="2" className="feature-card-description text-gray-600">
            {description}
          </Text>
        </Box>
      </Flex>
    </motion.div>
  );
}

export default FeatureCard;
