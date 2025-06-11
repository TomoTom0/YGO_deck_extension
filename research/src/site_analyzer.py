"""
遊戯王DB公式サイト分析クラス
"""

import os
import time
import json
from pathlib import Path
from typing import Dict, List, Optional
from urllib.parse import urljoin, urlparse

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException

from .utils.logger import get_logger


class YGOSiteAnalyzer:
    """遊戯王DB公式サイト分析クラス"""
    
    def __init__(self, username: str, password: str):
        self.username = username
        self.password = password
        self.logger = get_logger(__name__)
        self.driver: Optional[webdriver.Chrome] = None
        
        # 設定
        self.base_url = os.getenv('YGO_BASE_URL', 'https://www.db.yugioh-card.com')
        self.login_url = os.getenv('YGO_LOGIN_URL', 'https://www.db.yugioh-card.com/yugiohdb/member_login.action')
        self.timeout = int(os.getenv('SELENIUM_TIMEOUT', '10'))
        self.delay = int(os.getenv('DELAY_BETWEEN_REQUESTS', '2'))
        
        # 出力ディレクトリ
        self.output_dir = Path(os.getenv('OUTPUT_DIR', 'data'))
        self.screenshot_dir = Path(os.getenv('SCREENSHOT_DIR', 'data/screenshots'))
        self.output_dir.mkdir(exist_ok=True)
        self.screenshot_dir.mkdir(exist_ok=True)
    
    def setup_driver(self) -> webdriver.Chrome:
        """ChromeDriverを設定"""
        options = Options()
        options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-gpu')
        options.add_argument('--window-size=1920,1080')
        options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
        
        driver = webdriver.Chrome(options=options)
        driver.implicitly_wait(int(os.getenv('SELENIUM_IMPLICIT_WAIT', '5')))
        driver.set_page_load_timeout(int(os.getenv('SELENIUM_PAGE_LOAD_TIMEOUT', '30')))
        
        return driver
    
    def login(self) -> bool:
        """ログイン処理（画像選択を含む）"""
        try:
            self.logger.info("ログイン処理を開始します")
            self.driver.get(self.login_url)
            
            # ログインフォームが表示されるまで待機
            wait = WebDriverWait(self.driver, self.timeout)
            
            # ユーザー名入力
            username_field = wait.until(
                EC.presence_of_element_located((By.NAME, "userid"))
            )
            username_field.clear()
            username_field.send_keys(self.username)
            
            # パスワード入力
            password_field = self.driver.find_element(By.NAME, "password")
            password_field.clear()
            password_field.send_keys(self.password)
            
            # ログインボタンをクリック
            login_button = self.driver.find_element(By.CSS_SELECTOR, "input[type='submit']")
            login_button.click()
            
            # ページ遷移を待機
            time.sleep(3)
            current_url = self.driver.current_url
            
            # 画像選択画面の確認と処理
            if self._handle_image_selection():
                self.logger.info("画像選択処理が完了しました")
            
            # 最終的なログイン成功確認
            time.sleep(2)
            current_url = self.driver.current_url
            
            if "member_login" not in current_url and "login" not in current_url.lower():
                self.logger.info("ログインに成功しました")
                return True
            else:
                self.logger.error(f"ログインに失敗しました。現在のURL: {current_url}")
                # デバッグ用にページのスクリーンショットを保存
                self.driver.save_screenshot(str(self.screenshot_dir / "login_failed.png"))
                return False
                
        except Exception as e:
            self.logger.error(f"ログイン処理でエラーが発生しました: {e}")
            # エラー時もスクリーンショットを保存
            try:
                self.driver.save_screenshot(str(self.screenshot_dir / "login_error.png"))
            except:
                pass
            return False
    
    def _handle_image_selection(self) -> bool:
        """画像選択処理（キャラクター認証）"""
        try:
            wait = WebDriverWait(self.driver, 10)
            
            # 現在のページの情報をログ出力
            self.logger.info(f"画像選択チェック - URL: {self.driver.current_url}")
            self.logger.info(f"ページタイトル: {self.driver.title}")
            
            # スクリーンショットを保存（デバッグ用）
            self.driver.save_screenshot(str(self.screenshot_dir / "image_selection_page.png"))
            
            # ページソースも保存（構造分析用）
            with open(self.output_dir / "image_selection_page.html", "w", encoding="utf-8") as f:
                f.write(self.driver.page_source)
            
            # 画像選択に関連する要素を探す
            self.logger.info("画像選択要素を検索中...")
            
            # まず、中央の基準画像（お手本）を探す
            reference_image_selectors = [
                ".reference-image",           # 基準画像用クラス
                ".main-image",               # メイン画像
                ".question-image",           # 質問画像
                "#reference-image",          # ID指定
                "div.center img",            # センタリングされた画像
                "[class*='reference'] img",  # reference関連クラス
                "[class*='question'] img",   # question関連クラス
                "[class*='sample'] img",     # sample関連クラス
                "img[alt*='お手本']",        # alt属性
                "img[title*='お手本']",      # title属性
            ]
            
            reference_image = None
            for selector in reference_image_selectors:
                try:
                    elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                    if elements:
                        self.logger.info(f"基準画像候補を発見: {selector} ({len(elements)}個)")
                        reference_image = elements[0]
                        break
                except Exception as e:
                    continue
            
            # 選択可能な画像を探す
            selectable_image_selectors = [
                "input[type='checkbox'] + img",    # チェックボックス付き画像
                "input[type='checkbox'] ~ img",    # チェックボックス関連画像
                ".selectable img",                 # 選択可能クラス
                ".option img",                     # オプション画像
                ".choice img",                     # 選択肢画像
                "[onclick] img",                   # クリック可能な画像
                "label img",                       # ラベル内の画像
                "div.image-option img",            # 画像オプション
                "[class*='select'] img",           # select関連クラス
                "[class*='choice'] img",           # choice関連クラス
                "img[style*='cursor: pointer']",   # ポインターカーソル
            ]
            
            selectable_images = []
            checkboxes = []
            
            # 全ての画像要素を取得
            all_images = self.driver.find_elements(By.TAG_NAME, "img")
            self.logger.info(f"ページ内の画像総数: {len(all_images)}")
            
            # チェックボックスを探す
            all_checkboxes = self.driver.find_elements(By.CSS_SELECTOR, "input[type='checkbox']")
            self.logger.info(f"チェックボックス数: {len(all_checkboxes)}")
            
            # 画像の詳細情報を収集
            image_info = []
            for i, img in enumerate(all_images[:20]):  # 最大20個まで
                try:
                    info = {
                        "index": i,
                        "src": img.get_attribute("src"),
                        "alt": img.get_attribute("alt"),
                        "class": img.get_attribute("class"),
                        "id": img.get_attribute("id"),
                        "width": img.size.get("width"),
                        "height": img.size.get("height"),
                        "location": img.location,
                        "is_displayed": img.is_displayed()
                    }
                    image_info.append(info)
                    self.logger.debug(f"画像{i}: {info}")
                except Exception as e:
                    self.logger.debug(f"画像{i}の情報取得エラー: {e}")
            
            # 画像情報を保存
            with open(self.output_dir / "image_selection_analysis.json", "w", encoding="utf-8") as f:
                json.dump({"images": image_info, "checkboxes": len(all_checkboxes)}, f, ensure_ascii=False, indent=2)
            
            # チェックボックスが存在する場合、それらをクリック
            if all_checkboxes:
                self.logger.info("チェックボックス方式の画像選択を実行")
                # 適当にいくつかのチェックボックスを選択（実際の判定ロジックは後で実装）
                for i, checkbox in enumerate(all_checkboxes[:min(3, len(all_checkboxes))]):
                    try:
                        if not checkbox.is_selected():
                            checkbox.click()
                            self.logger.info(f"チェックボックス{i}を選択")
                            time.sleep(0.5)
                    except Exception as e:
                        self.logger.error(f"チェックボックス{i}のクリックエラー: {e}")
            
            # 画像を直接クリックする必要がある場合
            else:
                self.logger.info("画像クリック方式の選択を試行")
                clicked_count = 0
                for img in all_images:
                    try:
                        # 基準画像は除外（サイズや位置で判定）
                        if img.size.get("width", 0) > 200 and img.size.get("height", 0) > 200:
                            continue
                        
                        # クリック可能そうな画像をクリック
                        parent = img.find_element(By.XPATH, "..")
                        if parent.tag_name in ["a", "label", "div", "span"]:
                            img.click()
                            clicked_count += 1
                            self.logger.info(f"画像をクリック: {img.get_attribute('src')[:50]}...")
                            time.sleep(0.5)
                            
                            if clicked_count >= 3:  # 適当に3つ選択
                                break
                    except Exception as e:
                        continue
            
            # 次へ進むボタンを探す
            submit_selectors = [
                "input[type='submit']",
                "button[type='submit']",
                "input[value*='次']",
                "input[value*='進']",
                "input[value*='OK']",
                "input[value*='確認']",
                "button:contains('次')",
                "button:contains('OK')",
                ".btn-submit",
                ".next-button",
                "#submit",
                "a[href*='next']",
                "a:contains('次へ')"
            ]
            
            time.sleep(1)
            
            for selector in submit_selectors:
                try:
                    elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                    if elements:
                        self.logger.info(f"送信ボタンを発見: {selector}")
                        elements[0].click()
                        time.sleep(3)
                        
                        # クリック後のスクリーンショット
                        self.driver.save_screenshot(str(self.screenshot_dir / "after_image_selection.png"))
                        break
                except Exception as e:
                    continue
            
            return True
            
        except TimeoutException:
            self.logger.info("画像選択画面のタイムアウト - 通常のログインと判断")
            return True
        except Exception as e:
            self.logger.error(f"画像選択処理でエラー: {e}")
            # エラー時の詳細情報を保存
            try:
                self.driver.save_screenshot(str(self.screenshot_dir / "image_selection_error.png"))
                with open(self.output_dir / "image_selection_error.html", "w", encoding="utf-8") as f:
                    f.write(self.driver.page_source)
            except:
                pass
            return False
    
    def analyze_page_structure(self, url: str, page_name: str) -> Dict:
        """ページ構造を分析"""
        try:
            self.logger.info(f"ページ構造分析開始: {page_name}")
            self.driver.get(url)
            time.sleep(self.delay)
            
            # スクリーンショットを保存
            screenshot_path = self.screenshot_dir / f"{page_name}.png"
            self.driver.save_screenshot(str(screenshot_path))
            
            # 基本情報を収集
            analysis = {
                'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
                'url': url,
                'page_name': page_name,
                'title': self.driver.title,
                'current_url': self.driver.current_url,
                'page_source_length': len(self.driver.page_source),
                'screenshot_path': str(screenshot_path),
                'elements': {},
                'forms': [],
                'links': [],
                'scripts': [],
                'errors': []
            }
            
            # 主要な要素を分析
            self._analyze_elements(analysis)
            self._analyze_forms(analysis)
            self._analyze_links(analysis)
            self._analyze_scripts(analysis)
            
            # 結果を保存
            output_file = self.output_dir / f"{page_name}_analysis.json"
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(analysis, f, ensure_ascii=False, indent=2)
            
            self.logger.info(f"ページ構造分析完了: {page_name}")
            return analysis
            
        except Exception as e:
            self.logger.error(f"ページ構造分析でエラーが発生しました: {e}")
            return {'error': str(e)}
    
    def _analyze_elements(self, analysis: Dict):
        """HTML要素を分析"""
        selectors = {
            'tables': 'table',
            'forms': 'form',
            'inputs': 'input',
            'selects': 'select',
            'textareas': 'textarea',
            'buttons': 'button',
            'links': 'a',
            'images': 'img',
            'divs': 'div',
            'spans': 'span',
            'deck_related': '[class*="deck"], [id*="deck"]',
            'card_related': '[class*="card"], [id*="card"]',
            'main_related': '[class*="main"], [id*="main"]',
            'extra_related': '[class*="extra"], [id*="extra"]',
            'side_related': '[class*="side"], [id*="side"]'
        }
        
        for name, selector in selectors.items():
            try:
                elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                analysis['elements'][name] = {
                    'count': len(elements),
                    'sample': []
                }
                
                # 最大5個のサンプルを収集
                for i, element in enumerate(elements[:5]):
                    try:
                        sample = {
                            'tag': element.tag_name,
                            'text': element.text[:100] if element.text else '',
                            'attributes': {}
                        }
                        
                        # 主要な属性を収集
                        for attr in ['id', 'class', 'name', 'type', 'value', 'href', 'src']:
                            value = element.get_attribute(attr)
                            if value:
                                sample['attributes'][attr] = value
                        
                        analysis['elements'][name]['sample'].append(sample)
                    except Exception as e:
                        analysis['errors'].append(f"Element analysis error: {e}")
                        
            except Exception as e:
                analysis['errors'].append(f"Selector '{selector}' error: {e}")
    
    def _analyze_forms(self, analysis: Dict):
        """フォームを分析"""
        try:
            forms = self.driver.find_elements(By.TAG_NAME, 'form')
            for i, form in enumerate(forms):
                form_data = {
                    'index': i,
                    'action': form.get_attribute('action'),
                    'method': form.get_attribute('method'),
                    'inputs': []
                }
                
                inputs = form.find_elements(By.TAG_NAME, 'input')
                for input_elem in inputs:
                    input_data = {
                        'type': input_elem.get_attribute('type'),
                        'name': input_elem.get_attribute('name'),
                        'value': input_elem.get_attribute('value'),
                        'id': input_elem.get_attribute('id')
                    }
                    form_data['inputs'].append(input_data)
                
                analysis['forms'].append(form_data)
        except Exception as e:
            analysis['errors'].append(f"Form analysis error: {e}")
    
    def _analyze_links(self, analysis: Dict):
        """リンクを分析"""
        try:
            links = self.driver.find_elements(By.TAG_NAME, 'a')
            for link in links[:20]:  # 最大20個
                href = link.get_attribute('href')
                if href:
                    analysis['links'].append({
                        'href': href,
                        'text': link.text[:50] if link.text else '',
                        'is_deck_related': 'deck' in href.lower()
                    })
        except Exception as e:
            analysis['errors'].append(f"Link analysis error: {e}")
    
    def _analyze_scripts(self, analysis: Dict):
        """スクリプトを分析"""
        try:
            scripts = self.driver.find_elements(By.TAG_NAME, 'script')
            for script in scripts:
                src = script.get_attribute('src')
                if src:
                    analysis['scripts'].append({
                        'src': src,
                        'type': 'external'
                    })
                else:
                    content = script.get_attribute('innerHTML')
                    if content and len(content) > 100:
                        analysis['scripts'].append({
                            'content_preview': content[:200],
                            'type': 'inline',
                            'length': len(content)
                        })
        except Exception as e:
            analysis['errors'].append(f"Script analysis error: {e}")
    
    def run_analysis(self):
        """分析を実行"""
        try:
            # ドライバーを設定
            self.driver = self.setup_driver()
            
            # ログイン
            if not self.login():
                self.logger.error("ログインに失敗しました。分析を中止します。")
                return
            
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
                }
            ]
            
            # 各ページを分析
            for page in pages_to_analyze:
                try:
                    self.analyze_page_structure(page['url'], page['name'])
                    time.sleep(self.delay)
                except Exception as e:
                    self.logger.error(f"ページ分析エラー {page['name']}: {e}")
            
            # 総合レポートを作成
            self._create_summary_report()
            
        finally:
            if self.driver:
                self.driver.quit()
    
    def _create_summary_report(self):
        """総合レポートを作成"""
        try:
            summary = {
                'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
                'analysis_files': []
            }
            
            # 分析ファイルを列挙
            for file_path in self.output_dir.glob('*_analysis.json'):
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    summary['analysis_files'].append({
                        'file': file_path.name,
                        'page_name': data.get('page_name'),
                        'url': data.get('url'),
                        'title': data.get('title'),
                        'elements_count': sum(elem.get('count', 0) for elem in data.get('elements', {}).values()),
                        'forms_count': len(data.get('forms', [])),
                        'errors_count': len(data.get('errors', []))
                    })
            
            # 総合レポートを保存
            summary_file = self.output_dir / 'summary_report.json'
            with open(summary_file, 'w', encoding='utf-8') as f:
                json.dump(summary, f, ensure_ascii=False, indent=2)
            
            self.logger.info(f"総合レポートを作成しました: {summary_file}")
            
        except Exception as e:
            self.logger.error(f"総合レポート作成エラー: {e}")