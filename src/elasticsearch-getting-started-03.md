# 第３回 Elasticsearch 入門 ドキュメント管理の基本
前回は「データスキーマ設計のいろは」というテーマで Elasticsearch にインデックスするためのドキュメント構造の設計について説明しました。
今回は「ドキュメント管理の基本」というテーマで、そのドキュメントを追加・更新・削除する操作の基本を解説します。

きっと、他の検索エンジンと比べ、その高機能ぶりに驚くはずです。

## 直感的に分かりやす API
Elasticsearch は検索をはじめ、各種設定やサーバの状態取得など、ほとんどの操作を API として提供しています。もちろんドキュメントの追加・参照・更新・削除の API も提供していて、その仕様はとてもシンプルで直感的に使いこなすことができます。

ドキュメントをあらわす URL スキーマは以下のようになっています。

```js
/{index}/{type}/{id}
```

基本的には、各種ドキュメントのエンドポイントに対して、`GET` `PUT` `POST` `DELETE` `HEAD` メソッドで追加・更新・削除などの操作が可能です。

例えば、posts というタイプを持つ blog インデックスに ドキュメントを識別するための ID が 123 というドキュメントを追加するには次のようにリクエストするだけです。

```js
PUT /blog/posts/123
{
  "title": "Hello! Elasticsearch",
  "author": "Kunihiko Kido",
  "views": 0
}
```

もし、blog インデックスが存在しない場合は、このオペレーションで自動的に posts タイプも含めて作成されます。そして body で指定した JSON 形式のドキュメントが追加され検索可能になります。とりあえず検索したいだけなら、本当にこれだけのオペレーションで、ドキュメントが追加され検索可能になってしまうのです。（カスタム・アナライザを適用する場合は、個別のマッピング定義が必要ですが別の機会に説明します。）

## １つのドキュメントは一意な ID で管理されている
Elasticsearch は Index と Type 内にインデックスされているドキュメントを一意に識別することができるのはドキュメントの ID のみです。
RDB のように複数のフィールドの組み合わせによるユニーク・キーなどの制約は定義することはできません。


### 独自のドキュメント ID を使う場合と自動生成する場合
インデックスされたドキュメントは必ず一意なドキュメント ID で管理されます。

#### 任意のドキュメント ID でインデックス

すでに一意に管理されている ID があればその ID を使用することができます。
（例えば、ウェブページであれば URL 、商品情報であれば商品 ID など）

```js
PUT /blog/posts/123
{
  "title": "Hello! Elasticsearch",
  "author": "Kunihiko Kido",
  "views": 0
}
```

アクセスログなどのように ID 管理されていないデータはどうすれば良いでしょうか？

#### ドキュメント ID を自動生成してインデックス
Elasticsearch にはドキュメント ID を自動生成する仕組があります。

リクエスト方法は `POST` メソッドを使用して ID を指定せずに以下のようにリクエストするだけです。

```js
POST /blog/posts/
{
  "title": "Hello! Elasticsearch",
  "author": "Kunihiko Kido",
  "views": 0
}
```

ドキュメント ID を自動生成した場合は、以下のレスポンス例のように、 `_id` フィールドに生成されたドキュメント ID が付与された結果が返されます。

```js
{
	"_index": "blog",
	"_type": "posts",
	"_id": "AVPKnvgaogRcMfU8CT47",
	"_version": 1,
	"_shards": {
		"total": 2,
		"successful": 1,
		"failed": 0
	},
	"created": true
}
```

## 少し高度なドキュメント管理方法
他の検索エンジンではあまり提供されていない、少し高度なドキュメントの管理方法（操作方法）について説明します。

* [存在しない場合のみ新しいドキュメントを作成する](#advanced-01)
* [ドキュメントの一部を更新する](#advanced-02)
* [スクリプトを使ってドキュメントの一部を更新する](#advanced-03)
* [楽観的並行性制御（optimistic concurrency control）](#advanced-04)
* [有効期限つきドキュメントをインデックスする（TTL）](#advanced-05)

<a id="advanced-01"></a>
### 存在しない場合のみ新しいドキュメントを作成する
ドキュメントが存在しない場合のみ新しい内容で追加するには `op_type=create` または `_create` エンドポイントを使用します。

```js
PUT /blog/posts/123?op_type=create
{
  "title": "Hello! Elasticsearch",
  "author": "Kunihiko Kido",
  "views": 0
}
```

または

```js
PUT /blog/posts/123/_create
{
  "title": "Hello! Elasticsearch",
  "author": "Kunihiko Kido",
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

<a id="advanced-02"></a>
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
    "author": "Kunihiko Kido",
    "tags": ["Elasticsearch"],
    "views": 0
  }
}
```

<a id="advanced-03"></a>
### スクリプトを使ってドキュメントの一部を更新する
例えば、ユーザがアクセスしたページ・ビューをカウントアップしたい場合など、もとの値をベースにドキュメントの一部を更新したい場合は `script` を使用します。

参考: [Enabling dynamic scripting](https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-scripting.html#enable-dynamic-scripting)


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
    "author": "Kunihiko Kido",
    "tags": ["Elasticsearch"],
    "views": 1
  }
}
```

#### 部分更新と衝突への対応
例えば、ページ・ビュー数など複数のプロセスによってカウントアップされる値を更新したい場合は、`retry_on_conflict` パラメータを使用することができます。

以下の例では複数のプロセスによって同時に `views` フィールドの値をカウントアップした際に発生するエラーに対して５回りトライして更新します。

```js
POST /blog/posts/123/_update?retry_on_conflict=5
{
   "script" : "ctx._source.views+=1",
   "upsert": {
       "views": 0
   }
}
```

この方法は、書き込む順番は関係のないページ・ビュー数などのカウントアップに有効です。
書き込む順番が重要な場合は楽観的ロックを使用します。

<a id="advanced-04"></a>
### 楽観的並行性制御（optimistic concurrency control）
Elasticsearch は、他の処理とは競合してはならないトランザクションにおいて、楽観的並行性制御（以下楽観的ロック）の仕組みを提供しています。

楽観的ロックとは、ドキュメント更新開始時には特に排他処理は行なわず、完了する際に他からの更新がされたかどうかを確認します。
そして、もし他から更新されてしまっていたら自らの更新処理を破棄し、エラーとする仕組みです。

#### Elasticsearch 管理のバージョン番号を使用した楽観的ロック
Elasticsearch はドキュメントの `_version` メタ情報にバージョン番号を管理しています。
このバージョン番号はドキュメントが更新されるたびに増加します。
この Elasticsearch が管理しているバージョン番号を使った楽観的ロックの仕組みを説明します。

まずは更新する対象ドキュメントのバージョン番号を確認します。以下の例ではバージョン番号は１です。

```js
{
  "_index": "blog",
  "_type": "posts",
  "_id": "123",
  "_version": 1,
  "found": true,
  "_source": {
    "title": "Hello! Elasticsearch",
    "author": "Kunihiko Kido"
  }
}
```

このバージョン番号を使って、楽観的ロックを使って制御するには `version` パラメータを使用して以下のようにリクエストします。

```js
PUT /blog/posts/123?version=1
{
  "title": "Hello! Elasticsearch",
  "author": "Kunihiko Kido",
  "views": 0
}
```

ドキュメントを更新するときに、他のプロセスに更新されずにバージョン番号が１のままの時は更新に成功します。
そして、`_version` の値は 2 へ増加します。

すでに他のプロセスに更新され、 `_version` の値が指定した値と異なる場合は、以下のようにエラーになります。

```js
{
  "error" : {
    "root_cause" : [ {
      "type" : "version_conflict_engine_exception",
      "reason" : "[posts][123]: version conflict, current [2], provided [1]",
      "shard" : "0",
      "index" : "blog"
    } ],
    "type" : "version_conflict_engine_exception",
    "reason" : "[posts][123]: version conflict, current [2], provided [1]",
    "shard" : "0",
    "index" : "blog"
  },
  "status" : 409
}
```

#### 外部システム管理のバージョン番号を使用した楽観的ロック
外部システム管理のバージョン番号を使用する場合は、`version` パラメータに加え、`version_type=external` パラメータを使用して以下のようにリクエストします。また、`version` パラメータには外部システムで管理しているバージョン番号を指定します。

```js
PUT /blog/posts/123?version=5&version_type=external
{
  "title": "Hello! Elasticsearch",
  "author": "Kunihiko Kido",
  "views": 0
}
```

外部システムで管理しているバージョン番号が常に最新ということを前提としているため、現在のドキュメントのバージョン番号は事前に知る必要はありません。

ドキュメントの現在のバージョン番号が、指定したバージョン番号未満の場合は更新に成功します。
そして `_version` が指定したバージョン番号で更新されます。

また、バージョン番号が同じか大き場合（すでに新しい情報で更新されている場合）にはエラーになります。

```js
{
  "error" : {
    "root_cause" : [ {
      "type" : "version_conflict_engine_exception",
      "reason" : "[posts][123]: version conflict, current [2], provided [1]",
      "shard" : "0",
      "index" : "blog"
    } ],
    "type" : "version_conflict_engine_exception",
    "reason" : "[posts][123]: version conflict, current [2], provided [1]",
    "shard" : "0",
    "index" : "blog"
  },
  "status" : 409
}
```

<a id="advanced-05"></a>
### 有効期限つきドキュメントをインデックスする（TTL）
ドキュメントを削除する方法には、TTL （Time To Live）を指定して、有効期限つきのドキュメントをインデックスする方法もあります。
アクセスログなど増加していくデータを自動で削除するのに便利です。

まずは、`_ttl` の設定を有効にします。

```js
PUT /blog
{
  "mapping": {
    "posts": {
      "_ttl": {
        "enabled": true
      }
    }
  }
}
```

そして、ドキュメント追加時に `ttl` パラメータに有効期限をつけてインデックスします。
以下のドキュメントはインデックス後１０分経過すると削除されます。

```js
PUT /blog/posts/123?ttl=10m
{
  "title": "Hello! Elasticsearch",
  "author": "Kunihiko Kido",
  "views": 0
}
```

`ttl` パラメータを指定しなくても、`_ttl` 設定有効時にデフォルトの TTL を設定することも可能です。

また、TTL をリセットしたい場合は同じ手順で、ドキュメントを更新すると経過時間がリセットされます。


## 複数ドキュメントの一括操作
これまで、１つのドキュメントに対する管理方法（操作方法）を説明してきました。
この章では、複数のドキュメントを１度に処理する 各種 API を簡単に紹介したいと思います。

* Multi Get API
* Bulk API
* Delete By Query API (<=1.7)
* Update By Query API (>=2.3)
* Reindex API (>=2.3)

### Multi Get API
Multi Get API は１度のリクエストで、複数のドキュメントを取得するための API です。

※ 参考: [Multi Get API](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-multi-get.html)

### Bulk API
Bulk API は１度のリクエストで、複数のドキュメントに対する追加・更新・削除オペレーションを提供する API です。

大量のドキュメントを追加・更新・削除する場合は、この Bulk API を使用したほうがパフォーマンスが良いです。

※ 参考: [Bulk API](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-bulk.html)

### Delete By Query API
検索条件にマッチしたドキュメントを削除する API です。

※ 参考: [Delete By Query API](https://www.elastic.co/guide/en/elasticsearch/reference/1.7/docs-delete-by-query.html)

※ 注意: Elasticsearch 2.0 で削除された API です。

**2.0 以上で当機能を実現する場合の手段**

* [Delete By Query Plugin を使用する方法](https://www.elastic.co/guide/en/elasticsearch/plugins/2.3/plugins-delete-by-query.html)
* scroll/scan API で検索条件にマッチしたドキュメント ID を取得し、Bulk API を使って削除する方法

### Update By Query API
検索条件にマッチしたドキュメントの任意のフィールドの値を更新する API です。

※ 参考:[Update By Query API](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-update-by-query.html)

※ 注意: Elasticsearch 2.3 から追加された API です。

**2.3 以前で当機能を実現する場合の手段**

* scroll/scan API で検索条件にマッチしたドキュメントを取得して、Bulk API を使ってアップデートする方法

### Reindex API
インデックス済みの情報を再度インデックスし直すための API です。

※ 参考: [Reindex API](https://www.elastic.co/guide/en/elasticsearch/reference/2.3/docs-reindex.html)

※ 注意: Elasticsearch 2.3 から追加された API です。

**2.3 以前で当機能を実現する場合の手段**

* scroll/scan API で検索条件にマッチしたドキュメントを取得して、Bulk API を使って上書き更新する方法
* 公式 Elasticsearch Client (Python など) の Reindex 用のヘルパ関数を使用する。
  * 注意: Reindex 用のヘルパ関数が提供されていない言語ものもある

## まとめ
今回は Elasticsearch におけるドキュメント管理（操作方法）について説明しました。

楽観的ロック、スクリプトを使用した部分更新など、検索エンジンとは思えないほどの高機能ぶりです。
このようなドキュメント管理の特徴も他の検索エンジンにはない Elasticsearch の特徴と言えるのではないでしょうか。
