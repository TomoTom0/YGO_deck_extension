#!/bin/bash

echo "🔧 Chrome拡張機能読み込み問題の修復スクリプト"
echo "================================================="

# 1. Chromeプロセスを完全終了
echo "📴 Chromeプロセスを終了中..."
pkill -f chrome
sleep 2

# 2. Chrome設定のバックアップと一時的な削除
echo "💾 Chrome設定をバックアップ中..."
if [ -d ~/.config/google-chrome ]; then
    cp -r ~/.config/google-chrome ~/.config/google-chrome-backup-$(date +%Y%m%d-%H%M%S)
    echo "✅ バックアップ完了"
fi

# 3. 新しいテスト用プロファイルでChromeを起動
echo "🚀 新しいプロファイルでChromeを起動中..."
google-chrome --user-data-dir=/tmp/chrome-test-profile --disable-web-security --disable-features=VizDisplayCompositor &

echo ""
echo "✅ 修復手順完了！"
echo ""
echo "📋 次の手順:"
echo "1. 新しいChromeウィンドウで chrome://extensions/ を開く"
echo "2. 開発者モードをON"
echo "3. 以下のフォルダを読み込み:"
echo "   /home/tomo/Desktop/chrome-extension/src"
echo ""
echo "💡 元のChromeに戻すには:"
echo "   pkill chrome"
echo "   google-chrome"