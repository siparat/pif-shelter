export abstract class StorageService {
	abstract getPresignedPostData(
		key: string,
		contentType: string,
		maxSize: number
	): Promise<{ url: string; fields: Record<string, string>; key: string }>;
	abstract delete(key: string): Promise<void>;
	abstract checkIfExists(key: string): Promise<boolean>;
}
