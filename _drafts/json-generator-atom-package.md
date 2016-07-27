# JSON Generator Atom Package
Elasticsearch 検証するのにサンプルデータ作成するの地味に大変じゃありませんか？ということで、JSON Generator Atom Package 作りました！そして公開しました！（久しぶりに便利なもの作った気がする）

https://atom.io/packages/json-generator

![overview](https://raw.githubusercontent.com/KunihikoKido/atom-json-generator/master/screenshots/overview.gif)

## インストール
※ このパッケージは、Atom エディタのプラグインとして動作します。Atom をまだインストールしていない場合は、[ここ](https://atom.io)からダウンロードしてインストールしてください。

json-generator は以下の手順でインストール出来ます。

apm install json-generator

または

Settings/Preferences ➔ Install ➔ Search for json-generator

## 使い方
### 1. テンプートの作成
Atom のコマンドパレットを表示して Json Generator: New Template を実行してください。新規のテンプートが表示されます。このまま実行しても良いのですが、これを以下のように変更してください。

**Example**

※ このテンプレートを保存する場合は、拡張子を *.hbs にして保存しましょう。

### 2. サンプルデータの作成
作成したテンプレートをアクティブにした状態で、Atom のコマンドパレットを表示して、Json Generator: Generate を実行してください。以下のようなサンプルデータが作成されます。

**Example**

基本的な使い方は以上です。

### 3. フォーマットを変更してサンプルデータを作成
デフォルトの出力フォーマットは json です。

サンプルデータのフォーマットは以下の３つを用意してます。

* json: pretty json format
* jsonlins: newline-separated json formar
* elasticsearch: elasticsearch bulk api format

パッケージの設定から出力フォーマットを選択できます。
(Settings/Preferences ➔ Packages ➔ Search for json-generator)

elasticsearch の bulk api フォーマットで出力するには、パッケージの設定で Output format を elasricsearch に変更してから、再度「2. サンプルデータの作成」の手順を実行します。

**Example**

## まとめ
いかがでしたでしょうか？これを使えば簡単にサンプルデータが作れるので Elasticsearch を検証しまくりですね。

また、AWS 関連では S3 に JSON Lines 形式のデータを保存して、Lambda で何か処理をするようなプログラムを作ることも多いかと思います。このツールを使えば、そのようなサンプルデータも作成できますね。

プルリクお待ちしています。
https://github.com/KunihikoKido/atom-json-generator

