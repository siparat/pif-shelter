import { JSX } from 'react';
import { SITE_URL } from '../../config/api';

type Props = {
	title: string;
	description: string;
	image?: string;
	url?: string;
	type?: 'website' | 'article';
	noindex?: boolean;
};

const SITE_NAME = 'Приют ПИФ';
const DEFAULT_IMAGE = `${SITE_URL}/favicon.svg`;

export const PageMeta = ({ title, description, image, url, type = 'website', noindex }: Props): JSX.Element => {
	const fullTitle = `${title} — ${SITE_NAME}`;
	const ogImage = image ?? DEFAULT_IMAGE;
	const ogUrl = url ?? SITE_URL;

	return (
		<>
			<title>{fullTitle}</title>
			<meta name="description" content={description} />
			{noindex && <meta name="robots" content="noindex, nofollow" />}

			<meta property="og:type" content={type} />
			<meta property="og:site_name" content={SITE_NAME} />
			<meta property="og:title" content={fullTitle} />
			<meta property="og:description" content={description} />
			<meta property="og:url" content={ogUrl} />
			<meta property="og:image" content={ogImage} />
			<meta property="og:locale" content="ru_RU" />

			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:title" content={fullTitle} />
			<meta name="twitter:description" content={description} />
			<meta name="twitter:image" content={ogImage} />
		</>
	);
};
