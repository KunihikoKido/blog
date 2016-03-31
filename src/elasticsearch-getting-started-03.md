# 第３回 Elasticsearch 入門 ドキュメント管理の基本
前回は「データスキーマ設計のいろは」というテーマで Elasticsearch にインデックスするためのドキュメント構造の設計について説明しました。今回は「ドキュメント管理の基本」というテーマで、そのドキュメントを追加・更新・削除する操作の基本を解説します。

## とてもシンプルな API
Elasticsearch は検索をはじめ、各種設定やサーバの状態取得など、ほとんどの操作を API として提供しています。もちろんドキュメントの追加・参照・更新・削除の API も提供していて、その仕様はとてもシンプルで直感的に使いこなすことができます。

ドキュメントをあらわす URL スキーマは以下のようになっています。

```js
GET|PUT|POST|DELETE|HEAD /{index}/{type}/{id}
```

例えば、posts というタイプを持つ blog インデックスに ドキュメントを識別するための Id が 123 というドキュメントを追加するには次のようにリクエストするだけです。

```js
PUT /blog/posts/123
{
  "title": "Hello! Elasticsearch",
  "auther": "Kunihiko Kido",
  "views": 0
}
```


もし、blog インデックスが存在しない場合は、このオペレーションで自動的に posts タイプも含めて作成されます。そして body で指定した JSON 形式のドキュメントが追加され検索可能になります。

とりあえず検索したいだけなら、本当にこれだけのオペレーションで、ドキュメントが追加され検索可能になってしまうのです。（カスタム・アナライザを適用する場合は、個別のマッピング定義が必要ですが別の機会に説明します。）

## １つのつのドキュメントは一意な Id で管理されている
Elasticsearch は Index 、Type 内のドキュメントを一意に識別することができるのはドキュメントの Id のみです。
RDB のように複数のフィールドの組み合わせによるユニーク・キーなどの制約は定義することはできません。


### 独自のドキュメント Id を使う場合と自動生成する場合
インデックスされたドキュメントは必ず一意になるドキュメント Id で管理されます。

#### 任意のドキュメント Id でインデックス

すでに一意に管理されている Id があればその Id を使用することができます。
（例えば、ウェブページであれば URL 、商品情報であれば商品 Id など）

```js
PUT /blog/posts/123
{
  "title": "Hello! Elasticsearch",
  "auther": "Kunihiko Kido",
  "views": 0
}
```


アクセスログなどのように Id 管理されていないデータはどうすれば良いでしょうか？

#### ドキュメント Id を自動生成してインデックス
Elasticsearch にはドキュメント Id を自動生成する仕組みもあります。リクエスト方法は `POST` メソッドを使用して Id を指定せずに以下のようにリクエストするだけです。

```js
POST /blog/posts/
{
  "title": "Hello! Elasticsearch",
  "auther": "Kunihiko Kido",
  "views": 0
}
```

ドキュメント Id を自動生成した場合は、以下のレスポンス例のように、 `_id` フィールドに生成されたドキュメント Id が付与された結果が返されます。

```js
{
  "_index": "blog",
  "_type": "posts",
  "_id": "AVFgSgVHUP18jI2wRx0w",
  "_version": 1,
  "created": true
}
```

## ドキュメント取得の基本
基本的なドキュメントの取得方法は、インデックス時のメソッドを `GET` に変更するだけです。

```
GET /blog/posts/123
```

レスポンスは、インデックス名やタイプ名などのメタ情報と、`_source` フィールドが以下の例のように返されます。

```js
{
  "_index": "blog",
  "_type": "posts",
  "_id": "123",
  "_version": 1,
  "found": true,
  "_source": {
    "title": "Hello! Elasticsearch",
    "auther": "Kunihiko Kido",
    "views": 0
  }
}
```

### 存在しないドキュメントのレスポンス例
また、存在しないドキュメントを指定した場合には、`404` の HTTP レスポンスコードと一緒に以下の例のようなレスポンスが返されます。

```js
{
  "_index": "blog",
  "_type": "posts",
  "_id": "123",
  "found": false,  
}
```

### ドキュメントの一部を取得する
ドキュメントが大きい場合など、必要なフィールドのみ取得することも可能です。

```
GET /blog/posts/123?_source=title,auther
```

```js
{
  "_index": "product",
  "_type": "items",
  "_id": "123",
  "_version": 1,
  "found": true,
  "_source": {
    "title": "Hello! Elasticsearch",
    "auther": "Kunihiko Kido"
  }
}
```

### メタ情報なしに `_source` のみ取得する
`_index` や `_type` などのメタ情報を含めずに、`_source` の内容だけ取得することもできます。

```
GET /blog/posts/123/_source
```


```js
{
  "title": "Hello! Elasticsearch",
  "auther": "Kunihiko Kido",
  "views": 0
}
```

## ドキュメントの存在を確認する
ドキュメントが存在するかどうかを確認するには HEAD メソッドを使用します。
body レスポンスはありません。HTTP のレスポンス情報で存在確認を判断することができます。

```
HEAD /blog/posts/123
```

存在する場合

```
HTTP/1.1 200 OK
Content-Type: text/plain; charset=UTF-8
Content-Length: 0
```

存在しない場合

```
HTTP/1.1 404 Not Found
Content-Type: text/plain; charset=UTF-8
Content-Length: 0
```

## ドキュメント更新の基本
ドキュメントの更新は幾つか方法があるので、注意が必要です。

### ドキュメント全体を上書き更新する場合
以下のリクエストはドキュメントの追加と同じです。すでに存在する場合は、リクエストした内容でドキュメント全体が上書き更新されます。

```js
PUT /blog/posts/123
{
  "title": "Hello! Kibana",
  "auther": "Kunihiko Kido",
  "views": 0
}
```

### 存在しない場合のみ新しいドキュメントを作成する
ドキュメントが存在しない場合のみ新しい内容で追加するには `op_type=create` または `_create` エンドポインントを使用します。

```js
PUT /blog/posts/123?op_type=create
{
  "title": "Hello! Elasticsearch",
  "auther": "Kunihiko Kido",
  "views": 0,
  "published": "2016/03/29"
}
```

または

```js
PUT /blog/posts/123/_create
{
  "title": "Hello! Elasticsearch",
  "auther": "Kunihiko Kido",
  "views": 0
}
```

存在する場合は以下のようなエラーが発生します。

```js
{
  "error" : "DocumentAlreadyExistsException[[blog][4] [posts][123]: document already exists]",
  "status" : 409
}
```

### ドキュメントの一部を更新する
更新したいドキュメントの一部をリクエストして、部分的な更新をすることができます。

```js
PUT /blog/posts/123/_update
{
  "doc": {
    "tags": ["Elasticsearch"]
  }
}
```

`_source` フィールドもアップデートされます。

```js
{
  "_index": "blog",
  "_type": "posts",
  "_id": "123",
  "_version": 3,
  "found": true,
  "_source": {
    "title": "Hello! Elasticsearch",
    "auther": "Kunihiko Kido",
    "tags": ["Elasticsearch"],
    "views": 0
  }
}
```

### スクリプトを使ってドキュメントの一部を更新する
例えば、views をカウントアップしたい場合など、もとの値をベースにドキュメントの一部を更新したい場合は `script` を使用します。

```js
PUT /blog/posts/123/_update
{
  "script": "ctx._source.views+=1"
}
```

views の値が１足されます。

```js
{
  "_index": "blog",
  "_type": "posts",
  "_id": "123",
  "_version": 3,
  "found": true,
  "_source": {
    "title": "Hello! Elasticsearch",
    "auther": "Kunihiko Kido",
    "tags": ["Elasticsearch"],
    "views": 1
  }
}
```


## ドキュメント削除の基本
ドキュメントを削除するには、`DELETE` メソッドを使用します。

```
DELETE /blog/posts/123
```

## 少し高度なドキュメントの更新方法
### 楽観的並行性制御（optimistic concurrency control）
Elasticsearch は、他の処理とは競合してはならないトランザクションにおいて、楽観的並行性制御の仕組みを提供しています。

楽観的並行性制御とは、ドキュメント更新開始時には特に排他処理は行なわず、完了する際に他からの更新がされたかどうかを確認します。
そして、もし他から更新されてしまっていたら自らの更新処理を破棄し、エラーとする仕組みです。

以下のリクエストでは、現在インデックスされている version が 1 の場合は更新されます。

```js
PUT /blog/posts/123?version=1
{
  "title": "Hello! Elasticsearch",
  "auther": "Kunihiko Kido",
  "views": 0
}
```

ドキュメントの更新が成功すると version が 2 へ増加します。

```
{
  "_index": "blog",
  "_type": "posts",
  "_id": "123",
  "_version": 2,
  "created": false
}
```
