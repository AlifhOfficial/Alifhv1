export * from "./types";
export { uploadFile, deleteFile, getSignedUrl, getStorageStatus } from "./service";
export { uploadPrivateFile, deletePrivateFile, getPrivateSignedUrl } from "./private-service";
export {
  generateUserAvatarKey,
  generateBrandImageKey,
  type BrandImageType,
} from "./keys";

// Client-side upload utilities (presigned URL pipeline - legacy)
export {
  uploadImage,
  uploadListingImage,
  uploadAvatar,
  uploadPartnerImage,
  uploadShowroomImage,
  uploadShowroomVideo,
  type UploadType,
  type UploadOptions,
  type UploadResult,
  type ListingUploadResult,
  type SingleUploadResult,
} from "./upload-client";

// Direct upload utilities (client-side compression, no server processing)
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
