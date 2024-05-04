import { AppBskyFeedPost, BskyAgent } from '@atproto/api'

export interface AppChronoskyPost {
	readonly record: AppChornoskyPostRecord
	readonly reservedAt: Date
}

export interface AppChornoskyPostRecord {
	createdAt?: string
	text: string
	tags?: string[]
	langs?: string[]
	via?: string
}

export class AppChronoskyReservedPost {
	private _record: AppChornoskyPostRecord
	/** 予約投稿日時 */
	private _reservedAt: Date = new Date()

	constructor(post: AppChronoskyPost) {
		this._record = post.record
		this._reservedAt = post.reservedAt
	}

	async post(agent: BskyAgent): Promise<void> {
		const postDate = new Date()
		if (postDate < this._reservedAt) {
			console.log(`Skip: ${postDate.toDateString()} ${postDate.toTimeString()}`)
			return
		}
		this._record.createdAt = postDate.toISOString()
		// Add posted by ChronoPost
		this._record.tags = ['ReservedPost']
		this._record.via = 'Chronosky'
		const res = await agent.post(this._record as AppBskyFeedPost.Record)
		if (res.uri && res.cid) {
			console.log(`Posted: ${res.uri}`)
		}
	}
}
