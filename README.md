# My Blog
[![Build Status](https://travis-ci.org/KunihikoKido/myblog.svg?branch=master)](https://travis-ci.org/KunihikoKido/myblog)

## Conditions of use
このプロジェクトは、 [Kunihiko Kido](https://github.com/KunihikoKido) 個人のブログ記事校正及びビルドプロセスのために公開されています。

このビルドプロセスによって作成された記事は、[Kunihiko Kido](https://github.com/KunihikoKido) が所有するブログまたは、http://dev.classmethod.jp 上でのみ公開可能です。他のウェブサイトまたはメディア上での公開は、当者の許可なしにはできませんのでご注意ください。

## Building documentation
### Setup local machine

```
# 1. install gitbook cli
npm install -g gitbook-cli

# 2. install redpen
brew install redpen

# 3. clone this repository
git clone https://github.com/KunihikoKido/myblog.git
```

### Commands
#### make check
run the redpen command.

#### make html
make standalone HTML files.

#### make pdf
make pdf file
