#!/usr/bin/env python3
"""
遊戯王DB画像選択認証の対話的調査スクリプト
手動で画像選択を行いながら、ページ構造を詳細に分析する
"""

import os
import sys
import time
import json
from pathlib import Path
from dotenv import load_dotenv

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# プロジェクトルートをPythonパスに追加
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from src.utils.logger import setup_logger


class InteractiveLoginAnalyzer:
    """対話的ログイン分析クラス"""
    
    def __init__(self):
        load_dotenv()
        self.logger = setup_logger()
        self.driver = None
        
        self.username = os.getenv('YGO_USERNAME')
        self.password = os.getenv('YGO_PASSWORD')
        self.base_url = os.getenv('YGO_BASE_URL', 'https://www.db.yugioh-card.com')
        self.login_url = os.getenv('YGO_LOGIN_URL', 'https://www.db.yugioh-card.com/yugiohdb/member_login.action')
        
        self.output_dir = Path('data/interactive')
        self.output_dir.mkdir(exist_ok=True, parents=True)
    
    def setup_driver(self):
        """ChromeDriverを設定（ヘッドレスモードなし）"""
        options = Options()
        # ヘッドレスモードを無効化（画面表示あり）
        # options.add_argument('--headless')
        options.add_argument('--window-size=1920,1080')
        options.add_argument('--disable-dev-shm-usage')
        
        self.driver = webdriver.Chrome(options=options)
        self.driver.implicitly_wait(5)
    
    def analyze_image_selection_page(self):
        """画像選択ページを詳細に分析"""
        self.logger.info("画像選択ページの分析を開始します")
        
        # 現在のページ情報
        page_info = {
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
            'url': self.driver.current_url,
            'title': self.driver.title,
            'analysis': {}
        }
        
        # スクリーンショット
        self.driver.save_screenshot(str(self.output_dir / 'image_selection_full.png'))
        
        # ページソースを保存
        with open(self.output_dir / 'image_selection_source.html', 'w', encoding='utf-8') as f:
            f.write(self.driver.page_source)
        
        # 1. すべての画像を分析
        all_images = self.driver.find_elements(By.TAG_NAME, "img")
        page_info['analysis']['total_images'] = len(all_images)
        
        image_data = []
        for i, img in enumerate(all_images):
            try:
                data = {
                    'index': i,
                    'src': img.get_attribute('src'),
                    'alt': img.get_attribute('alt'),
                    'title': img.get_attribute('title'),
                    'class': img.get_attribute('class'),
                    'id': img.get_attribute('id'),
                    'width': img.size['width'],
                    'height': img.size['height'],
                    'location': img.location,
                    'parent_tag': img.find_element(By.XPATH, "..").tag_name,
                    'parent_class': img.find_element(By.XPATH, "..").get_attribute('class'),
                    'parent_onclick': img.find_element(By.XPATH, "..").get_attribute('onclick'),
                    'is_displayed': img.is_displayed()
                }
                
                # 祖父要素も確認
                try:
                    grandparent = img.find_element(By.XPATH, "../..")
                    data['grandparent_tag'] = grandparent.tag_name
                    data['grandparent_class'] = grandparent.get_attribute('class')
                except:
                    pass
                
                image_data.append(data)
                self.logger.info(f"画像{i}: src={data['src'][:50]}..., size={data['width']}x{data['height']}")
            except Exception as e:
                self.logger.error(f"画像{i}の分析エラー: {e}")
        
        page_info['analysis']['images'] = image_data
        
        # 2. フォーム要素を分析
        forms = self.driver.find_elements(By.TAG_NAME, "form")
        form_data = []
        for i, form in enumerate(forms):
            try:
                fdata = {
                    'index': i,
                    'action': form.get_attribute('action'),
                    'method': form.get_attribute('method'),
                    'id': form.get_attribute('id'),
                    'class': form.get_attribute('class')
                }
                form_data.append(fdata)
                self.logger.info(f"フォーム{i}: action={fdata['action']}")
            except Exception as e:
                self.logger.error(f"フォーム{i}の分析エラー: {e}")
        
        page_info['analysis']['forms'] = form_data
        
        # 3. クリック可能な要素を分析
        clickable_selectors = [
            "input[type='checkbox']",
            "input[type='radio']",
            "input[type='button']",
            "input[type='submit']",
            "button",
            "a",
            "[onclick]",
            "[style*='cursor: pointer']",
            "[style*='cursor:pointer']"
        ]
        
        clickable_elements = []
        for selector in clickable_selectors:
            try:
                elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                for elem in elements:
                    clickable_elements.append({
                        'selector': selector,
                        'tag': elem.tag_name,
                        'type': elem.get_attribute('type'),
                        'value': elem.get_attribute('value'),
                        'text': elem.text[:50] if elem.text else '',
                        'onclick': elem.get_attribute('onclick'),
                        'href': elem.get_attribute('href') if elem.tag_name == 'a' else None
                    })
            except Exception as e:
                self.logger.error(f"セレクター{selector}の分析エラー: {e}")
        
        page_info['analysis']['clickable_elements'] = clickable_elements
        
        # 4. JavaScriptを分析
        scripts = self.driver.find_elements(By.TAG_NAME, "script")
        page_info['analysis']['script_count'] = len(scripts)
        
        # 結果を保存
        with open(self.output_dir / 'image_selection_analysis.json', 'w', encoding='utf-8') as f:
            json.dump(page_info, f, ensure_ascii=False, indent=2)
        
        self.logger.info(f"分析結果を保存しました: {self.output_dir / 'image_selection_analysis.json'}")
        
        return page_info
    
    def wait_for_manual_action(self, message="手動操作を待っています..."):
        """ユーザーの手動操作を待つ"""
        self.logger.info(message)
        input("操作が完了したらEnterキーを押してください: ")
    
    def run(self):
        """対話的分析を実行"""
        try:
            self.setup_driver()
            
            # ログインページに移動
            self.logger.info(f"ログインページに移動: {self.login_url}")
            self.driver.get(self.login_url)
            
            # 自動でユーザー名とパスワードを入力
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
            
            # 画像選択ページの確認
            current_url = self.driver.current_url
            self.logger.info(f"現在のURL: {current_url}")
            
            if "member_login" not in current_url and "login" not in current_url.lower():
                self.logger.info("画像選択ページに到達したと思われます")
                
                # ページを分析
                self.analyze_image_selection_page()
                
                # 手動で画像を選択してもらう
                self.logger.info("\n" + "="*50)
                self.logger.info("画像選択を手動で行ってください:")
                self.logger.info("1. 中央の画像と同じキャラクターの画像をすべて選択")
                self.logger.info("2. 次へ進むボタンをクリック")
                self.logger.info("="*50 + "\n")
                
                self.wait_for_manual_action("画像選択を完了してください")
                
                # 選択後のページを分析
                time.sleep(2)
                self.logger.info(f"選択後のURL: {self.driver.current_url}")
                self.driver.save_screenshot(str(self.output_dir / 'after_selection.png'))
                
                # ログイン成功の確認
                if "member_login" not in self.driver.current_url:
                    self.logger.info("ログインに成功しました！")
                    
                    # デッキ編集ページに移動
                    deck_edit_url = f"{self.base_url}/yugiohdb/deck_edit.action"
                    self.logger.info(f"デッキ編集ページに移動: {deck_edit_url}")
                    self.driver.get(deck_edit_url)
                    time.sleep(3)
                    
                    self.driver.save_screenshot(str(self.output_dir / 'deck_edit_page.png'))
                else:
                    self.logger.error("ログインに失敗しました")
            
            self.wait_for_manual_action("ブラウザを閉じる準備ができたら")
            
        except Exception as e:
            self.logger.error(f"エラーが発生しました: {e}")
            self.driver.save_screenshot(str(self.output_dir / 'error.png'))
        finally:
            if self.driver:
                self.driver.quit()


if __name__ == "__main__":
    analyzer = InteractiveLoginAnalyzer()
    analyzer.run()