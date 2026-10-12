import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Text, Flex, Box, Grid, AspectRatio, Card } from '@radix-ui/themes';
import { FancyButton, ShimmeringHeading, DIM_COLOR, ACCENT_COLOR } from '../components/StyledComponents';
import FeatureCard from '../components/feature/FeatureCard';
import { featureCards } from '../data/featureCardsData';
import { motion } from 'framer-motion';
import { FaFire } from 'react-icons/fa';
import { getFeaturedSneaker } from '../services/api';
import { FeaturedSneakerSkeleton } from '../components/skeletons/Skeletons';

function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const [featuredSneaker, setFeaturedSneaker] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedSneaker = async () => {
      setIsLoading(true);
      try {
        const sneaker = await getFeaturedSneaker();
        setFeaturedSneaker(sneaker);
      } catch (error) {
        console.error('Error fetching featured sneaker:', error.response?.data || error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedSneaker();

    // Set up an interval to fetch a new featured sneaker every 12 hours
    const interval = setInterval(fetchFeaturedSneaker, 12 * 60 * 60 * 1000);

    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <Container className="min-h-[calc(100vh-128px)] flex flex-col px-4 sm:px-6 md:px-8 py-8 md:py-12">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto w-full flex-grow"
      >
        <Flex direction={{ initial: 'column', md: 'row' }} gap="8" className="items-start">
          {/* Left Column: Headings and Text */}
          <Box className="flex-1 flex flex-col justify-between items-center md:items-start">
            <div className="text-center md:text-left">
              <motion.div variants={itemVariants}>
                <ShimmeringHeading size="8" className="mb-5 md:my-5">
                  KicksKraze
                </ShimmeringHeading>
              </motion.div>
              
              <motion.div variants={itemVariants} className="mb-6">
                <Text size="3" className="text-gray-600 leading-relaxed">
                  Welcome to KicksKraze, your go-to marketplace for authentic sneakers. 
                  From classic styles to the latest drops, we offer a curated selection 
                  of verified kicks. Step into authenticity with KicksKraze.
                </Text>
              </motion.div>

              <motion.div variants={itemVariants} className="mb-12">
                <Link to="/store" className="inline-block">
                  <FancyButton className="text-sm md:text-base px-6 py-2 rounded-full">
                    Shop Now
                  </FancyButton>
                </Link>
              </motion.div>

              <motion.div variants={itemVariants} className="my-6">
                {isLoading ? (
                  <FeaturedSneakerSkeleton />
                ) : featuredSneaker && (
                  <Card className="overflow-hidden max-w-xs shadow-lg border border-gray-200 mx-auto md:mx-0">
                    <Box className="p-3">
                      <Flex align="center" justify="between" className="mb-2">
                        <Box className="bg-orange-500 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center">
                          <FaFire className="mr-1 text-yellow-300" /> Sneaker of the Day
                        </Box>
                      </Flex>
                      <Box className="w-full h-40 relative rounded-lg shadow-inner p-2">
                        <img
                          src={featuredSneaker.imgUrl}
                          alt={featuredSneaker.name}
                          className="absolute inset-0 w-full h-full object-contain p-2"
                          onError={(e) => {
                            e.target.onerror = null;
                          }}
                        />
                      </Box>
                      <Box className="mt-3 flex justify-between items-center">
                        <Text size="2" weight="bold" style={{ color: DIM_COLOR }}>
                          {featuredSneaker.name}
                        </Text>
                        <Text size="4" weight="bold" style={{ color: ACCENT_COLOR }}>
                          ${featuredSneaker.price}
                        </Text>
                      </Box>
                    </Box>
                  </Card>
                )}
              </motion.div>
            </div>
          </Box>

          {/* Right Column: Feature Cards */}
          <Box className="flex-1">
            <Grid columns="1" gap="4">
              {featureCards.map((card, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <FeatureCard 
                    icon={card.icon}
                    title={card.title}
                    description={card.description}
                  />
                </motion.div>
              ))}
            </Grid>
          </Box>
        </Flex>
      </motion.div>
    </Container>
  );
}

export default Home;
