import {
	DeleteObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { env } from "@/env";

export const r2 = new S3Client({
	region: env.CLOUDFLARE_REGION,
	endpoint: `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: env.CLOUDFLARE_ACCESS_KEY_ID,
		secretAccessKey: env.CLOUDFLARE_SECRET_ACCESS_KEY,
	},
	requestChecksumCalculation: "WHEN_REQUIRED",
});

export const BUCKET_NAME = env.CLOUDFLARE_BUCKET_NAME;
export const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

export function getAvatarKey(userId: string, ext: string) {
	// One stable key per user (and extension). Repeated presigned uploads
	// overwrite the same object instead of accumulating unbounded new keys.
	return `avatars/${userId}/avatar.${ext}`;
}

/** Only keys under the user's own prefix may be uploaded or deleted. */
export function isOwnedAvatarKey(key: string, userId: string): boolean {
	return key.startsWith(`avatars/${userId}/`);
}

export async function getAvatarUploadUrl(
	key: string,
	contentType: string,
	contentLength: number,
) {
	const command = new PutObjectCommand({
		Bucket: BUCKET_NAME,
		Key: key,
		ContentType: contentType,
		ContentLength: contentLength,
	});
	return getSignedUrl(r2, command, {
		expiresIn: 300,
		// Bind the declared MIME type to the signature. Without this the
		// presigner omits content-type, allowing arbitrary content to be
		// uploaded under an image key.
		signableHeaders: new Set(["content-type"]),
	});
}

export async function deleteAvatarObject(key: string) {
	const command = new DeleteObjectCommand({
		Bucket: BUCKET_NAME,
		Key: key,
	});
	await r2.send(command);
}
