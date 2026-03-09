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

export interface GuardianshipTelegramReminderEmailProps {
	guardianName: string;
	animalName: string;
	telegramBotLink: string;
}

const GuardianshipTelegramReminderEmail = ({
	guardianName,
	animalName,
	telegramBotLink
}: GuardianshipTelegramReminderEmailProps): JSX.Element => {
	const previewText = `Без привязки бота мы не можем отправлять отчёты по ${animalName}.`;

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
							Привяжите Telegram-бота
						</Heading>

						<Text className="text-[#4F3D38] text-[16px] leading-[26px]">
							Привет, <strong>{guardianName}</strong>!
						</Text>

						<Text className="text-[#4F3D38] text-[16px] leading-[26px]">
							Без привязки бота мы не можем отправлять вам отчёты по <strong>{animalName}</strong>.
							Перейдите по ссылке ниже — это займёт несколько секунд.
						</Text>

						<Section className="text-center mt-[32px] mb-[32px]">
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

export const guardianshipTelegramReminderEmail = {
	subject: (props: GuardianshipTelegramReminderEmailProps) =>
		`Привяжите бота — отчёты по ${props.animalName} ждут вас`,
	component: GuardianshipTelegramReminderEmail
} satisfies IEmailTemplateDefinition<GuardianshipTelegramReminderEmailProps>;
