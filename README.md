# 遊戯王デッキサポート(インポート/エクスポート)

## Abstract

このアプリは公式カードデータベースのデッキ表示画面にエクスポートボタン、インポートボタンを追加します。
**2021/02/11: Databaseを自動更新するようにしました。**

## Usage

- デッキの内容が表示されている画面でエクスポートボタンを押すと、.ydkファイル(ADSのデッキ形式)としてダウンロードします。

![](intro/export.gif)

- デッキ編集画面でインポートボタンを押して.ydkファイルを選択すると、その内容が自動で入力されます。
- **2021/02/11: 現在は入力は英語名で行われますが、そのまま保存すれば問題は生じません。** (英語名または日本語名が正式に決まっていないカードのみ除外されます。)
![](intro/import.gif)


## Install

### Chrome Store
Chrome Storeの[遊戯王デッキサポート](https://chrome.google.com/webstore/detail/jdgobeohbdmglcmgblpodggmgmponihc)からインストールできます。

### GitHub
GitHubから本拡張機能をインストールする場合、以下の手順になります。
1. [zip形式などでダウンロード](https://github.com/TomoTom0/YGO_deck_extension/archive/main.zip)する。
2. Chromeの拡張機能管理画面に移動して「**パッケージ化されていない拡張機能を読み込む**」

## Caution

発表直後のカードや国内未発売のカードについては対応していない場合があります。

## Contact

- [お問い合わせ](https://docs.google.com/forms/d/e/1FAIpQLSdh2wRCUWpX6ZLfma-g5O46eD93wOPHpDHWQGxdOcJLmm_tGQ/viewform?usp=sf_link)

## License

MIT
