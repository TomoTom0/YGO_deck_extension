#!/usr/bin/env python3
"""
遊戯王DB公式サイト構造調査メインスクリプト
"""

import os
import sys
import logging
from pathlib import Path
from dotenv import load_dotenv

# プロジェクトルートをPythonパスに追加
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from src.site_analyzer import YGOSiteAnalyzer
from src.utils.logger import setup_logger

def main():
    """メイン処理"""
    # 環境変数を読み込み
    load_dotenv()
    
    # ログの設定
    logger = setup_logger()
    logger.info("遊戯王DB公式サイト調査を開始します")
    
    try:
        # 環境変数の確認
        username = os.getenv('YGO_USERNAME')
        password = os.getenv('YGO_PASSWORD')
        
        if not username or not password:
            logger.error("ログイン情報が設定されていません。.envファイルを確認してください。")
            return 1
        
        # サイト分析器を初期化
        analyzer = YGOSiteAnalyzer(username, password)
        
        # 分析実行
        analyzer.run_analysis()
        
        logger.info("調査が完了しました")
        return 0
        
    except KeyboardInterrupt:
        logger.info("調査が中断されました")
        return 1
    except Exception as e:
        logger.error(f"エラーが発生しました: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())