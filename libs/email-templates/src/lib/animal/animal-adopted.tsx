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

export interface AnimalAdoptedEmailProps {
	guardianName: string;
	animalName: string;
	homeLink: string;
}

const AnimalAdoptedEmail = ({ guardianName, homeLink, animalName }: AnimalAdoptedEmailProps): JSX.Element => {
	const previewText = `${animalName} нашёл дом! Спасибо, что были рядом.`;

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

						<Section className="bg-[#4F3D38] rounded-xl py-4 px-5 mb-6">
							<Heading className="text-[#F0E7D6] text-[22px] font-semibold text-center p-0 my-0 mx-0">
								У него теперь есть дом
							</Heading>
						</Section>

						<Text className="text-[#4F3D38] text-[16px] leading-[26px]">
							Привет, <strong>{guardianName}</strong>!
						</Text>

						<Text className="text-[#4F3D38] text-[16px] leading-[26px]">
							Мы хотим сообщить радостную новость: <strong>{animalName}</strong> приютили. У него
							появилась своя семья и свой дом — во многом благодаря вашей поддержке.
						</Text>

						<Text className="text-[#4F3D38] text-[16px] leading-[26px]">
							Опекунство над этим животным автоматически прекращено. Cредства за оплаченный период
							вернутся на вашу карту в течение нескольких рабочих дней.
						</Text>

						<Text className="text-[#4F3D38] text-[16px] leading-[26px]">
							Спасибо, что были рядом с ним. Если захотите поддержать другого подопечного — мы всегда рады
							видеть вас среди опекунов.
						</Text>

						<Section className="text-center mt-[24px] mb-[16px]">
							<Button
								className="bg-[#FE8651] rounded-lg text-[#FFF8FE] text-[15px] font-semibold no-underline text-center px-7 py-3"
								href={homeLink}>
								Подобрать другого хвостика
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

export const animalAdoptedEmail = {
	subject: (props: AnimalAdoptedEmailProps) => `${props.animalName} нашёл дом — приют ПИФ`,
	component: AnimalAdoptedEmail
} satisfies IEmailTemplateDefinition<AnimalAdoptedEmailProps>;
