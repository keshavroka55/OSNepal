import { Helmet } from 'react-helmet-async';

const DEFAULT_DOMAIN = 'https://opensourcenepal.org';

export const OrganizationSchema = () => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Open Source Nepal',
    url: DEFAULT_DOMAIN,
    logo: `${DEFAULT_DOMAIN}/logo512.png`,
    description: 'Open Source Nepal is a modern startup launch and discovery platform for indie hackers, founders, and startup teams.',
    image: `${DEFAULT_DOMAIN}/og-image.jpg`,
    sameAs: [
      'https://twitter.com/Open Source Nepal',
      'https://linkedin.com/company/os-nepal',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      url: `${DEFAULT_DOMAIN}/contact`,
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'NP', // Updated to Nepal
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

export default OrganizationSchema;