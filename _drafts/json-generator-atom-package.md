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


## コマンド
Atom のコマンドパレットを表示して以下の２つのコマンドが見つかるはずです。

* Json Generator: New Template
* Json Generator: Generate (ctrl-alt-g)

### New Template
サンプルデータを作成するための新規のテンプートを作成するためのコマンドです。実行するとテンプートのサンプルが表示されます。これをベースにカスタマイズしてください。

### Generate (ctrl-alt-g)
テンプートをもとにサンプルデータを作成するためのコマンドです。実行するとサンプルデータが作成されます。

サンプルデータのフォーマットは以下の３つを用意してます。

* json: pretty json format
* jsonlins: newline-separated json formar
* elasticsearch: elasticsearch bulk api format

パッケージの設定から出力フォーマットを選択できます。
(Settings/Preferences ➔ Packages ➔ Search for json-generator)

## 使い方
### 1. テンプートの作成
Atom のコマンドパレットを表示して Json Generator: New Template を実行してください。新規のテンプートが表示されます。このまま実行しても良いのですが、これを以下のように変更してください。

※ このテンプレートを保存する場合は、拡張子を *.hbs にして保存しましょう。

### 2. サンプルデータの作成
作成したテンプレートをアクティブにした状態で、Atom のコマンドパレットを表示して、Json Generator: Generate を実行してください。以下のようなサンプルデータが作成されます。


基本的な使い方は以上です。

### 3. フォーマットを変更してサンプルデータを作成
デフォルトの出力フォーマットは json です。

elasticsearch の bulk api フォーマットで出力するには、パッケージの設定で Output format を elasricsearch に変更してから、再度「2. サンプルデータの作成」の手順を実行します。



