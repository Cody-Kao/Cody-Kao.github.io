/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

const ALLOWED_ORIGINS = [
	'https://cody-kao.github.io', // Hexo site
	'http://localhost:4000', // optional dev
];

function corsHeaders(origin) {
	if (ALLOWED_ORIGINS.includes(origin)) {
		return {
			'Access-Control-Allow-Origin': origin,
			'Access-Control-Allow-Credentials': 'true',
			'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type',
		};
	}
	return {};
}

export default {
	async fetch(req, env) {
		const url = new URL(req.url);
		const origin = req.headers.get('Origin');

		// =============================
		// CORS preflight
		// =============================
		if (req.method === 'OPTIONS') {
			return new Response(null, {
				status: 204,
				headers: corsHeaders(origin),
			});
		}

		// =============================
		// OAuth callback
		// =============================
		if (url.pathname === '/oauth/github') {
			const code = url.searchParams.get('code');
			const redirectOrigin = url.searchParams.get('origin');

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
			const accessToken = tokenData.access_token;

			if (!accessToken) {
				return new Response('OAuth failed', { status: 400 });
			}

			const sessionId = crypto.randomUUID();

			await env.GH_SESSIONS.put(sessionId, JSON.stringify({ accessToken, createdAt: Date.now() }), { expirationTtl: 60 * 60 * 24 * 7 });
			const isProd = redirectOrigin.startsWith('https://');

			return new Response(
				`
				<html>
				<body>
					<script>
					// Send message to parent window
					window.opener.postMessage({ success: true }, '${redirectOrigin}');
					// Close popup
					window.close();
					</script>
					<p>Logging in… You can close this window.</p>
				</body>
				</html>
				`,
				{
					status: 200,
					headers: {
						'Content-Type': 'text/html',
						'Set-Cookie': `gh_session=${sessionId}; HttpOnly; Path=/; ${isProd ? 'Secure; SameSite=Lax' : 'Secure; SameSite=None'}`,
					},
				},
			);
		}

		// =============================
		// Like endpoint
		// =============================
		if (url.pathname === '/like' && req.method === 'POST') {
			const cookie = req.headers.get('Cookie') || '';
			const match = cookie.match(/gh_session=([^;]+)/);

			if (!match) {
				return new Response('Unauthorized', {
					status: 401,
					headers: corsHeaders(origin),
				});
			}

			const sessionId = match[1];
			const sessionRaw = await env.GH_SESSIONS.get(sessionId);

			if (!sessionRaw) {
				return new Response('Session expired', {
					status: 401,
					headers: corsHeaders(origin),
				});
			}

			const { accessToken } = JSON.parse(sessionRaw);
			const { issueNumber } = await req.json();

			const ghRes = await fetch(`https://api.github.com/repos/${env.OWNER}/${env.REPO}/issues/${issueNumber}/reactions`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${accessToken}`,
					'Content-Type': 'application/json',
					'User-Agent': 'github-like-oauth-worker', // required: just give a name to User-Agent
				},
				body: JSON.stringify({ content: '+1' }),
			});
			const text = await ghRes.text();

			if (!ghRes.ok) {
				console.error('GitHub error:', ghRes.status, text);
				if (ghRes.status === 401) {
					return new Response('Bad credential', {
						status: 401,
						headers: corsHeaders(origin),
					});
				}
				return new Response('GitHub API failed', {
					status: ghRes.status,
					headers: corsHeaders(origin),
				});
			}

			return new Response(JSON.stringify({ ok: true }), {
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders(origin),
				},
			});
		}

		return new Response('Not Found', {
			status: 404,
			headers: corsHeaders(origin),
		});
	},
};
