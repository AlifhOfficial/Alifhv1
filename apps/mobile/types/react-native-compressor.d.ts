/**
 * Type declarations for react-native-compressor
 * This provides TypeScript support for the native image compression library.
 */

declare module 'react-native-compressor' {
  export interface ImageCompressOptions {
    /** Maximum width in pixels */
    maxWidth?: number;
    /** Maximum height in pixels */
    maxHeight?: number;
    /** Compression quality (0-1) */
    quality?: number;
    /** Input type */
    input?: 'uri' | 'base64';
    /** Output format */
    output?: 'jpg' | 'png';
    /** Return type */
    returnableOutputType?: 'uri' | 'base64';
  }

  export interface VideoCompressOptions {
    /** Bitrate in bps */
    bitrate?: number;
    /** Maximum size in MB */
    maxSize?: number;
    /** Quality preset */
    quality?: 'low' | 'medium' | 'high';
    /** Cancel progress callback ID */
    progressDivider?: number;
  }

  export interface Image {
    /**
     * Compress an image
     * @param uri - Local file URI
     * @param options - Compression options
     * @returns Compressed image URI
     */
    compress(uri: string, options?: ImageCompressOptions): Promise<string>;

    /**
     * Get image metadata
     * @param uri - Local file URI
     */
    getMetadata(uri: string): Promise<{
      width: number;
      height: number;
      size: number;
      type: string;
    }>;
  }

  export interface Video {
    /**
     * Compress a video
     * @param uri - Local file URI
     * @param options - Compression options
     * @param onProgress - Progress callback
     * @returns Compressed video URI
     */
    compress(
      uri: string,
      options?: VideoCompressOptions,
      onProgress?: (progress: number) => void
    ): Promise<string>;

    /**
     * Cancel active compression
     */
    cancelCompression(): void;
  }

  export const Image: Image;
  export const Video: Video;
}
