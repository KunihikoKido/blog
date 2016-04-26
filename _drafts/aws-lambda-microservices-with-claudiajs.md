# ClaudiaJS を使った簡単マイクロサービス開発
Claudia.js はマイクロサービスを簡単に開発するためのオープンソースのデプロイメントツールです。Claudia.js を使うと AWS Lambda と Amazon API Gateway を使ったマイクロサービスを簡単に開発・デプロイすることができます。

Node.js 用の REST API をプログラミングするための Claudia API Builder ライブラリが提供されています。
Claudia.js は Claudia API Builder でプログラミングされたソースコードから、Amazon API Gateway に設定するべき内容を解釈して API のデプロイをコマンド一つで自動化してくれます。

便利そうですね。

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
var ApiBuilder = require('claudia-api-builder'),
	api = new ApiBuilder();

module.exports = api;

api.get('/hello', function () {
	'use strict';
	return 'hello claudia.js';
});
```

上記のプログラムは、エンドポイント `/hello` に対して GET メソッドでアクセスすると文字列 'hello claudia.js' を返す簡単な API です。

`package.json` に `"files": "*.js"` を追加します。

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

## AWS に新しいマイクロサービスをインストール
それでは、AWS に作成したマイクロサービスをインストールしてみましょう。

インストールするには、`claudia create` コマンドを使用します。
以下のコマンドで、AWS Lambda と Amazon API Gateway に API を公開するためのモジュールと各種設定が自動的に行われます。

``` bash
claudia create --name web-api-test --region us-east-1 --api-module app
```

しばらく待つと、以下のようなデプロイ情報が表示されます。

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
API がデプロイされたようなので、確認してみましょう。

AWS Lambda Console を確認すると、`web-api-test` という名前のファンクションが登録されています。

![AWS Lambda Console](https://raw.githubusercontent.com/KunihikoKido/docs/master/images/aws-lambda-microservices-with-claudiajs-1.png)


Amazon API Gateway Console では、`/hello` API エンドポイントに GET メソッドが定義されてることが確認できます。

![Amazon API Gateway Console](https://raw.githubusercontent.com/KunihikoKido/docs/master/images/aws-lambda-microservices-with-claudiajs-2.png)

以下のように `curl` コマンドを使って、アクセスしてみましょう。"hello claudia.js" とレスポンスが返ってきますね。

```
curl https://zjv2654klk.execute-api.us-east-1.amazonaws.com/latest/hello
"hello claudia.js"
```

## API エンドポイントを追加してみる

```
npm install superb --save
```

```
api.get('/greet', function (request) {
	var superb = require('superb');
	return request.queryString.name + ' is ' + superb();
});
```


```
claudia update
```

![Amazon API Gateway Console](https://raw.githubusercontent.com/KunihikoKido/docs/master/images/aws-lambda-microservices-with-claudiajs-3.png)


```
curl https://zjv2654klk.execute-api.us-east-1.amazonaws.com/latest/greet?name=Mike
```

```
curl https://zjv2654klk.execute-api.us-east-1.amazonaws.com/latest/greet?name=Mike
"Mike is beautiful"
```


```
claudia destroy
```


## さいごに
最近流行りのサーバーレス・アーキテクチャでの開発は、複数のサービスを組み合わせて使うことが多いと思います。そのためデプロイや設定は複雑になりがちです。Claudia.js を使うことで、開発からデプロイまで一気通貫してできるのでますますサーバーレス・アーキテクチャの開発が加速するのではないでしょうか。
