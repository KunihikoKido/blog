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

* あらゆる規模に拡張可能（検索トラフィック・データ量の両方）
* リアルタイムにデータを利用可能（検索・分析）
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

### Single Elasticsearch Cluster
![single elasticsearch cluster]( https://raw.githubusercontent.com/KunihikoKido/docs/master/images/elasticsearch-platform/elasticsearch-platform.003.png)


### Multiple Elasticsearch Clusters
![multiple elasticsearch clusters](https://raw.githubusercontent.com/KunihikoKido/docs/master/images/elasticsearch-platform/elasticsearch-platform.004.png)
