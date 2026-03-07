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

export interface GuardianshipCancelLinkEmailProps {
	guardianName: string;
	animalName: string;
	cancelLink: string;
}

const GuardianshipCancelLinkEmail = ({
	guardianName,
	animalName,
	cancelLink
}: GuardianshipCancelLinkEmailProps): JSX.Element => {
	const previewText = `Ссылка для отмены опекунства над ${animalName}. Действует один раз.`;

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
							Отмена опекунства
						</Heading>

						<Text className="text-[#4F3D38] text-[16px] leading-[26px]">
							Привет, <strong>{guardianName}</strong>!
						</Text>

						<Text className="text-[#4F3D38] text-[16px] leading-[26px]">
							Если вы решили прекратить опеку над <strong>{animalName}</strong>, нажмите кнопку ниже.
							Подписка будет отменена, оплаченный период сохранится.
						</Text>

						<Section className="text-center mt-[24px] mb-[16px]">
							<Button
								className="bg-[#FE8651] rounded-lg text-[#FFF8FE] text-[15px] font-semibold no-underline text-center px-7 py-3"
								href={cancelLink}>
								Отменить опекунство
							</Button>
						</Section>

						<Text className="text-[#6b7280] text-[14px] leading-[24px]">
							Кнопка не работает? Скопируй ссылку и вставь в браузер:
							<br />
							<a
								target="_blank"
								href={cancelLink}
								className="text-[#2563eb] no-underline break-all"
								rel="noreferrer">
								{cancelLink}
							</a>
						</Text>

						<Hr className="border border-solid border-[#A09287] my-[26px] mx-0 w-full" />

						<Text className="text-[#A09287] text-[13px] leading-[20px]">
							Ссылка одноразовая. Если вы не запрашивали отмену, проигнорируйте письмо.
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

export const guardianshipCancelLinkEmail = {
	subject: 'Ссылка для отмены опекунства — приют ПИФ',
	component: GuardianshipCancelLinkEmail
} satisfies IEmailTemplateDefinition<GuardianshipCancelLinkEmailProps>;
