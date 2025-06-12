#!/bin/bash

# Chrome拡張機能の自動インストールスクリプト
# 注意: このスクリプトは開発者モードが既に有効な場合のみ動作します

echo "🎮 遊戯王DBデッキサポート - Chrome拡張機能インストール"
echo "=============================================="

# 拡張機能のパスを取得
EXTENSION_PATH="$(cd "$(dirname "$0")/src" && pwd)"
echo "📁 拡張機能パス: $EXTENSION_PATH"

# manifest.jsonの存在確認
if [ ! -f "$EXTENSION_PATH/manifest.json" ]; then
    echo "❌ エラー: manifest.jsonが見つかりません"
    exit 1
fi

echo "✅ manifest.json確認完了"

# Chromeのプロファイルパスを検出
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    CHROME_PROFILE="$HOME/.config/google-chrome/Default"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    CHROME_PROFILE="$HOME/Library/Application Support/Google/Chrome/Default"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    CHROME_PROFILE="$USERPROFILE/AppData/Local/Google/Chrome/User Data/Default"
fi

echo "🔍 Chromeプロファイル: $CHROME_PROFILE"

# 手動での追加手順を表示
echo ""
echo "📋 手動インストール手順:"
echo "1. Chromeで chrome://extensions/ を開く"
echo "2. 右上の「開発者モード」を有効化"
echo "3. 「パッケージ化されていない拡張機能を読み込む」をクリック"
echo "4. 以下のフォルダを選択:"
echo "   $EXTENSION_PATH"
echo ""

# ブラウザを開く
if command -v google-chrome &> /dev/null; then
    echo "🌐 Chrome拡張機能ページを開いています..."
    google-chrome "chrome://extensions/" &
elif command -v chromium-browser &> /dev/null; then
    echo "🌐 Chromium拡張機能ページを開いています..."
    chromium-browser "chrome://extensions/" &
else
    echo "⚠️  Chromeが見つかりません。手動でchrome://extensions/を開いてください"
fi

echo "✨ インストール準備完了！"