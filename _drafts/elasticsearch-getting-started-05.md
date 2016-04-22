# 第５回 Elasticsearch 入門 API の使い方をハンズオンで理解する

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
# 1. ダウンロード
curl -L -O https://download.elastic.co/elasticsearch/release/org/elasticsearch/distribution/tar/elasticsearch/2.3.1/elasticsearch-2.3.1.tar.gz

# 2. 解凍
tar -xvf elasticsearch-2.3.1.tar.gz
```

以上で事前準備は完了です。

## ハンズオン
それでは早速ハンズオンをはじめたいと思います。

### 練習１．起動・停止とステータス確認
Elasticsearch の起動・停止とステータスの確認方法です。
ターミナルを開いてインストールディレクトリに移動して Elasticsearch 起動してみましょう。

Elasticsearch を起動するには以下の手順で実行します。


``` bash
cd elasticsearch-2.3.1/bin
./elasticsearch
```

※ 実行した Elasticsearch フォアグランドで実行します。
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

#### デフォルトでは Node の名前はランダムに設定される
今起動した Elasticsearch は 1 Cluster 内に 1 Node という構成で起動している状態です。

表示されているログの中に、`Riot Grrl` という単語を見つけることができます。これが Node の名前です。

おそらく自身の端末に表示されている Node 名は別の名前が表示されているかもしれませんが問題ありません。Elasticsearch は起動時にランダムの Node 名を設定して起動するというのがデフォルトの動作です。
Cluster のデフォルトの名前は `elasticsearch` です。

#### Cluster や Node に任意の名前をつけることも可能
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

``` bash
curl -XGET 'localhost:9200/'
```

正常に起動していれば、以下のように結果が表示されます。

``` javascript
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
簡単すぎて物足りないかもですね。

### 練習２. Cluster や Node 、Index の状態を確認する
API にアクセスして Elasticsearch の状態を少し詳しく見ていきましょう。

#### Cluster の状態確認
まずは Cluster の状態からです。Cluster は Elasticsearch の分散システムを構成する仕組みの中で一番大きな単位です。Cluster の中に複数の Node を構成し、さらにその中に Shards を構成しています。

Cluster の状態を確認するには、以下の API をコールします。

``` bash
curl 'localhost:9200/_cat/health?v'
```

以下はそのレスポンスです。`_cat` API は人が見て分かりやすいようにテキスト形式で結果表示する管理用の API です。

``` bash
curl 'localhost:9200/_cat/health?v'
epoch      timestamp cluster       status node.total node.data shards pri relo init unassign pending_tasks max_task_wait_time active_shards_percent
1461220257 15:30:57  elasticsearch green           1         1      0   0    0    0        0             0                  -                100.0%
```

status が `green` になっていますが、これが正常な状態です。Node の数は１つです。Index は１つも作成していないため Shards の数は０になっています。

### すべての Index の情報一覧を確認する
次に Index の情報を取得していみましょう。Index 情報一覧を取得するには以下の API をコールします。

``` bash
curl 'localhost:9200/_cat/indices?v'
```

以下はそのレスポンスです。まだ１つも Index を作成していないため何も表示されません。

``` bash
curl 'localhost:9200/_cat/indices?v'
health status index pri rep docs.count docs.deleted store.size pri.store.size
```

### Index を作成する
Index を作成してみましょう。以下の例では、`customer` という名前のインデックスを作成しています。
そして先ほど説明した `/_cat/indices` API を使って Index の情報を取得しています。

```
curl -XPUT 'localhost:9200/customer?pretty'
curl 'localhost:9200/_cat/indices?v'
```

以下はそのレスポンスです。

```
curl -XPUT 'localhost:9200/customer?pretty'
{
  "acknowledged" : true
}

curl 'localhost:9200/_cat/indices?v'
health status index    pri rep docs.count docs.deleted store.size pri.store.size
yellow open   customer   5   1          0            0       130b           130b
```

`customer` という名前の Index が Primary Shards 5、 Replica Shards 1 という設定で作成されているのがわかります。

health が `yellow` になっているのは、Node が１つのため、Replica Shards が作成できないためです。
（同じ Node 内に Primary とついになっている Replica Shards は作成されません。）

### Shards の状態を確認する
Shards の状態をもう少し詳しく調べてみましょう。Shards の状態を確認するには、以下のように API をコールします。


```
curl 'localhost:9200/_cat/shards?v'
```

以下はそのレスポンスです。

```
curl 'localhost:9200/_cat/shards?v'

```


Primary Shards の０〜４が配置され、それのついになっている Replica Shards が UNASSIGNED になっていて配置されていないことがわかります。

### Replica Shards の数を変更する
今回１つの Node で構成していますので、Replica Shards は配置されず、何の意味もありません。以下の API をコールして Replica Shards の数を０にしてみましょう。

``` bash
curl -XPUT 'localhost:9200/customer/_settings' -d '
{
    "index" : {
        "number_of_replicas" : 0
    }
}'

curl 'localhost:9200/_cat/indices?v'
curl 'localhost:9200/_cat/shards?v'

```

以下はそのレスポンスです。

```
curl -XPUT 'localhost:9200/customer/_settings' -d '
{
    "index" : {
        "number_of_replicas" : 0
    }
}'

{
  "acknowledged" : true
}

curl 'localhost:9200/_cat/indices?v'
health status index    pri rep docs.count docs.deleted store.size pri.store.size
green open   customer   5   0          0            0       130b           130b

curl 'localhost:9200/_cat/shards?v'
```

Replica Shards の数が０と表示されていれば成功です。また、先ほどまで yellow だった health が green になっているのが確認できると思います。配置されるべきすべての Shards が正常に配置されているためです。

このように Replica Shards は、Index 作成後も自由にその数を変更することができます。

※ Praimary Shards は、Index 作成後はその数を変更できません。


### 練習３. データの追加・更新・削除
### 練習４. サンプルデータを使って検索や集計
