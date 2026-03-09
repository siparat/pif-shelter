import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Img,
	Preview,
	Section,
	Tailwind,
	Text
} from '@react-email/components';
import { JSX } from 'react';
import { IEmailTemplateDefinition } from '../types';

export interface GuardianshipActivatedEmailProps {
	guardianName: string;
	animalName: string;
	telegramBotLink: string;
}

const GuardianshipActivatedEmail = ({
	guardianName,
	animalName,
	telegramBotLink
}: GuardianshipActivatedEmailProps): JSX.Element => {
	const previewText = `Вы оформили опекунство над ${animalName}. Перейдите в Telegram-бот для отчётов.`;

	return (
		<Html>
			<Head />
			<Preview>{previewText}</Preview>
			<Tailwind>
				<Body className="bg-[#4F3D38] my-auto mx-auto font-sans px-2">
					<Container className="border border-solid border-[#483834] rounded-2xl my-[40px] mx-auto p-[32px] max-w-[500px] bg-[#F0E7D6] shadow-sm">
						<Section className="mt-[8px] mb-[24px]">
							<Img
								src="https://s3.twcstorage.ru/pif/email/logo-dark.png"
								width={70}
								height={85}
								alt="ПИФ"
								className="my-0 mx-auto rounded-xl object-cover"
							/>
						</Section>

						<Heading className="text-[#4F3D38] text-[24px] font-semibold text-center p-0 my-[16px] mx-0">
							Вы оформили опекунство
						</Heading>

						<Text className="text-[#4F3D38] text-[16px] leading-[26px]">
							Привет, <strong>{guardianName}</strong>!
						</Text>

						<Text className="text-[#4F3D38] text-[16px] leading-[26px]">
							Спасибо, что оформили опекунство над <strong>{animalName}</strong>. Отчёты по подопечному мы
							отправляем в Telegram-бот — перейдите по ссылке ниже и сохраните её, если закроете страницу.
						</Text>

						<Section className="text-center mt-[24px] mb-[32px]">
							<Button
								className="bg-[#0088cc] rounded-lg text-[#FFF8FE] text-[15px] font-semibold no-underline text-center px-7 py-3"
								href={telegramBotLink}>
								Перейти в Telegram-бот
							</Button>
						</Section>

						<Hr className="border border-solid border-[#A09287] my-[26px] mx-0 w-full" />

						<Text className="text-[#A09287] text-[13px] leading-[20px] text-center mt-[32px]">
							С любовью к хвостикам,
							<br />
							Команда приюта ПИФ
						</Text>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
};

export const guardianshipActivatedEmail = {
	subject: 'Вы оформили опекунство — приют ПИФ',
	component: GuardianshipActivatedEmail
} satisfies IEmailTemplateDefinition<GuardianshipActivatedEmailProps>;
