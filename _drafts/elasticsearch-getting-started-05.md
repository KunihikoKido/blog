# 第５回 Elasticsearch 入門 各種 API の使い方をハンズオンで理解する

第１回〜第４回にわたって Elasticsearch の基本的なことを説明してきました。今回は実際に Elasticsearch をさわりながら具体的に API の使い方を説明したいと思います。

## ハンズオンの内容
今回のハンズオンは、以下の Elasticsearch 公式ドキュメントを参考にしています。
Elasticsearch のインストールから、ステータスの確認、ドキュメントの登録〜検索まで頻繁に使用しそうな API を中心に節目する予定です。

* [Getting Started - Elasticsearch - The Definitive Guide](https://www.elastic.co/guide/en/elasticsearch/guide/current/getting-started.html)
* [Getting Started - Elasticsearch Reference](https://www.elastic.co/guide/en/elasticsearch/reference/current/getting-started.html)


## 事前準備
Elasticsearch を動かすには、少なくとも Java 7 のバージョンが必要です。現時点では、Oracle JDK version 1.8.0_73. が推奨されています。使用する PC の Java のバージョンを確認して、もしバージョンが古い場合は、バージョンアップをしてください。各種 OS の インストールドキュメントは [Oracle website](http://docs.oracle.com/javase/8/docs/technotes/guides/install/install_overview.html) を参考にしてください。

``` bash
java -version
echo $JAVA_HOME
```

その他ハンズオンで使用するツールは以下です。

* Terminal アプリケーション
* cURL コマンド

### インストール

``` bash
# 1. ダウンロード
curl -L -O https://download.elastic.co/elasticsearch/release/org/elasticsearch/distribution/tar/elasticsearch/2.3.1/elasticsearch-2.3.1.tar.gz

# 2. 解凍
tar -xvf elasticsearch-2.3.1.tar.gz
```

## ハンズオン
### 練習１．起動と停止とステータス確認
それでは早速、ターミナルを開いて Elasticsearch のインストールディレクトリに移動して起動してみましょう。

``` bash
cd elasticsearch-2.3.1/bin
./elasticsearch
```



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

現在は 1 Cluster 内に 1 Node という構成で起動している状態です。
このログの中に、`Riot Grrl` という単語が表示されています。これが Node の名前です。
多分自分の端末に表示されている Node 名は別の名前が表示されているかもしれませんが問題ありません。Elasticsearch は起動時にランダムの Node 名を設定して起動するというのがデフォルトの動作です。
Cluster のデフォルトの名前は `elasticsearch` です。


起動時に任意の Cluster 名や Node 名を指定することも可能です。（または config/elasticsearch.yml の設定ファイルを変更）

``` bash
./elasticsearch --cluster.name classmethod --node.name node1
```

### 練習２. Cluster や Node 、Index の状態を確認する
### 練習３. データの追加・更新・削除
### 練習４. サンプルデータを使って検索や集計
