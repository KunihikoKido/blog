# 第６回 Elasticsearch 入門 API の使い方をハンズオンで理解する 〜前編〜

第１回〜第４回にわたって Elasticsearch の基本的なことを説明してきました。今回は実際に Elasticsearch をさわりながら具体的に API の使い方を説明したいと思います。

## ハンズオンの内容
ハンズオンの内容は、以下の Elasticsearch 公式ドキュメントを参考にしています。
Elasticsearch のインストールから、ステータスの確認、ドキュメントの登録〜検索まで頻繁に使用しそうな API を中心に説明していきます。

* [Getting Started - Elasticsearch - The Definitive Guide](https://www.elastic.co/guide/en/elasticsearch/guide/current/getting-started.html)
* [Getting Started - Elasticsearch Reference](https://www.elastic.co/guide/en/elasticsearch/reference/current/getting-started.html)


## 事前準備
Elasticsearch を動かすには、少なくとも Java 7 のバージョンが必要です。現時点では、Oracle JDK version 1.8.0_73. が推奨されています。使用する PC の Java のバージョンを確認して、もしバージョンが古い場合は、バージョンアップをしてください。各種 OS の Java のインストールドキュメントは [Oracle website](http://docs.oracle.com/javase/8/docs/technotes/guides/install/install_overview.html) を参考にしてください。

``` bash
java -version
echo $JAVA_HOME
```

その他ハンズオンで使用するツールは以下です。

* Terminal アプリケーション
* cURL コマンド

### Elasticsearch のインストール
Elasticsearch のパッケージは、yum などの各種ディストリビューション向けのパッケージも提供していますが、今回は tar.gz 形式のパッケージをダウンロードしてきてインストールしてください。

以下はそのインストール手順です。現在の最新バージョン v2.3.1 を使用します。

``` bash
# 1. Elasticsearch インストール
curl -L -O https://download.elastic.co/elasticsearch/release/org/elasticsearch/distribution/tar/elasticsearch/2.3.1/elasticsearch-2.3.1.tar.gz
tar -xvf elasticsearch-2.3.1.tar.gz

# 2. Kuromoji & ICU プラグインのインストール
cd elasticsearch-2.3.1
./bin/plugin install analysis-kuromoji
./bin/plugin install analysis-icu

# 2. Kibana のインストール
curl -L -O https://download.elastic.co/kibana/kibana/kibana-4.5.0-darwin-x64.tar.gz
tar -xvf kibana-4.5.0-darwin-x64.tar.gz

# 3. Sense プラグインのインストール
cd kibana-4.5.0-darwin-x64
./bin/kibana plugin --install elastic/sense
```

以上で事前準備は完了です。

## 基本コンセプト
ハンズオンを始める前に、Elasticsearch の基本コンセプトを簡単に説明します。
Elasticsearch は、検索のボリュームとデータ量の両方に対してスケーラブルな検索および分析エンジンです。
リソースが足りなければ、サーバを追加してい構成するだけで様々なサイズの要件に対応できます。
そのため、すこし用語が多いので Elasticsearch を構成する主要要素について理解しましょう。

### Cluster
Cluster は１つまたは複数の Node (Server) から構成されます。
すべてのデータはこの Cluster 配下で管理され、Cluster に所属するすべての Node を横断して検索することを可能にします。各 Node は一意な Cluster 名を識別し、その Cluster に参加します。
デフォルトの Cluster 名は、`elasticsearch` です。

### Node
Node は１つのサーバです。Cluster の一部として構成されます。
データをストアし、Cluster に参加してデータのインデックスや検索を提供します。

### Index & Type & Document
Index はデータを管理するための論理的な仕組みです。
Elasticsearch の Index を説明するために、リレーショナル DB と比較してみます。

```
Relational DB  ⇒ Databases ⇒ Tables ⇒ Rows      ⇒ Columns
Elasticsearch  ⇒ Indices   ⇒ Types  ⇒ Documents ⇒ Fields
```

１つの Elasticsearch Cluster は複数の Indices （Databases） を定義することができ、それぞれに複数の Types （Tables） を構成することができます。Types それぞれに複数の Documents （Rows） を保存でき、Document 毎に複数の Fields （Columns） を持っています。

### Shards & Replicas
Shards は、Index を物理的に管理し、Node に配置されます。書き込み可能な Primary Shards と 読み取り専用の Replica Shards から構成されます。デフォルトでは、１つの Index は５つの Primary Shards と、それと対になる Replica Shards が１つづつ作成されるように設定されています。サーバはこの Shards 数分スケールアウトすることが可能です。

何となくわかりましたでしょうか？

もう少し付け加えると、複数の Cluster を使用する Multi Cluster という構成も可能です。

## ハンズオン
それでは早速ハンズオンをはじめたいと思います。

* 練習１. 起動・停止とステータス確認
* 練習２. Cluster や Node 、Index の状態を確認する
* 練習３. ドキュメントの操作
* 練習４. バッチプロセッシング
* 練習５. サンプルデータを使って検索や集計

### 練習１．起動・停止とステータス確認
Elasticsearch の起動・停止とステータスの確認方法です。
ターミナルを開いてインストールディレクトリに移動して Elasticsearch 起動してみましょう。

Elasticsearch を起動するには以下の手順で実行します。


``` bash
cd elasticsearch-2.3.1/bin
./elasticsearch
```

※ 実行した Elasticsearch はフォアグランドで実行されます。
停止する場合は `Ctrl+C` で停止します。-d オプションをつけて実行することでバックグラウンドで起動することもできます。

起動すると以下のようなログがターミナルに表示されます。

``` bash
./elasticsearch
[2016-04-20 12:33:16,186][INFO ][node                     ] [Riot Grrl] version[2.3.1], pid[2884], build[bd98092/2016-04-04T12:25:05Z]
[2016-04-20 12:33:16,186][INFO ][node                     ] [Riot Grrl] initializing ...
[2016-04-20 12:33:16,622][INFO ][plugins                  ] [Riot Grrl] modules [reindex, lang-expression, lang-groovy], plugins [], sites []
[2016-04-20 12:33:16,638][INFO ][env                      ] [Riot Grrl] using [1] data paths, mounts [[/ (/dev/disk1)]], net usable_space [177gb], net total_space [232.6gb], spins? [unknown], types [hfs]
[2016-04-20 12:33:16,640][INFO ][env                      ] [Riot Grrl] heap size [990.7mb], compressed ordinary object pointers [true]
[2016-04-20 12:33:16,640][WARN ][env                      ] [Riot Grrl] max file descriptors [10240] for elasticsearch process likely too low, consider increasing to at least [65536]
[2016-04-20 12:33:18,185][INFO ][node                     ] [Riot Grrl] initialized
[2016-04-20 12:33:18,186][INFO ][node                     ] [Riot Grrl] starting ...
[2016-04-20 12:33:18,262][INFO ][transport                ] [Riot Grrl] publish_address {127.0.0.1:9300}, bound_addresses {[fe80::1]:9300}, {[::1]:9300}, {127.0.0.1:9300}
[2016-04-20 12:33:18,266][INFO ][discovery                ] [Riot Grrl] elasticsearch/QRNNB3hFTyWWqYdcCaV1RA
[2016-04-20 12:33:21,304][INFO ][cluster.service          ] [Riot Grrl] new_master {Riot Grrl}{QRNNB3hFTyWWqYdcCaV1RA}{127.0.0.1}{127.0.0.1:9300}, reason: zen-disco-join(elected_as_master, [0] joins received)
[2016-04-20 12:33:21,315][INFO ][http                     ] [Riot Grrl] publish_address {127.0.0.1:9200}, bound_addresses {[fe80::1]:9200}, {[::1]:9200}, {127.0.0.1:9200}
[2016-04-20 12:33:21,315][INFO ][node                     ] [Riot Grrl] started
[2016-04-20 12:33:21,330][INFO ][gateway                  ] [Riot Grrl] recovered [0] indices into cluster_state
```

起動できましたか？

#### Node の名前はランダムに設定される
今起動した Elasticsearch は 1 Cluster 内に 1 Node という構成で起動している状態です。

表示されているログの中に、`Riot Grrl` という単語を見つけることができます。これが Node の名前です。

おそらく自身の端末に表示されている Node 名は別の名前が表示されているかもしれませんが問題ありません。Elasticsearch は起動時にランダムの Node 名を設定して起動するというのがデフォルトの動作です。
Cluster のデフォルトの名前は `elasticsearch` です。

#### Cluster や Node に任意の名前をつける
起動時に任意の Cluster 名や Node 名を指定することも可能です。（または config/elasticsearch.yml の設定ファイルを変更）

``` bash
./elasticsearch --cluster.name classmethod --node.name node1
```

本番環境では、Node 名に稼働しているサーバのホスト名など、それぞれの Node で識別しやすい名前をつけましょう。

#### デフォルトポートは 9200
Elasticsearch は各種操作のための REST API を提供しています。
その REST API を受け付けるポートとして、`9200` にバインドされます。
このポート番号は必要であれば変更することも可能です。

以下のコマンドでアクセスしてみましょう。

```
GET /
```

[VIEW IN SENSE](http://localhost:5601/app/sense/?load_from=https://raw.githubusercontent.com/KunihikoKido/docs/master/snippets/elasticsearch-getting-started-05/01.json)


正常に起動していれば、以下のように結果が表示されます。

``` bash
# GET /
{
  "name" : "Riot Grrl",
  "cluster_name" : "elasticsearch",
  "version" : {
    "number" : "2.3.1",
    "build_hash" : "bd980929010aef404e7cb0843e61d0665269fc39",
    "build_timestamp" : "2016-04-04T12:25:05Z",
    "build_snapshot" : false,
    "lucene_version" : "5.5.0"
  },
  "tagline" : "You Know, for Search"
}
```

これで Elasticsearch を使用する準備が整いました。

### 練習２. Cluster や Node 、Index の状態を確認する
API にアクセスして Elasticsearch の状態を少し詳しく見ていきましょう。

#### Cluster の状態確認
まずは Cluster の状態からです。Cluster は Elasticsearch の分散システムを構成する仕組みの中で一番大きな単位です。Cluster の中に複数の Node を構成し、さらにその中に Shards を構成しています。

Cluster の状態を確認するには、以下の API をコールします。

```
GET /_cat/health?v
```

以下はそのレスポンスです。`_cat` API は人が見て分かりやすいようにテキスト形式で結果表示する管理用の API です。

``` bash
# GET /_cat/health?v
epoch      timestamp cluster       status node.total node.data shards pri relo init unassign pending_tasks max_task_wait_time active_shards_percent
1461220257 15:30:57  elasticsearch green           1         1      0   0    0    0        0             0                  -                100.0%
```

status が `green` になっていますが、これが正常な状態です。Node の数は１つです。Index は１つも作成していないため Shards の数は０になっています。

#### すべての Index の情報一覧を確認する
次に Index の情報を取得していみましょう。Index 情報一覧を取得するには以下の API をコールします。

```
GET /_cat/indices?v
```

以下はそのレスポンスです。まだ１つも Index を作成していないため何も表示されません。

``` bash
health status index pri rep docs.count docs.deleted store.size pri.store.size
```

#### Index を作成する
Index を作成してみましょう。以下の例では、`customer` という名前のインデックスを作成しています。
そして先ほど説明した `/_cat/indices` API を使って Index の情報を取得しています。

``` bash
PUT /customer
GET /_cat/indices?v
```

以下はそのレスポンスです。

``` bash
# PUT /customer
{
  "acknowledged" : true
}

# GET /_cat/indices?v
health status index    pri rep docs.count docs.deleted store.size pri.store.size
yellow open   customer   5   1          0            0       130b           130b
```

`customer` という名前の Index が Primary Shards 5、 Replica Shards 1 という設定で作成されているのがわかります。

health が `yellow` になっているのは、Node が１つのため、Replica Shards が作成できないためです。
（同じ Node 内に Primary とついになっている Replica Shards は作成されません。）

#### Shards の状態を確認する
Shards の状態をもう少し詳しく調べてみましょう。Shards の状態を確認するには、以下のように API をコールします。


```
GET /_cat/shards?v
```

以下はそのレスポンスです。

``` bash
# GET /_cat/shards?v
index    shard prirep state      docs store ip        node   
customer 3     p      STARTED       0  159b 127.0.0.1 Riot Grrl
customer 3     r      UNASSIGNED                             
customer 2     p      STARTED       0  159b 127.0.0.1 Riot Grrl
customer 2     r      UNASSIGNED                             
customer 1     p      STARTED       0  159b 127.0.0.1 Riot Grrl
customer 1     r      UNASSIGNED                             
customer 4     p      STARTED       0  159b 127.0.0.1 Riot Grrl
customer 4     r      UNASSIGNED                             
customer 0     p      STARTED       0  159b 127.0.0.1 Riot Grrl
customer 0     r      UNASSIGNED                             
```


Primary Shards の０〜４が配置され、それのついになっている Replica Shards が `UNASSIGNED` になっていて配置されていないことがわかります。

#### Replica Shards の数を変更する
今回１つの Node で構成していますので、Replica Shards は配置されず、何の意味もありません。以下の API をコールして Replica Shards の数を０にしてみましょう。

```
PUT /customer/_settings
{
    "index" : {
        "number_of_replicas": 0
    }
}

GET /_cat/indices?v
GET /_cat/shards?v
```

以下はそのレスポンスです。

``` bash
# PUT /customer/_settings
{
  "acknowledged": true
}

# GET /_cat/indices?v
health status index       pri rep docs.count docs.deleted store.size pri.store.size
green  open   customer      5   0          0            0       795b           795b


# GET /_cat/shards?v
index       shard prirep state      docs   store ip        node      
customer    1     p      STARTED       0    159b 127.0.0.1 Riot Grrl
customer    3     p      STARTED       0    159b 127.0.0.1 Riot Grrl
customer    4     p      STARTED       0    159b 127.0.0.1 Riot Grrl
customer    2     p      STARTED       0    159b 127.0.0.1 Riot Grrl
customer    0     p      STARTED       0    159b 127.0.0.1 Riot Grrl
```

Replica Shards の数が０と表示されていれば成功です。また、先ほどまで yellow だった health が green になっているのが確認できると思います。配置されるべきすべての Shards が正常に配置されているためです。

このように Replica Shards は、Index 作成後も自由にその数を変更することができます。

※ Primary Shards は、Index 作成後はその数を変更できません。

### 練習３. ドキュメント管理
ドキュメントの追加・更新・削除など操作方法について説明します。

#### ドキュメントのインデックス
以下の例では `customer` Index 内の `external` Type に Id が `1` のデータを登録する例です。
登録する内容は JSON フォーマットで構造化したデータを指定します。

```
PUT /customer/external/1
{
  "name": "John Doe"
}
```

レスポンスは以下のようになります。created が `true` となっているのは、新規で作成されたことを意味します。

```
{
  "_index" : "customer",
  "_type" : "external",
  "_id" : "1",
  "_version" : 1,
  "_shards" : {
    "total" : 2,
    "successful" : 1,
    "failed" : 0
  },
  "created" : true
}
```

#### ドキュメントの取得
インデックスしたドキュメントを取得してみましょう。

```
GET /customer/external/1
```

レスポンスは以下のようになります。found が `true` となっているので指定したドキュメントが見つかったことを意味しています。
また、インデックスした元の JSON データは、`_source` フィールドに含まれます。

```
{
  "_index" : "customer",
  "_type" : "external",
  "_id" : "1",
  "_version" : 1,
  "found" : true,
  "_source" : {
    "name" : "John Doe"
  }
}
```

#### ドキュメントのインデックスと置き換え
以下のリクエストは先ほどと全く同じドキュメントをインデックスするためのリクエストです。
もう一度実行してみましょう。

```
PUT /customer/external/1
{
  "name": "John Doe"
}
```

すでに存在するデータに対して、`PUT` メソッドを使用してドキュメントを更新すると、後から更新したドキュメントに置き換えられます。
そのため、更新したい部分的な情報ではなく、置き換える対象ドキュメント全体の情報が必要です。


以下のように id `2` はまだインデックスされていないため新規追加になります。

```
PUT /customer/external/2
{
  "name": "John Doe"
}
```

`id` を指定せずに `POST` メソッドを使用してドキュメントをインデックスした場合には、
id が自動で割り振られるため常に新しいドキュメントとして追加されます。

```
POST /customer/external
{
  "name": "John Doe"
}
```

#### ドキュメントの更新
ドキュメントの部分更新をする場合は、以下のように `_update` エンドポイントを使用して、API をコールします。
置き換えと異なるのは、更新したいフィールドの内容のみ指定すれば良い点です。

```
POST /customer/external/1/_update
{
  "doc": {"name": "Jane Doe"}
}
```

また、以下の例では `name` フィールドの更新と `age` フィールドの追加をしています。

```
POST /customer/external/1/_update
{
  "doc": {"name": "Jane Doe", "age": 20}
}
```

さらに `script` を使用すると、更新対象データの元の値を使用して計算した結果で更新することが可能です。

```
POST /customer/external/1/_update
{
  "script" : "ctx._source.age += 5"
}
```

#### ドキュメントの削除

```
DELETE /customer/external/2
```


#### Index の削除

```
DELETE /customer
GET /_cat/indices?v
```


```
# DELETE /customer
{
  "acknowledged" : true
}

# GET /_cat/indices?v
health status index pri rep docs.count docs.deleted store.size pri.store.size

```

### 練習４. バッチプロセッシング


```
POST /customer/external/_bulk
{"index":{"_id":"1"}}
{"name": "John Doe" }
{"index":{"_id":"2"}}
{"name": "Jane Doe" }
```


```
POST /customer/external/_bulk
{"update":{"_id":"1"}}
{"doc": {"name": "John Doe becomes Jane Doe"}}
{"delete":{"_id":"2"}}
```
