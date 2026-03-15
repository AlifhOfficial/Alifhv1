import Image, { type ImageProps } from 'next/image';

type MarketingImageProps = ImageProps;

export function MarketingImage(props: MarketingImageProps) {
  const { fill, width, height, priority, alt, src, className } = props;

  if (!fill && (width == null || height == null)) {
    return (
      <img
        src={typeof src === 'string' ? src : src.src}
        alt={alt}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
    );
  }

  return <Image {...props} unoptimized={props.unoptimized ?? true} />;
}
