# 快適？ブログ執筆環境構築
木戸です。入社して２ヶ月が経ちました。ブログの投稿本数も１１本（５．５／月）と標準的なペースで書いています。

社内ではブログの執筆環境は人それぞれのようで、Wordpress で直接書いている人や、Mac で Markdown エディタを使って書いている人など様々なようです。

試行錯誤して、なんとなく自分にあったブログ執筆環境が整ってきたのでブログで公開してみます。

参考になれば幸いです。

## ブログ執筆環境要件
私のブログ執筆環境要件は以下です。

- **執筆**
  - フォーマットは Markdown 形式で書きたい。
  - 修正履歴を残したい
  - Mac と iPhone の両方で書けるようにしたい。
  - Elasticsearch の記事は自動的に電子書籍化（PDF ePub）してまとめて読めるようにしたい。
  - 文章の校正チェックを自動化したい。
- **公開**
  - Wordpress へはそのままコピペして公開できるようにしたい
  - Wordpress へ公開した任意の記事は、自分のブログサイトの下書きに自動で追加したい

ちょっと特殊な要件も入っていますが。。

## システム概要
基本的には Github を起点に、Mac と iPhone の両方で編集できるようにしています。
電子書籍化は GitBook を使って、Github へコミットしたタイミングで自動で作成される仕組みです。

```
[Mac or iPhone] ← pull & push → [Github] → publish → [GitBook / Travis CI]
```

Travis CI は必須ではありませんが、文章校正チェックで使用しています。
（一人で書くので、Mac 上でも RedPen で文章校正チェックできるのでそれでじゅうぶん。）

## Github のファイル構成
以下は Github で管理しているファイルやディレクトリ構成です。

```sh
docs
├── images              # (1)
│   ├── redpen-getting-started-1.png
│   └── redpen-getting-started-2.png
├── src                 # (2)
│   ├── elasticsearch-getting-started-01.md
│   ├── elasticsearch-getting-started-02.md
│   ├── elasticsearch-getting-started-03.md
│   └── redpen-getting-started.md
├── validators          # (3)
│   ├── easyReadCheck.js
│   └── spellCheckValidator.js
├── .bookignore         # (4)
├── .gitignore          # (5)
├── .travis.yml         # (6)
├── book.json           # (7)
├── GLOSSARY.md         # (8)
├── INTRO.md            # (9)
├── Makefile            # (10)
├── README.md           # (11)
├── redpen-conf-ja.xml  # (12)
└── SUMMARY.md          # (13)
```

- **(1)** 画像ファイル管理ディレクトリ
- **(2)** ブログ記事管理ディレクトリ
- **(3)** RedPen のカスタム・バリデータ
- **(1)** GitBook の用語集ページ
- **(2)** GitBook のトップページ
- **(3)** Travis CI 向けの各種オペレーション
- **(4)** 当プロジェクトの説明
- **(5)** GitBook の目次ページ
- **(6)** GitBook の設定ファイル
- **(8)** RedPen の設定ファイル（校正ルール）


### 記事を書くときのルール
まずは記事を書くときのルールです。
基本的には `src` 配下でファイルを管理して、`images` 配下で画像ファイルを管理しているのですが幾つかルールを設定しています。

- **記事ファイル管理ルール**
  - `src` 配下で管理する
  - １ファイル１記事単位で作成する
- **記事ファイル名のつけ方ルール**
  - ファイル名は記事の特徴を表す名詞から始める
    - ※ 例えば、Elasticsearch 関連なら `elasticsearch`-getting-started-03.md
  - ファイル名は Wordpress 公開 URL と同じにする
- **記事書き方ルール**
  - フォーマットは Markdown で記述する
  - 文字コードは UTF-8
  - h1 (Markdown 形式で)から書き始める
    - ※ Wordpress で公開する時のタイトルを h1 で書いておく
  - 文章校正にルールに従って修正する
    - ※ RedPen で校正ルールを設定
  - 画像ファイルの埋め込み URL はフルパスで記述する
    - ※ Github の raw ファイル取得 URL
- **画像ファイル管理ルール**
  - `images` 配下で管理する
  - ファイル名は記事ファイル名＋連番＋拡張子
    - ※ 例えば、`redpen-getting-started-1.png`

## 文章校正ルール（RedPen）
RedPen 関連のファイル

## クライアントツール

### Mac OSX 環境
#### Markdown エディタ
* Atom Editor + markdown-perview core package

#### Git クライアント
* Atom Editor + git-plus community package
* Git CLI

#### スクリーンキャプチャ・画像編集ツール
* Skitch
* Licecap

#### 文章校正チェックツール
* RedPen CLI
* Atom Editor + redpen community package

### iPhone 環境
#### エディタ ＆ Git クライアントアプリ
* Git2Go

#### スクリーンキャプチャ・画像編集アプリ
* Skitch
