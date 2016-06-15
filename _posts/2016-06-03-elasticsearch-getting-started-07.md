# 第７回 Elasticsearch 入門 API の使い方をハンズオンで理解する 〜前編〜

第１回〜第５回にわたって Elasticsearch の基本的なことを説明してきました。
今回、「 API の使い方をハンズオンで理解する 〜前編〜」では、Elasticsearch の起動・停止〜ドキュメントの管理（追加・登録・削除）を中心に説明します。

## ハンズオンの内容
ハンズオンの内容は、以下の Elasticsearch 公式ドキュメントを参考にしています。

* [Getting Started - Elasticsearch - The Definitive Guide](https://www.elastic.co/guide/en/elasticsearch/guide/current/getting-started.html)
* [Getting Started - Elasticsearch Reference](https://www.elastic.co/guide/en/elasticsearch/reference/current/getting-started.html)


## 事前準備
Elasticsearch を動かすには、少なくとも Java 7 のバージョンが必要です。現時点では、Oracle JDK version 1.8.0_73. が推奨されています。使用する PC の Java のバージョンを確認して、もしバージョンが古い場合は、バージョンアップをしてください。各種 OS の Java のインストールドキュメントは [Oracle website](http://docs.oracle.com/javase/8/docs/technotes/guides/install/install_overview.html) を参考にしてください。

``` bash
java -version
echo $JAVA_HOME
```

### Elasticsearch のインストール
Elasticsearch のパッケージは、yum などの各種ディストリビューション向けのパッケージも提供していますが、今回は tar.gz 形式のパッケージをダウンロードしてきてインストールしてください。

以下はそのインストール手順です。現在の最新バージョン v2.3.3 を使用します。

**Elasticsearch のインストール**

``` bash
# 1. Elasticsearch インストール
curl -L -O https://download.elastic.co/elasticsearch/release/org/elasticsearch/distribution/tar/elasticsearch/2.3.3/elasticsearch-2.3.3.tar.gz
tar -xvf elasticsearch-2.3.3.tar.gz

# 2. Kuromoji & ICU プラグインのインストール と Script の有効化
cd elasticsearch-2.3.3
./bin/plugin install analysis-kuromoji
./bin/plugin install analysis-icu
echo "script.inline: true" >> config/elasticsearch.yml
```

**Sense (Kibana) のインストール**

``` bash
# 1. Kibana のインストール
curl -L -O https://download.elastic.co/kibana/kibana/kibana-4.5.1-darwin-x64.tar.gz
tar -xvf kibana-4.5.1-darwin-x64.tar.gz

# 2. Sense プラグインのインストール
cd kibana-4.5.1-darwin-x64
./bin/kibana plugin --install elastic/sense
```

以上で事前準備は完了です。

## 基本コンセプト
ハンズオンを始める前に、Elasticsearch の基本コンセプトを理解しておきましょう。

* [第６回 Elasticsearch 入門 基本コンセプトを理解する](http://dev.classmethod.jp/server-side/elasticsearch-getting-started-07/)

## ハンズオン
それでは早速ハンズオンをはじめたいと思います。

* 練習１. 起動・停止とステータス確認
* 練習２. Cluster や Node 、Index の状態を確認する
* 練習３. ドキュメントの操作
* 練習４. バッチプロセッシング

### 練習１．起動・停止とステータス確認
Elasticsearch の起動・停止とステータスの確認方法です。
ターミナルを開いてインストールディレクトリに移動して Elasticsearch 起動してみましょう。

Elasticsearch を起動するには以下の手順で実行します。


``` bash
cd elasticsearch-2.3.3/bin
./elasticsearch
```

※ 実行した Elasticsearch はフォアグランドで実行されます。
停止する場合は `Ctrl+C` で停止します。-d オプションをつけて実行することでバックグラウンドで起動することもできます。

起動すると以下のようなログがターミナルに表示されます。

``` bash
./elasticsearch
[2016-04-20 12:33:16,186][INFO ][node                     ] [Riot Grrl] version[2.3.3], pid[2884], build[bd98092/2016-04-04T12:25:05Z]
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
ハンズオンでは、Rest API の実行に、`Sense` を使用しますので、Kibana も起動してきましょう。

``` bash
cd kibana-4.5.1-darwin-x64/bin
./kibana
```


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

[VIEW IN SENSE](http://localhost:5601/app/sense/?load_from=https://raw.githubusercontent.com/KunihikoKido/docs/master/snippets/elasticsearch-getting-started-07/01.json)


正常に起動していれば、以下のように結果が表示されます。

``` bash
# GET /
{
  "name" : "Riot Grrl",
  "cluster_name" : "elasticsearch",
  "version" : {
    "number" : "2.3.3",
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

[VIEW IN SENSE](http://localhost:5601/app/sense/?load_from=https://raw.githubusercontent.com/KunihikoKido/docs/master/snippets/elasticsearch-getting-started-07/02.json)


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

[VIEW IN SENSE](http://localhost:5601/app/sense/?load_from=https://raw.githubusercontent.com/KunihikoKido/docs/master/snippets/elasticsearch-getting-started-07/03.json)

以下はそのレスポンスです。まだ１つも Index を作成していないため何も表示されません。

``` bash
health status index pri rep docs.count docs.deleted store.size pri.store.size
```

#### Index を作成する
Index を作成してみましょう。以下の例では、`customer` という名前のインデックスを作成しています。
そして先ほど説明した `/_cat/indices` API を使って Index の情報を取得しています。

```
PUT /customer
GET /_cat/indices?v&index=customer
```

[VIEW IN SENSE](http://localhost:5601/app/sense/?load_from=https://raw.githubusercontent.com/KunihikoKido/docs/master/snippets/elasticsearch-getting-started-07/04.json)


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
GET /_cat/shards?v&index=customer
```

[VIEW IN SENSE](http://localhost:5601/app/sense/?load_from=https://raw.githubusercontent.com/KunihikoKido/docs/master/snippets/elasticsearch-getting-started-07/05.json)


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

GET /_cat/indices?v&index=customer
GET /_cat/shards?v&index=customer
```

[VIEW IN SENSE](http://localhost:5601/app/sense/?load_from=https://raw.githubusercontent.com/KunihikoKido/docs/master/snippets/elasticsearch-getting-started-07/06.json)


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

[VIEW IN SENSE](http://localhost:5601/app/sense/?load_from=https://raw.githubusercontent.com/KunihikoKido/docs/master/snippets/elasticsearch-getting-started-07/07.json)


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

[VIEW IN SENSE](http://localhost:5601/app/sense/?load_from=https://raw.githubusercontent.com/KunihikoKido/docs/master/snippets/elasticsearch-getting-started-07/08.json)


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
GET /customer/external/1

PUT /customer/external/1
{
  "name": "John Doe"
}

GET /customer/external/1
```

[VIEW IN SENSE](http://localhost:5601/app/sense/?load_from=https://raw.githubusercontent.com/KunihikoKido/docs/master/snippets/elasticsearch-getting-started-07/07.json)

すでに存在するデータに対して、`PUT` メソッドを使用してドキュメントを更新すると、後から更新したドキュメントに置き換えられます。
そのため、更新したい部分的な情報ではなく、置き換える対象ドキュメント全体の情報が必要です。

#### id を自動的に生成してインデックスする

`id` を指定せずに `POST` メソッドを使用してドキュメントをインデックスした場合には、
id が自動で割り振られるため常に新しいドキュメントとして追加されます。

```
POST /customer/external
{
  "name": "John Doe"
}
```

[VIEW IN SENSE](http://localhost:5601/app/sense/?load_from=https://raw.githubusercontent.com/KunihikoKido/docs/master/snippets/elasticsearch-getting-started-07/09.json)

以下はレスポンスの内容です。`AVUU85TvkezALHBDHIAe` と言う id が自動的に割り振られたことが確認できます。

```
{
  "_index": "customer",
  "_type": "external",
  "_id": "AVUU85TvkezALHBDHIAe",
  "_version": 1,
  "_shards": {
    "total": 1,
    "successful": 1,
    "failed": 0
  },
  "created": true
}
```

#### ドキュメントの更新
ドキュメントの部分更新をする場合は、以下のように `_update` エンドポイントを使用して、API をコールします。
置き換えと異なるのは、更新したいフィールドの内容のみ指定すれば良い点です。

```
GET /customer/external/1

POST /customer/external/1/_update
{
  "doc": {"name": "Jane Doe"}
}

GET /customer/external/1
```

[VIEW IN SENSE](http://localhost:5601/app/sense/?load_from=https://raw.githubusercontent.com/KunihikoKido/docs/master/snippets/elasticsearch-getting-started-07/10.json)

また、以下の例では `name` フィールドの更新と `age` フィールドの追加をしています。

```
GET /customer/external/1

POST /customer/external/1/_update
{
  "doc": {"name": "Jane Doe", "age": 20}
}

GET /customer/external/1
```

[VIEW IN SENSE](http://localhost:5601/app/sense/?load_from=https://raw.githubusercontent.com/KunihikoKido/docs/master/snippets/elasticsearch-getting-started-07/11.json)

##### Script を使ったドキュメントの更新
さらに `script` を使用すると、更新対象データの元の値を使用して計算した結果で更新することが可能です。

```
GET /customer/external/1

POST /customer/external/1/_update
{
  "script" : "ctx._source.age += 5"
}

GET /customer/external/1
```

[VIEW IN SENSE](http://localhost:5601/app/sense/?load_from=https://raw.githubusercontent.com/KunihikoKido/docs/master/snippets/elasticsearch-getting-started-07/12.json)

#### ドキュメントの削除
ドキュメントを削除するには、DELETE メソッドを使用します。

```
GET /customer/external/2

DELETE /customer/external/2

GET /customer/external/2
```

[VIEW IN SENSE](http://localhost:5601/app/sense/?load_from=https://raw.githubusercontent.com/KunihikoKido/docs/master/snippets/elasticsearch-getting-started-07/13.json)


#### Index の Close と Open
まだ、Index は削除しないけど、Index を利用できないようにしたい場合は、Close Index API を使用します。

```
POST /customer/_close
```

[VIEW IN SENSE](http://localhost:5601/app/sense/?load_from=https://raw.githubusercontent.com/KunihikoKido/docs/master/snippets/elasticsearch-getting-started-07/14.json)

Close されている Index は、Open Index API を使って再度検索可能な状態にできます。

```
POST /customer/_open
```

[VIEW IN SENSE](http://localhost:5601/app/sense/?load_from=https://raw.githubusercontent.com/KunihikoKido/docs/master/snippets/elasticsearch-getting-started-07/15.json)

また、Index の Close & Open は、Analyzer でファイルベースで管理している辞書の更新を反映させる場合にも使用されるオペレーションです。


#### Index の削除
Index 全体を削除するには、以下のように API をコールします。

```
GET /_cat/indices?v

DELETE /customer

GET /_cat/indices?v
```

[VIEW IN SENSE](http://localhost:5601/app/sense/?load_from=https://raw.githubusercontent.com/KunihikoKido/docs/master/snippets/elasticsearch-getting-started-07/16.json)


以下はそのレスポンスです。

```
# GET /_cat/indices?v
health status index    pri rep docs.count docs.deleted store.size pri.store.size
yellow open   customer   5   1          0            0       130b           130b


# DELETE /customer
{
  "acknowledged": true
}

# GET /_cat/indices?v
health status index   pri rep docs.count docs.deleted store.size pri.store.size
```

### 練習４. バッチプロセッシング
ドキュメントの追加・更新・削除のオペレーションは、Bulk API を使用して、まとめて実行することも可能です。
他の API と異なり、body にリクエストする内容は Json 形式ではなく、Jsonlines 形式になっていることに注意してください。

以下の例は、2件のドキュメントを Bulk API を使用して、インデックスしています。

```
POST /customer/external/_bulk
{"index":{"_id":"1"}}
{"name": "John Doe" }
{"index":{"_id":"2"}}
{"name": "Jane Doe" }
```

[VIEW IN SENSE](http://localhost:5601/app/sense/?load_from=https://raw.githubusercontent.com/KunihikoKido/docs/master/snippets/elasticsearch-getting-started-07/17.json)

また、アクションの異なる内容を混在してリクエストすることも可能です。
以下の例は、先ほどインデックスした1件目の `name` フィールドの内容を更新し、2件目にインデックスしたドキュメントを削除しています。

```
POST /customer/external/_bulk
{"update":{"_id":"1"}}
{"doc": {"name": "John Doe becomes Jane Doe"}}
{"delete":{"_id":"2"}}
```

[VIEW IN SENSE](http://localhost:5601/app/sense/?load_from=https://raw.githubusercontent.com/KunihikoKido/docs/master/snippets/elasticsearch-getting-started-07/18.json)


## さいごに
いかがでしたでしょうか？
今回、「 API の使い方をハンズオンで理解する 〜前編〜」では、Elasticsearch の起動・停止〜ドキュメントの管理（追加・登録・削除）を中心に説明しました。

次回、「 API の使い方をハンズオンで理解する 〜後編〜」では、サンプルデータを用意して、検索・集計について説明する予定です。
