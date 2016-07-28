# JSON Generator Atom Package
Amazon Elasticsearch Service 2.3 がサポートされましたね。現在進行中のプロジェクトで Amazon ES を使うかどうか再検討しなくてはと思いつつ、

本題です。Elasticsearch の検証をするとき、サンプルデータを作成するのは地味に大変じゃありませんか？
AWS の S3 に JSON Lines 形式のファイルを保存して Lambda で何か処理をするときのサンプルデータを作るのは大変ですよね？

ということで、JSON Generator Atom Package 作りました！そして公開しました！（久しぶりに便利なもの作った気がする）

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

``` js
[
  {{!-- This is comment --}}
  {{#repeat 10}}
  {
    "_index": "blog",
    "_type": "posts",
    "_id": "{{@index}}",
    "title": "{{loremja}}",
    "contents": "{{loremja 3}}",
    "auther": "{{firstName}} {{lastName}}",
    "genre": [
      {{#repeat 3}}
      "{{genre}}"
      {{/repeat}}
    ],
    "published": "{{date '2014' '2016' 'YYYY-MM-DD HH:mm:ss'}}",
    "images": [
      {{#repeat 3}}
      "img{{@index}}.png"
      {{/repeat}}
    ],
    "starts": {{int 0 100}}
  }
  {{/repeat}}
]
```

※ このテンプレートを保存する場合は、拡張子を \*.hbs にして保存しましょう。

### 2. サンプルデータの作成
作成したテンプレートをアクティブにした状態で、Atom のコマンドパレットを表示して、Json Generator: Generate を実行してください。以下のようなランダムなデータでサンプルデータが作成されます。

**Example**

``` js
[
  {
    "_index": "blog",
    "_type": "posts",
    "_id": "0",
    "title": "第二それからもったばこたちに込みてだしたのまで云うか。",
    "contents": "私気質はでと徳義幸にしないな。個人たか今んかしでまして多分私はそれにおいて批評の失礼から離さからいるんた。かっこうはただぎてしまいはもうじぶんがをしたた。",
    "auther": "Dori Turner",
    "genre": [
      "Action",
      "Comedy",
      "Crime"
    ],
    "published": "2014-12-23 08:33:39",
    "images": [
      "img0.png",
      "img1.png",
      "img2.png"
    ],
    "starts": 8
  },
  {
    "_index": "blog",
    "_type": "posts",
    "_id": "1",
    "title": "日本かももまあ欠乏をは威張っだない。",
    "contents": "または立派に赴任当るれないうちを主意から暮らしれう農家他の壇のようたのない。う三ぞ気じゃしていが過ぎましやっと弾きのたよ。あなたも道のあっが現に個性お尋ねに立っです。",
    "auther": "Rene Mullens",
    "genre": [
      "Drama",
      "Western",
      "Romance"
    ],
    "published": "2014-11-10 12:59:22",
    "images": [
      "img0.png",
      "img1.png",
      "img2.png"
    ],
    "starts": 37
  },
  〜〜〜 省略 〜〜〜
]
```


基本的な使い方は以上です。

### 3. フォーマットを変更してサンプルデータを作成
デフォルトの出力フォーマットは json です。

サンプルデータのフォーマットは以下の３つを用意してます。

* json: pretty json format
* jsonlins: newline-separated json formar
* elasticsearch: elasticsearch bulk api format

パッケージの設定から出力フォーマットを選択できます。
(Settings/Preferences ➔ Packages ➔ Search for json-generator)

elasticsearch の bulk api フォーマットで出力するには、パッケージの設定で Output format を elasticsearch に変更してから、再度「2. サンプルデータの作成」の手順を実行します。

**Example**

``` js
{"index":{"_index":"blog","_type":"posts","_id":"0"}}
{"title":"思うままがらんと持っようにおいでをふりまわしてよくついますな。","contents":"鼻しきりに狸に行ってしまっ。あなたにあるは歩くあり私をすま一般例外なものべき。糸もするてのにわかにから二日へしますた。","auther":"Alexa Lenihan","genre":["Film-Noir","Documentary","Musical"],"published":"2014-05-31 22:56:28","images":["img0.png","img1.png","img2.png"],"starts":0}
{"index":{"_index":"blog","_type":"posts","_id":"1"}}
{"title":"なるは引きあげは楽長というのへしばらくやれましくせな。","contents":"ひらいて歩きたをあるてぶんをちからいね。お生意気でて待ち構えてください。いっしょはセロに楽長から向けて嵐に楽屋を一拍しが眼のこんどからちがいたた。","auther":"Jamie Garling","genre":["Adventure","Drama","Western"],"published":"2014-10-31 09:39:03","images":["img0.png","img1.png","img2.png"],"starts":26}
{"index":{"_index":"blog","_type":"posts","_id":"2"}}
{"title":"たばこはもって手なと。","contents":"師範は安危にとどまら時、自分が威張っ上をいうれるたい一間が未熟にするたませ。そのところそれかおいひとの棒を夜中と見るものへあわてたた。したがってこの会員を立っからは同時に重きも先生のところに聴いのをしたう。","auther":"Shea Raymond","genre":["Musical","War","War"],"published":"2015-06-03 04:49:03","images":["img0.png","img1.png","img2.png"],"starts":50}
〜〜〜 省略 〜〜〜
```

## デフォルトのダミーデータを上書きしてサンプルデータを作成する。
デフォルトのダミーデータは、パッケージの設定で変更できます。
(Settings/Preferences ➔ Packages ➔ Search for json-generator)

例えば、テンプレートの `{{firstName}}` `{{lastName}}` で置き換えられる値を日本語にしたければ、以下の設定項目に日本語の名前を登録してから再度サンプルデータを作成してください。

* Mock Data: firstName
* Mock Data: lastName

## さいごに
いかがでしたでしょうか？これを使えば Elasticsearch で試してみたいスキーマの JSON サンプルデータが簡単に作れますよね。ガンガン Elasticsearch を使っていきましょう。

ソースコードは GitHub で公開していますので、追加機能などプルリクお待ちしています。
https://github.com/KunihikoKido/atom-json-generator
