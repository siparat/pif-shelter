export abstract class StorageService {
	abstract getPresignedPostData(
		key: string,
		contentType: string,
		maxSize: number,
		expires?: number
	): Promise<{ url: string; fields: Record<string, string>; key: string }>;
	abstract getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
	abstract uploadBuffer(key: string, contentType: string, body: Buffer): Promise<void>;
	abstract delete(key: string): Promise<void>;
	abstract checkIfExists(key: string): Promise<boolean>;
	abstract getMetadata(key: string): Promise<{ contentType?: string; size?: number }>;
}
