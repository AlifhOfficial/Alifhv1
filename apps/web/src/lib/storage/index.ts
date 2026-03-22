export * from "./types";
export { uploadFile, deleteFile, getSignedUrl, getStorageStatus } from "./service";
export { uploadPrivateFile, deletePrivateFile, getPrivateSignedUrl } from "./private-service";

// Video upload (showroom only - goes direct, no compression)
export { uploadShowroomVideo } from "./upload-client";

// Image upload pipeline (preshrink → Fly preprocessing → R2)
export {
  compressAndUploadListingImages,
  compressAndUploadAvatar,
  compressAndUploadPartnerImage,
  compressAndUploadShowroomImage,
  type ListingUploadResult,
  type SingleUploadResult,
  type DirectListingUploadResult,
  type DirectSingleUploadResult,
} from "./upload-client";
