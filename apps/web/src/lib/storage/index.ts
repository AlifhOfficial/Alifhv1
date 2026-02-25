export * from "./types";
export { uploadFile, deleteFile, getSignedUrl, getStorageStatus } from "./service";
export { uploadPrivateFile, deletePrivateFile, getPrivateSignedUrl } from "./private-service";
export {
  generateUserAvatarKey,
  generateBrandImageKey,
  type BrandImageType,
} from "./keys";

// Client-side upload utilities (presigned URL pipeline)
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
