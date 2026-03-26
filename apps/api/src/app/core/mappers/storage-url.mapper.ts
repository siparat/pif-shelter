export class StorageUrlMapper {
	static getPublicObjectUrl(endpoint: string, bucket: string, storageKey: string): string {
		const normalizedEndpoint = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;
		const normalizedKey = storageKey.startsWith('/') ? storageKey.slice(1) : storageKey;
		return `${normalizedEndpoint}/${bucket}/${normalizedKey}`;
	}
}
