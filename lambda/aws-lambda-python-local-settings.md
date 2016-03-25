# AWS Lambda Python 実行環境によって設定を切り替える

こんにちは、木戸です。

最近では、[python-lambda-local](https://github.com/HDE/python-lambda-local) など、ローカル環境で Lambda ファンクションをエミュレート実行する便利なライブラリなど公開されています。

これらのライブラリを使用して、ファンクションを実装していると、ローカル環境実行時と AWS Lamda 環境実行時で Debug Level を変更したかったり、その他例えば接続先 S3 のバケット名を変更したかったりと、実行する環境によって各種設定情報を変更したい場合が多々あります。

_一般的によく使われていそうな手法_

* S3 に環境変数ファイルを配置する方法
* Lambda Configuration の Description に JSON でパラメータを渡す方法

今回はもう少し簡単に環境変数を切り替える方法として、Python で見かける設定ファイルの切り替え方法を Lambda ファンクション開発を前提にご紹介します。

## 仕組み
今回ご紹介する仕組みは、プロダクション（AWS Lambda）の環境設定を管理するモジュール（settings.py）と、開発時固有の設定を管理するモジュール（local_settings.py）を用意して、ディプロイパッケージ作成時に local_settings.py を除外することで設定の切り替えを実現します。

## 構築例
### プロジェクト構成
プロジェクトの構成は以下のような構成です。

```bash
myfunction
├── lambda_function.py		# Lambda function module
├── settings.py				# settings module
├── local_settings.py		# local settings module
└── exclude.lst				# exclude files for bundle zip
```

### 各種ファイルについて

#### lambda_function.py
Lambda ファンクションのメインのファイルです。このファイルでは、Lmabda handler を定義してメインの処理をいつものようにコーディングします。

各種設定情報を参照するには `settings.py` モジュールをインポートして参照します。

```python
import json
import settings
import logging
logger = logging.getLogger(__name__)
logger.setLevel(settings.LOG_LEVEL)

def lambda_handler(event, context):
	logger.debug(json.dumps(event, ensure_ascii=False, indent=2))
```

#### settings.py
Lambda ファンクションの設定ファイルです。本番環境で使用する各種設定情報を定義します。

以下の例では、``LOG_LEVEL`` を ``INFO`` に設定しています。

```python
# local_settings.py のインポートは必ずファイルの最後に記述すること。
import logging

LOG_LEVEL = logging.INFO

try:
    from local_settings import *
except ImportError:
    pass
```

#### local_settings.py
これも Lambda ファンクションの設定ファイルです。ローカルマシーンで実行する際の固有の設定を定義します。

``settings.py`` では、``LOG_LEVEL`` を ``INFO`` に設定していましたが、こちらのファイルでは、``DEBUG`` に設定しています。こうすることで、ローカル環境で、ファンクションの実行するときは、``LOG_LEVEL`` 上書きされ ``DEBUG`` で動作する仕組みです。

```python
# ローカルで変更の必要がある変数のみ定義すること
import logging

LOG_LEVEL = logging.DEBUG
```

#### exclude.lst
ディプロイパッケージ（Zipファイル）作成時に除外するファイルを定義するファイルです。

```
# 必ず local_settings.py を除外すること
*.pyc
lambda_function.zip
local_settings.py
exclude.lst
```

#### ディプロイパッケージの作成
作成した ``exclude.lst`` ファイルを指定して ZIPファイルを作成します。


```bash
# 1. Create bundle zip
cd myfunction
zip -r9 lambda_function.zip * -x@exclude.lst

# 2. ZIPファイルに含まれるファイル一覧表示
zipinfo lambda_function.zip
Archive:  lambda_function.zip   580 bytes   2 files
-rw-r--r--  3.0 unx      217 tx defX 10-Feb-16 16:39 lambda_function.py
-rw-r--r--  3.0 unx      110 tx defX 10-Feb-16 16:39 settings.py
2 files, 327 bytes uncompressed, 244 bytes compressed:  25.4%
```

ディプロイパッケージには、``local_settings.py``が含まれませんので、このファイルをLambdaにアップロードして使用すれば、ローカル固有の設定は除外されて動作する仕組みです。

## まとめ
もっと良い方法があるんじゃないかと思いつつ（フィードバックを期待）、Lambda に環境変数を渡せる仕組みができたら良いのになぁ〜と期待。

## 参考
* <a href="http://dev.classmethod.jp/cloud/aws/invoke-aws-lambda-python-locally/" target="_blank">AWS Lambda Pythonをローカル環境で実行</a>
* <a href="https://github.com/HDE/python-lambda-local" target="_blank">Github: HDE/python-lambda-local</a>
