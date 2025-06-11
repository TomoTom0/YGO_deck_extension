"""
ログ設定ユーティリティ
"""

import os
import logging
from pathlib import Path


def setup_logger() -> logging.Logger:
    """メインロガーを設定"""
    
    # ログレベルを環境変数から取得
    log_level = os.getenv('LOG_LEVEL', 'INFO').upper()
    
    # ログファイルパスを設定
    log_file = os.getenv('LOG_FILE', 'logs/research.log')
    log_path = Path(log_file)
    log_path.parent.mkdir(exist_ok=True)
    
    # ロガーを設定
    logger = logging.getLogger('ygo_research')
    logger.setLevel(getattr(logging, log_level))
    
    # 既存のハンドラーをクリア
    if logger.handlers:
        logger.handlers.clear()
    
    # フォーマッターを設定
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # ファイルハンドラーを追加
    file_handler = logging.FileHandler(log_path, encoding='utf-8')
    file_handler.setLevel(getattr(logging, log_level))
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    
    # コンソールハンドラーを追加
    console_handler = logging.StreamHandler()
    console_handler.setLevel(getattr(logging, log_level))
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    return logger


def get_logger(name: str) -> logging.Logger:
    """指定した名前のロガーを取得"""
    return logging.getLogger(f'ygo_research.{name}')