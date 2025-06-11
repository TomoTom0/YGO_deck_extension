#!/usr/bin/env python3
"""
ハイブリッド分析: 最初に対話的ログイン、その後ヘッドレスで自動分析
"""

import os
import sys
import time
from pathlib import Path
from dotenv import load_dotenv

# プロジェクトルートをPythonパスに追加
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from src.interactive_login import InteractiveLoginAnalyzer
from src.session_manager import SessionManager, HeadlessAnalyzer
from src.utils.logger import setup_logger


class HybridAnalyzer:
    """ハイブリッド分析クラス"""
    
    def __init__(self):
        load_dotenv()
        self.logger = setup_logger()
        self.session_manager = SessionManager()
        
        self.username = os.getenv('YGO_USERNAME')
        self.password = os.getenv('YGO_PASSWORD')
        
        if not self.username or not self.password:
            self.logger.error("ログイン情報が設定されていません。.envファイルを確認してください。")
            raise ValueError("ログイン情報が必要です")
    
    def interactive_login_and_save_session(self) -> bool:
        """対話的ログインを行い、セッションを保存"""
        self.logger.info("=== 対話的ログインフェーズ ===")
        
        try:
            # InteractiveLoginAnalyzerを少し修正して使用
            analyzer = ModifiedInteractiveAnalyzer(self.session_manager)
            return analyzer.run()
            
        except Exception as e:
            self.logger.error(f"対話的ログインエラー: {e}")
            return False
    
    def headless_analysis(self) -> bool:
        """ヘッドレスモードで詳細分析"""
        self.logger.info("=== ヘッドレス分析フェーズ ===")
        
        try:
            analyzer = HeadlessAnalyzer(self.session_manager)
            return analyzer.analyze_with_session()
            
        except Exception as e:
            self.logger.error(f"ヘッドレス分析エラー: {e}")
            return False
    
    def run(self):
        """ハイブリッド分析を実行"""
        self.logger.info("ハイブリッド分析を開始します")
        
        # Step 1: セッションの確認
        headless_analyzer = HeadlessAnalyzer(self.session_manager)
        
        # 既存セッションで試行
        try:
            self.logger.info("既存セッションでの分析を試行中...")
            driver = headless_analyzer.setup_driver(headless=True)
            
            if (self.session_manager.load_session(driver) and 
                self.session_manager.verify_session(driver)):
                
                self.logger.info("既存セッションが有効です。ヘッドレス分析を開始します。")
                driver.quit()
                
                if self.headless_analysis():
                    self.logger.info("ヘッドレス分析が完了しました")
                    return True
                
            driver.quit()
            
        except Exception as e:
            self.logger.debug(f"既存セッション確認エラー: {e}")
        
        # Step 2: 対話的ログイン
        self.logger.info("対話的ログインが必要です")
        if not self.interactive_login_and_save_session():
            self.logger.error("対話的ログインに失敗しました")
            return False
        
        # Step 3: ヘッドレス分析
        if not self.headless_analysis():
            self.logger.error("ヘッドレス分析に失敗しました")
            return False
        
        self.logger.info("ハイブリッド分析が完了しました")
        return True


class ModifiedInteractiveAnalyzer(InteractiveLoginAnalyzer):
    """セッション保存機能付きの対話的分析"""
    
    def __init__(self, session_manager: SessionManager):
        super().__init__()
        self.session_manager = session_manager
    
    def run(self):
        """セッション保存を含む対話的分析"""
        try:
            self.setup_driver()
            
            # ログインページに移動
            self.logger.info(f"ログインページに移動: {self.login_url}")
            self.driver.get(self.login_url)
            
            # 自動でユーザー名とパスワードを入力
            from selenium.webdriver.support.ui import WebDriverWait
            from selenium.webdriver.support import expected_conditions as EC
            from selenium.webdriver.common.by import By
            
            wait = WebDriverWait(self.driver, 10)
            
            username_field = wait.until(
                EC.presence_of_element_located((By.NAME, "userid"))
            )
            username_field.clear()
            username_field.send_keys(self.username)
            
            password_field = self.driver.find_element(By.NAME, "password")
            password_field.clear()
            password_field.send_keys(self.password)
            
            self.logger.info("ユーザー名とパスワードを入力しました")
            
            # ログインボタンをクリック
            login_button = self.driver.find_element(By.CSS_SELECTOR, "input[type='submit']")
            login_button.click()
            
            self.logger.info("ログインボタンをクリックしました")
            time.sleep(3)
            
            # 画像選択が必要かチェック
            current_url = self.driver.current_url
            self.logger.info(f"現在のURL: {current_url}")
            
            if "member_login" not in current_url and "login" not in current_url.lower():
                # ログイン後の画面を分析
                self.analyze_image_selection_page()
                
                # 手動で画像選択
                self.logger.info("\n" + "="*50)
                self.logger.info("【重要】画像選択を手動で行ってください:")
                self.logger.info("1. 中央の画像と同じキャラクターの画像をすべて選択")
                self.logger.info("2. 次へ進むボタンをクリック")
                self.logger.info("3. ログインが完了するまで操作を続ける")
                self.logger.info("="*50 + "\n")
                
                self.wait_for_manual_action("ログインが完了したら")
                
                # ログイン成功を確認
                time.sleep(2)
                current_url = self.driver.current_url
                self.logger.info(f"ログイン後のURL: {current_url}")
                
                if "member_login" not in current_url and "login" not in current_url.lower():
                    # セッションを保存
                    if self.session_manager.save_session(self.driver):
                        self.logger.info("✓ セッションの保存に成功しました")
                    else:
                        self.logger.warning("セッションの保存に失敗しました")
                    
                    # デッキページに移動して確認
                    deck_url = f"{self.base_url}/yugiohdb/deck_list.action"
                    self.logger.info(f"デッキページで動作確認: {deck_url}")
                    self.driver.get(deck_url)
                    time.sleep(2)
                    
                    self.driver.save_screenshot(str(self.output_dir / 'login_success_deck_page.png'))
                    
                    self.logger.info("✓ ログインに成功しました")
                    return True
                else:
                    self.logger.error("ログインに失敗しました")
                    return False
            else:
                self.logger.error("ログインページから移動できませんでした")
                return False
            
        except Exception as e:
            self.logger.error(f"エラーが発生しました: {e}")
            if self.driver:
                self.driver.save_screenshot(str(self.output_dir / 'error.png'))
            return False
        finally:
            if self.driver:
                self.logger.info("ブラウザを閉じます...")
                time.sleep(2)  # セッション保存のため少し待機
                self.driver.quit()


if __name__ == "__main__":
    analyzer = HybridAnalyzer()
    success = analyzer.run()
    
    if success:
        print("✓ ハイブリッド分析が完了しました")
        print("  - data/interactive/ : 対話的ログインの結果")
        print("  - data/headless_analysis/ : ヘッドレス分析の結果")
        print("  - data/sessions/ : 保存されたセッション")
    else:
        print("✗ ハイブリッド分析に失敗しました")