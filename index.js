import { create } from 'rung-sdk';
import { Natural, String as Text } from 'rung-cli/dist/types';
import agent from 'superagent';
import promisifyAgent from 'superagent-promise';
import Bluebird from 'bluebird';

const request = promisifyAgent(agent,Bluebird);

function render(movie) {
   return <b>{ _('O filme "{{movie}}" já está disponível no Netflix.', { movie }) }</b>;
}

function renderComment({ show_title, summary, poster }) {
	return `
		${summary}
		![${show_title}](${poster})
	`;
}

function main(context,done) {
    const { title, year } = context.params;

	request.get('http://netflixroulette.net/api/api.php')
		.query({ title, year: year === 0 ? undefined : year })
		.then(({ body }) => {
			done({
				[body.show_id]: {
					title: 'Seu filme está disponível',
					content: render(body.show_title),
					comment: renderComment(body)
				}
			})
		})
		.catch(() => done({ alerts: {} }));
}

const params = {
    title: {
        description: _('Qual o título do Filme?'),
        type: Text,
		required: true
    },
	year: {
		description: _('Qual o ano do Filme?'),
		type: Natural,
		default: 0
	}
};

export default create(main, {
    params,
    primaryKey: true,
    title: _("Filmes Netflix"),
    description: _("Ser informado quando um filme sair no Netflix."),
    preview: render('The Founder')
});

