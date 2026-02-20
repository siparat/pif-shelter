import { BadRequestException, Injectable } from '@nestjs/common';
import { StorageService } from '@pif/storage';

@Injectable()
export class FileStoragePolicy {
	constructor(private readonly storage: StorageService) {}

	async assertExists(key: string): Promise<void> {
		if (!key) {
			return;
		}

		const isExists = await this.storage.checkIfExists(key);
		if (!isExists) {
			throw new BadRequestException(`Файл ${key} не найден в хранилище. Загрузите его повторно.`);
		}
	}

	async assertAllExist(keys: string[]): Promise<void> {
		if (keys.length === 0) {
			return;
		}

		const checks = await Promise.all(keys.map((key) => this.storage.checkIfExists(key)));
		const missingIndex = checks.findIndex((exists) => !exists);

		if (missingIndex !== -1) {
			throw new BadRequestException(`Файл ${keys[missingIndex]} не найден в хранилище.`);
		}
	}
}
