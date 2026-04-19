import { v2 as cloudinary, UploadApiResponse, UploadApiOptions } from "cloudinary";
import { logger } from "../utils/logger";
import { env } from "../env";

// Configure cloudinary with timeout for large uploads
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  timeout: 600000, // 10 minutes timeout for large uploads
});

const uploadOnCloudinary = async (
  localFilePath: string,
  options: UploadApiOptions = { resource_type: "auto" },
): Promise<UploadApiResponse> => {
  // Removed | null because we will throw error
  if (!localFilePath) {
    throw new Error("File path is missing");
  }

  try {
    // Use standard upload which handles both images and videos reasonably well for this size
    // For very large files, we might need to revisit logic to conditionally use upload_large
    const response = (await cloudinary.uploader.upload(localFilePath, {
      ...options,
    })) as UploadApiResponse;

    if (!response || !response.secure_url) {
      throw new Error("Cloudinary upload failed: Missing secure_url in response");
    }

    logger.info(`Cloudinary Response Keys: ${Object.keys(response).join(", ")}`);
    logger.info(`File uploaded on cloudinary: ${response.secure_url}`);

    return response;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    logger.error("Error uploading file to cloudinary:", error);

    // Throw the specific error message from Cloudinary if available
    throw new Error(error?.message || "Cloudinary upload failed");
  }
};

const deleteOnCloudinary = async (publicId: string): Promise<{ result: string }> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    logger.info(`File deleted from cloudinary. publicId: ${publicId}`);
    return result;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    logger.error("Error while deleting file on cloudinary:", error);
    throw new Error(error?.message || "Cloudinary deletion failed");
  }
};

export { uploadOnCloudinary, deleteOnCloudinary };
