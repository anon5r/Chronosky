import { BskyAgent } from '@atproto/api'
import { AppChronoskyUser } from './chronosky/user'
import { AppChronoskyReservedPost } from './chronosky/post'


export default {
	/**
	 * TODO: この関数は、消す
	 *  @param {Request} request
	 */
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		// Your fetch handler logic here
		const url = new URL(request.url)
		const testURL = `${url.protocol}//${url.host}/__scheduled?cron=*+*+*+*+*`
		return new Response(`Hello, request for testing to <a href="${testURL}">${testURL}</a>`, {
			headers: { 'content-type': 'text/html' },
		})
	},

	/**
	 * Perform a scheduled task.
	 * スケジュールされたハンドラは、wrangler.tomlの [[triggers]] で
	 * 設定した間隔で呼び出されます。
	 *
	 * @param {ScheduledEvent} event - The scheduled event.
	 * @param {Env} env - The environment object.
	 * @param {ExecutionContext} ctx - The execution context object.
	 * @returns {Promise<void>} - Promise that resolves when the task is completed.
	 */
	async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
		const did = 'did:plc:gcqkf237epgjwbpubgk5ncsd'
		const user: AppChronoskyUser = new AppChronoskyUser(env.KV_ACCOUNTS)
		await user.load(did)
		const agent: BskyAgent = await user.login()

		// ログイン成功したら投稿
		if (agent.hasSession) {
			const postMessage = new AppChronoskyReservedPost({
				record: {
					text: `Hello, ${new Date().toDateString()} ${new Date().toTimeString()}`,
					langs: ['ja'],
				},
				reservedAt: new Date(),
			})
			await postMessage.post(agent)
		}


		// このテンプレートでは、単に結果をログに記録します：
		console.log(`trigger fired at ${event.cron}`)
	},

}
