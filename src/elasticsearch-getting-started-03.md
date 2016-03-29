# 第３回 Elasticsearch 入門 ドキュメント管理の基本
前回は「データスキーマ設計のいろは」というテーマで Elasticsearch にインデックスするためのドキュメント構造の設計について説明しました。今回は「ドキュメント管理の基本」というテーマで、そのドキュメントを追加・更新・削除する操作の基本を解説します。

## 1つのドキュメントは1つの一意な ID で管理されている
RDB では1つのテーブル内に保存されているデータを１つまたは複数のカラムで構成されたプライマリ・キーやユニーク・キーを使って一意に識別するこどができます。
一方 Elasticsearch は Index 、Type （ドキュメントタイプ）内のドキュメントを一意に識別することができるのは Document Id のみです。ドキュメントを参照する URL は次のように定義されています。

```
GET /{index}/{type}/{id}
```

### 独自の Document Id を使う場合
RDB で管理されている商品情報など、決められた ID を持っている場合は、その独自の ID を使用してドキュメントをインデックスすることができます。

例えば、`product` Index の `items` Type に ID が `123` の商品情報をインデックスルルには、以下のようにリクエストします。

```json
PUT /product/items/123
{
  "name": "冷蔵庫",
  "price": 345,
  "published": "2016/03/29"
}
```

以下はそのレスポンス例です。指定した `123` が Document Id として登録されます。

```json
{
  "_index": "product",
  "_type": "items",
  "_id": "123",
  "_version": 1,
  "created": true
}
```

### 自動生成される Document Id を使う場合
アクセスログなど、常に追加オペレーションのみでデータを識別するための ID がない場合など、Document Id を自動生成してインデックスすることができます。

リクエスト方法は先ほどの例を修正すると、Document Id を指定せずに、メソッドを `POST` に変更しリクエストするだけです。

```json
POST /product/items/
{
  "name": "冷蔵庫",
  "price": 3456,
  "published": "2016/03/29"
}
```

以下はそのレスポンス例です。 `_id` に自動生成された Document Id が付与されます。

```json
{
  "_index": "product",
  "_type": "items",
  "_id": "AVFgSgVHUP18jI2wRx0w",
  "_version": 1,
  "created": true
}
```
