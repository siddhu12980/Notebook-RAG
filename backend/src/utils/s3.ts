import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const region = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

console.log(region, accessKeyId, secretAccessKey);


if (!region || !accessKeyId || !secretAccessKey) {
  throw new Error("AWS credentials are not set");
}

console.log(region, accessKeyId, secretAccessKey);

// Initialize S3 client
const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

const bucketName = process.env.S3_BUCKET_NAME || "";

if (!bucketName) {
  console.error("S3_BUCKET_NAME environment variable is not set");
}

/**
 * Generate a presigned URL for uploading a file to S3
 * @param userId User ID for namespacing uploads
 * @param filename Original filename
 * @param contentType MIME type of the file
 * @returns Object containing upload URL and the file key in S3
 */
export async function generateUploadUrl(
  userId: string,
  filename: string,
  contentType: string
): Promise<{ uploadUrl: string; key: string }> {
  // Create a unique file key including userId for access control
  const fileExtension = filename.split(".").pop();
  const key = `uploads/${userId}/${uuidv4()}.${fileExtension}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
    Metadata: {
      userId,
      originalFilename: filename,
    },
  });

  // Generate a presigned URL that expires in 15 minutes
  const uploadUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 900, // 15 minutes
  });

  return { uploadUrl, key };
}

/**
 * Generate a presigned URL for downloading a file from S3
 * @param key S3 object key
 * @returns Presigned URL for downloading the file
 */
export async function generateDownloadUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  // Generate a presigned URL that expires in 1 hour
  const downloadUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 3600, // 1 hour
  });

  return downloadUrl;
}

/**
 * Get a file from S3 as a buffer
 * @param key S3 object key
 * @returns Buffer containing the file data
 */
export async function getFileBuffer(key: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  const response = await s3Client.send(command);

  // Convert stream to buffer
  const chunks: Buffer[] = [];
  for await (const chunk of response.Body as any) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}
