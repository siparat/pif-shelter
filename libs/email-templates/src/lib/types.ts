import { JSX } from 'react';

export interface IEmailTemplateDefinition<T> {
	subject: string | ((props: T) => string);
	component: (props: T) => JSX.Element;
}
