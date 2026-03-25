import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

let _s3: S3Client | null = null;

function getS3() {
  if (!_s3) {
    _s3 = new S3Client({
      endpoint: process.env.BACKBLAZE_ENDPOINT!,
      region: process.env.BACKBLAZE_REGION ?? "auto",
      credentials: {
        accessKeyId: process.env.BACKBLAZE_KEY_ID!,
        secretAccessKey: process.env.BACKBLAZE_APP_KEY!,
      },
    });
  }
  return _s3;
}

export function isStorageEnabled() {
  return !!(
    process.env.BACKBLAZE_ENDPOINT &&
    process.env.BACKBLAZE_KEY_ID &&
    process.env.BACKBLAZE_APP_KEY &&
    process.env.BACKBLAZE_BUCKET &&
    process.env.BACKBLAZE_PUBLIC_URL
  );
}

/**
 * Downloads an image from a URL and uploads it to Backblaze B2.
 * Returns the permanent public URL.
 */
export async function uploadImageFromUrl(
  sourceUrl: string,
  key: string
): Promise<string> {
  const res = await fetch(sourceUrl);
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);

  const buffer = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get("content-type") ?? "image/png";

  await getS3().send(
    new PutObjectCommand({
      Bucket: process.env.BACKBLAZE_BUCKET!,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  return `${process.env.BACKBLAZE_PUBLIC_URL}/${key}`;
}
