#!/bin/bash

echo "🚀 遊戯王DB用Chrome起動スクリプト"
echo ""

# プロファイルディレクトリの確認・作成
PROFILE_DIR="/home/tomo/work/app/YGO_deck_extension/chrome-profile"

if [ ! -d "$PROFILE_DIR" ]; then
    echo "📁 プロファイルディレクトリを作成中..."
    mkdir -p "$PROFILE_DIR"
    echo "✅ プロファイルディレクトリ作成完了: $PROFILE_DIR"
else
    echo "📁 既存プロファイルディレクトリ: $PROFILE_DIR"
fi

echo ""
echo "🔧 Chrome起動オプション:"
echo "   --user-data-dir=$PROFILE_DIR"
echo "   --no-sandbox"
echo "   --disable-dev-shm-usage"
echo ""

# WSL環境でのChrome起動試行
echo "🌐 WSL環境でのChrome起動を試行中..."

# DISPLAYの設定を試行
export DISPLAY=:0.0

# Chromeの起動
if command -v google-chrome &> /dev/null; then
    echo "✅ google-chrome コマンドが見つかりました"
    
    # バックグラウンドで起動
    echo "🚀 Chrome起動中..."
    google-chrome \
        --user-data-dir="$PROFILE_DIR" \
        --no-sandbox \
        --disable-dev-shm-usage \
        --disable-gpu \
        --remote-debugging-port=9222 \
        --new-window \
        "https://www.db.yugioh-card.com/yugiohdb/" &
    
    CHROME_PID=$!
    echo "🔍 Chrome PID: $CHROME_PID"
    
    # 少し待機してプロセス確認
    sleep 3
    
    if ps -p $CHROME_PID > /dev/null; then
        echo "✅ Chrome起動成功"
        echo ""
        echo "📋 次の手順:"
        echo "   1. Chromeブラウザでログインを完了"
        echo "   2. 全てのChromeウィンドウを閉じる"
        echo "   3. 以下のコマンドを実行:"
        echo "      node ygo-db-session-reuse.js"
        echo ""
        echo "⏳ Chrome起動完了を待機中..."
        wait $CHROME_PID
    else
        echo "❌ Chrome起動に失敗しました"
        echo ""
        echo "🔧 代替手順："
        echo "   1. Windowsで通常のChromeを起動"
        echo "   2. 以下のフラグでChromeを起動:"
        echo "      chrome.exe --user-data-dir=\"$(wslpath -w $PROFILE_DIR)\""
        echo "   3. 遊戯王DBにログイン"
        echo "   4. Chromeを完全終了"
        echo "   5. WSLで以下を実行:"
        echo "      node ygo-db-session-reuse.js"
    fi
    
elif command -v chromium-browser &> /dev/null; then
    echo "✅ chromium-browser コマンドが見つかりました"
    
    chromium-browser \
        --user-data-dir="$PROFILE_DIR" \
        --no-sandbox \
        --disable-dev-shm-usage \
        --disable-gpu \
        --remote-debugging-port=9222 \
        --new-window \
        "https://www.db.yugioh-card.com/yugiohdb/" &
    
    CHROME_PID=$!
    echo "🔍 Chromium PID: $CHROME_PID"
    wait $CHROME_PID
    
else
    echo "❌ Chrome/Chromiumが見つかりません"
    echo ""
    echo "🔧 手動での起動手順:"
    echo ""
    echo "📋 Windows側で以下のコマンドを実行してください:"
    echo "   (PowerShellまたはコマンドプロンプトで)"
    echo ""
    echo "   chrome.exe --user-data-dir=\"$(wslpath -w $PROFILE_DIR)\" --new-window https://www.db.yugioh-card.com/yugiohdb/"
    echo ""
    echo "   または"
    echo ""
    echo "   \"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe\" --user-data-dir=\"$(wslpath -w $PROFILE_DIR)\" --new-window https://www.db.yugioh-card.com/yugiohdb/"
    echo ""
    echo "📋 その後:"
    echo "   1. 遊戯王DBでログイン完了"
    echo "   2. Chromeを完全終了"
    echo "   3. WSLで: node ygo-db-session-reuse.js"
fi

echo ""
echo "📁 プロファイルパス情報:"
echo "   WSL: $PROFILE_DIR"
echo "   Windows: $(wslpath -w $PROFILE_DIR 2>/dev/null || echo 'wslpath not available')"
echo ""