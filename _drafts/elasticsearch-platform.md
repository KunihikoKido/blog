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

ひとつのシステムでも様々な種類のデータを管理し利用することが当たり前になってきたとも言えます。

### データベースの種類によって得意不得意がある
例えば、リレーショナルDBの特徴を見てみましょう。
商品情報を永続化することを考えてみます。

### イベント駆動型のシステム
様々な種類のデータの管理と利用、そのデータや個々のアプリケーション要件にマッチしたテクノロジーの選択を進めることで、現在のシステムは以下の図のようになってきているのではないでしょうか。

![event driven](https://raw.githubusercontent.com/KunihikoKido/docs/master/images/elasticsearch-platform/elasticsearch-platform.001.png)


例えば、リレーショナルDBで管理されている商品情報へのアクセスはそのサーバー固有のプロトコロルを使用してSQLでクエリをリクエストしたり、アクセス情報へのアクセスはサーバーへログインしてログファイルを開いて内容を確認したり、Twitter などのソーシャル情報へは、そのプロバイダーが提供する API 仕様に準拠したアクセス方法でリクエストして必要な情報を取得するなどです。

プロトコルも違えば、リクエストする手続きも、レスポンスされるフォーマットもバラバラです。

## データ利活用におけるシステム要件
データ利活用におけるシステム要件を以下に挙げてみました。

* あらゆる規模に拡張可能（検索トラフィック・データ量）
* リアルタイムにデータを利用可能（検索・分析）
* 高速なクエリ実行
* 高度なクエリ言語
* 様々種類のスキーマに対応可能
* 様々な種類のデータ型に対応可能
* 柔軟なデータモデル（マルチテナンシーなど）

主な要件はこんな感じでしょうか。どんなサイズのデータ量にも拡張できて、様々なユースケースにも対応できるように高速かつ行動なクエリ言語を提供し、さまざなま種類のデータをストアできるシステムということです。

## Elasticsearch 中心のデータ駆動型のシステム
![data driven](https://raw.githubusercontent.com/KunihikoKido/docs/master/images/elasticsearch-platform/elasticsearch-platform.002.png)

## Single Elasticsearch Cluster
![single elasticsearch cluster]( https://raw.githubusercontent.com/KunihikoKido/docs/master/images/elasticsearch-platform/elasticsearch-platform.003.png)


## Multiple Elasticsearch Clusters
![multiple elasticsearch clusters](https://raw.githubusercontent.com/KunihikoKido/docs/master/images/elasticsearch-platform/elasticsearch-platform.004.png)
