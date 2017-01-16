# Elasticsearch Index Template のバージョニング
本番環境の Index はどのバージョンの Index Template が適用されているの？
あ、、仕組み考えるの忘れてた。本番環境運用開始したら当然必要な情報ですね。
今回は Index Template のバージョニング方法についてまとめたいと思います。

## Index Template とは？
Index Template を簡単に説明すると、「 Index Template で管理する主な構成要素」をあらかじめテンプレート化しておき、
Index が作成された時にそのテンプレートを元に自動で構成要素を定義できる仕組みになっています。

新しい Index を作成する際に命名規約に沿っていれば、共通の構成要素を自動で適用できる便利な仕組みです。

**Index Template で管理する主な構成要素**

* シャードの構成（Primary Shards、Replica Shards）
* エイリアスの定義（Index Aliases）
* カスタマイズした言語処理の定義（Analyzers、Char Filters、Token Filters）
* フィールドマッピングの定義（Mappings）

以下の例では、名前が `blog` から始まる Index が作成された場合に、`_all` フィールドを無効に設定する Index Template の登録例です。

```bash
# Add Index Template for blog index.
PUT _template/blog
{
  "template": "blog*",
  "mappings": {
    "_default_": {
      "_all": {
        "enabled": false
      }
    }
  }
}
```

Index Template を登録しておくことで、以下の例のように Index 作成時に自動でそのルールが適用されます。

```bash
# Create blog index
PUT blog

# Get mappings of blog index
GET blog/_mapping
{
  "blog": {
    "mappings": {
      "_default_": {
        "_all": {
          "enabled": false
        }
      }
    }
  }
}
```

## Index Template の管理
Index Template は各プロジェクト/プロダクト毎に GitHub などのバージョン管理システムで管理することが多いのではないでしょうか？
以下は、JSON ファイルとして Index Template を管理している例です。
拡張子を覗いたいファイル名が Index Template 名と言うルールで管理しています。

```bash
# GitHub Repository
elasticsearch/config/templates
├── event-aliases-order.json
├── event-index-settings.json
├── event-mapping-default.json
├── master-aliases-category.json
├── master-aliases-coupon.json
├── master-aliases-customer.json
├── master-aliases-item.json
├── master-aliases-store.json
├── master-analysis-en.json
├── master-analysis-ja.json
├── master-index-settings.json
├── master-mapping-category.json
├── master-mapping-coupon.json
├── master-mapping-customer.json
├── master-mapping-default.json
├── master-mapping-item.json
└── master-mapping-store.json
```

Elasticsearch を準備して、Index を作成する前に、これらの Index Template をデプロイ（登録）します。
必ず現在のバージョンすべての Index Template をデプロイします。

```bash
# Deploy Index Templates.
$ curl -XPUT 'localhost:9200/_template/event-aliases-order' -d @event-aliases-order.json
$ curl -XPUT 'localhost:9200/_template/event-index-settings' -d @event-index-settings.json
$ curl -XPUT 'localhost:9200/_template/event-mapping-default' -d @event-mapping-default.json
$ curl -XPUT 'localhost:9200/_template/master-aliases-category' -d @master-aliases-category.json
$ curl -XPUT 'localhost:9200/_template/master-aliases-coupon' -d @master-aliases-coupon.json
$ curl -XPUT 'localhost:9200/_template/master-aliases-customer' -d @master-aliases-customer.json
$ curl -XPUT 'localhost:9200/_template/master-aliases-item' -d @master-aliases-item.json
$ curl -XPUT 'localhost:9200/_template/master-aliases-store' -d @master-aliases-store.json
$ curl -XPUT 'localhost:9200/_template/master-analysis-en' -d @master-analysis-en.json
$ curl -XPUT 'localhost:9200/_template/master-analysis-ja' -d @master-analysis-ja.json
$ curl -XPUT 'localhost:9200/_template/master-index-settings' -d @master-index-settings.json
$ curl -XPUT 'localhost:9200/_template/master-mapping-category' -d @master-mapping-category.json
$ curl -XPUT 'localhost:9200/_template/master-mapping-coupon' -d @master-mapping-coupon.json
$ curl -XPUT 'localhost:9200/_template/master-mapping-customer' -d @master-mapping-customer.json
$ curl -XPUT 'localhost:9200/_template/master-mapping-default' -d @master-mapping-default.json
$ curl -XPUT 'localhost:9200/_template/master-mapping-item' -d @master-mapping-item.json
$ curl -XPUT 'localhost:9200/_template/master-mapping-store' -d @master-mapping-store.json
```

## Index Template のバージョニング
このままでは、対象環境の Index がどのバージョンの Index Template で作成されたのかわからなくなってしまいます。
Elasticsearch の API をコールして、そのバージョンが確認できるのがベストです。

### バージョニング用 Index Template の追加
以下の例のように バージョニング用の Index Template を追加して、Elasticsearch にデプロイしてください。

```bash
# GitHub Repository
elasticsearch/config/templates
├── event-aliases-order.json
├── event-index-settings.json
├── event-mapping-default.json
├── master-aliases-category.json
├── master-aliases-coupon.json
├── master-aliases-customer.json
├── master-aliases-item.json
├── master-aliases-store.json
├── master-analysis-en.json
├── master-analysis-ja.json
├── master-index-settings.json
├── master-mapping-category.json
├── master-mapping-coupon.json
├── master-mapping-customer.json
├── master-mapping-default.json
├── master-mapping-item.json
├── master-mapping-store.json
└── product.json                # バージョニング用の Index Template を追加管理
```

```bash
...
$ curl -XPUT 'localhost:9200/_template/product' -d @product.json
```

product.json は、バージョニング用の Index Template 例です。`_meta.version` にリリースタグ（Git）のバージョン情報を管理してください。
適用する Index 名には、`*` を指定して、すべての Index に適用されるようにしています。

**product.json の内容例**

```bash
{
  "template": "*",
  "mappings": {
    "_default_": {
      "_meta": {
        "product": "Product A",   # プロダクト名
        "version": "1.0.1"        # リリースタグ（Git）のバージョン情報
      }
    }
  }
}
```

`_meta` は任意の属性を登録できるので、プロダクト名なども含めておいても良いでしょう。


> **Elasticsearch 5.x**
> ES 5.x 系では、version と言うメタ情報が追加されていますので、このメタ情報を使用して管理しても良いでしょう。
> [Template Versioning](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-templates.html#versioning-templates)


## デプロイバージョンの確認
デプロイされている Index Template のバージョンを確認するには、Template API を使用し、バージョニング用の Index Template 名を指定して以下のようにリクエストします。

```bash
# Request
$ curl -XGET 'localhost:9200/_template/product' | jq '.[].mappings._default_._meta'

# Response
{
  "product": "Product A",
  "version": "1.0.1"
}
```

> **注意**
> この操作で確認できるのは、Index Template としてデプロイされているバージョンの確認です。
> 各 Index に適用されている Index Template のバージョンを確認するには、以下の「適用バージョンの確認」を参照してください。

## 適用バージョンの確認
Index 作成後、Elasticsearch の API を使用して、対象の Index に適用されている Index Template のバージョンを確認するには以下のようにリクエストします。

以下は、`blog` Index に提供されている Index Template のバージョン確認例です。

```bash
# Request
$ curl -XGET 'localhost:9200/blog/_mapping' | jq '.[].mappings._default_._meta'

# Response
{
  "product": "Product A",
  "version": "1.0.1"
}
```


## まとめ
いかがでしたでしょうか？
Elasticsearch 2.x 系では、Index Template のバージョニングをするための機能は提供されていませんが、
メタ情報をうまく活用することで、可能になります。
これで、本番環境運用が開始しても安心して保守できますね。
