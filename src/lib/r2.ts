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

export function getAvatarKey(userId: string, ext: string) {
	return `avatars/${userId}/${Date.now()}.${ext}`;
}

export async function getAvatarUploadUrl(key: string, contentType: string) {
	const command = new PutObjectCommand({
		Bucket: BUCKET_NAME,
		Key: key,
		ContentType: contentType,
	});
	return getSignedUrl(r2, command, { expiresIn: 300 });
}

export async function deleteAvatarObject(key: string) {
	const command = new DeleteObjectCommand({
		Bucket: BUCKET_NAME,
		Key: key,
	});
	await r2.send(command);
}
