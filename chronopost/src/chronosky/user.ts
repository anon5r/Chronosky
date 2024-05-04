import { AtpSessionData } from '@atproto/api/src/types'
import { ComAtprotoServerGetSession } from '@atproto/api/src/client'
import { BskyAgent } from '@atproto/api'
import { OutputSchema as SessionOutputSchema } from '@atproto/api/src/client/types/com/atproto/server/getSession'

export interface AuthAccount {
	identifier: string,
	password: string,
	session: AtpSessionData | ComAtprotoServerGetSession.Response['data'],
	endpoint: string,
}

export class AppChronoskyUser {
	private _account: AuthAccount = {
		identifier: '',
		password: '',
		endpoint: '',
		session: {} as AtpSessionData,
	}
	/** Env.KV */
	private _kv: KVNamespace
	/** DID */
	private _did: string = ''
	/** KVの有効期限 */
	private static readonly KV_EXPIRE_SEC: number = 604800

	constructor(KV: KVNamespace) {
		this._kv = KV
	}

	public async load(did: string) {
		let value: string | null = await this._kv.get(did)
		if (value) {
			try {
				this._account = JSON.parse(value as string)
			} catch (e) {
				console.error(e)
			}
		}
	}

	public get account(): AuthAccount {
		return this._account
	}

	/**
	 * Logs in the user with the provided account credentials.
	 *
	 * @param {AuthAccount} account - The account object containing the user's credentials.
	 * @returns {Promise<BskyAgent>} A promise that resolves with a BskyAgent object representing the logged-in user.
	 * @throws {Error} If the login fails.
	 */
	public async login(): Promise<BskyAgent> {
		// エージェントの作成
		const agent: BskyAgent = new BskyAgent({
			service: this._account.endpoint,
		})

		// ログイン済みセッション
		let loginRes: ComAtprotoServerGetSession.Response = { success: false, headers: {}, data: {} as SessionOutputSchema }
		if (this._account.session?.accessJwt) {
			loginRes = await agent.resumeSession(this._account.session as AtpSessionData)
			console.log('loginRes = ', loginRes)
		}

		if (!loginRes.success) {
			// 初回または期限切れセッション
			loginRes = await agent.login({
				identifier: this._account.identifier,
				password: this._account.password,
			})
		}

		if (!loginRes.success)
			throw new Error('Failed to login')

		if (loginRes.success) {
			// セッションを保存
			this._account.session = loginRes.data
			console.log(`key = ${loginRes.data.did}, value = ${JSON.stringify(this._account)}`)
			await this._kv.put(loginRes.data.did, JSON.stringify(this._account),
				{ expirationTtl: AppChronoskyUser.KV_EXPIRE_SEC },	// 1週間
			)
		}
		return agent
	}

}
