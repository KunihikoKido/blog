# 第８回 Elasticsearch 入門 API の使い方をハンズオンで理解する 〜後編〜
前回に引き続き、今回もハンズオンです。後編では、仮想 Classmethod 社の社員情報をサンプルデータとして用意しました（※ もちろんデータは本物ではありませんのでご安心ください。）。
このサンプルデータを使用して、検索や分析方法を API を使って説明します。

環境のセットアップがお済みでない方は、前回の「[第７回 Elasticsearch 入門 API の使い方をハンズオンで理解する 〜前編〜](http://dev.classmethod.jp/server-side/elasticsearch-getting-started-07/)」の「事前準備」の章を参考にセットアップしてください。

## サンプルデータのインデックス
ハンズオンを始める前に、以下の手順でサンプルデータをダウンロードしてインデックスしてください。
employees.jsonl を含むサンプルデータは [こちら](https://github.com/KunihikoKido/docs/blob/master/data/employees.zip?raw=true) からダウンロードできます。

```
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
サンプルデータは、社員の名前（`firstname`、`lastname`）や性別（`gender`）、興味のある AWS サービス（`interests`）などの属性を持つ社員データです。

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

例えば、`firstname` フィールドの内容は、インデックス時も検索時も `standard` Analyzer で解析されます。`standard` Analyzer は主に英語系の文章をインデックス・検索するために使用される Analyzer です。そのためこのフィールドは、自然文章検索で使用することができます。また、`firstname` には、`firstname.raw` と言うフィールドが定義されています。このフィールドの内容はインデックス時も検索時もアナライズされません。完全一致検索や集計、フルソートなどで使用することができます。

そのほか、long 型のフィールドや date 型のフィールド、boolean 型のフィールドなどフィールド毎に様々なタイプのフィールドが定義されています。

## 検索
ここからは、いよいよサンプルデータを使ったハンズオンです。Elasticsearch 1.x 系と 2.x 系で検索条件を組み立てる Query DSL は少し書き方が違いますので注意してください。今回は 2.x 系を基準に説明します。

### 全てにマッチする Query
全ての Document にマッチする Query をリクエストしてみましょう。
`_search` エンドポイントに、Json 形式で組み立てた検索条件を body の内容としてリクエストします。
このエンドポイントは `POST` と `GET` の両方がサポートされています。

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
`_source` の内容をそのまま返してしまうと検索結果の内容が大きくなりすぎてしまう場合があります。その場合は、include や exclude を使って `_source` の内容を制御することができます。以下の例は、exclude を使って "joined_date" と "friends" フィールドを除外する例です。

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
１ページ目、２ページ目など、検索結果に対して指定したページの一覧を取得するには `size` と `from` パラメータを使用します。

```
GET /classmethod/employees/_search
{
    "query": {
        "match_all": {}
    },
    "size": 10,
    "from": 0
}
```

* `size`
    * １リクエストで返却する最大 Document 数を指定します。
* `from`
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
また、検索時に指定した文字列もインデックス時と同じ言語処理がされるため、`tammy` `Tammy` `TAMMY` いずれのパターンの文字列も `tammy` として検索します。そのため入力文字列に揺らぎがあっても検索結果にヒットするというわけです。

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
代表的なのは Bool クエリです。

※ And や Or クエリもサポートされていますが、Bool クエリを使うように推奨されています。

```
GET /classmethod/employees/_search
{
  "query": {
    "bool": {
      "must": [
        {"match": {"firstname": "Tammy"}},
        {"match": {"lastname": "Hatfield"}},
        {"range": {"age": {"gte": 20, "lte": 30}}}
      ]
    }
  }
}
```

Bool クエリには、`must` 以外に `filter` `should` `must_not` がサポートされています。

### Query と Filter の違い
Bool クエリでサポートされている `must` と `filter` の違いについて何が違うの？と思いませんか。
どちらも全ての条件にマッチした Document のみ検索にヒットします。
先ほどのクエリを以下のように変更してみましょう。

```
GET /classmethod/employees/_search
{
  "query": {
    "bool": {
      "must": [
        {"match": {"firstname": "Tammy"}},
        {"match": {"lastname": "Hatfield"}}
      ],
      "filter": [
        {"range": {"age": {"gte": 20, "lte": 30}}}      
      ]
    }
  }
}
```

検索結果にマッチする Document は変わらないはずです。ただし、`_score` の値に変化があったはずです。
`must` で指定した検査条件はスコアの計算にも使われますが、`filter` で指定した検索条件はスコアの計算には使われません。

* Query 条件
  * 検索結果のスコアが計算される検索条件
* Filter 条件
  * 検索結果のスコアが計算されない検索条件
  * よく使う Filter は自動的にキャッシュされます

参考: [Query and filter context](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-filter-context.html)

## 集計
Elasticsearch は集計機能（Aggregations）も提供します。

### Metrics Aggregations
Metrics Aggregations は主に数値系のフィールドを対象に合計や平均値などを求めるための Aggregation です。
以下の例では、全ての社員情報を対象に平均年齢をもとめています。

※ `size: 0` を指定することで、集計結果のみレスポンスされるようにしています。

```
GET /classmethod/employees/_search
{
  "query": {
    "match_all": {}
  },
  "aggs": {
    "avg_age": {
      "avg": {"field": "age"}
    }
  },
  "size": 0
}
```

レスポンス例

```
{
  "took": 10,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "failed": 0
  },
  "hits": {
    "total": 2000,
    "max_score": 0,
    "hits": []
  },
  "aggregations": {
    "avg_age": {
      "value": 30.0285
    }
  }
}
```

全社員の平均年齢は 30.0285 歳ということがわかりました。

参考: [Metrics Aggregations](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-metrics.html)

### Bucket Aggregations
Bucket Aggregations には様々な種類があります。ここでは代表的な `terms` Aggregation を紹介します。

以下の例では、人気の AWS サービスごとにその平均年齢を求めています。

```
GET /classmethod/employees/_search
{
  "query": {
    "match_all": {}
  },
  "aggs": {
    "interests": {
      "terms": {
        "field": "interests.raw",
        "size": 10
      },
      "aggs": {
        "avg_age": {
          "avg": {"field": "age"}
        }
      }
    }
  },
  "size": 0
}
```

レスポンス例

```
{
  "took": 17,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "failed": 0
  },
  "hits": {
    "total": 2000,
    "max_score": 0,
    "hits": []
  },
  "aggregations": {
    "interests": {
      "doc_count_error_upper_bound": 77,
      "sum_other_doc_count": 4600,
      "buckets": [
        {
          "key": "Amazon Simple Queue Service (SQS)",
          "doc_count": 135,
          "avg_age": {
            "value": 29.94814814814815
          }
        },
        {
          "key": "Amazon SimpleDB",
          "doc_count": 134,
          "avg_age": {
            "value": 29.5
          }
        },
        {
          "key": "Amazon EC2 Container Service (ECS)",
          "doc_count": 123,
          "avg_age": {
            "value": 29.650406504065042
          }
        },
        {
          "key": "Amazon Cognito",
          "doc_count": 122,
          "avg_age": {
            "value": 29.237704918032787
          }
        },
        {
          "key": "Amazon AppStream",
          "doc_count": 119,
          "avg_age": {
            "value": 30.10924369747899
          }
        },
        {
          "key": "Auto Scaling",
          "doc_count": 119,
          "avg_age": {
            "value": 29.77310924369748
          }
        },
        {
          "key": "AWS Certificate Manager",
          "doc_count": 117,
          "avg_age": {
            "value": 28.914529914529915
          }
        },
        {
          "key": "AWS CodeCommit",
          "doc_count": 116,
          "avg_age": {
            "value": 29
          }
        },
        {
          "key": "AWS Direct Connect",
          "doc_count": 115,
          "avg_age": {
            "value": 30.756521739130434
          }
        },
        {
          "key": "Amazon API Gateway",
          "doc_count": 115,
          "avg_age": {
            "value": 29.652173913043477
          }
        }
      ]
    }
  }
}
```

この結果から、一番人気のある Amazon Simple Queue Service (SQS) は、135 人が興味がり、その平均年齢は 29.94814814814815 ということがわかります。（サンプルデータですので実際の人気とは関係ありません）

参考: [Bucket Aggregations](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket.html)

### Pipeline Aggregations
Pipeline Aggregations は Elasticsearch 2.x から提供されている Aggregation です。
Aggregation の結果を使って累積した値を計算するなど、特殊な機能を提供します。今回は説明のみとさせていただきますので、興味のある人は以下のリンク先を参照してください。

参考: [Pipeline Aggregations](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-pipeline.html)


## 検索条件のテンプート化（Search Template）
Elasticsearch には、検索条件をテンプレート化して再利用することができる機能が提供されています。
この機能を使用することで、プログラム内に検索条件をハードコーディングする必要がなくなります。
プログラムからは、事前に登録済みのテンプレート ID と必要であれば、パラメータをリクエストして実行することができます。

参考: [Search Template](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-template.html)

### Search Template の作成と登録
Search Template を作成して登録してみましょう。

```
POST /_search/template/template01
{
    "template": {
        "query": {
            "match": {
                "firstname": "{{firstname}}"
            }
        }
    }
}
```

テンプレート言語として Mustache の書式が使用できます。動的に変更したい部分を変数化して記述することができます。

参考: [MUSTACHE](http://mustache.github.io/mustache.5.html)

### Search Template を使って検索
登録したテンプレートを使用して検索するには登録済みのテンプレート ID と必要なパラメータを以下のように設定してリクエストしてください。

```
GET /classmethod/employees/_search/template
{
  "id": "template01",
  "params": {
    "firstname": "Tammy"
  }
}
```

直接 Query を組み立ててリクエストした時と、同じように検索結果が返却されていれば OK です。

### Search Template の展開結果を取得
テンプレートにパラメータを適用して展開されたクエリを確認したい場合は、以下のようにリクエストしてください。


```
GET /_render/template
{
  "id": "template01",
  "params": {
    "firstname": "Tammy"
  }
}
```

レスポンス例

```
{
  "template_output": {
    "query": {
      "match": {
        "firstname": "Tammy"
      }
    }
  }
}
```

### Search Template を削除
登録済みのテンプレートを削除する場合は以下のようにリクエストします。

```
DELETE /_search/template/template01
```

## さいごに
今回、検索・集計と検索条件のテンプレート化について駆け足で説明しました。
基本的な操作は網羅していると思いますが、まだまだ深いところまでは説明しきれていません。
徐々に深い所まで、今後連載を続けていきたいと思いますのでよろしくお願いします。
