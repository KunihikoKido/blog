# AWS Lambda で MeCab を動かす【改】
木戸です。

前回ご紹介した「[ AWS Lambda で MeCab を動かす](http://dev.classmethod.jp/cloud/aws-lambda-with-mecab/)」のエントリですが、通りすがりの shogo82148 さんに素敵なプルリクエストをいただきました。今回はそのご紹介です。

## 改善点
改善点は以下の２点です。

* 「**外部プロセス起動をやめて高速化**」
	* MeCab は非常に高速なのですが、外部プロセス起動をやめることでさらに高速化しています。
* 「**OS コマンドインジェクションの危険性の改善**」
	* Amazon API Gateway などで外部に公開した場合の OS コマンドインジェクションの危険性を改善しています。


## ソースの解説
前回ご紹介したサンプルコードでは、``LD_LIBRARY_PATH`` を使って ``import MeCab`` 時に ``libmecab.so`` ライブラリを見つけられるようにするため、外部プロセスとして起動していました。（そもそも、Lambda handler 起動する前に ``LD_LIBRATY_PATH`` 設定できればこんなことしなくても良いのですが。）

改善後は、``import MeCab`` する前に ``ctypes.cdll.LoadLibrary`` を使って ``libmecab.so`` ライブラリを直接読み込みます。そうすることで ``LD_LIBRARY_PATH`` が設定されていなくても MeCab のモジュールとそのライブラリがリンクできるようになっています。そのため上記の改善と MeCab を実行するモジュールを外部に切り出す必要も無くなり、``lambda_function.py`` と  ``tokenize.py`` モジュールが統合され、コード的にもかなりシンプルになっています！

_lambda_function.py （tokenize.py 統合）_

```python
# coding=utf-8
import os
import settings

import logging
logger = logging.getLogger(__name__)
logger.setLevel(settings.LOG_LEVEL)

# preload libmecab
import ctypes
libdir = os.path.join(os.getcwd(), 'local', 'lib')
libmecab = ctypes.cdll.LoadLibrary(os.path.join(libdir, 'libmecab.so'))

import MeCab

# prepare Tagger
dicdir = os.path.join(os.getcwd(), 'local', 'lib', 'mecab', 'dic', 'ipadic')
rcfile = os.path.join(os.getcwd(), 'local', 'etc', 'mecabrc')
default_tagger = MeCab.Tagger("-d{} -r{}".format(dicdir, rcfile))
unk_tagger = MeCab.Tagger("-d{} -r{} --unk-feature 未知語,*,*,*,*,*,*,*,*".format(dicdir, rcfile))

DEFAULT_STOPTAGS = ['BOS/EOS']

def lambda_handler(event, context):
    sentence = event.get('sentence', '').encode('utf-8')
    stoptags = event.get('stoptags', '').encode('utf-8').split(',') + DEFAULT_STOPTAGS
    unk_feature = event.get('unk_feature', False)

    tokens = []
    tagger = unk_tagger if unk_feature else default_tagger
    node = tagger.parseToNode(sentence)
    while node:
        feature = node.feature + ',*,*'
        part_of_speech = get_part_of_speech(feature)
        reading = get_reading(feature)
        base_form = get_base_form(feature)
        token = {
            "surface": node.surface.decode('utf-8'),
            "feature": node.feature.decode('utf-8'),
            "pos": part_of_speech.decode('utf-8'),
            "reading": reading.decode('utf-8'),
            "baseform": base_form.decode('utf-8'),
            "stat": node.stat,
        }

        if part_of_speech not in stoptags:
            tokens.append(token)
        node = node.next
    return {"tokens": tokens}

def get_part_of_speech(feature):
    return '-'.join([v for v in feature.split(',')[:4] if v != '*'])

def get_reading(feature):
    return feature.split(',')[7]

def get_base_form(feature):
    return feature.split(',')[6]
```

## まとめ
AWS Lambda Python で ``LD_LIBRARY_PATH`` の設定が必要な時は、``ctypes.cdll.LoadLibrary`` で直接読み込んでしまおう！ということで。

## 参考
* <a href="https://github.com/KunihikoKido/aws-lambda-ja-tokenizer" target="_blank">Github: KunihikoKido/aws-lambda-ja-tokenizer</a>
* <a href="http://dev.classmethod.jp/cloud/aws-lambda-with-mecab/" target="_blank">AWS Lambda で MeCab を動かす</a>
