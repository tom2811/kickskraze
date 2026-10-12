import React from 'react';
import { Card, Flex, Box, AspectRatio } from '@radix-ui/themes';

// Skeleton component for SneakerCard
export function SneakerCardSkeleton() {
  return (
    <Card className="overflow-hidden shadow-sm">
      <AspectRatio ratio={4 / 3} className="mb-2">
        <Box className="w-full h-full bg-gray-200 animate-pulse" />
      </AspectRatio>
      <Box className="p-2 md:p-3 bg-white">
        <Flex direction="column" gap="1">
          <SkeletonBox className="h-4 w-1/3" />
          <SkeletonBox className="h-6 w-3/4" />
          <SkeletonBox className="h-4 w-1/2" />
          <SkeletonBox className="h-7 w-1/4 mt-1" />
          <SkeletonBox className="h-8 w-full mt-2" />
        </Flex>
      </Box>
    </Card>
  );
}

// Reusable skeleton box component
function SkeletonBox({ className }) {
  return <Box className={`bg-gray-200 rounded animate-pulse ${className}`} />;
}

// Skeleton component for FeaturedSneaker
export function FeaturedSneakerSkeleton() {
  return (
    <Card className="overflow-hidden shadow-sm">
      <AspectRatio ratio={16 / 9} className="mb-2">
        <Box className="w-full h-full bg-gray-200 animate-pulse" />
      </AspectRatio>
      <Box className="p-2 md:p-3 bg-white">
        <Flex direction="column" gap="1">
          <SkeletonBox className="h-6 w-3/4" />
          <SkeletonBox className="h-4 w-1/2" />
        </Flex>
      </Box>
    </Card>
  );
}
