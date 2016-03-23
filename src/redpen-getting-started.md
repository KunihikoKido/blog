# RedPen でわかりやすい技術文書を書こう

最近はブログを始めマニュアルや仕様書など技術文書を書く機会が多くなってきました。
技術文書はわかりやすさが重要だと思うのですが実際は書けていません。
どうしたらわかりやすい文書が書けるのだろうか？と調べていたら RedPen というツールを見つけたので早速試してみました。


## RedPen とは？
[RedPen](http://redpen.cc/) とはプログラマや記者が規約に従って文書を記述するのをサポートしてくれるオープンソースのソフトウェアツールです。

プログラミングが規約に従ってコーディングされているかチェックするように、RedPen は自然言語で記述された入力文書の検査を自動化してくれます。

**RedPen の特徴**

* 設定が柔軟に行えます。（カスタマイズも柔軟）
* どのような言語で書かれた文書でも処理できます。（もちろん日本語も OK です）
* Markdown や Textile フォーマットで記述された文書をそのまま検査できます。

## RedPen のインストール
RedPen はコマンドラインベースのツールとして提供されています。
Homebrew インストールできるので導入はとても簡単です。（ for Mac ）

```
brew install redpen
```

## とりあえず使ってみる
インストールが完了したら以下のサンプル文章をファイルに保存して検査してみましょう。
以下の文章は、過去に私が公開したブログの一部です。

_サンプル文章_

```
## Index で分けるか？ Type で分けるか？
例えば、商品情報を保存するインデックスの設計を考えてみましょう。
いわゆるRDBの設計で言うところのテーブル設計ですね。おそらくRDBではアプリケーション要件のみが、その設計の中心になるはずです。

例えば、商品名や説明、価格情報などの基本情報、カテゴリマスターがあって、１つの商品は SKU の組み合わせを複数持っているとか。あとはそれらの情報をどの単位でテーブルに落とし込むか？といった感じでしょうか？

これを Elasticsearch で設計する場合、考慮するのはアプリケーション要件だけではないのです。説明する前に簡単に RDB との論理的な構成を比較してみると以下のような構成です。
```

ターミナルを開いて以下のように検査を実行します。

```sh
$ redpen sample.md
```

実行結果には、以下のような規約に沿っていない行とその理由が出力されます。
以下はその結果で出力されたエラーです。たくさんエラーが出力されています。わかりづらい文章ということですね。

```
sample.md:3: ValidationError[DoubledWord], 一文に二回以上利用されている単語 "設計" がみつかりました。 at line: いわゆるRDBの設計で言うところのテーブル設計ですね。
sample.md:3: ValidationError[SpaceBetweenAlphabeticalWord], アルファベット単語の前にスペースが存在しません。 at line: いわゆるRDBの設計で言うところのテーブル設計ですね。
sample.md:3: ValidationError[SpaceBetweenAlphabeticalWord], アルファベット単語の後にスペースが存在しません。 at line: いわゆるRDBの設計で言うところのテーブル設計ですね。
sample.md:3: ValidationError[SpaceBetweenAlphabeticalWord], アルファベット単語の前にスペースが存在しません。 at line: おそらくRDBではアプリケーション要件のみが、その設計の中心になるはずです。
sample.md:3: ValidationError[SpaceBetweenAlphabeticalWord], アルファベット単語の後にスペースが存在しません。 at line: おそらくRDBではアプリケーション要件のみが、その設計の中心になるはずです。
sample.md:5: ValidationError[KatakanaEndHyphen], カタカナ単語 "カテゴリマスター" に不正なハイフンが見つかりました。 at line: 例えば、商品名や説明、価格情報などの基本情報、カテゴリマスターがあって、１つの商品は SKU の組み合わせを複数持っているとか。
sample.md:5: ValidationError[DoubledWord], 一文に二回以上利用されている単語 "情報" がみつかりました。 at line: 例えば、商品名や説明、価格情報などの基本情報、カテゴリマスターがあって、１つの商品は SKU の組み合わせを複数持っているとか。
sample.md:5: ValidationError[DoubledWord], 一文に二回以上利用されている単語 "商品" がみつかりました。 at line: 例えば、商品名や説明、価格情報などの基本情報、カテゴリマスターがあって、１つの商品は SKU の組み合わせを複数持っているとか。
sample.md:5: ValidationError[CommaNumber], カンマの数 (5) が最大の "3" を超えています。 at line: 例えば、商品名や説明、価格情報などの基本情報、カテゴリマスターがあって、１つの商品は SKU の組み合わせを複数持っているとか。
sample.md:7: ValidationError[DoubledWord], 一文に二回以上利用されている単語 "構成" がみつかりました。 at line: 説明する前に簡単に RDB との論理的な構成を比較してみると以下のような構成です。
```

校正した文章がこちら。微妙な違いですが、心なしか文章がクドくなくなったような気がします。

```
## Index で分けるか？ Type で分けるか？
例えば、商品情報を保存するインデックスの設計を考えてみましょう。
いわゆる RDB で言うところのテーブル設計ですね。おそらく RDB ではアプリケーション要件のみが、その設計の中心になるはずです。

例えばある商品は名称や説明、価格などの基本情報を持ちます。その商品情報は１つ以上のカテゴリマスタに紐付いていて、SKU の組み合わせを複数持っているとか。あとはそれらの情報をどの単位でテーブルに落とし込むか？といった感じでしょうか？

これを Elasticsearch で設計する場合、考慮するのはアプリケーション要件だけではないのです。説明する前に簡単に RDB との論理的な構成を比較します。
```

## 設定ファイルのカスタマイズ
以下はデフォルトで使用されていた設定ファイルです。

```xml
<redpen-conf lang="ja">
    <validators>
        <validator name="SentenceLength">                // センテンス長の規約
            <property name="max_len" value="100"/>
        </validator>
        <validator name="InvalidSymbol"/>                 // 記号の規約
        <validator name="KatakanaEndHyphen"/>             // カタカナの規約
        <validator name="KatakanaSpellCheck"/>            // カタカナのスペルチェック
        <validator name="SectionLength">                  // セクションの規約
            <property name="max_num" value="1500"/>
        </validator>
        <validator name="ParagraphNumber"/>               // パラグラフ数の規約
        <validator name="DoubledWord" />                  // 一文内の同一単語の規約
        <validator name="SpaceBetweenAlphabeticalWord" /> // 日本語文書内のアルファベットの規約
        <validator name="CommaNumber" />                  // コンマの数の規約
        <validator name="SuccessiveWord" />               // 単語の繰り返し規約
        <validator name="JavaScript" />
    </validators>
</redpen-conf>
```

デフォルトでは、センテンス長や記号、カタカナなどの日本語の文章をわかりやすくする統一するための規約が設定されています。
なるほど、センテンスの文字数やパラグラフ数を極力短く、一文内では同じ単語を使用しないように気をつけるだけでもわかりやすくなりそうですね。

上記の設定以外にも、``ですます``と``である``調の混在や二重否定チェックなど日本語特有の規約も用意されています。
設定のカスタマイズは、デフォルトの内容をもとに自分好みに修正していけばよいでしょう。

※ 各種設定の詳細については[マニュアル](http://redpen.cc/docs/latest/index_ja.html)を参照してください。

カスタマイズした設定の指定は以下の例のように ``-c`` オプションを使用します。

```
redpen -c redpen-conf.xml sample.md
```

## RedPen と Github と Travis CI でレビュを効率化
一人で技術文書を書いている場合は、コマンドラインで RedPen を実行して規約に沿っているか確認する。
複数人で作業している場合は Travis CI との連携が便利そうです。
規約（redpen-conf）を文書と一緒に Github で共有して、Travis CI と連携することで、基本的な規約のレビュが自動化できますね。

1. Github で文書管理
2. フォークしてもらう
3. プルリクもらう
4. Travis CI で規約自動チェック
5. 規約沿った文書になっていればマージ

という流れです。



**Github のファイル構成例**

```
blog
├── .gitignore
├── .travis.yml                     # Travis CI ファイル
├── README.md
├── redpen-conf.xml                 # RedPen 規約ファイル
└── src                             # コンテンツファイル
    └── redpen-getting-started.md
```

**Travis 設定ファイル例**

```
language: text

jdk:
  - oraclejdk8

env:
  - URL=https://github.com/redpen-cc/redpen/releases/download/redpen-1.5.2

install:
  - wget $URL/redpen-1.5.2.tar.gz
  - tar xvf redpen-1.5.2.tar.gz
  - export PATH=$PWD/redpen-distribution-1.5.2/bin:$PATH

script:
  - redpen -f markdown src/*.md
```

## まとめ
