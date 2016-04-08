# 快適？ブログ執筆環境構築
木戸です。入社して２ヶ月が経ちました。ブログの投稿本数も１１本（５．５／月）と比較的順調なペースで書いています。

社内のブログの執筆環境は人それぞれのようで、Wordpress で直接書いている人や、Mac で Markdown エディタを使って書いている人など様々なようです。

試行錯誤して、なんとなく自分にあったブログ執筆環境が整ってきたのでブログで紹介してみたいと思います。

参考になれば幸いです。

## ブログ執筆環境要件
私のブログ執筆環境要件を以下にまとめました。

- **執筆**
  - フォーマットは Markdown 形式で書きたい。
  - 修正履歴を残したい
  - Mac と iPhone の両方で書けるようにしたい。
  - Elasticsearch の記事は自動的に電子書籍化（PDF ePub）してまとめて読めるようにしたい。
  - 文章の校正ルールの検査を自動化したい。
- **公開**
  - Wordpress へはそのままコピペして公開できるようにしたい

ちょっと特殊な要件も入っていますが。。
これらの要件をもとに、構築しているブログ執筆環境を説明します。

## システム概要
![system overview](https://raw.githubusercontent.com/KunihikoKido/docs/master/images/myblog-writing-1.png)

基本的には Github を起点に、Mac と iPhone の両方で編集できるようにしています。

電子書籍化は GitBook を使っています。Github へ修正を反映したタイミングで自動で作成される仕組みです。

文章の校正ルールのチェックは RedPen を使っています。こちらも Github へ修正を反映したタイミングで Travis CI 上で RedPen を動かして自動的にチェックする仕組みです。

## Github のファイル構成
以下は Github で管理しているファイルやディレクトリ構成です。

```
GitHub Repository
├── _posts              # (1)
│   ├── 2016-03-10-elasticsearch-getting-started-01.md
│   ├── 2016-03-17-elasticsearch-getting-started-02.md
│   ├── 2016-03-25-redpen-getting-started.md
│   └── 2016-03-31-elasticsearch-getting-started-03.md
├── images              # (2)
│   └── redpen-getting-started-2.png
├── validators          # (3)
│   ├── easyReadCheck.js
│   └── spellCheckValidator.js
├── .bookignore         # (4)
├── .gitignore          # (5)
├── .travis.yml         # (6)
├── GLOSSARY.md         # (7)
├── INTRO.md            # (8)
├── Makefile            # (9)
├── README.md           # (10)
├── SUMMARY.md          # (11)
├── book.json           # (12)
└── redpen-conf-ja.xml  # (13)
```

- *(1):* 記事の管理ディレクトリ
- *(2):* 画像の管理ディレクトリ（記事で掲載する画像）
- *(3):* RedPen カスタムバリデータ管理ディレクトリ
- *(4):* GitBook 用 ignore ファイル
- *(5):* Git 用 ignore ファイル
- *(6):* Travis 設定ファイル
- *(7):* GitBook 用語集ファイル
- *(8):* GitBook トップページファイル
- *(9):* プロジェクト用コマンド群
- *(10):* プロジェクト README ファイル
- *(11):* GitBook 目次ファイル
- *(12):* GitBook 設定ファイル
- *(13):* RedPen 設定ファイル

Travis や GitBook の設定ファイルを用意して、各種サービスで校正チェック自動化したり電子書籍（PDF、ePub）を自動で公開しています。

各種設定ファイルの内容など興味のある方はこちら↓を参照してください。

※ 参考: [github.com/KunihikoKido/docs](https://github.com/KunihikoKido/docs)

## 記事を書くときのルール
基本的には `_posts` 配下で記事ファイルを管理して、`images` 配下で画像ファイルを管理しています。
また、それ以外にも幾つかルールを設定しています。

- **記事ファイル管理ルール**
  - １ファイル１記事単位で作成する
- **記事ファイル名のつけ方ルール**
  - ファイル名は Wordpress 公開 URL と同じにする
- **記事書き方ルール**
  - フォーマットは Markdown で記述する
  - 文章校正にルールに従って修正する
    - ※ RedPen で校正ルールを設定
  - 画像ファイルの埋め込み URL はフルパスで記述する
    - ※ Github の raw ファイル取得 URL
- **画像ファイル管理ルール**
  - `images` 配下で管理する

### 文章校正ルール（RedPen）
文章校正ルールのチェックには RedPen を使用しています。
RedPen は以下のような校正ルールファイルを用意すると、そのルールに従って自然言語で書かれた文章をチェックしてくれる優れものです。

※ 参考: [RedPen でわかりやすい技術文書を書こう - Developers.IO](http://dev.classmethod.jp/tool/redpen-getting-started/)

私は以下のルールで文章を校正しています。

* `SentenceLength`
  * 文の長さ自体を検査（最大１２０文字）
* `InvalidSymbol`
  * 不正なシンボルの検索
* `KatakanaEndHyphen`
  * カタカナ単語末尾の長音検査
* `KatakanaSpellCheck`
  * カタカナ単語のゆらぎ検査
* `SectionLength`
  * 節の長さ（最大１５００文字）
* `ParagraphNumber`
  * 節内のパラグラフ数（最大６パラグラフ）
* `SpaceBetweenAlphabeticalWord`
  * アルファベット前後のスペースあるかどうかの検査
* `CommaNumber`
  * 一文中のコンマの数を検査（最大３）
* `JavaScript`
  * ひらがな表記検査（「殆ど」→「ほとんど」など）
  * 名詞のスペルチェック（Elasticsearch、Solr、など）
* `JapaneseStyle`
  * ですます調、である調の混在検査
* `DoubleNegative`
  * 二重否定のチェック

※ アルファベット前後のスペース入れておくと、GitBook の用語集が作りやすいです。

## 電子書籍化（GitBook）
![gitbook](https://raw.githubusercontent.com/KunihikoKido/docs/master/images/myblog-writing-2.png)

電子書籍化は GitBook を使用しています。
Elasticsearch 関連の記事だけを対象に電子書籍化したいので、
以下の SUMMARY.md のように、Elasticsearch 関連の記事のみ目次に追加することで実現しています。

**SUMMARY.md**

```
# 目次

### はじめに
* [はじめに](INTRO.md)

### 入門
* [第１回 Elasticsearch 入門 インデックスを設計する際に知っておくべき事](_posts/2016-03-10-elasticsearch-getting-started-01.md)
* [第２回 Elasticsearch 入門 データスキーマ設計のいろは](_posts/2016-03-17-elasticsearch-getting-started-02.md)
* [第３回 Elasticsearch 入門 ドキュメント管理は意外と高度なことができる](_posts/2016-03-31-elasticsearch-getting-started-03.md)
```

このように Elasticsearch 関連の記事を追加したら、SUMMARY.md を更新して GitHub へコミットすると自動で、PDF や ePub が作成される仕組みです。

### 各種コマンド
ローカル環境で作業するときのコマンドを幾つか用意しています。

* `make check`
  * 文章の校正チェックをするためのコマンド
* `make html`
  * Markdown で書いた記事を GitBook 形式の HTML ファイルへビルドするためのコマンド
* `make pdf`
  * Markdown で書いた記事を GitBook 形式の PDF ファイルへビルドするためのコマンド

GitBook をローカル環境へ用意するには以下の記事を参考にしてください。

* 参考: [GitBook 環境を準備してみる - Developers.IO](http://dev.classmethod.jp/devenv/install-gitbook/)

## クライアントツール
以下は簡単ですが、各種クライアントで使用しているツールを紹介します。

### Mac OSX 環境

#### Atom
![Atom](https://raw.githubusercontent.com/KunihikoKido/docs/master/images/myblog-writing-4.png)

GitHub が提供するオープンソースのエディタです。
Markdown のプレビュや、Git の操作（git-plus コミュニティパッケージ）が可能です。
また、RedPen を Atom から操作するためのコミュニティパッケージも公開されています。

* [Atom](https://atom.io)
* [git-plus - Atom Package](https://atom.io/packages/git-plus)
* [redpen - Atom Package](https://atom.io/packages/redpen)

#### Skitch
Skitch はスクリーン・キャプチャを撮ったり、画像に図形や矢印・コメントを簡単に描き込むことができるアプリケーションです。

* [Skitch](https://evernote.com/intl/jp/skitch/)

#### LICEcap
LICEcap はアニメーション・スクリーンキャプチャです。

* [LICEcap](http://www.cockos.com/licecap/)

#### RedPen
RedPen は自然言語で記述された入力文書のチェックを自動化します。コマンドラインなどのツールを提供しています。

* [RedPen](http://redpen.cc/)

#### gitbook-cli
GitBook コマンドラインツールです。Markdown で書いた GitBook 形式のファイルをビルドして HTML や PDF などの電子書籍フォーマットを出力することができます。

* [gitbook-cli](https://github.com/GitbookIO/gitbook-cli)

### iPhone iOS 環境

#### Git2Go
![Git2Go](https://raw.githubusercontent.com/KunihikoKido/docs/master/images/myblog-writing-3.png)

Git2Go は本格的な iOS 向け GitHub クライアントアプリケーションです。
無料版では、GitHub 公開リポジトリをローカルにクローンして、
コミット履歴やソースの参照だけでなくブランチの作成やコードの修正、コミットなどの操作を iOS から実行することが可能です。

* [Git2Go](http://git2go.com/)


## まとめ
一人でブログを書く環境にしては、ちょっとやりすぎなところはありますが、
チームでブログを書く環境ではその効果を発揮するはずです。たぶん。おそらく。きっと。

私はこの環境をブログの下書き用に使用しています。
もちろん、Github pages + jekyll と組み合わせて、そのままブログを公開する環境として拡張することもできます。

Github pages + jekyll + Travis CI (RedPen で校正チェック)

このブログ環境は Markdown で書けるし、プルリクのタイミングで文章の校正ルールチェックもできるので、もしかしたら最強なのでは？
