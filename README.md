# Docs HOWTO
[![Build Status](https://travis-ci.org/KunihikoKido/myblog.svg?branch=master)](https://travis-ci.org/KunihikoKido/myblog)

## Conditions of use
このプロジェクトは、 [Kunihiko Kido](https://github.com/KunihikoKido) 個人のブログ記事校正及びビルドプロセスのために公開されています。

このビルドプロセスによって作成された記事は、[Kunihiko Kido](https://github.com/KunihikoKido) が所有するブログまたは、http://dev.classmethod.jp 上でのみ公開可能です。他のウェブサイトまたはメディア上での公開は、当者の許可なしにはできませんのでご注意ください。

## Building documentation
ローカルの Mac OSX 向けにドキュメントのビルド環境構築とビルド手順について説明します。

### Setup local machine
まずはじめに、ドキュメントのビルド（HTML、PDFの作成）及び文章の規約チェックに必要な各種コマンドラインベースのツールをインストールします。

* gitbook cli：ドキュメントのビルドツール
* redpen：技術文書規約検査ツール

```bash
# 1. install gitbook cli
npm install -g gitbook-cli

# 2. install redpen
brew install redpen
```

次に、このプロジェクトのリポジトリのクローンを作成します。

```bash
# 1. clone this repository
git clone https://github.com/KunihikoKido/docs.git docs
```

以上で、ローカル環境のセットアップは完了です。

### Make standalone HTML files
HTML ファイルを作成するには、以下の手順で作成します。

```bash
# 1. change directory to project root.
cd docs

# 2. make standalone HTML files.
make html

# 3. open html in brawser
open _build/html/index.html
```

### Make pdf file
PDF ファイルを作成するには、以下の手順で作成します。

```bash
# 1. change directory to project root.
cd docs

# 2. make pdf file.
make html

# 3. open pdf in preview app.
open _build/docs.pdf
```

### Check document
文章の規約をチェックするには以下のコマンドを実行します。

```bash
# 1. change directory to project root.
cd docs

# 2. make pdf file.
make check
```

規約に沿っていない文章がある場合はエラーが出力されますので、その内容を参考に校正してください。
