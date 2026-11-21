import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Home, ArrowLeft, Search, Compass } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFoundPage() {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1] as const,
      },
    },
  };

  const suggestions = [
    {
      icon: Compass,
      label: 'Explore Products',
      description: 'Discover the latest startups',
      path: '/products',
    },
    {
      icon: Search,
      label: 'Search',
      description: 'Find what you\'re looking for',
      path: '/products',
    },
    {
      icon: Home,
      label: 'Home',
      description: 'Return to the homepage',
      path: '/',
    },
  ];

  return (
    <div className="min-h-screen bg-card flex items-center justify-center pt-[44px]">
      <div className="max-w-[1262px] mx-auto px-5 md:px-6 lg:px-8 py-12 md:py-16 w-full">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-[600px] mx-auto"
        >
          {/* 404 Display */}
          <motion.div variants={itemVariants} className="mb-8">
            <span className="text-muted-foreground text-[12px] font-normal leading-[16px] tracking-normal">
              ERROR
            </span>
            <div className="text-[120px] md:text-[160px] font-semibold leading-[1] text-foreground mt-2 mb-4">
              404
            </div>
          </motion.div>

          {/* Message */}
          <motion.div variants={itemVariants}>
            <h1 className="text-foreground text-[40px] md:text-[48px] font-semibold leading-[44px] md:leading-[52px] mb-4">
              Page not found
            </h1>
            <p className="text-foreground text-[17px] font-normal leading-[25px] mb-8 max-w-[480px] mx-auto">
              Sorry, the page you're looking for doesn't exist or has been moved. 
              Let's get you back on track.
            </p>
          </motion.div>

          {/* Primary Actions */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-3 justify-center mb-12"
          >
            <Button
              onClick={() => navigate(-1)}
              className="h-[44px] rounded-full border-2 border-primary text-primary hover:bg-[rgba(0,113,227,0.05)] active:border-primary-active bg-transparent text-[17px] leading-[25px] px-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            <Button
              onClick={() => navigate('/products')}
              className="h-[44px] rounded-full bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active text-[17px] leading-[25px] px-6"
            >
              <Search className="mr-2 h-4 w-4" />
              Browse Products
            </Button>
          </motion.div>

          {/* Suggestions */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {suggestions.map((suggestion) => (
              <motion.button
                key={suggestion.label}
                onClick={() => navigate(suggestion.path)}
                className="p-6 border border-border bg-card text-left cursor-pointer group"
                whileHover={{
                  scale: 1.02,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                  transition: { duration: 0.2 },
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary mb-4 group-hover:bg-primary transition-colors duration-200">
                  <suggestion.icon className="h-5 w-5 text-muted-foreground group-hover:text-white transition-colors duration-200" />
                </div>
                <h3 className="text-[17px] font-semibold leading-[21px] text-foreground mb-1">
                  {suggestion.label}
                </h3>
                <p className="text-[12px] font-normal leading-[16px] text-muted-foreground">
                  {suggestion.description}
                </p>
              </motion.button>
            ))}
          </motion.div>

          {/* Help Text */}
          <motion.p
            variants={itemVariants}
            className="mt-12 text-[12px] font-normal leading-[16px] text-muted-foreground"
          >
            If you believe this is a mistake, please{' '}
            <a
              href="mailto:support@opensourcenepal.org"
              className="text-primary hover:text-primary-hover underline transition-colors duration-200"
            >
              contact support
            </a>
            .
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}