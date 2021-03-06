# Claudia.js を使った簡単マイクロサービス開発
最近流行りのサーバーレス・アーキテクチャでの開発は、複数のサービスを組み合わせて使うことが多いと思います。そのためデプロイや設定は複雑になりがちです。AWS でサーバーレス・アーキテクチャの代表と言えば、AWS Lambda と Amazon API Gateway が思い浮かぶのではないでしょうか？今回ご紹介する Claudia.js は、それらのサービスを使用した開発をさらに加速する予感です。

## Claudia.js とは？
Claudia.js はマイクロサービスを簡単に開発するためのオープンソースのデプロイメントツールです。Claudia.js を使うと AWS Lambda と Amazon API Gateway を使ったマイクロサービスを簡単に開発・デプロイすることができます。

さらに、Node.js 用の REST API をプログラミングするための Claudia API Builder ライブラリが提供されています。
Claudia.js は Claudia API Builder でプログラミングされたソースコードから、Amazon API Gateway に設定するべき内容を解釈して API のデプロイをコマンド一つで自動化してくれます。

すごく便利そうですね。

それでは早速使ってみたのでその利用手順を説明したいと思います。


## Claudia.js のインストール
Claudia.js はコマンドラインベースのデプロイメントツールを提供しています。以下のコマンドで Claudia.js をグルーバルパスへインストールします。

``` bash
npm install claudia -g

```

## Node.js プロジェクトの作成
以下の手順で Node.js プロジェクトを作成します。

``` bash
# 1. プロジェクトの作成と初期化
mkdir web-api-sample
cd web-api-sample
npm init

# 2. プロジェクトの dependency に Claudia API Builder を追加
npm install claudia-api-builder --save
```

次に `app.js` という名前で以下の内容を作成します。

``` javascript
var ApiBuilder = require('claudia-api-builder');
var api = new ApiBuilder();

module.exports = api;

api.get('/hello', function () {
	'use strict';
	return 'hello claudia.js';
});
```

上記のプログラムは、エンドポイント `/hello` に対して GET メソッドでアクセスすると文字列 'hello claudia.js' を返す簡単な API です。

次に `package.json` に `"files": "*.js"` を追加します。

``` javascript
{
  "name": "web-api-sample",
  "version": "1.0.0",
  "description": "",
  "files": "*.js",              // Add
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "claudia-api-builder": "^1.1.0"
  }
}

```

## AWS にデプロイする
それでは、AWS に作成したマイクロサービスをインストールしてみましょう。

インストールするには、`claudia create` コマンドを使用します。
以下のコマンドで、AWS Lambda と Amazon API Gateway に API を公開するためのモジュールと各種設定が自動的に行われます。

``` bash
claudia create --name web-api-sample --region us-east-1 --api-module app
```

しばらく待つと、以下のようなデプロイ情報が表示されます。（claudia.json ファイルにも保存されます）

```
{
  "lambda": {
    "role": "web-api-sample-executor",
    "name": "web-api-sample",
    "region": "us-east-1"
  },
  "api": {
    "id": "6thvhu4lc5",
    "module": "app",
    "url": "https://6thvhu4lc5.execute-api.us-east-1.amazonaws.com/latest"
  }
}
```

### API の動作確認
API がデプロイされたようなので確認してみましょう。
AWS Lambda Console を確認すると、`web-api-sample` という名前のファンクションが登録されています。また、
Amazon API Gateway Console では、`/hello` API エンドポイントに GET メソッドが定義されてることが確認することができます。

![AWS Lambda Console](https://raw.githubusercontent.com/KunihikoKido/docs/master/images/aws-lambda-microservices-with-claudiajs-1.png)


以下のように `curl` コマンドを使って、アクセスしてみましょう。（`6thvhu4lc5` は割り振られた API ID を指定してください）

```
curl https://6thvhu4lc5.execute-api.us-east-1.amazonaws.com/latest/hello
```

"hello claudia.js" とレスポンスが返って来れば正常にデプロイされていることが確認できます。


## API を追加してみる
REST API を実装するイメージで、ユーザ情報を操作する各種 API を実装してみます（モック）。

* `/users`
  * POST: ユーザ情報追加 API
* `/users/{id}`
  * GET: ユーザ情報取得 API
  * PUT: ユーザ情報更新 API
  * DELETE: ユーザ情報削除 API


app.js に以下のコードを追加します。

``` javascript
api.post('/users', function (request){
	'use strict';
	var id = request.body.userId;
	var result = {
		'_id': id,
		'_source': {
			userId: id,
			name: request.body.name,
			age: request.body.age
		},
		created: true
	};
	return result;
});


api.get("/users/{id}", function (request) {
	'use strict';
	var id = request.pathParams.id;
	var item = {
		userId: id,
		name: 'Kunihiko Kido',
		age: 39
	}
	return item;
});


api.put('/users/{id}', function (request){
	'use strict';
	var id = request.pathParams.id;
	var result = {
		'_id': id,
		'_source': {
			userId: id,
			name: request.body.name || 'Kunihiko Kido',
			age: request.body.age || 39
		},
		updated: true
	};
	return result;

});


api.delete('/users/{id}', function (request){
	'use strict';
	var id = request.pathParams.id;
	var item = {
		'_id': id,
		'_source': {
			userId: id,
			name: 'Kunihiko Kido',
			age: 39,
		},
		deleted: true
	};
	return item;
})
```

最後に以下のコマンドを実行してデプロイします。

```
claudia update
```

### 追加した API の確認
Amazon API Gateway Console をリロードすると ユーザ情報 API エンドポイントと各種メソッドが追加されているのが確認できます。

![Amazon API Gateway Console](https://raw.githubusercontent.com/KunihikoKido/docs/master/images/aws-lambda-microservices-with-claudiajs-2.png)

curl コマンドを使ってリクエストしてみましょう。

#### Create a new user
*request:*

```
curl -H "Content-Type: application/json" -XPOST https://6thvhu4lc5.execute-api.us-east-1.amazonaws.com/latest/users -d '
{
  "userId": "1",
  "name": "Kunihiko Kido",
  "age": 39
}'
```

*response:*

```
{
  "_id": "1",
  "_source": {
    "userId": "1",
    "name": "Kunihiko Kido",
    "age": 39
  },
  "created": true
}
```

#### Get the user by id
*request:*

```
curl -XGET https://6thvhu4lc5.execute-api.us-east-1.amazonaws.com/latest/users/1
```

*response:*

```
{
  "userId": "1",
  "name": "Kunihiko Kido",
  "age": 39
}

```

#### Update the user name
*request:*

```
curl -H "Content-Type: application/json" -XPUT https://6thvhu4lc5.execute-api.us-east-1.amazonaws.com/latest/users/1 -d '
{
  "name": "Kido"
}'
```

*response:*

```
{
  "_id": "1",
  "_source": {
    "userId": "1",
    "name": "Kido",
    "age": 39
  },
  "updated": true
}
```

#### Remove the user
*request:*

```
curl -XDELETE https://6thvhu4lc5.execute-api.us-east-1.amazonaws.com/latest/users/1
```

*response:*

```
{
  "_id": "1",
  "_source": {
    "userId": "1",
    "name": "Kunihiko Kido",
    "age": 39
  },
  "deleted": true
}
```

## おかたづけ
AWS Lambda と Amazon API Gateway の各種設定やモジュールを削除するには以下のコマンドを実行します。

```
claudia destroy
```

これで綺麗さっぱりインストールしたマイクロサービスは削除されました。

## さいごに
いかがでしたでしょうか。今回は Claudia.js の基本的な使い方について説明しました。
使ってみた印象では、Claudia.js のデプロイ自動化だけでなく、REST API を実装しやすくする Claudia API Builder も魅力的に感じました。バックエンドに S3 や DynamoDB を使ったより実践的な[サンプルプロジェクト](https://github.com/claudiajs/example-projects)も公開されていますので、ぜひ使ってその便利さを体験してください。


## 参考

* [Claudia.js](https://github.com/claudiajs/claudia)
* [Claudia API Builder](https://github.com/claudiajs/claudia-api-builder)
* [Claudia.js Example projects](https://github.com/claudiajs/example-projects)
