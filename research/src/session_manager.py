#!/usr/bin/env python3
"""
遊戯王DBセッション管理
ユーザーが一度ログインした後、そのセッションを保存して再利用する
"""

import os
import json
import pickle
import time
from pathlib import Path
from typing import Optional, Dict, List
from datetime import datetime, timedelta

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from .utils.logger import get_logger


class SessionManager:
    """セッション管理クラス"""
    
    def __init__(self):
        self.logger = get_logger(__name__)
        self.session_dir = Path('data/sessions')
        self.session_dir.mkdir(exist_ok=True, parents=True)
        
        self.cookie_file = self.session_dir / 'cookies.pkl'
        self.session_info_file = self.session_dir / 'session_info.json'
        
        self.base_url = os.getenv('YGO_BASE_URL', 'https://www.db.yugioh-card.com')
        self.login_url = os.getenv('YGO_LOGIN_URL', 'https://www.db.yugioh-card.com/yugiohdb/member_login.action')
    
    def save_session(self, driver: webdriver.Chrome) -> bool:
        """現在のセッションを保存"""
        try:
            # クッキーを保存
            cookies = driver.get_cookies()
            with open(self.cookie_file, 'wb') as f:
                pickle.dump(cookies, f)
            
            # セッション情報を保存
            session_info = {
                'timestamp': datetime.now().isoformat(),
                'url': driver.current_url,
                'cookie_count': len(cookies),
                'cookies': [
                    {
                        'name': c['name'],
                        'domain': c['domain'],
                        'path': c['path'],
                        'expiry': c.get('expiry')
                    }
                    for c in cookies
                ]
            }
            
            with open(self.session_info_file, 'w', encoding='utf-8') as f:
                json.dump(session_info, f, ensure_ascii=False, indent=2)
            
            self.logger.info(f"セッションを保存しました: {len(cookies)}個のクッキー")
            return True
            
        except Exception as e:
            self.logger.error(f"セッション保存エラー: {e}")
            return False
    
    def load_session(self, driver: webdriver.Chrome) -> bool:
        """保存されたセッションを読み込み"""
        try:
            if not self.cookie_file.exists():
                self.logger.warning("保存されたセッションが見つかりません")
                return False
            
            # セッション情報を確認
            if self.session_info_file.exists():
                with open(self.session_info_file, 'r', encoding='utf-8') as f:
                    session_info = json.load(f)
                
                # セッションの有効期限を確認（24時間）
                saved_time = datetime.fromisoformat(session_info['timestamp'])
                if datetime.now() - saved_time > timedelta(hours=24):
                    self.logger.warning("セッションが古すぎます（24時間以上）")
                    return False
            
            # まずベースURLにアクセス
            driver.get(self.base_url)
            
            # クッキーを読み込み
            with open(self.cookie_file, 'rb') as f:
                cookies = pickle.load(f)
            
            # クッキーを追加
            for cookie in cookies:
                try:
                    # expiryフィールドを調整（必要に応じて）
                    if 'expiry' in cookie and cookie['expiry']:
                        # 期限切れのクッキーはスキップ
                        if cookie['expiry'] < time.time():
                            continue
                    
                    driver.add_cookie(cookie)
                except Exception as e:
                    self.logger.debug(f"クッキー追加エラー（無視）: {e}")
            
            self.logger.info("セッションを読み込みました")
            return True
            
        except Exception as e:
            self.logger.error(f"セッション読み込みエラー: {e}")
            return False
    
    def verify_session(self, driver: webdriver.Chrome) -> bool:
        """セッションが有効か確認"""
        try:
            # デッキ一覧ページにアクセス
            deck_list_url = f"{self.base_url}/yugiohdb/deck_list.action"
            driver.get(deck_list_url)
            time.sleep(2)
            
            # ログインページにリダイレクトされていないか確認
            current_url = driver.current_url
            if "member_login" in current_url or "login" in current_url.lower():
                self.logger.warning("セッションが無効です（ログインページにリダイレクト）")
                return False
            
            # ログイン必須の要素が存在するか確認
            try:
                # デッキ関連の要素を探す
                deck_elements = driver.find_elements(By.CSS_SELECTOR, "[class*='deck'], [id*='deck']")
                if deck_elements:
                    self.logger.info("セッションは有効です")
                    return True
            except:
                pass
            
            self.logger.warning("セッションの有効性を確認できません")
            return False
            
        except Exception as e:
            self.logger.error(f"セッション確認エラー: {e}")
            return False
    
    def clear_session(self):
        """保存されたセッションをクリア"""
        try:
            if self.cookie_file.exists():
                self.cookie_file.unlink()
            if self.session_info_file.exists():
                self.session_info_file.unlink()
            self.logger.info("セッションをクリアしました")
        except Exception as e:
            self.logger.error(f"セッションクリアエラー: {e}")


class HeadlessAnalyzer:
    """ヘッドレスモードでの分析クラス"""
    
    def __init__(self, session_manager: SessionManager):
        self.session_manager = session_manager
        self.logger = get_logger(__name__)
        self.driver: Optional[webdriver.Chrome] = None
        
        self.base_url = os.getenv('YGO_BASE_URL', 'https://www.db.yugioh-card.com')
        self.output_dir = Path('data/headless_analysis')
        self.output_dir.mkdir(exist_ok=True, parents=True)
    
    def setup_driver(self, headless: bool = True) -> webdriver.Chrome:
        """ChromeDriverを設定"""
        options = Options()
        
        if headless:
            options.add_argument('--headless')
        
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-gpu')
        options.add_argument('--window-size=1920,1080')
        options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
        
        driver = webdriver.Chrome(options=options)
        driver.implicitly_wait(5)
        driver.set_page_load_timeout(30)
        
        return driver
    
    def analyze_with_session(self):
        """保存されたセッションを使用して分析"""
        try:
            # ヘッドレスモードでドライバーを起動
            self.driver = self.setup_driver(headless=True)
            
            # セッションを読み込み
            if not self.session_manager.load_session(self.driver):
                self.logger.error("セッションの読み込みに失敗しました")
                return False
            
            # セッションの有効性を確認
            if not self.session_manager.verify_session(self.driver):
                self.logger.error("セッションが無効です")
                return False
            
            # 分析対象のページ
            pages_to_analyze = [
                {
                    'url': f"{self.base_url}/yugiohdb/deck_list.action",
                    'name': 'deck_list'
                },
                {
                    'url': f"{self.base_url}/yugiohdb/deck_edit.action",
                    'name': 'deck_edit'
                },
                {
                    'url': f"{self.base_url}/yugiohdb/card_search.action",
                    'name': 'card_search'
                },
                {
                    'url': f"{self.base_url}/yugiohdb/member.action",
                    'name': 'member_page'
                }
            ]
            
            # 各ページを分析
            for page in pages_to_analyze:
                try:
                    self.logger.info(f"ページ分析開始: {page['name']}")
                    self.driver.get(page['url'])
                    time.sleep(2)
                    
                    # スクリーンショット
                    screenshot_path = self.output_dir / f"{page['name']}.png"
                    self.driver.save_screenshot(str(screenshot_path))
                    
                    # ページ情報を収集
                    page_info = {
                        'timestamp': datetime.now().isoformat(),
                        'name': page['name'],
                        'url': page['url'],
                        'actual_url': self.driver.current_url,
                        'title': self.driver.title,
                        'elements': self._analyze_page_elements()
                    }
                    
                    # 結果を保存
                    output_file = self.output_dir / f"{page['name']}_analysis.json"
                    with open(output_file, 'w', encoding='utf-8') as f:
                        json.dump(page_info, f, ensure_ascii=False, indent=2)
                    
                    self.logger.info(f"ページ分析完了: {page['name']}")
                    
                except Exception as e:
                    self.logger.error(f"ページ分析エラー {page['name']}: {e}")
            
            return True
            
        except Exception as e:
            self.logger.error(f"分析エラー: {e}")
            return False
        finally:
            if self.driver:
                self.driver.quit()
    
    def _analyze_page_elements(self) -> Dict:
        """ページ要素を分析"""
        elements = {}
        
        # 重要な要素を検索
        selectors = {
            'forms': 'form',
            'tables': 'table',
            'deck_elements': '[class*="deck"], [id*="deck"]',
            'card_elements': '[class*="card"], [id*="card"]',
            'buttons': 'input[type="submit"], button',
            'links': 'a[href*="action"]'
        }
        
        for name, selector in selectors.items():
            try:
                found = self.driver.find_elements(By.CSS_SELECTOR, selector)
                elements[name] = {
                    'count': len(found),
                    'samples': []
                }
                
                # 最初の3個のサンプルを収集
                for elem in found[:3]:
                    sample = {
                        'tag': elem.tag_name,
                        'text': elem.text[:50] if elem.text else '',
                        'class': elem.get_attribute('class'),
                        'id': elem.get_attribute('id')
                    }
                    elements[name]['samples'].append(sample)
                    
            except Exception as e:
                self.logger.debug(f"要素分析エラー {name}: {e}")
        
        return elements