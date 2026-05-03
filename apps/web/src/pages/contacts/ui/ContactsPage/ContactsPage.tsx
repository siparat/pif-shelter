import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { JSX } from 'react';
import { footerContacts } from '../../../../shared/config/footer';

const ContactsPage = (): JSX.Element => {
	const email = footerContacts.find((c) => c.key === 'email');
	const phone = footerContacts.find((c) => c.key === 'phone');
	const telegram = footerContacts.find((c) => c.key === 'telegram');
	const address = footerContacts.find((c) => c.key === 'address');

	return (
		<div className="rounded-4xl bg-[#201915] p-6 shadow-2xl sm:p-8 md:p-12 lg:p-16">
			<div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
				<div className="flex flex-col rounded-[32px] bg-[#3a2c27] p-8 shadow-xl sm:p-10 md:p-12">
					<h1 className="mb-4 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl md:text-5xl">
						Связаться с нами
					</h1>
					<p className="mb-10 text-base leading-relaxed text-(--color-text-on-dark)/80 sm:text-lg">
						Остались вопросы или хотите помочь приюту? Выберите удобный способ связи, и мы с радостью
						ответим!
					</p>

					<ul className="flex flex-col gap-6">
						{email && (
							<li className="flex items-center gap-5">
								<span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[14px] bg-white text-[#3a2c27] shadow-sm transition-transform hover:scale-105">
									<Mail className="h-6 w-6" strokeWidth={2.5} />
								</span>
								<a
									href={email.href}
									className="text-[17px] font-semibold text-white transition-opacity hover:opacity-80">
									{email.label}
								</a>
							</li>
						)}
						{phone && (
							<li className="flex items-center gap-5">
								<span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[14px] bg-white text-[#3a2c27] shadow-sm transition-transform hover:scale-105">
									<Phone className="h-6 w-6" strokeWidth={2.5} />
								</span>
								<a
									href={phone.href}
									className="text-[17px] font-semibold text-white transition-opacity hover:opacity-80">
									{phone.label}
								</a>
							</li>
						)}
						{telegram && (
							<li className="flex items-center gap-5">
								<span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[14px] bg-white text-[#3a2c27] shadow-sm transition-transform hover:scale-105">
									<Send className="h-6 w-6" strokeWidth={2.5} />
								</span>
								<a
									href={telegram.href}
									target="_blank"
									rel="noreferrer"
									className="text-[17px] font-semibold text-white transition-opacity hover:opacity-80">
									{telegram.label}
								</a>
							</li>
						)}
						{address && (
							<li className="flex items-center gap-5">
								<span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[14px] bg-white text-[#3a2c27] shadow-sm transition-transform hover:scale-105">
									<MapPin className="h-6 w-6" strokeWidth={2.5} />
								</span>
								<a
									href={address.href}
									target="_blank"
									rel="noreferrer"
									className="text-[17px] font-semibold text-white">
									{address.label}
								</a>
							</li>
						)}
					</ul>
				</div>

				<div className="relative h-[400px] w-full overflow-hidden rounded-[32px] shadow-xl lg:h-full lg:min-h-[500px]">
					<iframe
						src="https://yandex.ru/map-widget/v1/?um=constructor%3A1c8f4088e455be850e21e0d92056c33b8c9840aa6fbfff9445785eaa5bd28cc5&amp;source=constructor"
						width="100%"
						height="100%"
						className="absolute inset-0 border-0"
						title="Карта проезда к приюту"
					/>
				</div>
			</div>
		</div>
	);
};

export default ContactsPage;
