import axios from './axios';
import button from './button';
import chatbot from './chatbot';
import components from './components';
import header from './header';
import message from './message';
import title from './title';
import validation from './validation';

export default {
	...button,
	...title,
	...message,
	...header,
	...components,
	...validation,
	...axios,
	...chatbot,
};
