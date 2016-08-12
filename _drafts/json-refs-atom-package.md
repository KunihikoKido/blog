# json refs atom package
現在進行中のプロジェクトで、 Swagger を使って REST API 仕様書を作成しています。
実際のプロジェクトで作成する Swagger はとても巨大で、１ファイルで管理するのは難しいです。
そこで考えるのがファイルの分割。以下の記事でも紹介していますが、swagger.json のファイルを分割して
作成・管理することができます。実際に使用するときは、外部参照の定義を解決して swagger.json を作成流れです。

[Swagger 定義ファイルを分割する](http://dev.classmethod.jp/etc/split-swagger/)

JSON 内で ```$ref``` を使用して、他で定義されている JSON を参照する [JSON Reference](https://tools.ietf.org/id/draft-pbryan-zyp-json-ref-03.html) という規格があったので、調べがてら Atom の Package にして公開しました。(正直役に立つかどうかわかりません。。)

[JSON Refs Atom Package](https://atom.io/packages/json-refs)

![overview](https://raw.githubusercontent.com/KunihikoKido/atom-json-refs/master/screenshots/overview.gif)

## インストール
※ このパッケージは、Atom エディタのプラグインとして動作します。Atom をまだインストールしていない場合は、[ここ](https://atom.io)からダウンロードしてインストールしてください。

json-refs は以下の手順でインストール出来ます。

```
apm install json-refs
```

または

Settings/Preferences ➔ Install ➔ Search for json-refs


## 使い方
### 1. JSON ファイルの作成
Atom エディタを起動して、以下の内容で `sample.json` という名前で保存します。

``` js
{
  "definitions": {
    "address": {
      "type": "object",
      "properties": {
        "street_address": {
          "type": "string"
        },
        "city": {
          "type": "string"
        },
        "state": {
          "type": "string"
        }
      },
      "required": [
        "street_address",
        "city",
        "state"
      ]
    }
  },
  "type": "object",
  "properties": {
    "billing_address": {
      "$ref": "#/definitions/address"
    },
    "shipping_address": {
      "allOf": [
        {
          "$ref": "#/definitions/address"
        },
        {
          "properties": {
            "type": {
              "enum": [
                "residential",
                "business"
              ]
            }
          },
          "required": [
            "type"
          ]
        }
      ]
    }
  }
}
```

上記のサンプルは、１ファイル内に定義と参照が入っているサンプルです。

`definitions` 内に address オブジェクトのスキーマが定義されています。
また、`billing_address` や `shipping_address` で、definitions で定義されている address を参照しています。

### 2. $ref で参照している内容を解決する
Atom のコマンドパレットを表示して、`Json Refs: Resolve` を実行してください。
以下はその実行結果です。

```
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "definitions": {
    "address": {
      "type": "object",
      "properties": {
        "street_address": {
          "type": "string"
        },
        "city": {
          "type": "string"
        },
        "state": {
          "type": "string"
        }
      },
      "required": [
        "street_address",
        "city",
        "state"
      ]
    }
  },
  "type": "object",
  "properties": {
    "billing_address": {
      "type": "object",
      "properties": {
        "street_address": {
          "type": "string"
        },
        "city": {
          "type": "string"
        },
        "state": {
          "type": "string"
        }
      },
      "required": [
        "street_address",
        "city",
        "state"
      ]
    },
    "shipping_address": {
      "allOf": [
        {
          "type": "object",
          "properties": {
            "street_address": {
              "type": "string"
            },
            "city": {
              "type": "string"
            },
            "state": {
              "type": "string"
            }
          },
          "required": [
            "street_address",
            "city",
            "state"
          ]
        },
        {
          "properties": {
            "type": {
              "enum": [
                "residential",
                "business"
              ]
            }
          },
          "required": [
            "type"
          ]
        }
      ]
    }
  }
}
```

billing_address など、$ref で参照していた内容が実体の内容に解決されています。

## さいごに
今回は、swagger.json を作成する際に、JSON の外部参照の規格を知るきっかけになりました。規格を調べてみて REST API の レスポンスにもこの規格を使って、外部リソースの情報を付加する目的で使っても便利そうだなと感じました(一般的かどうかは別として)。また、複雑なリレーショナルデータベースのテーブルの内容を Elasticsearch へインデックスする際にも利用できると、これもまた便利そうです。(Ingest あたりに JSON Reference パーサが実装されると Index データ作成が便利かな？)

ソースコードは GitHub で公開していますので、追加機能などプルリクお待ちしています。
[https://github.com/KunihikoKido/atom-json-refs](https://github.com/KunihikoKido/atom-json-refs)
