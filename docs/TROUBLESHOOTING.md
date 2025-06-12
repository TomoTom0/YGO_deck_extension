# 🔧 Chrome拡張機能 トラブルシューティングガイド

## ❌ **拡張機能が読み込まれない場合**

### **チェックリスト：**

#### **1. 基本確認**
- [ ] `chrome://extensions/` を開いている
- [ ] 右上の「開発者モード」がONになっている
- [ ] 正しいフォルダを選択している: `/home/tomo/work/app/YGO_deck_extension/src`

#### **2. フォルダ選択時の注意**
- [ ] `src` フォルダ**自体**を選択（中身ではない）
- [ ] フォルダに `manifest.json` が直接入っている
- [ ] 他の拡張機能フォルダと間違えていない

#### **3. 権限・セキュリティ**
- [ ] フォルダの読み取り権限がある
- [ ] Chrome がフォルダにアクセスできる
- [ ] ウイルス対策ソフトがブロックしていない

#### **4. Chrome設定**
- [ ] Chrome が最新版である
- [ ] 他の拡張機能が干渉していない
- [ ] Chromeのポリシー設定で拡張機能が禁止されていない

## 🛠️ **詳細な対処法**

### **方法1: Chromeの再起動**
```bash
# Chromeを完全に終了してから再起動
pkill chrome
google-chrome
```

### **方法2: 別の方法で読み込み**
1. 拡張機能ページで「更新」ボタンをクリック
2. 既存の拡張機能を削除してから再読み込み
3. Chrome を管理者権限で実行

### **方法3: パッケージ化して読み込み**
```bash
# 拡張機能をパッケージ化
cd /home/tomo/work/app/YGO_deck_extension
zip -r ygo-extension.zip src/
```

### **方法4: エラーログの確認**
1. `chrome://extensions/` で「エラー」をチェック
2. Chrome DevTools Console でエラー確認
3. `chrome://extensions/` の詳細ページでエラー表示

## 🎯 **手動での確認手順**

### **ステップ1: フォルダ内容の確認**
```bash
ls -la /home/tomo/work/app/YGO_deck_extension/src/
# 以下が表示されるはず:
# manifest.json
# js/
# css/
# images/
# popup.html
# options.html
```

### **ステップ2: manifest.json の確認**
```bash
head -10 /home/tomo/work/app/YGO_deck_extension/src/manifest.json
# 以下が表示されるはず:
# {
#   "name": "遊戯王DBデッキサポート",
#   "version": "3.0.0",
#   "manifest_version": 3,
#   ...
```

### **ステップ3: Chrome拡張機能ページでの操作**
1. `chrome://extensions/` を開く
2. 右上の「開発者モード」をON
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. **重要**: `/home/tomo/work/app/YGO_deck_extension/src` フォルダを選択
5. 「選択」ボタンをクリック

### **ステップ4: 成功時の表示**
拡張機能が正常に読み込まれると：
- 拡張機能一覧に「遊戯王DBデッキサポート」が表示
- バージョン「3.0.0」が表示
- エラーマークがない
- ON/OFFスイッチが表示される

## 🚨 **よくあるエラーと対処法**

### **エラー: "Invalid manifest"**
- manifest.json の構文エラー
- 対処: JSON構文チェックツールで確認

### **エラー: "Could not load extension"**
- ファイル権限の問題
- 対処: `chmod -R 755 src/` で権限を設定

### **エラー: "This extension is not from Chrome Web Store"**
- 正常な警告（開発版のため）
- 対処: 「読み込む」をクリックして続行

### **エラー: 拡張機能は表示されるが動作しない**
- コンテンツスクリプトの問題
- 対処: 対象サイトでF12コンソールエラーを確認

## 📞 **それでも解決しない場合**

1. **Chrome のバージョン確認**
   ```
   chrome://settings/help
   ```

2. **新しいChromeプロファイルで試す**
   ```
   google-chrome --user-data-dir=/tmp/test-profile
   ```

3. **別のブラウザで試す**
   - Chromium
   - Microsoft Edge (Chromium版)

4. **ログファイルの確認**
   ```
   ~/.config/google-chrome/Default/Extensions/
   ```