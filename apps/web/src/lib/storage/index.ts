export * from "./types";
export { uploadFile, deleteFile, getSignedUrl, getStorageStatus } from "./service";
export { uploadPrivateFile, deletePrivateFile, getPrivateSignedUrl } from "./private-service";
export {
  generateUserAvatarKey,
  generateBrandImageKey,
  type BrandImageType,
} from "./keys";

// Video upload (showroom only - goes direct, no compression)
export { uploadShowroomVideo } from "./upload-client";

// Direct upload utilities (client-side compression + direct R2 upload)
export {
  uploadListingImageDirect,
  uploadAvatarDirect,
  uploadPartnerImageDirect,
  uploadShowroomImageDirect,
  compressAndUploadListingImage,
  compressAndUploadListingImages,
  compressAndUploadAvatar,
  compressAndUploadPartnerImage,
  compressAndUploadShowroomImage,
  type ListingUploadResult,
  type SingleUploadResult,
  type DirectListingUploadResult,
  type DirectSingleUploadResult,
} from "./upload-client";

// Client-side compression utilities
export {
  compressListingImage,
  compressListingImages,
  compressAvatar,
  compressPartnerImage,
  compressShowroomImage,
  compressShowroomImages,
  validateImageFile,
  type CompressedImage,
  type ListingImagePair,
  type PartnerImageType,
  type ShowroomAssetType,
} from "./image-compress";
