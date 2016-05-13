# 第７回 Elasticsearch 入門 API の使い方をハンズオンで理解する 〜後編〜

### 練習５. サンプルデータを使って検索や集計


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

[www.json-generator.com/](http://www.json-generator.com/)


[employees.zip](https://github.com/KunihikoKido/docs/blob/master/data/employees.zip?raw=true)


```
PUT /_template/classmethod
{
  "template": "classmethod*",
  "order": 0,
  "settings": {
    "number_of_replicas": 0
  },
  "mappings": {
    "employees": {
      "dynamic_templates": [
        {
          "string_template": {
            "match": "*",
            "match_mapping_type": "string",
            "mapping": {
              "type": "string",
              "fields": {
                "raw": {
                  "type": "string",
                  "index": "not_analyzed"
                }
              }
            }
          }
        }
      ],
      "properties": {
        "location": {
          "type": "geo_point"
        },
        "friends": {
          "type": "nested"
        }
      }
    }
  }
}
```



```
curl -XPOST 'localhost:9200/classmethod/employees/_bulk?pretty' --data-binary "@employees.jsonl"
```


```
GET /_cat/indices?v
health status index       pri rep docs.count docs.deleted store.size pri.store.size
yellow open   classmethod   5   1       2000            0       130b           130b
```


```
curl -XDELETE 'localhost:9200/classmethod'
```

```
curl -XPUT 'localhost:9200/_template/classmethod' -d @index-template.json
```

```
curl -XDELETE 'localhost:9200/_template/classmethod'
```
