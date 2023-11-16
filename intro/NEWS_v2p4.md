# 遊戯王DBデッキサポート Update@v2.4

## Abstract

- デッキレシピ編集履歴、InfoエリアURL履歴の確認およびその時点への差し戻しができるようになりました。
- Header全体表示とデッキ編集を同時に行えるようになりました。
- デッキレシピスクリーンショット風の画像を作成できるようになりました。

## Deck Edit Mode

### Mouse UI

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


### Info Area

- Infoエリアを表示している状態でInfoエリアの左から3分の1をクリックすると1つ前のページに戻り、右から3分の1をクリックすると(存在するなら)1つ先のページを表示します。
- クリックでのカードの移動に関する説明は、前節の表に含んでいます。
- <img src="src/images/svg/contacts_FILL0_wght400_GRAD0_opsz24.svg" style="background:#ff9900;height:18px;"> 情報エリアの表示・非表示を切り替える

## Other Features

### Import/Export

- **Neuronアプリのデッキレシピ風の画像を作成することができます。**
    - 現在、カラーバリエーションは赤と青があり、それぞれ左/右クリックに対応しています。
    - 公開されているデッキの場合、自動的に画像下部にデッキレシピへのQRコードが追加されます。
- <img src="src/images/svg/screenshot-keyboard_FILL0_wght400_GRAD0_opsz24.svg" style="background:#ff9900;height:18px;"> デッキレシピスクリーンショット風の画像を作成する

<img src="intro/imgs/deck_recipie_screenshot.jpg" style="height:50vh;">


## Contact

- [お問い合わせ](https://docs.google.com/forms/d/e/1FAIpQLSdh2wRCUWpX6ZLfma-g5O46eD93wOPHpDHWQGxdOcJLmm_tGQ/viewform?usp=sf_link)

