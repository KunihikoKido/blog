# Elasticsearch データ利活用におけるシステム改善提案
## はじめに

## 現在のシステムの特徴と課題
オープンソースやクラウドの普及、ビッグデータの重要性の認知によって、システムアーキテクチャは４、５年前と比べ大きく変化してきました。例えば、Amazon Web Services が提供するデータを保存して永続化可能なサービスを見てみると以下のように、様々なサービスが提供されています。

* Amazon CloudSearch
* Amazon CloudWatch (Logs)
* Amazon DynamoDB
* Amazon ElastiCache (Memcached)
* Amazon ElastiCache (Redis)
* Amazon Elasticsearch Service
* Amazon RDS for Aurora
* Amazon RDS for MariaDB
* Amazon RDS for MySQL
* Amazon RDS for Oracle
* Amazon RDS for PostgreSQL
* Amazon RDS for SQL Server
* Amazon Redshift
* Amazon S3
* Amazon SimpleDB

また、オープンソースに目を向けてみると、特に NoSQL のジャンルでは様々な特徴を持ったデータベースが存在します。

* キー・バリュー型
  * Hibari
  * Dynamo
  * Memcached
  * Redis
  * Scalaris
* カラム指向型
  * HBase
  * Hypertable
  * Cassandra
* ドキュメント指向型
  * CouchDB
  * MongoDB
* グラフ型
  * Neo4j
  * InfiniteGraph

開発者は、アプリケーションの要件やデータの規模に合わせて最適なデータベースを選択し利用できるようになってきました。

これは逆に言えば、データ利活用におけるすべての要件を満たすシステムは存在しないとも言えます。そのため開発者はシステムを使い分ける必要があるということです。

### データベースの種類によって得意不得意がある
リレーショナル DB の特徴を見てみましょう。
MySQL などのリレーショナル DB は、構造化されたデータをビジネス要件を満たすように矛盾なく永続化するのが得意なデーベースです。その反面アクセスログなどデータ量が多く非構造なデータの管理は苦手です。

Redshift などのカラム型のデータベースは、構造化された大量データの永続化と高速な集計が得意なデータベースてす。その反面クライアントシステムからの同時アクセス数が多い要件は適してません。

DynamoDB などのキー・バリュー型のデータベースは、ユーザーのセッション情報など、シンプルなデータ構造で大量のデータの永続化や高速な参照が得意なデーベースです。その反面複雑なフィルタリングやソードなどは苦手です。

### イベント駆動型システムの課題
そんなこんなで出来上がるのが、以下の図のようなイベント駆動型のシステムです。

![event driven](https://raw.githubusercontent.com/KunihikoKido/docs/master/images/elasticsearch-platform/elasticsearch-platform.001.png)



このシステムは、すでにあるデータを対象に新しいユースケースを実現したい場合でも、要件によってはシステム構成から見直す必要が出てきます。また、利用する手続きや言語の異なるデータベース（データストア）が複数存在するため、開発者の学習コストも多くなります。

## データ利活用におけるシステム要件
データ利活用におけるシステム要件を以下に挙げてみました。

* あらゆる規模に拡張可能（検索トラフィック・データ量／書き込み速度の両方）
* すべてのデータを横断して検索できる
* 高速なクエリ実行
* 高度なクエリ言語
* 様々種類のスキーマに対応可能
* 様々な種類のデータ型に対応可能
* 柔軟なデータモデル（マルチテナンシーなど）

主な要件はこんな感じでしょうか。どんなサイズのデータ量にも拡張できて、様々なユースケースにも対応できるように高速かつ高度なクエリ言語を提供し、さまざなま種類のデータをストアできるシステムということです。

## Elasticsearch 中心のデータ駆動型のシステム
データ利活用におけるシステムに Elasticsearch を適用すると以下のようなシステムになります。（参照系）

![data driven](https://raw.githubusercontent.com/KunihikoKido/docs/master/images/elasticsearch-platform/elasticsearch-platform.002.png)

すべてのデータを Elasticsearch にインデックスすることで、データの検索や集計など参照系のインターフェースを統一することができます。また、必要に応じて複数のデータソースを横断して検索や集計をすることが可能になるのです。

ここで重要なのは、Elasticsearch は他のデータベースを置き換えるものではないということ。

特にオリジナルデータを管理しているデータベースの置き換えは、基本的には避けるべきです。もしオリジナルデータを他で管理していて、検索や分析のためだけに使用しているデータベースは置き換えを検討することができます。


## あらゆる規模に拡張可能な Elasticsearch
Elasticsearch の Index は複数の Shards (Primary/Replica) で管理されていて、その Shards は Node (Server) に配置される仕組みです。そのため、検索トラフィック増大やデータの増大（書き込み速度の低下）の両方に対して、Node を増やすことでシステムを拡張することができます。

### Single Elasticsearch Cluster
以下の図は１台以上の Node で構成される基本的な Cluster 構成です。

![single elasticsearch cluster]( https://raw.githubusercontent.com/KunihikoKido/docs/master/images/elasticsearch-platform/elasticsearch-platform.003.png)


### Multiple Elasticsearch Clusters
以下の図は、複数の Cluster から構成される超大規模な構成です。
インデックスなどの書き込みはそれぞれの Cluster で管理されます。
Tribe Node と言う特別な Node は、検索リクエストをバックエンドの Cluster へ伝播させるプロキシ的な役割を担います。

![multiple elasticsearch clusters](https://raw.githubusercontent.com/KunihikoKido/docs/master/images/elasticsearch-platform/elasticsearch-platform.004.png)


## すべてのデータを横断して検索できる Elasticsearch
Elasticsearch は複数の Index に対して柔軟に横断検索することができます。
以下はそのバリエーション例です。

- `/_search`  
  すべてのインデックス内のすべてのタイプを対象に検索する
- `/blog/_search`  
  blog インデックス内のすべてのタイプを対象に検索する
- `/blog,author/_search`  
  blog と author インデックス内のすべてのタイプを対象に検索する
- `/b*,a*/_search`  
  b から始まるインデックスと、a から始まるインデックス内のすべてのタイプを対象に検索する
- `/blog/posts/_search`  
  blog インデックス内の posts タイプを対象に検索する
- `/blog,author/posts,users/_search`  
  blog と author インデックス内の posts と users タイプを対象に検索する
- `/_all/posts,users/_search`  
  すべてのインデックス内の posts と users タイプを対象に検索する


## 高速なクエリ実行
Elasticsearch は元のデータをそのまま保存するのではなく、高速に検索できるようにトークン単位でインデックスを作ります。１冊の本に例えるなら本の末尾にある索引を作るイメージです。

検索の際はその索引ページからクエリ条件にあったドキュメント探して結果を高速に返します。

## 高度なクエリ言語
Elasticsearch はクエリ言語として JSON ベースの Query DSL を提供しています。
構造化された JSON フォーマットで、論理的に組み立てやすくさまざななクエリを提供しています。

```
{
    "query": {
        "bool": {
            "must": [{
                "match": {
                    "title": "Search"
                }
            }, {
                "match": {
                    "content": "Elasticsearch"
                }
            }],
            "filter": [{
                "term": {
                    "status": "published"
                }
            }, {
                "range": {
                    "publish_date": {
                        "gte": "2015-01-01"
                    }
                }
            }]
        }
    }
}
```

* Query DSL
  * Match All Query
  * Full text queries
    * Match Query
    * Multi Match Query
    * Common Terms Query
    * Query String Query
    * Simple Query String Query  
  * Term level queries
    * Term Query
    * Terms Query
    * Range Query
    * Exists Query
    * Missing Query
    * Prefix Query
    * Wildcard Query
    * Regexp Query
    * Fuzzy Query
    * Type Query
    * Ids Query
  * Compound queries
    * Constant Score Query
    * Bool Query
    * Dis Max Query
    * Function Score Query
    * Boosting Query
    * Indices Query
    * And Query
    * Not Query
    * Or Query
    * Filtered Query
    * Limit Query
  * Joining queries
    * Nested Query
    * Has Child Query
    * Has Parent Query
  * Geo queries
    * GeoShape Query
    * Geo Bounding Box Query
    * Geo Distance Query
    * Geo Distance Range Query
    * Geo Polygon Query
    * Geohash Cell Query
  * Specialized queries
    * More Like This Query
    * Template Query
    * Script Query
  * Span queries
    * Span Term Query
    * Span Multi Term Query
    * Span First Query
    * Span Near Query
    * Span Or Query
    * Span Not Query
    * Span Containing Query
    * Span Within Query

[Query DSL](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html)

[Aggregations](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations.html)


* 様々種類のスキーマに対応可能
* 様々な種類のデータ型に対応可能
* 柔軟なデータモデル（マルチテナンシーなど）
