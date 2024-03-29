# 遊戯王DBデッキサポート

## Abstract

公式カードデータベースのデッキ画面にMouseUIモードやExport / Import / Sort / Shuffleボタンを追加します。

DB作成における古いOCGカードのid収集において、[ocg-card.com](https://ocg-card.com/)様を利用させていただいています。

## Deck Edit Mode

### Mouse UI

- **遊戯王DBのデッキ編集が、マスターデュエルのようにマウスを主体としたUI(MouseUI)で操作できます**。
- テキストベースとMouseUIの画面はボタンエリアの**Text/Image**で切り替えできます。
- カードの移動はマウスのクリックで行います。
- Ctrl+WheelクリックまたはCtrl+右クリックで新しいタブでカードのページを開きます。
- デッキ閲覧画面でも同様にカード画像の移動ができます。

|From|Left|Wheel|Right|
|-|-|-|-|
|Main/Extra| Sideへ移動|  (Main/Extraに)1枚追加| 削除(Tempへ)|
|Side| Main/Extraへ移動|  (Sideに)1枚追加| 削除(Tempへ)|
|Temp|Main/Extraへ移動|Main/Extraに追加|Sideに移動|
|Search, Info|Main/Extraへ追加|カードのページを開く|Sideへ追加|

<img src="intro/imgs/tutorial_MouseUI.gif" style="width:60vw;">

- <img src="src/images/svg/arrow_back_FILL0_wght400_GRAD0_opsz24.svg" style="background:#ff9900;height:18px;"> デッキ閲覧画面に戻る
- <img src="src/images/svg/toc_FILL0_wght400_GRAD0_opsz24.svg" style="background:#ff9900;height:18px;"> Headerの省略の有無を切り替える

- デッキ編集画面で画面を長押しすることで、履歴モーダルを呼び出すことができます。
    - モーダルではレシピ編集操作の履歴およびInfoエリアの履歴が表示されます。
    - いずれかの要素をクリックすると、デッキレシピ編集操作をその時点に遡ったり、そのときのInfoエリアを表示したりできます。
    - デッキレシピ編集履歴はその操作を行った時間も表示されます。
    - モーダル上でホイールスクロールを行うと、縦スクロールが横スクロールに変換されます。
    - モーダル外をクリックすると、モーダルは閉じます。

<img src="intro/imgs/modal_history.png" style="width:60vw;">

- Headerを省略せず表示する際、ボタンの左/ホイール/右クリックに応じて、HeaderがInfoエリア、(従来の)deckエリア、searchエリアで展開されます。
    - これにより、デッキレシピおよびInfoエリアないしsearchエリアを確認しながらHeaderを編集することができます。

<img src="intro/imgs/headerInInfoArea.png" style="width:60vw;">

### Deck Manager

- デッキレシピの保存、読み込みなどをページを切り替えることなく行うことができます。
    - <img src="src/images/svg/save_FILL0_wght400_GRAD0_opsz24.svg" style="background:#ff9900;height:18px;"> デッキレシピを保存する
    - <img src="src/images/svg/style_FILL0_wght400_GRAD0_opsz24.svg" style="background:#ff9900;height:18px;"> デッキレシピを読み込む
    - <img src="src/images/svg/content_copy_FILL0_wght400_GRAD0_opsz24.svg" style="background:#ff9900;height:18px;"> デッキレシピを複製する
    - <img src="src/images/svg/delete_FILL0_wght400_GRAD0_opsz24.svg" style="background:#ff9900;height:18px;"> デッキレシピを削除する
    - <img src="src/images/svg/add_FILL0_wght400_GRAD0_opsz24.svg" style="background:#ff9900;height:18px;"> 空のデッキレシピを新規作成する

- 公式の遊戯王DBとは別に、Chrome拡張機能のキャッシュ内にデッキを保存することもできます。
    - 単純な保存・読み込みなら公式DBに保存するよりも高速です。
    - Optionページでまとめて確認、削除することができます。(現時点ではOptionページで画像付きのデッキレシピを確認することはできません。)
- キャッシュデッキ機能では、デッキ名に加えてversion名を付けて版管理することができます。
    - デッキを複製して保存しておかずとも、過去のレシピと比較する必要はありません。
- デッキレシピの保存時や削除時には、`@@Auto`に`_delete_Zoodiac`のようなバージョン名で自動保存されます。

### Search Area

- カード検索エリアをデッキ編集画面右側に追加します。
- 公式のカード検索画面と同様のUI・機能を備えています。
- クリックでのカードの移動に関する説明は、前節の表に含んでいます。
- <img src="src/images/svg/search_FILL0_wght400_GRAD0_opsz24.svg" style="background:#ff9900;height:18px;"> 検索エリアの表示・非表示を切り替える

### Info Area

- 情報エリアをデッキ編集画面左側に追加します。
- ページを切り替えることなく、各カードの詳細や関連カード、Q&Aを確認できます。
    - 各カード画像をダブルクリックまたはCtrl+左クリックすることで、情報エリアでページを開きます。
    - (カード画像を除く)情報エリア内のリンクを(シングル)クリックすることで、情報エリアでページを開きます。
    - ホイールクリックすると、新しいタブで開きます。
- Infoエリアを表示している状態でInfoエリアの左から3分の1をクリックすると1つ前のページに戻り、右から3分の1をクリックすると(存在するなら)1つ先のページを表示します。
- クリックでのカードの移動に関する説明は、前節の表に含んでいます。
- <img src="src/images/svg/contacts_FILL0_wght400_GRAD0_opsz24.svg" style="background:#ff9900;height:18px;"> 情報エリアの表示・非表示を切り替える

### Fit Editor

- ページからデッキ編集に関係しない要素を排除して、デッキ編集に画面を最適化します。
- <img src="src/images/svg/fullscreen_FILL0_wght400_GRAD0_opsz24.svg" style="background:#ff9900;height:18px;"> FitモードのON/OFFを切り替える

<img src="intro/imgs/tutorial_fit.gif" style="width:60vw;">

## Other Features

### Shuffle/Sort

- Main, Extra, SideのカテゴリごとにカードをShuffle/Sortすることができます。
    - これらは保存されているカードの並び順に影響しません。
    - この機能はデッキ閲覧画面・編集画面の両方で利用できます。
- <img src="src/images/svg/shuffle_FILL0_wght400_GRAD0_opsz24.svg" style="background:#ff9900;height:18px;"> Shuffleする
- <img src="src/images/svg/sort_FILL0_wght400_GRAD0_opsz24.svg" style="background:#ff9900;height:18px;"> Sortする

### Import/Export

- デッキレシピをImport/Exportすることができます。カードのパスワード(id)、カードゲームID(cid)、カード名(Name)の任意の形式を選択することができます。
    - Exportボタンの`id/cid/Name`には、左/Wheel/右クリックがそれぞれ対応しています。
    - Importの際はid、cid、カード名のいずれからなるファイルでも対応しています。(詳細な形式はExportファイルで確認してください。)
- **Neuronアプリのデッキレシピ風の画像を作成することができます。**
    - 現在、カラーバリエーションは赤と青があり、それぞれ左/右クリックに対応しています。
    - 公開されているデッキの場合、自動的に画像下部にデッキレシピへのQRコードが追加されます。
- <img src="src/images/svg/download_FILL0_wght400_GRAD0_opsz24.svg" style="background:#ff9900;height:18px;"> デッキレシピをExportする
- <img src="src/images/svg/upload_FILL0_wght400_GRAD0_opsz24.svg" style="background:#ff9900;height:18px;"> デッキレシピをImportする
- <img src="src/images/svg/screenshot_keyboard_FILL0_wght400_GRAD0_opsz24.svg" style="background:#ff9900;height:18px;"> デッキレシピスクリーンショット風の画像を作成する

<img src="intro/imgs/deck_recipie_screenshot.jpg" style="height:50vh;">

<img src="intro/imgs/tutorial_exportImport.gif" style="width:60vw;">

## Option Page

- [拡張機能のOptionページ](chrome-extension://jdgobeohbdmglcmgblpodggmgmponihc/script/options.html)で各種設定を変更できます。
- キャッシュに保存したデッキレシピを確認、削除することができます。

<img src="intro/imgs/tutorial_optionPage.png" style="width:60vw;">

## News

- 2021/02/11: Databaseを自動更新するようにしました。
- 2022/04/18: v0.8: 遊戯王DBのHTML要素についての大幅な変更に対応しました。
- 2022/04/26: v0.9: ソート機能を追加しました。シャッフル機能を追加しました。
- 2022/05/02: v0.10: Rest APIを用いてデッキレシピを保存するようになりました。DBの作成に公式遊戯王DBの情報を利用するようにしました。
- 2022/06/01: v1.0: デッキ編集画面にMouseUIモードの導入を行いました。他にもマウス操作に関する機能を多数追加しました。
- 2023/11/10: v2.0: デッキ編集画面にInfoエリアの導入を行いました。
- 2023/11/16: v2.4: デッキ編集画面で編集操作の遡り、レシピ画像の作成ができるようになりました。

## Install

### Chrome Store
Chrome Storeの[遊戯王DBデッキサポート](https://chrome.google.com/webstore/detail/jdgobeohbdmglcmgblpodggmgmponihc)からインストールできます。
[オプションページ](chrome-extension://jdgobeohbdmglcmgblpodggmgmponihc/script/options.html)で各種設定を変更できます。

### GitHub
GitHubから本拡張機能をインストールする場合、以下の手順になります。
1. [zip形式などでダウンロード](https://github.com/TomoTom0/YGO_deck_extension/archive/main.zip)し、解凍する。
2. Chromeの拡張機能管理画面に移動して「**パッケージ化されていない拡張機能を読み込む**」から、解凍したファイルのうちsrcフォルダを選択する。

## Feauture Work

- [x] マスターデュエルのようなデッキ編集画面 (-> v1.0)
- [x] データベース作成で ocg-card.com 様に依存しないようにする (->日本語・英語以外の言語への対応)
- [ ] デッキごとのフォルダ分けないしタグ付けによる管理
- [x] 編集対象のデッキの切り替えをスムーズに
- [x] デッキレシピのスクショ作成
- [x] デッキ編集画面にinfoエリアを作成し、カード効果の詳細を確認できるようにする
- [x] デッキ編集操作で戻るを追加する
- [ ] デッキ編集画面の操作履歴にカーソルを重ねると、そのときのレシピを確認できるようにする

## Contact

- [お問い合わせ](https://docs.google.com/forms/d/e/1FAIpQLSdh2wRCUWpX6ZLfma-g5O46eD93wOPHpDHWQGxdOcJLmm_tGQ/viewform?usp=sf_link)

## License

MIT
