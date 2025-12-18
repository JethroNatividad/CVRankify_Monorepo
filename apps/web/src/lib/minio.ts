import { Client } from "minio";
import { env } from "~/env";

// Initialize MinIO client
let minioClientInstance: Client | null = null;

export const getMinioClient = (): Client => {
  minioClientInstance ??= new Client({
    endPoint: env.MINIO_ENDPOINT,
    port: env.MINIO_PORT,
    useSSL: false, // Set to true in production with proper SSL setup
    accessKey: env.MINIO_ACCESS_KEY,
    secretKey: env.MINIO_SECRET_KEY,
  });
  return minioClientInstance;
};

const getBucketName = (): string => env.MINIO_BUCKET_NAME;

// Ensure bucket exists on startup
export async function ensureBucketExists() {
  try {
    const minioClient = getMinioClient();
    const bucketName = getBucketName();
    const bucketExists = await minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      await minioClient.makeBucket(bucketName, "us-east-1");
      console.log(`Created bucket: ${bucketName}`);
    }
  } catch (error) {
    console.error("Error ensuring bucket exists:", error);
  }
}

// Upload file to MinIO
export async function uploadFileToMinio(
  file: Buffer,
  fileName: string,
  contentType: string,
): Promise<string> {
  await ensureBucketExists();

  try {
    const minioClient = getMinioClient();
    const bucketName = getBucketName();
    await minioClient.putObject(bucketName, fileName, file, file.length, {
      "Content-Type": contentType,
    });

    return fileName;
  } catch (error) {
    console.error("Error uploading file to MinIO:", error);
    throw new Error("Failed to upload file");
  }
}

// Get file URL from MinIO
export async function getFileUrl(fileName: string): Promise<string> {
  try {
    const minioClient = getMinioClient();
    const bucketName = getBucketName();
    // Generate a presigned URL valid for 24 hours
    const url = await minioClient.presignedGetObject(
      bucketName,
      fileName,
      24 * 60 * 60, // 24 hours in seconds
    );
    return url;
  } catch (error) {
    console.error("Error getting file URL from MinIO:", error);
    throw new Error("Failed to get file URL");
  }
}

// Delete file from MinIO
export async function deleteFileFromMinio(fileName: string): Promise<void> {
  try {
    const minioClient = getMinioClient();
    const bucketName = getBucketName();
    await minioClient.removeObject(bucketName, fileName);
  } catch (error) {
    console.error("Error deleting file from MinIO:", error);
    throw new Error("Failed to delete file");
  }
}

// Generate organized file path
export function generateResumeFilename(
  originalFileName: string,
  applicantName: string,
): string {
  const year = new Date().getFullYear();
  const timestamp = Date.now();
  const sanitizedName = applicantName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const extension = originalFileName.includes(".")
    ? originalFileName.split(".").pop()
    : "pdf";

  return `resumes/${year}/${sanitizedName}-${timestamp}.${extension}`;
}
