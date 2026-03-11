import {
	Body,
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

export interface AnimalRainbowEmailProps {
	guardianName: string;
	animalName: string;
}

const AnimalRainbowEmail = ({ guardianName, animalName }: AnimalRainbowEmailProps): JSX.Element => {
	const previewText = `${animalName} ушёл на радугу. Спасибо, что были с ним.`;

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

						<Heading className="text-[#4F3D38] text-[22px] font-semibold text-center p-0 my-[16px] mx-0 leading-[28px]">
							Он ушёл на радугу
						</Heading>

						<Text className="text-[#4F3D38] text-[16px] leading-[26px]">
							Привет, <strong>{guardianName}</strong>.
						</Text>

						<Text className="text-[#4F3D38] text-[16px] leading-[26px]">
							Мы с прискорбием сообщаем: <strong>{animalName}</strong> больше нет с нами. Для нас это
							тяжёлая потеря, и мы знаем, что вы поддерживали его как опекун.
						</Text>

						<Section className="bg-[#4F3D38] rounded-xl p-5 my-6">
							<Text className="text-[#F0E7D6] text-[15px] leading-[24px] m-0 text-center">
								Спасибо, что были рядом с ним и давали ему заботу и тепло. Ваша поддержка многое для
								него значила.
							</Text>
						</Section>

						<Text className="text-[#4F3D38] text-[16px] leading-[26px]">
							Опекунство автоматически прекращено. Cредства за оплаченный период вернутся на вашу карту в
							течение нескольких рабочих дней. Если захотите поддержать другого подопечного — мы будем
							рады.
						</Text>

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

export const animalRainbowEmail = {
	subject: (props: AnimalRainbowEmailProps) => `${props.animalName} — приют ПИФ`,
	component: AnimalRainbowEmail
} satisfies IEmailTemplateDefinition<AnimalRainbowEmailProps>;
