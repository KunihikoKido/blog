# 快適？ブログ執筆環境構築
木戸です。入社して２ヶ月が経ちました。ブログの投稿本数も１１本（５．５／月）と比較的順調なペースで書いています。

社内のブログの執筆環境は人それぞれのようで、Wordpress で直接書いている人や、Mac で Markdown エディタを使って書いている人など様々なようです。

試行錯誤して、なんとなく自分にあったブログ執筆環境が整ってきたのでブログで紹介してみます。

参考になれば幸いです。

## ブログ執筆環境要件
私のブログ執筆環境要件は以下です。

- **執筆**
  - フォーマットは Markdown 形式で書きたい。
  - 修正履歴を残したい
  - Mac と iPhone の両方で書けるようにしたい。
  - Elasticsearch の記事は自動的に電子書籍化（PDF ePub）してまとめて読めるようにしたい。
  - 文章の校正ルールの検査を自動化したい。
- **公開**
  - Wordpress へはそのままコピペして公開できるようにしたい

ちょっと特殊な要件も入っていますが。。

## システム概要
基本的には Github を起点に、Mac と iPhone の両方で編集できるようにしています。
電子書籍化は GitBook を使って、Github へコミットしたタイミングで自動で作成される仕組みです。

![blog writing](https://raw.githubusercontent.com/KunihikoKido/docs/master/images/myblog-writing-1.png)


Travis CI は必須ではありませんが、文章校正チェックで使用しています。
（一人で書くので、Mac 上で RedPen を使って文章校正チェックできるのでそれでじゅうぶん。）

## Github のファイル構成
以下は Github で管理しているファイルやディレクトリ構成です。

```sh
https://github.com/KunihikoKido/docs
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
├── .Travis.yml         # (6)
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

### 記事を書くときのルール
まずは記事を書くときのルールです。
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

## 文章校正ルール検査（RedPen）
文章校正ルールのチェックには RedPen を使用しています。
RedPen は以下のような校正ルールファイルを用意すると、そのルールに従って自然言語で書かれた文章をチェックしてくれる優れものです。

<a class="embedly-card" href="http://dev.classmethod.jp/tool/redpen-getting-started/">RedPen でわかりやすい技術文書を書こう ｜ Developers.IO</a><script async src="//cdn.embedly.com/widgets/platform.js" charset="UTF-8"></script>

**redpen-conf-ja.xml**

```xml
<redpen-conf lang="ja" type="zenkaku">
    <validators>
        <validator name="SentenceLength">
            <property name="max_len" value="120"/>
        </validator>
        <validator name="InvalidSymbol"/>
        <validator name="KatakanaEndHyphen"/>
        <validator name="KatakanaSpellCheck"/>
        <validator name="SectionLength">
            <property name="max_num" value="1500"/>
        </validator>
        <validator name="ParagraphNumber"/>
        <validator name="SpaceBetweenAlphabeticalWord" />
        <validator name="CommaNumber" />
        <!-- <validator name="SuccessiveWord" /> -->
        <validator name="JavaScript">
          <property name="script-path" value="validators" />
        </validator>
        <validator name="JapaneseStyle" />
        <validator name="DoubleNegative" />
        <!-- <validator name="DuplicatedSection" /> -->
    </validators>
    <symbols>
        <symbol name="FULL_STOP" value="。" />
        <symbol name="COMMA" value="、" />
        <symbol name="COLON" value="：" />
        <symbol name="NUMBER_SIGN" value="＃" />
        <symbol name="LEFT_PARENTHESIS" value="（" />
        <symbol name="RIGHT_PARENTHESIS" value="）" />
        <symbol name="LESS_THAN_SIGN" value="＜" />
        <symbol name="GREATER_THAN_SIGN" value="＞" />
        <symbol name="EQUAL_SIGN" value="＝" />
    </symbols>
</redpen-conf>
```

上記設定の内容の説明

* `SentenceLength`
  * 文の長さ自体を検査（最大１２０文字）
* `InvalidSymbol`
  * 不正なシンボルの検索
* `KatakanaEndHyphen`
  * カタカナ単語末尾の長音検査
* `KatakanaSpellCheck`
  * カタカナ単語のゆらぎ検査
* `ParagraphNumber`
  * 節内のパラグラフ数（最大６パラグラフ）
* `SpaceBetweenAlphabeticalWord`
  * アルファベット前後のスペースあるかどうかの検査
* `CommaNumber`
  * 一文中のコンマの数を検査
* `JavaScript`
  * ひらがな表記検査（「殆ど」→「ほとんど」など）
  * 名詞のスペルチェック（Elasticsearch、Solr、など）
* `JapaneseStyle`
  * ですます調、である調の混在検査
* `DoubleNegative`
  * 二重否定のチェック

このような内容で文章をチェックしています。

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

### 各種コマンド
ローカル環境でも、Markdown で書いた記事を GitBook の pdf や HTML へ変換できるように各種コマンド（`make html`、`make pdf`）を用意しています。

GitBook をローカル環境へ用意するには以下の記事を参考にしてください。

<a class="embedly-card" href="http://dev.classmethod.jp/devenv/install-gitbook/">GitBook 環境を準備してみる ｜ Developers.IO</a><script async src="//cdn.embedly.com/widgets/platform.js" charset="UTF-8"></script>

## クライアントツール
以下は簡単ですが、各種クライアントで使用しているツールです。

### Mac OSX 環境
#### Markdown エディタ
* Atom エディタ
  * Github が提供するオープンソースのエディタ
* markdown-perview core package (Atom エディタ)
  * Atom エディタで Markdown のプレビュができるパッケージ

#### Git クライアント
* git-plus community package (Atom エディタ)
  * Atom エディタで Git の操作を提供するパッケージ

#### スクリーンキャプチャ・画像編集ツール
* Skitch
  * 画像に矢印入れたり、コメント入れたりするのに便利なツール
* Licecap
  * 画面キャプチャを Gif で動きのある画像作るのに便利なツール

#### 文章校正チェックツール
* RedPen CLI
  * RedPen のコマンドラインツール
* redpen community package (Atom Editor)
  * Atom エディタで RedPen の文章校正チェックができるパッケージ

### iPhone 環境
#### エディタ ＆ Git クライアントアプリ
* Git2Go
  * Git の操作とテキストの編集などができるアプリ


## まとめ
ちょっと一人でブログを書く環境にしてはちょっとやりすぎなところはありますが、
複数人でブログを書く環境ではその効果を発揮するはずです。

私はこの環境をブログの下書き用に使用していますが、
もちろん、Github pages + jekyll と組み合わせてそのままブログを公開する環境としても利用することができます。

Github pages + jekyll + Travis CI (RedPen で校正チェック)

このブログ環境は Markdown で書けるし、プルリクのタイミングで文章の校正ルールチェックもできるので、もしかしたら最強なのでは？
