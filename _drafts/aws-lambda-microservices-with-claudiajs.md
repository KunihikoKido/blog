# ClaudiaJS を使った簡単マイクロサービス開発
Claudia.js は AWS Lambda と Amazon API Gateway を使った Node.js ベースのマイクロサービスを簡単に開発するためのオープンソースのデプロイメントツールです。



## Claudia.js のインストール
Claudia.js はコマンドラインベースのデプロイメントツールを提供しています。以下のコマンドで Claudia.js をグルーバルパスへインストールします。

``` bash
npm install claudia -g

```

## Node.js プロジェクトの作成
以下の手順で Node.js プロジェクトを作成してください。

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
	return 'hello world';
});
```

上記のプログラムは、エンドポイント `/hello` に対して GET メソッドでアクセスすると文字列 'hello world' を返す簡単な API です。

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

``` bash
claudia create --name web-api-sample --region us-east-1 --api-module app
```

```
{
  "lambda": {
    "role": "web-api-test-executor",
    "name": "web-api-test",
    "region": "us-east-1"
  },
  "api": {
    "id": "zjv2654klk",
    "module": "app",
    "url": "https://zjv2654klk.execute-api.us-east-1.amazonaws.com/latest"
  }
}
```


![AWS Lambda Console](https://raw.githubusercontent.com/KunihikoKido/docs/master/images/aws-lambda-microservices-with-claudiajs-1.png)

![Amazon API Gateway Console](https://raw.githubusercontent.com/KunihikoKido/docs/master/images/aws-lambda-microservices-with-claudiajs-2.png)



```
curl https://zjv2654klk.execute-api.us-east-1.amazonaws.com/latest/hello
```


```
curl https://zjv2654klk.execute-api.us-east-1.amazonaws.com/latest/hello
"hello world"
```


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
