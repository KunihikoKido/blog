# AWS Lambda で MeCab を動かす
木戸です。

今日はブログもくもく会です。休憩室でみんなでもくもくブログを書いています。

## MeCab とは？
MeCab は、オープンソースの形態素解析エンジンです。形態素解析と聞くと、全文検索を思い浮かべる人が多いかと思いますが、それ以外の用途でも活躍の場が多くあります。

## 例えば
例えば、Amazon Machine Learning （以下 AML）は既存データのパターンからモデルを作成し、そのモデルを使用して新しいデータを処理し予測結果を得ることができます。しかしこの既存データ、新しいデータに何も処理されていない日本語の文章が含まれている場合は、その予測精度も下がってしまいます。

なぜかと言うと、AML はデータ属性タイプに `TEXT` を指定した場合、そのフィールドの内容はスペースで区切られた単位をひとつの単語として解釈します。そして、それらの単語の出現数などから対照フィールドの相関関係を計算する仕組みです。日本語はそもそも分かち書きしない言語（単語をスペースで区切らない）のため制度が下がるというわけです。

そのため、Lambda で MeCab が使えるとサーバーレスで形態素解析処理を含んだデータ変換処理を実装できるのでないかと思いましたので、その実装方法を説明します。

## 前提条件
MeCab の形態素解析機能をスクリプト言語から、呼び出すために Python の言語バインディングを使用します。MeCab はコードにネイティブバイナリを使用しているため、ディプロイパッケージを作成する場合は Amazon Linux AMI を使用して Lambda 実行環境と同等の環境を構築してその OS 上で、パッケージを作成してください。

AWS Lambda Developer Guide »  [Lambda 実行環境と利用できるライブラリ](http://docs.aws.amazon.com/ja_jp/lambda/latest/dg/current-supported-versions.html)

## 実装例
今回ご紹介するのは、`sentence` を Input Event として与えると、その形態素解析結果を返すシンプルな Lambda Funtion の実装です。

_Input event:_

```js
{
  "sentence": "今日は良い天気です",
  "stoptags": "助詞-係助詞"
}
```

_Execution result sample:_

```js
{
  "tokens": [
    {
      "reading": "キョウ",
      "pos": "名詞-副詞可能",
      "baseform": "今日",
      "surface": "今日",
      "feature": "名詞,副詞可能,*,*,*,*,今日,キョウ,キョー"
    },
    {
      "reading": "ヨイ",
      "pos": "形容詞-自立",
      "baseform": "良い",
      "surface": "良い",
      "feature": "形容詞,自立,*,*,形容詞・アウオ段,基本形,良い,ヨイ,ヨイ"
    },
    {
      "reading": "テンキ",
      "pos": "名詞-一般",
      "baseform": "天気",
      "surface": "天気",
      "feature": "名詞,一般,*,*,*,*,天気,テンキ,テンキ"
    },
    {
      "reading": "デス",
      "pos": "助動詞",
      "baseform": "です",
      "surface": "です",
      "feature": "助動詞,*,*,*,特殊・デス,基本形,です,デス,デス"
    },
    {
      "reading": "。",
      "pos": "記号-句点",
      "baseform": "。",
      "surface": "。",
      "feature": "記号,句点,*,*,*,*,。,。,。"
    }
  ]
}
```

プロジェクトの構成は以下のようにしました。
MeCab バインディングをインポートして、実行するには MeCab のライブラリモジュールのパスを通す必要がありため、メインの Lambda ファンクションから切り離します。

```bash
$PROJECT_HOME/
├── lambda_function.py     # Lambda ファンクション モジュール
├── lib                    # Python バインディング
├── local                  # MeCab インストールディレクトリ
├── exclude.lst            # ディプロイパッケージ除外リストファイル
└── tokenizer.py           # MeCab 実行用 Python モジュール
```

### 1. プロジェクトの作成
```bash
# 1. プロジェクト用にディレクトリを作成
mkdir $HOME/lambda-tokenizer
```
※ 以下 PROJECT_HOME

### 2. MeCab のインストール

```bash
# 1. ダウンロードと解凍
wget http://mecab.googlecode.com/files/mecab-0.996.tar.gz
tar zvxf mecab-0.996.tar.gz

# 2. コンパイルとインストール
cd mecab-0.996
./configure --prefix=$PROJECT_HOME/local --enable-utf8-only
make && make install
```

### 3. MeCab 辞書のインストール

```bash
# 1. 辞書のダウンロードと解凍
wget http://mecab.googlecode.com/files/mecab-ipadic-2.7.0-20070801.tar.gz
tar zvxf mecab-ipadic-2.7.0-20070801.tar.gz

# 3. 辞書のコンパイルとインストール
cd mecab-ipadic-2.7.0-20070801
export PATH=$PROJECT_HOME/local/bin:$PATH
./configure --prefix=$PROJECT_HOME/local --enable-utf8-only
make && make install
```

### 4. MeCab Python バインディングのインストール

```bash
# 1. Virtualenv の作成とアクティベート
cd lambda-tokenizer
virtualenv env
source env/bin/activate

# 2. MeCab Python バインディングのインストール
pip install https://mecab.googlecode.com/files/mecab-python-0.996.tar.gz -t $PROJECT_HOME/lib
```

### 5. tokenizer.py
Python のランタイムが起動する際に MeCab のライブラリパスを通す必要があります。そのため MeCab の形態素解析処理機能を使用した Python コードは、メインの lambda_function.py からは切り離して実行モジュールとして作成します。

```python
# coding=utf-8
import os
import sys
import MeCab
import json

dicdir = os.path.join(os.getcwd(), 'local', 'lib', 'mecab', 'dic', 'ipadic')
rcfile = os.path.join(os.getcwd(), 'local', 'etc', 'mecabrc')

DEFAULT_STOPTAGS = ['BOS/EOS']

def get_part_of_speech(feature):
    return '-'.join([v for v in feature.split(',')[:4] if v != '*'])

def get_reading(feature):
    return feature.split(',')[7]

def get_base_form(feature):
    return feature.split(',')[6]

def tokenize(sentence, stoptags=[], unk_feature=False):
    stoptags += DEFAULT_STOPTAGS

    options = ["-d{}".format(dicdir), "-r{}".format(rcfile),]

    if unk_feature:
        options.append('--unk-feature 未知語,*,*,*,*,*,*,*,*')

    t = MeCab.Tagger(" ".join(options))
    m = t.parseToNode(sentence)

    tokens = []
    while m:
        feature = m.feature + ',*,*'
        part_of_speech = get_part_of_speech(feature)
        reading = get_reading(feature)
        base_form = get_base_form(feature)

        token = {
            "surface": m.surface,
            "feature": m.feature,
            "pos": part_of_speech,
            "reading": reading,
            "baseform": base_form,
            "stat": m.stat,
        }

        if part_of_speech not in stoptags:
            tokens.append(token)
        m = m.next

    return {"tokens": tokens}


if __name__ == '__main__':
    sentence = sys.argv[1]
    stoptags = sys.argv[2].split(',')
    unk_feature = True if sys.argv[3] == 'True' else False
    tokens = tokenize(sentence, stoptags, unk_feature)
    print(json.dumps(tokens, ensure_ascii=False, indent=2))
```

### 5. lambda_function.py
メインの lambda_function.py から、サブプロセスとして、MeCab のライブラリパスを通しつつ tokenizer.py 呼び出します。

```python
# coding=utf-8
import os
import subprocess
import json
import collections

libdir = os.path.join(os.getcwd(), 'local', 'lib')

def force_utf8(data):
    if isinstance(data, basestring):
        return data.encode('utf-8')
    elif isinstance(data, collections.Mapping):
        return dict(map(force_utf8, data.iteritems()))
    elif isinstance(data, collections.Iterable):
        return type(data)(map(force_utf8, data))
    else:
        return data

def lambda_handler(event, context):
    event = force_utf8(event)
    params = {
        "libdir": libdir,
        "sentence": event.get('sentence', ''),
        "stoptags": event.get('stoptags', ''),
        "unk_feature": event.get('unk_feature', False)
    }

    command = 'LD_LIBRARY_PATH={libdir} python tokenizer.py "{sentence}" "{stoptags}" "{unk_feature}"'.format(**params)
    tokens = subprocess.check_output(command, shell=True)

    return json.loads(tokens)
```

### exclude.lst
ZIP ファイル作成時に除外するファイルの一覧を作成します。

```
*.dist-info/*
*.egg-info
*.pyc
env/*
exclude.lst
lambda_function.zip
lib/*
local/bin/*
local/include/*
local/libexec/*
local/share/*
```

### ディプロイパッケージの作成（lambda_function.zip）
最後に、ディプロイパッケージの作成です。基本的には作成した Python モジュール、MeCab の Python モジュール、MeCab のライブラリと辞書を１つの Zip ファイルとして作成します。

```bash
# 1. ベースファイルをZIPへ追加
cd $PROJECT_HOME
zip -r9 lambda_function.zip * -x@exclude.lst

# 2. Python モジュールをZIPへ追加
cd $PROJECT_HOME/lib
zip -r9 ../lambda_function.zip * -x@../exclude.lst
```

## まとめ
AWS Lambda で MeCab が使用できると、AML で使用する文章データの変換をサーバーレスで実装したりすることが可能になります。（例えば、S3 → S3 とか）

### 実装するポイント

* ディプロイパッケージ作成環境を EC2 で構築する
* ネイティブコード呼び出す Python モジュールは別モジュールにする
* メインの Lambda Function からそのモジュールを呼び出す際はライブラリパスを通す

といった感じです。

今回実装したサンプルコードは、除外する品詞も指定できます。そのため、AML で使用する際はその文章の特徴が出そうな一般名詞、固有名詞だけを抽出するなどしてさらに精度を向上させることができます。ぜひカスタマイズして使用してみてください。

なお、上記のコード一式は GitHub へアップしています。

GitHub: [aws-lambda-ja-tokenizer](https://github.com/KunihikoKido/aws-lambda-ja-tokenizer)
