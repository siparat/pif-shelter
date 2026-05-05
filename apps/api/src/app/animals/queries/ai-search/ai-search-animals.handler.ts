import { ConfigService } from '@nestjs/config';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { animals, DatabaseService, posts } from '@pif/database';
import { AnimalStatusEnum, PostVisibilityEnum } from '@pif/shared';
import { desc, eq, inArray } from 'drizzle-orm';
import OpenAI from 'openai';
import { AnimalAiData, AnimalMapper } from '../../mappers/animal.mapper';
import { AiSearchAnimalsQuery } from './ai-search-animals.query';

const RESULT_MARKER = '\nRESULT:';
const HOLD_BACK = RESULT_MARKER.length + 2;

export type AiSearchStreamEvent =
	| { type: 'delta'; text: string }
	| { type: 'result'; matchedIds: string[]; suggestions: Array<{ id: string; note: string }> }
	| { type: 'error'; message: string };

@QueryHandler(AiSearchAnimalsQuery)
export class AiSearchAnimalsHandler implements IQueryHandler<AiSearchAnimalsQuery> {
	private readonly ai: OpenAI;
	private readonly aiModel: string;
	private readonly aiSystemRole: string;

	constructor(
		config: ConfigService,
		private readonly db: DatabaseService
	) {
		this.ai = new OpenAI({
			apiKey: config.getOrThrow('AI_API_KEY'),
			baseURL: 'https://api.x.ai/v1'
		});
		this.aiModel = config.getOrThrow('AI_MODEL');
		this.aiSystemRole = config.getOrThrow('AI_SYSTEM_ROLE');
	}

	async execute({ q }: AiSearchAnimalsQuery): Promise<AsyncGenerator<AiSearchStreamEvent>> {
		const rows = await this.db.client
			.select({
				id: animals.id,
				name: animals.name,
				species: animals.species,
				gender: animals.gender,
				birthDate: animals.birthDate,
				size: animals.size,
				coat: animals.coat,
				color: animals.color,
				tags: animals.tags,
				description: animals.description,
				isSterilized: animals.isSterilized,
				isVaccinated: animals.isVaccinated
			})
			.from(animals)
			.where(
				inArray(animals.status, [
					AnimalStatusEnum.PUBLISHED,
					AnimalStatusEnum.ON_TREATMENT,
					AnimalStatusEnum.ON_PROBATION
				])
			);

		const animalIds = rows.map((r) => r.id);

		const postRows =
			animalIds.length > 0
				? await this.db.client
						.select({ animalId: posts.animalId, title: posts.title, body: posts.body })
						.from(posts)
						.where(inArray(posts.animalId, animalIds) && eq(posts.visibility, PostVisibilityEnum.PUBLIC))
						.orderBy(desc(posts.createdAt))
				: [];

		const postsByAnimal = new Map<string, string[]>();
		for (const post of postRows) {
			const existing = postsByAnimal.get(post.animalId) ?? [];
			if (existing.length >= 2) continue;
			const snippet = `${post.title}: ${post.body.slice(0, 250)}`;
			existing.push(snippet);
			postsByAnimal.set(post.animalId, existing);
		}

		const animalList = rows.map((r) => AnimalMapper.toAiAnimalData(r, postsByAnimal.get(r.id) ?? []));

		return this.stream(q, animalList);
	}

	private async *stream(userQuery: string, animalList: AnimalAiData[]): AsyncGenerator<AiSearchStreamEvent> {
		const xaiStream = await this.ai.chat.completions.create({
			model: this.aiModel,
			stream: true,
			temperature: 0.4,
			max_tokens: 600,
			messages: [
				{ role: 'system', content: this.aiSystemRole },
				{
					role: 'user',
					content: `Список животных:\n${JSON.stringify(animalList)}\n\nЗапрос: ${userQuery}`
				}
			]
		});

		let accumulated = '';
		let sentUpTo = 0;

		for await (const chunk of xaiStream) {
			accumulated += chunk.choices[0]?.delta?.content ?? '';

			const resultIdx = accumulated.indexOf(RESULT_MARKER);
			const safeEnd = resultIdx >= 0 ? resultIdx : Math.max(sentUpTo, accumulated.length - HOLD_BACK);

			if (safeEnd > sentUpTo) {
				yield { type: 'delta', text: accumulated.slice(sentUpTo, safeEnd) };
				sentUpTo = safeEnd;
			}
		}

		const resultIdx = accumulated.indexOf(RESULT_MARKER);
		if (resultIdx >= 0) {
			if (resultIdx > sentUpTo) {
				const tail = accumulated.slice(sentUpTo, resultIdx).trimEnd();
				if (tail) yield { type: 'delta', text: tail };
			}
			const jsonStr = accumulated.slice(resultIdx + RESULT_MARKER.length).trim();
			try {
				const parsed = JSON.parse(jsonStr) as {
					matchedIds?: string[];
					suggestions?: Array<{ id: string; note: string }>;
				};
				yield { type: 'result', matchedIds: parsed.matchedIds ?? [], suggestions: parsed.suggestions ?? [] };
			} catch {
				yield { type: 'result', matchedIds: [], suggestions: [] };
			}
		} else {
			if (sentUpTo < accumulated.length) {
				yield { type: 'delta', text: accumulated.slice(sentUpTo) };
			}
			yield { type: 'result', matchedIds: [], suggestions: [] };
		}
	}
}
