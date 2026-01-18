/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(request, env) {
		const url = new URL(request.url);

		// CORS preflight
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type',
				},
			});
		}

		if (url.pathname !== '/oauth/github') {
			return new Response('Not Found', { status: 404 });
		}

		// Get the OAuth code from query parameter (for GET request)
		const code = url.searchParams.get('code');

		if (!code) {
			return new Response('Missing code', { status: 400 });
		}

		// Exchange code for token
		const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				client_id: env.GITHUB_CLIENT_ID,
				client_secret: env.GITHUB_CLIENT_SECRET,
				code,
			}),
		});

		const tokenData = await tokenRes.json();

		// Return a small HTML page to send the token back to the opener
		const origin = url.searchParams.get('origin');

		return new Response(
			`<!DOCTYPE html>
			<html>
			<body>
			<script>
			if (window.opener && "${origin}") {
				window.opener.postMessage(
				{ token: "${tokenData.access_token}" },
				"${origin}"
				);
			}
			window.close();
			</script>
			</body>
			</html>`,
			{
				headers: {
					'Content-Type': 'text/html',
				},
			},
		);
	},
};
