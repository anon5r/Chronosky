# Chronopost

Cloudflare WorkerのCron Triggersを使って、定期的に投稿を行うWorkerです。

# How to develop

- 開発サーバーを起動するには、ターミナルで `yarn run dev` を実行します
- http://localhost:8787/ を開いて、動作するWorkerを確認します
- Workerを公開するには、 `yarn run deploy` を実行します

`wrangler.toml` でWorkerにリソースをバインドします。バインディングを追加した後、
`Env` オブジェクトの型定義を `yarm run cf-typegen` で再生成することができます。

更なる情報は[こちら](https://developers.cloudflare.com/workers/)で学ぶことができます
