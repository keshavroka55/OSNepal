/**
 * SEO Configuration
 * Centralized metadata for all routes in the application
 * Used by SEOHead component to dynamically manage meta tags
 */

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://opensourcenepal.org';
const SITE_NAME = 'Open Source Nepal';
const SITE_DESCRIPTION = 'Open Source Nepal is the premier platform for indie hackers and founders to launch products, gain community traction, and connect with angel investors.';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;
const DEFAULT_TWITTER_IMAGE = `${SITE_URL}/twitter-image.jpg`;

export const SEO_CONFIG = {
  siteUrl: SITE_URL,
  siteName: SITE_NAME,
  description: SITE_DESCRIPTION,
  socialImage: DEFAULT_OG_IMAGE,
  twitterHandle: '@Open Source Nepal',
  author: 'Open Source Nepal Team',
  defaultLocale: 'en_US',
};

/**
 * Route-specific SEO metadata
 * Each route should have: title, description, keywords, image (optional)
 */
export const ROUTE_SEO = {
  '/': {
    title: 'Open Source Nepal - Launch Your Startup, Connect with Investors, Grow Together',
    description: 'Launch your startup, climb the leaderboards, and connect with mentors and investors at Open Source Nepal. The modern ecosystem for builders.',
    keywords: 'startup launch, indie hackers, product hunt, startup community, angel investors, tech founders',
    image: DEFAULT_OG_IMAGE,
    noindex: false,
  },
  '/home': {
    title: 'Home - Open Source Nepal | Startup Community Platform',
    description: 'Discover trending startups and connect with founders in the Open Source Nepal community. Launch products, gain exposure, and find your next opportunity.',
    keywords: 'startup community, trending products, founder network, product discovery',
    image: DEFAULT_OG_IMAGE,
    noindex: false,
  },
  '/discover': {
    title: 'Discover Products - Open Source Nepal | Startup Marketplace',
    description: 'Explore the latest startups and innovative products from the Open Source Nepal community. Find trending tech, SaaS tools, and indie projects.',
    keywords: 'product discovery, trending startups, SaaS tools, indie projects, tech products',
    image: DEFAULT_OG_IMAGE,
    noindex: false,
  },
  '/leaderboard': {
    title: 'Leaderboard - Open Source Nepal | Top Ranked Startups',
    description: 'View the top-ranked startups and founders on the Open Source Nepal leaderboard. See who\'s making waves in the startup ecosystem.',
    keywords: 'startup leaderboard, top founders, trending startups, ranking',
    image: DEFAULT_OG_IMAGE,
    noindex: false,
  },
  '/submit': {
    title: 'Submit Your Startup - Open Source Nepal | Get Featured',
    description: 'Launch your startup on Open Source Nepal and gain exposure to our community. Share your product, climb rankings, and connect with investors.',
    keywords: 'submit startup, launch product, get featured, startup exposure',
    image: DEFAULT_OG_IMAGE,
    noindex: false,
  },
  '/profile': {
    title: 'My Profile - Open Source Nepal | Founder Dashboard',
    description: 'Manage your Open Source Nepal profile, track your startups, and monitor your ranking and engagement metrics.',
    keywords: 'founder profile, startup dashboard, metrics tracking',
    image: DEFAULT_OG_IMAGE,
    noindex: true, // Private page, prevent indexing
  },
  '/dashboard': {
    title: 'Admin Dashboard - Open Source Nepal | Management Panel',
    description: 'Administrative dashboard for Open Source Nepal platform management.',
    keywords: 'admin dashboard, platform management',
    image: DEFAULT_OG_IMAGE,
    noindex: true, // Private page, prevent indexing
  },
  '/privacy-policy': {
    title: 'Privacy Policy - Open Source Nepal',
    description: 'Read Open Source Nepal\'s comprehensive privacy policy and learn how we protect your data.',
    keywords: 'privacy policy, data protection, terms',
    image: DEFAULT_OG_IMAGE,
    noindex: false,
  },
  '/terms-of-service': {
    title: 'Terms of Service - Open Source Nepal',
    description: 'Review Open Source Nepal\'s terms of service and user agreement.',
    keywords: 'terms of service, user agreement, legal',
    image: DEFAULT_OG_IMAGE,
    noindex: false,
  },
  '/cookie': {
    title: 'Cookie Policy - Open Source Nepal',
    description: 'Learn about cookies and how Open Source Nepal uses them to enhance your experience.',
    keywords: 'cookie policy, cookies, data tracking',
    image: DEFAULT_OG_IMAGE,
    noindex: false,
  },
  '/login': {
    title: 'Login - Open Source Nepal | Founder Account',
    description: 'Sign in to your Open Source Nepal account to access your dashboard and manage your startups.',
    keywords: 'login, sign in, account',
    image: DEFAULT_OG_IMAGE,
    noindex: true, // Private page
  },
  '/register': {
    title: 'Register - Open Source Nepal | Join Our Community',
    description: 'Create a Open Source Nepal account and start launching your startup today. Join thousands of founders.',
    keywords: 'register, sign up, create account, join',
    image: DEFAULT_OG_IMAGE,
    noindex: false,
  },
  '/forgot-password': {
    title: 'Forgot Password - Open Source Nepal',
    description: 'Reset your Open Source Nepal password and regain access to your account.',
    keywords: 'forgot password, password reset',
    image: DEFAULT_OG_IMAGE,
    noindex: true,
  },
};

/**
 * Get SEO metadata for a route
 * Falls back to default metadata if route-specific not found
 */
export const getSeoData = (path) => {
  const seoData = ROUTE_SEO[path];
  
  if (seoData) {
    return {
      ...seoData,
      url: `${SITE_URL}${path}`,
    };
  }

  // Default fallback
  return {
    title: `${SITE_NAME} - Connect. Launch. Grow.`,
    description: SITE_DESCRIPTION,
    keywords: 'startup, community, product launch, angel investors',
    image: DEFAULT_OG_IMAGE,
    url: `${SITE_URL}${path}`,
    noindex: false,
  };
};

/**
 * Get SEO data for dynamic routes (e.g., /products/:id)
 */
export const getDynamicSeoData = (routeType, data = {}) => {
  const baseUrl = SITE_URL;

  const dynamicRoutes = {
    product: {
      title: `${data.name || 'Product'} - ${SITE_NAME}`,
      description: data.tagline || `Discover ${data.name} on ${SITE_NAME}. ${SITE_DESCRIPTION}`,
      keywords: `${data.name}, startup, product, ${data.category || 'technology'}`,
      image: data.logo || DEFAULT_OG_IMAGE,
      url: `${baseUrl}/projects/${data.slug ?? data.id}`,
    },
    profile: {
      title: `${data.name || 'Profile'} - ${SITE_NAME}`,
      description: data.headline || `View ${data.name}'s profile and startups on ${SITE_NAME}.`,
      keywords: `${data.name}, founder, startup, profile`,
      image: data.avatar || DEFAULT_OG_IMAGE,
      url: `${baseUrl}/profile/${data.id}`,
    },
  };

  return dynamicRoutes[routeType] || {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    keywords: 'startup',
    image: DEFAULT_OG_IMAGE,
    url: baseUrl,
  };
};

export default SEO_CONFIG;
