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

export interface GuardianshipRefundedEmailProps {
	guardianName: string;
	animalName: string;
}

const GuardianshipRefundedEmail = ({ guardianName, animalName }: GuardianshipRefundedEmailProps): JSX.Element => {
	const previewText = `Деньги за опекунство над ${animalName} возвращены. Животное снято с опекунства.`;

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
							Деньги за опекунство возвращены
						</Heading>

						<Text className="text-[#4F3D38] text-[16px] leading-[26px]">
							Привет, <strong>{guardianName}</strong>!
						</Text>

						<Text className="text-[#4F3D38] text-[16px] leading-[26px]">
							Средства за опекунство над <strong>{animalName}</strong> возвращены на вашу платёжную карту.
							Ожидайте зачисления в течение нескольких рабочих дней в зависимости от вашего банка.
						</Text>

						<Text className="text-[#4F3D38] text-[16px] leading-[26px]">
							Животное снято с опекунства. Если у вас есть вопросы — напишите нам.
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

export const guardianshipRefundedEmail = {
	subject: 'Деньги за опекунство возвращены — приют ПИФ',
	component: GuardianshipRefundedEmail
} satisfies IEmailTemplateDefinition<GuardianshipRefundedEmailProps>;
