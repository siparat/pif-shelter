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

export interface InviteEmailProps {
	name?: string;
	inviteLink?: string;
	roleName?: string;
}

export const InviteEmail = ({ name, inviteLink, roleName }: InviteEmailProps): JSX.Element => {
	const previewText = `Эта ссылка — твой персональный пропуск. Свободная регистрация в системе закрыта, чтобы защитить данные хвостиков. Пожалуйста, не передавай это письмо третьим лицам.`;

	return (
		<Html>
			<Head />
			<Preview>{previewText}</Preview>
			<Tailwind>
				<Body className="bg-[#4F3D38] my-auto mx-auto font-sans px-2">
					<Container className="border border-solid border-[#483834] rounded-2xl my-[40px] mx-auto p-[32px] max-w-[500px] bg-[#F0E7D6] shadow-sm">
						<Section className="mt-[8px] mb-[24px]">
							<Img
								src={'https://s3.twcstorage.ru/pif/email/logo-dark.png'}
								width="70"
								height="85"
								alt="ПИФ"
								className="my-0 mx-auto rounded-xl object-cover"
							/>
						</Section>

						<Heading className="text-[#4F3D38] text-[24px] font-semibold text-center p-0 my-[16px] mx-0">
							Добро пожаловать в команду
						</Heading>

						<Text className="text-[#4F3D38] text-[16px] leading-[26px]">Привет!</Text>

						<Text className="text-[#4F3D38] text-[16px] leading-[26px]">
							<strong>{name},</strong> приглашаем тебя присоединиться к цифровой команде приюта ПИФ в
							роли: <strong>{roleName}</strong>.
						</Text>

						<Text className="text-[#F0E7D6] text-[15px] leading-[24px] bg-[#4F3D38] p-4 rounded-lg my-[24px]">
							{previewText}
						</Text>

						<Section className="text-center mt-[32px] mb-[32px]">
							<Button
								className="bg-[#FE8651] rounded-lg text-[#FFF8FE] text-[15px] font-semibold no-underline text-center px-7 py-3"
								href={inviteLink}>
								Создать аккаунт
							</Button>
						</Section>

						<Text className="text-[#6b7280] text-[14px] leading-[24px]">
							Кнопка не работает? Скопируй ссылку ниже и вставь в браузер:
							<br />
							<a
								target="_blank"
								href={inviteLink}
								className="text-[#2563eb] no-underline break-all"
								rel="noreferrer">
								{inviteLink}
							</a>
						</Text>

						<Hr className="border border-solid border-[#A09287] my-[26px] mx-0 w-full" />

						<Text className="text-[#A09287] text-[13px] leading-[20px]">
							Если ты не ждал(а) этого приглашения, просто проигнорируй письмо. Ссылка для регистрации
							автоматически сгорит через 24 часа.
						</Text>

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
