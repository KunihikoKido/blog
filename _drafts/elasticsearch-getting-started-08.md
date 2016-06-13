# 第８回 Elasticsearch 入門 API の使い方をハンズオンで理解する 〜後編〜
前回に引き続き、今回もハンズオンです。後編ということで、今回は Classmethod 社の社員情報をサンプルデータとして用意したので、このデータを使用して検索や分析を Elasticsearch の API を使って、体験して見たいと思います。※ もちろんデータは本物ではありませんのでご安心ください。

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
Mapping 情報とは、テーブル定義のようなものです。以下のリクエストでサンプルデータがインデックスされている
 Type の Mapping 情報が取得できます。

```
GET /classmethod/_mapping/employees
```

以下のレスポンスが、Mapping 定義そのもです。String 型のフィールドには `raw` という名前のマルチフィールドを用意しています。これらのルールはサンプルデータをインデックスするときに追加しておいた Index Template のルールに従って、データインデックス時に自動で適用されたものです。

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

## 全てにマッチするクエリ
全ての Document にマッチする Query をリクエストしてみましょう。

```
GET /classmethod/employees/_search
{
    "query": {
        "match_all": {}
    }
}
```

レスポンスは以下のようになっているはずです。`hits.total` が Query にマッチした Document 数です。サンプルデータの社員情報は `_source` に含まれています。


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
      {
        "_index": "classmethod",
        "_type": "employees",
        "_id": "19",
        "_score": 1,
        "_source": {
          "employee_id": 19,
          "firstname": "Angelica",
          "lastname": "Nolan",
          "email": "buckley.herrera@classmethod.jp",
          "salary": 436746,
          "age": 33,
          "gender": "male",
          "phone": "+1 (925) 577-3934",
          "address": "348 Seeley Street, Caroleen, Oklahoma, 2759",
          "joined_date": "2015-07-12",
          "location": {
            "lat": 12.220363,
            "lon": 139.020541
          },
          "married": false,
          "interests": [
            "Amazon GameLift",
            "Amazon Elastic MapReduce",
            "AWS Elastic Beanstalk",
            "Amazon Virtual Private Cloud (VPC)"
          ],
          "friends": []
        }
      },
      {
        "_index": "classmethod",
        "_type": "employees",
        "_id": "22",
        "_score": 1,
        "_source": {
          "employee_id": 22,
          "firstname": "Opal",
          "lastname": "Pugh",
          "email": "petty.arnold@classmethod.jp",
          "salary": 425483,
          "age": 38,
          "gender": "male",
          "phone": "+1 (805) 430-3245",
          "address": "635 Chestnut Street, Mathews, American Samoa, 3088",
          "joined_date": "2014-01-30",
          "location": {
            "lat": -73.974216,
            "lon": -51.789355
          },
          "married": false,
          "interests": [
            "Amazon Virtual Private Cloud (VPC)",
            "Amazon SimpleDB",
            "AWS Direct Connect"
          ],
          "friends": [
            {
              "firstname": "Lea",
              "lastname": "Cox"
            }
          ]
        }
      },
      {
        "_index": "classmethod",
        "_type": "employees",
        "_id": "24",
        "_score": 1,
        "_source": {
          "employee_id": 24,
          "firstname": "Cross",
          "lastname": "Robinson",
          "email": "janet.mueller@classmethod.jp",
          "salary": 512962,
          "age": 21,
          "gender": "female",
          "phone": "+1 (835) 517-2051",
          "address": "441 Wakeman Place, Coral, Nevada, 2554",
          "joined_date": "2014-04-01",
          "location": {
            "lat": -27.621172,
            "lon": -40.33974
          },
          "married": false,
          "interests": [
            "Amazon Database Migration Service",
            "Amazon Elasticsearch Service",
            "Amazon Simple Workflow Service (SWF)",
            "Amazon WorkSpaces"
          ],
          "friends": [
            {
              "firstname": "Brady",
              "lastname": "Gibson"
            },
            {
              "firstname": "Jackson",
              "lastname": "Zimmerman"
            }
          ]
        }
      },
      {
        "_index": "classmethod",
        "_type": "employees",
        "_id": "25",
        "_score": 1,
        "_source": {
          "employee_id": 25,
          "firstname": "Harmon",
          "lastname": "Rice",
          "email": "wolf.houston@classmethod.jp",
          "salary": 648477,
          "age": 36,
          "gender": "male",
          "phone": "+1 (961) 502-3105",
          "address": "182 Bath Avenue, Kenvil, Michigan, 2967",
          "joined_date": "2015-02-27",
          "location": {
            "lat": 79.530654,
            "lon": -119.439587
          },
          "married": true,
          "interests": [
            "Amazon GameLift",
            "AWS Data Pipeline",
            "Amazon CloudSearch",
            "Amazon Simple Email Service (SES)",
            "Amazon Elastic Compute Cloud (EC2)"
          ],
          "friends": [
            {
              "firstname": "Ophelia",
              "lastname": "Walters"
            },
            {
              "firstname": "Castro",
              "lastname": "Martin"
            }
          ]
        }
      },
      {
        "_index": "classmethod",
        "_type": "employees",
        "_id": "26",
        "_score": 1,
        "_source": {
          "employee_id": 26,
          "firstname": "Wilcox",
          "lastname": "Peck",
          "email": "dale.larson@classmethod.jp",
          "salary": 444170,
          "age": 31,
          "gender": "female",
          "phone": "+1 (946) 589-2960",
          "address": "837 Elizabeth Place, Loma, Arizona, 7886",
          "joined_date": "2015-06-13",
          "location": {
            "lat": -16.810873,
            "lon": -46.658798
          },
          "married": false,
          "interests": [
            "Elastic Load Balancing",
            "AWS CodePipeline"
          ],
          "friends": []
        }
      },
      {
        "_index": "classmethod",
        "_type": "employees",
        "_id": "29",
        "_score": 1,
        "_source": {
          "employee_id": 29,
          "firstname": "Diaz",
          "lastname": "Knowles",
          "email": "vega.kirk@classmethod.jp",
          "salary": 565249,
          "age": 34,
          "gender": "male",
          "phone": "+1 (837) 581-3310",
          "address": "819 Wythe Avenue, Turpin, Vermont, 7145",
          "joined_date": "2014-04-10",
          "location": {
            "lat": -69.616783,
            "lon": -49.445282
          },
          "married": false,
          "interests": [
            "Amazon Elastic Compute Cloud (EC2)"
          ],
          "friends": [
            {
              "firstname": "Mayra",
              "lastname": "Snow"
            }
          ]
        }
      },
      {
        "_index": "classmethod",
        "_type": "employees",
        "_id": "40",
        "_score": 1,
        "_source": {
          "employee_id": 40,
          "firstname": "Carroll",
          "lastname": "Booker",
          "email": "gray.benton@classmethod.jp",
          "salary": 813364,
          "age": 29,
          "gender": "male",
          "phone": "+1 (992) 422-2048",
          "address": "308 Schenck Street, Chesterfield, Delaware, 9703",
          "joined_date": "2015-04-16",
          "location": {
            "lat": 60.098237,
            "lon": -108.452153
          },
          "married": true,
          "interests": [
            "Amazon Machine Learning",
            "Amazon Mobile Analytics",
            "AWS IoT",
            "Amazon Machine Learning"
          ],
          "friends": [
            {
              "firstname": "Tessa",
              "lastname": "Moran"
            },
            {
              "firstname": "Cecilia",
              "lastname": "Schroeder"
            }
          ]
        }
      },
      {
        "_index": "classmethod",
        "_type": "employees",
        "_id": "41",
        "_score": 1,
        "_source": {
          "employee_id": 41,
          "firstname": "Lindsey",
          "lastname": "Gomez",
          "email": "summers.joyce@classmethod.jp",
          "salary": 374506,
          "age": 33,
          "gender": "male",
          "phone": "+1 (849) 600-3841",
          "address": "270 Hampton Avenue, Hemlock, Northern Mariana Islands, 4198",
          "joined_date": "2015-10-05",
          "location": {
            "lat": -32.169831,
            "lon": -86.412486
          },
          "married": false,
          "interests": [
            "Amazon API Gateway"
          ],
          "friends": [
            {
              "firstname": "Paulette",
              "lastname": "Saunders"
            }
          ]
        }
      }
    ]
  }
}
```

## 不要な `_source` の内容を除外する

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
