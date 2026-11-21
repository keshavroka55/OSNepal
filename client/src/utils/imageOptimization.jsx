/**
 * Image Optimization Utilities
 * Provides helpers for image optimization and lazy loading
 */

/**
 * Generate responsive image srcset
 * Usage: <img srcSet={generateImageSrcSet(url)} alt="description" />
 */
export const generateImageSrcSet = (url, widths = [320, 640, 1024, 1280]) => {
  if (!url) return '';
  
  // If using a CDN with URL parameter support (adjust based on your CDN)
  // Example: imgix, cloudinary, or similar
  return widths
    .map((width) => `${url}?w=${width} ${width}w`)
    .join(', ');
};

/**
 * Lazy load image component wrapper
 * Provides loading states and error handling
 */
export const OptimizedImage = ({
  src,
  alt,
  className = '',
  loading = 'lazy',
  width,
  height,
  srcSet,
  onLoad,
  onError,
  ...props
}) => {
  return (
    <img
      src={src}
      alt={alt}
      className={`${className} transition-opacity duration-300`}
      loading={loading}
      {...(width && { width })}
      {...(height && { height })}
      {...(srcSet && { srcSet })}
      onLoad={onLoad}
      onError={onError}
      {...props}
    />
  );
};

/**
 * Image with blur-up placeholder effect
 * Useful for better perceived performance
 */
export const BlurImage = ({ src, blurSrc, alt, className = '', ...props }) => {
  const [isLoaded, setIsLoaded] = React.useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {blurSrc && !isLoaded && (
        <img
          src={blurSrc}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover blur-sm"
          aria-hidden="true"
        />
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setIsLoaded(true)}
        loading="lazy"
        {...props}
      />
    </div>
  );
};

/**
 * Generate image URL with width parameter
 * Useful for CDN-based image optimization
 */
export const getImageUrl = (url, { width, height, quality = 80, format = 'webp' } = {}) => {
  if (!url) return '';

  // Skip optimization for data URLs or relative paths without extension
  if (url.startsWith('data:') || !url.includes('.')) {
    return url;
  }

  // For CDN URLs (adjust based on your CDN provider)
  const params = new URLSearchParams();
  if (width) params.append('w', width);
  if (height) params.append('h', height);
  if (quality) params.append('q', quality);

  const separator = url.includes('?') ? '&' : '?';
  return params.toString() ? `${url}${separator}${params.toString()}` : url;
};

/**
 * Picture element for modern image format support
 */
export const PictureImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  sources = [], // Array of { srcSet, type, media }
}) => {
  return (
    <picture>
      {sources.map((source, index) => (
        <source
          key={index}
          {...(source.media && { media: source.media })}
          {...(source.srcSet && { srcSet: source.srcSet })}
          {...(source.type && { type: source.type })}
        />
      ))}
      <img
        src={src}
        alt={alt}
        className={className}
        {...(width && { width })}
        {...(height && { height })}
        loading="lazy"
      />
    </picture>
  );
};

/**
 * Next-gen image format detection
 * Returns WebP if supported, otherwise original format
 */
export const getOptimalImageFormat = (url) => {
  const supportsWebP =
    typeof window !== 'undefined' &&
    new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () =>
        resolve(webP.height === 2);
      webP.src =
        'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAAAwAQCdASoBAAEAAUAcJaACdLoBnAAP/v3AgAA=';
    });

  if (supportsWebP && !url?.includes('.webp')) {
    return url?.replace(/\.(jpg|png)$/i, '.webp');
  }
  return url;
};

/**
 * Responsive image configuration
 * Provides standard breakpoints for responsive images
 */
export const RESPONSIVE_IMAGE_SIZES = {
  thumbnail: { width: 150, height: 150 },
  small: { width: 300, height: 300 },
  medium: { width: 600, height: 400 },
  large: { width: 1024, height: 768 },
  xlarge: { width: 1280, height: 960 },
  hero: { width: 1920, height: 1080 },
};

/**
 * Generate picture sources for responsive images
 */
export const getResponsiveImageSources = (url) => {
  return [
    {
      media: '(min-width: 1200px)',
      srcSet: generateImageSrcSet(url, [1280, 1920]),
    },
    {
      media: '(min-width: 768px)',
      srcSet: generateImageSrcSet(url, [640, 1024]),
    },
    {
      media: '(max-width: 767px)',
      srcSet: generateImageSrcSet(url, [320, 640]),
    },
  ];
};

export default {
  generateImageSrcSet,
  OptimizedImage,
  BlurImage,
  getImageUrl,
  PictureImage,
  getOptimalImageFormat,
  RESPONSIVE_IMAGE_SIZES,
  getResponsiveImageSources,
};
