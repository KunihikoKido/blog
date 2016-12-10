# Elasticsearch CLI
久しぶりのブログエントリ…。今回は Elasticsearch の API をコマンドラインで、パチパチ操作するためのいわゆる CLI を作ったのでその紹介です。

開発で Elasticsearch を使っていると、開発環境、ステージング環境、本番環境、などなど色々な環境が存在しますよね。Amazon ES の v4 認証や、Shield （Elastic）の認証も越える必要もあります。そもそも API が多いので覚えられません。よく使うオペレーションは簡単に実行したい。と色々悩みが多いです。

これらの悩みを解決するため、今回作成した ES CLI は以下の特徴を持っています。

* 複数環境を切り替えられる
* v4 認証や、Shield の認証に対応
* help でコマンド一覧表示
* ターミナルで指定しやすいパラメータ指定
* インストールが簡単
* 柔軟にカスタマイズできる


それがこれ

[elasticsearch-fabric](https://github.com/KunihikoKido/elasticsearch-fabric)


感の良い人はわかってしまったかもしれませんが、python の fabric のタスクとして提供してます。（elasticsearch-py + fabric で省エネ開発w）

## どんなことができるの？
インストールやセットアップ方法は [elasticsearch-fabric](https://github.com/KunihikoKido/elasticsearch-fabric) を参照してください。ここでは、curl との比較を交えてコマンドの使い方をを紹介します。

### Cluster Health

**curl command:**

```
$ curl -XGET 'http://127.0.0.1:9200/_cat/health?v=1' -d '{}'
```

VS

**es cli:**

```
$ fab es.cat.health:v=1
```


### List All Indecies

**curl command:**

```
$ curl -XGET 'http://127.0.0.1:9200/_cat/indecies?v=1' -d '{}'
```

VS

**es cli:**

```
$ fab es.cat.indecies:v=1
```

### Create an Index

**curl command:**

```
$ curl -XPUT 'http://127.0.0.1:9200/blog' -d '{}'
$ curl -XGET 'http://127.0.0.1:9200/_cat/indecies?v=1' -d '{}'

```

VS

**es cli:**

```
$ fab es.create:blog
$ fab es.cat.indecies:v=1
```

### Index and Query a Document

**curl command:**

```
$ curl -XPUT 'http://127.0.0.1:9200/blog/posts/1' -d '{
  "title": "Hello Elasticsearch!"
}'
$ curl -XGET 'http://127.0.0.1:9200/blog/posts/1' -d '{}'

```

VS

**es cli:**

```
$ cat post.json | fab es.index:blog,posts,1
$ fab es.get:1

```

### Batch Processing

**curl command:**

```
$ curl -XPOST 'http://127.0.0.1:9200/blog/posts/_bulk' -d '
{"index":{"_id":"1"}}
{"title": "Hello Elasticsearch!" }
{"index":{"_id":"2"}}
{"title": "Hello fabric!" }
'
```

VS

**es cli:**

```
$ cat posts.jsol | fab es.bulk:blod,posts
```

### Simple Search

**curl command:**

```
$ curl -XGET 'http://127.0.0.1/blog/_sesrch?q=hello
```

VS

**es cli:**

```
$ fab es.search:hello
```

### Request body Search

**curl command:**

```
$ curl -XGET 'http://127.0.0.1:9200/blog/_search' -d '{
  "query": {
    "match": {"title": "hello"}
  }
}'
```

VS

**es cli:**

```
$ cat query.json | fab es.search:blog
```

## まとめ
いかがでしたでしょうか？
これで、あなたも Elasticsearch API マスター！？

他にも色々できますが、それはまたの機会に紹介したいと思います。

改善・要望は是非プルリクお願いします！（README 英語がメチャメチャなで誰か改善してほしい＆もう少し詳しいマニュアル作ってほしい。）



