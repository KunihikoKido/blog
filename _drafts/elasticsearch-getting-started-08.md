# 第８回 Elasticsearch 入門 API の使い方をハンズオンで理解する 〜後編〜
前回に引き続き、今回もハンズオンです。後編では、仮想 Classmethod 社の社員情報をサンプルデータとして用意しました（※ もちろんデータは本物ではありませんのでご安心ください。）。
このサンプルデータを使用して、検索や分析方法を API を使って説明します。

環境のセットアップがお済みでないかたは、前回の「[第７回 Elasticsearch 入門 API の使い方をハンズオンで理解する 〜前編〜](http://dev.classmethod.jp/server-side/elasticsearch-getting-started-07/)」の「事前準備」の章を参考にセットアップしてください。

## サンプルデータのインデックス
ハンズオンを始める前に、以下の手順でサンプルデータをダウンロードしてインデックスしてください。
employees.jsonl を含むサンプルデータは [こちら](https://github.com/KunihikoKido/docs/blob/master/data/employees.zip?raw=true) からダウンロードできます。

``` sh
cd employees
# 1. add index template.
curl -XPUT 'localhost:9200/_template/classmethod' -d '@index-template.json'

# 2. load sample data & check the index
curl -XPOST 'localhost:9200/classmethod/employees/_bulk?pretty' --data-binary "@employees.jsonl"
curl 'localhost:9200/_cat/indices?v&index=classmethod'
```

レスポンス

```
# curl 'localhost:9200/_cat/indices?v&index=classmethod'
health status index       pri rep docs.count docs.deleted store.size pri.store.size
green  open   classmethod   5   0       5028            0        2mb            2mb
```

## サンプルデータの説明
サンプルデータの内容は以下のようになっています。社員の名前（`firstname`、`lastname`）や性別（`gender`）、興味のある AWS サービス（`interests`）などの属性を持つ社員データです。

このサンプルデータは、[www.json-generator.com/](http://www.json-generator.com/) を使って作成しました。

``` javascript
{
    "employee_id": 0,
    "firstname": "Kay",
    "lastname": "Ward",
    "email": "todd.nguyen@classmethod.jp",
    "salary": 726428,
    "age": 38,
    "gender": "male",
    "phone": "+1 (917) 512-3882",
    "address": "720 Maujer Street, Graniteville, Virgin Islands, 6945",
    "joined_date": "2014-10-24",
    "location": {
        "lat": 72.434989,
        "lon": 48.395502
    },
    "married": false,
    "interests": ["Auto Scaling", "Amazon Cognito"],
    "friends": [{
        "firstname": "Melba",
        "lastname": "Hobbs"
    }]
}
```


## Mapping 情報をもう少し詳し見る
Mapping 情報には、各種フィールドの型やアナライズ方法などが定義されています。Document 内の各種フィールドは、この定義の内容に従ってインデックスが作成されます。

社員情報の Mapping 情報を取得するには以下のように API をリクエストしてください。

```
GET /classmethod/_mapping/employees
```

レスポンス例

```
{
  "classmethod": {
    "mappings": {
      "employees": {
        "dynamic_templates": [
          {
            "string_template": {
              "mapping": {
                "type": "string",
                "fields": {
                  "raw": {
                    "index": "not_analyzed",
                    "type": "string"
                  }
                }
              },
              "match": "*",
              "match_mapping_type": "string"
            }
          }
        ],
        "properties": {
          "address": {
            "type": "string",
            "fields": {
              "raw": {
                "type": "string",
                "index": "not_analyzed"
              }
            }
          },
          "age": {
            "type": "long"
          },
          "email": {
            "type": "string",
            "fields": {
              "raw": {
                "type": "string",
                "index": "not_analyzed"
              }
            }
          },
          "employee_id": {
            "type": "long"
          },
          "firstname": {
            "type": "string",
            "fields": {
              "raw": {
                "type": "string",
                "index": "not_analyzed"
              }
            }
          },
          "friends": {
            "type": "nested",
            "properties": {
              "firstname": {
                "type": "string",
                "fields": {
                  "raw": {
                    "type": "string",
                    "index": "not_analyzed"
                  }
                }
              },
              "lastname": {
                "type": "string",
                "fields": {
                  "raw": {
                    "type": "string",
                    "index": "not_analyzed"
                  }
                }
              }
            }
          },
          "gender": {
            "type": "string",
            "fields": {
              "raw": {
                "type": "string",
                "index": "not_analyzed"
              }
            }
          },
          "interests": {
            "type": "string",
            "fields": {
              "raw": {
                "type": "string",
                "index": "not_analyzed"
              }
            }
          },
          "joined_date": {
            "type": "date",
            "format": "strict_date_optional_time||epoch_millis"
          },
          "lastname": {
            "type": "string",
            "fields": {
              "raw": {
                "type": "string",
                "index": "not_analyzed"
              }
            }
          },
          "location": {
            "type": "geo_point"
          },
          "married": {
            "type": "boolean"
          },
          "phone": {
            "type": "string",
            "fields": {
              "raw": {
                "type": "string",
                "index": "not_analyzed"
              }
            }
          },
          "salary": {
            "type": "long"
          }
        }
      }
    }
  }
}
```

例えば、`firstname` フィールドの内容は、インデックス時も検索時も `standard` Analyzer で解析されます。`standard` Analyzer は主に英語系の文章をインデックス・検索するために使用される Analyzer です。そのためこのフィールドに対する検索は主に自然文章検索で使用することができます。また、`firstname` には、`firstname.raw` と言うフィールドが定義されています。このフィールドの内容はインデックス時も検索時もアナライズされません。完全一致検索や集計、フルソートなどで使用することができます。

そのほか、long 型のフィールドや date 型のフィールド、boolean 型のフィールドなどフィールド毎に様々なタイプのフィールドが定義されています。

## 検索
ここからは、いよいよサンプルデータを使ったハンズオンです。Elasticsearch 1.x 系と 2.x 系で検索条件を組み立てる Query DSL 少し書き方が違いますので注意してください。今回は 2.x 系を基準に説明します。

### 全てにマッチする Query
全ての Document にマッチする Query をリクエストしてみましょう。
`_search` エンドポイントに、Json 形式で組み立てた検索条件を body の内容としてリクエストします。メソッドが `GET` になっていますが、間違いではありません。`POST` と `GET` がサポートされています。

```
GET /classmethod/employees/_search
{
    "query": {
        "match_all": {}
    }
}
```

レスポンス例

```
{
  "took": 9,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "failed": 0
  },
  "hits": {
    "total": 2000,
    "max_score": 1,
    "hits": [
      {
        "_index": "classmethod",
        "_type": "employees",
        "_id": "0",
        "_score": 1,
        "_source": {
          "employee_id": 0,
          "firstname": "Kay",
          "lastname": "Ward",
          "email": "todd.nguyen@classmethod.jp",
          "salary": 726428,
          "age": 38,
          "gender": "male",
          "phone": "+1 (917) 512-3882",
          "address": "720 Maujer Street, Graniteville, Virgin Islands, 6945",
          "joined_date": "2014-10-24",
          "location": {
            "lat": 72.434989,
            "lon": 48.395502
          },
          "married": false,
          "interests": [
            "Auto Scaling",
            "Amazon Cognito"
          ],
          "friends": [
            {
              "firstname": "Melba",
              "lastname": "Hobbs"
            }
          ]
        }
      },
      {
        "_index": "classmethod",
        "_type": "employees",
        "_id": "14",
        "_score": 1,
        "_source": {
          "employee_id": 14,
          "firstname": "Tammy",
          "lastname": "Hatfield",
          "email": "kathrine.oneal@classmethod.jp",
          "salary": 324595,
          "age": 27,
          "gender": "female",
          "phone": "+1 (923) 595-2112",
          "address": "875 Mill Lane, Hatteras, Wisconsin, 1117",
          "joined_date": "2014-03-22",
          "location": {
            "lat": 74.576713,
            "lon": -26.013868
          },
          "married": true,
          "interests": [
            "Amazon Redshift",
            "Amazon Simple Storage Service (S3)",
            "AWS Directory Service",
            "Amazon Elasticsearch Service",
            "Amazon Elastic MapReduce"
          ],
          "friends": []
        }
      },
      〜〜 省略 〜〜
    ]
  }
}
```

* `hits.total`
    * 検索結果合計数（Document 数）
* `hits.max_score`
    * 最大スコア
* `hits.hits`
    * 検索結果一覧
* `hits.hits._index`
    * Index 名称
* `hits.hits._type`
    * Type 名称
* `hits.hits._score`
    * スコア
* `hits.hits._id`
    * Document ID
* `hits.hits._source`
    * ソース・データ（社員情報）


## 検索結果の `_source` から任意のフィールドを除外
検索結果の内容が大きくなりすぎてしまう場合は、必要なフィールドのみレスポンスに返すことができます。以下は、"joined_date" と "friends" フィールドを除外する例です。

```
GET /classmethod/employees/_search
{
    "_source": {
        "exclude": ["joined_date", "friends"]
    },
    "query": {
        "match_all": {}
    }
}
```

## ページング
１ページ目、２ページ目などその検索結果の指定したページの一覧を取得するには `size` と `offset` パラメータを使用します。

```
GET /classmethod/employees/_search
{
    "query": {
        "match_all": {}
    },
    "size": 10,
    "offset": 0
}
```

* `size`
    * １リクエストで返却する最大 Document 数を指定します。
* `offset`
    * スキップする Document 数を指定します。

## 検索結果をフィルタリング
Elasticsearch は様々な種類の Query をサポートしています。

### Full text queries
以下の例は、`match` クエリを使用して、`firstname` フィールドの内容が、`tammy` にマッチする Document を検索する例です。

```
GET /classmethod/employees/_search
{
  "query": {
    "match": {
      "firstname": "tammy"
    }
  }
}
```

１件ヒットしましたか？
それでは、`tammy` を `Tammy` や `TAMMY` に変更して検索してください。
結果は同じように１件ヒットするはずです。

`firstname` にインデックスされているデータは言語処理されるため、`tammy` `Tammy` `TAMMY` いずれのパターンの文字列も `tammy` としてインデックスされます。
また、検索時に指定した文字列もインデックス時と同じ言語処理がされるため、`tammy` `Tammy` `TAMMY` いずれのパターンの文字列も `tammy` として検索します。そのため多少の揺らぎがあっても検索結果にヒットするというわけです。

今度は、`firstname` を `firstname.raw` に変更して検索するとどうなりますか？
`tammy` と `TAMMY` はヒットしなくなります。`firstname.raw` はインデックス・検索ともに言語処理しない設定になっているため、`Tammy` に完全に一致する場合のに検索にヒットします。

参考: [Full text queries](https://www.elastic.co/guide/en/elasticsearch/reference/current/full-text-queries.html)

### Term level queries
以下の例は、`term` クエリを使用して `firstname` フィールドの内容が、`tammy` にマッチする Document を検索する例です。

```
GET /classmethod/employees/_search
{
  "query": {
    "term": {
      "firstname": "tammy"
    }
  }
}
```

１件ヒットしましたか？
次に、`tammy` を `Tammy` や `TAMMY` に変更して同じ Query をリクエストしてください。

```
GET /classmethod/employees/_search
{
  "query": {
    "term": {
      "firstname": "Tammy"
    }
  }
}
```

この結果は０件になるはずです。

`firstname` にインデックスされているデータは、言語処理され `tammy` としてインデックスされています。それに対して、`term` クエリで指定した `Tammy` は言語処理されず検索します。
そのため、`Tammy` に一致する Document が見つからなかったというわけです。

参考: [Term level queries](https://www.elastic.co/guide/en/elasticsearch/reference/current/term-level-queries.html)

### Compound queries
Compound クエリについて見ていきましょう。複数検索条件の組み合わせに使用するクエリです。
代表的なのは Bool クエリです。And や Or クエリもサポートされていますが、Bool クエリを使うように推奨されています。

```
GET /classmethod/employees/_search
{
  "query": {
    "bool": {
      "must": [
        {"match": {"firstname": "Tammy"}},
        {"match": {"lastname": "Hatfield"}}
      ]
    }
  }
}

```

## 数値や日付のフィールドで範囲検索

## ユーザの任意のキーワードで全文検索

## 任意のフィールドで集計

## 複数のフィールドを多段で集計

## 検索条件のテンプート化（Search Template）

## Search Template を使って検索

## Search Template を削除
