import { AnimalLabel } from '@pif/database';

export abstract class AnimalLabelsRepository {
	abstract findById(id: string): Promise<AnimalLabel | undefined>;
	abstract findByName(name: string): Promise<AnimalLabel | undefined>;
	abstract create(data: { name: string; color: string }): Promise<string>;
	abstract update(id: string, data: Partial<{ name: string; color: string }>): Promise<AnimalLabel>;
	abstract delete(id: string): Promise<void>;
}
