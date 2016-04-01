# 第４回 Elasticsearch 入門 検索の基本
今回は「検索の基本」について解説したいと思います。

Elasticsearch の検索のパワーをフルに活用するには、以下の内容を理解する必要があります（日本語を対象に検索する場合など）。


* Mapping
* Analysis
* Query DSL

今回はこれらのことは一旦置いておいて、検索の基本について解説します。

## 第１回から第３回までのおさらい
Elasticsearch


## サーチエンドポイント
Elasticsearch のサーチエンドポイントの基本ルールは以下の URL パターンです。ドキュメントの管理同様わかりやすくなっています。

```
GET|POST /{index}/{type}/_search
```

メソッドは、GET と POST の両方を提供しています。
GET メソッドでも body の内容を受け付けています。

※ 注意: クライアントによっては、HTTP GET メソッド使用時に body の内容をリクエストしない場合があります。そのため、基本的には body の内容をリクエストする場合は POST メソッドを使用したほうが良いでしょう。

### サーチエンドポイントのバリエーション
Elasticsearch はインデックスやタイプを横断で検索できるようになっているため、上記の基本ルールを元に柔軟な指定が可能です。

以下はそのバリエーションです。

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

バリエーションは豊富ですが、直感的で覚えやすい印象です。
