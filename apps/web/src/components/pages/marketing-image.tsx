import Image, { type ImageProps } from 'next/image';

type MarketingImageProps = ImageProps;

function resolveImageSrc(src: MarketingImageProps['src']): string {
  if (typeof src === 'string') {
    return src;
  }

  if ('src' in src && typeof src.src === 'string') {
    return src.src;
  }

  if ('default' in src && src.default && typeof src.default === 'object' && 'src' in src.default) {
    return String(src.default.src);
  }

  return '';
}

export function MarketingImage(props: MarketingImageProps) {
  const { fill, width, height, priority, alt, src, className } = props;

  if (!fill && (width == null || height == null)) {
    return (
      <img
        src={resolveImageSrc(src)}
        alt={alt ?? ''}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
    );
  }

  return <Image {...props} alt={alt ?? ''} unoptimized={props.unoptimized ?? false} />;
}
