#!/usr/bin/env python3
"""
Playwright版 遊戯王DB公式サイト分析
"""

import os
import sys
import time
import json
import asyncio
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime

from playwright.async_api import async_playwright, Browser, BrowserContext, Page
from dotenv import load_dotenv

# プロジェクトルートをPythonパスに追加
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from src.utils.logger import setup_logger


class PlaywrightYGOAnalyzer:
    """Playwright版遊戯王DB分析クラス"""
    
    def __init__(self):
        load_dotenv()
        self.logger = setup_logger()
        
        # 認証情報
        self.username = os.getenv('YGO_USERNAME')
        self.password = os.getenv('YGO_PASSWORD')
        
        if not self.username or not self.password:
            raise ValueError("YGO_USERNAME and YGO_PASSWORD must be set in .env file")
        
        # URLs
        self.base_url = os.getenv('YGO_BASE_URL', 'https://www.db.yugioh-card.com')
        self.login_url = os.getenv('YGO_LOGIN_URL', 'https://www.db.yugioh-card.com/yugiohdb/member_login.action')
        
        # 出力ディレクトリ
        self.output_dir = Path('data/playwright_analysis')
        self.session_dir = Path('data/playwright_sessions')
        self.output_dir.mkdir(exist_ok=True, parents=True)
        self.session_dir.mkdir(exist_ok=True, parents=True)
        
        # セッションファイル
        self.session_file = self.session_dir / 'session_state.json'
    
    async def interactive_login_and_save_session(self) -> bool:
        """対話的ログインとセッション保存"""
        async with async_playwright() as p:
            # ブラウザを起動（ヘッドありモード）
            browser = await p.chromium.launch(
                headless=False,
                args=['--window-size=1920,1080']
            )
            
            try:
                context = await browser.new_context(
                    viewport={'width': 1920, 'height': 1080},
                    user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                )
                
                page = await context.new_page()
                
                # ログインページに移動
                self.logger.info(f"ログインページに移動: {self.login_url}")
                await page.goto(self.login_url)
                
                # ページのスクリーンショット
                await page.screenshot(path=self.output_dir / 'login_page.png')
                
                # ログイン情報を自動入力
                await page.fill('input[name="userid"]', self.username)
                await page.fill('input[name="password"]', self.password)
                
                self.logger.info("ログイン情報を入力しました")
                
                # ログインボタンをクリック
                await page.click('input[type="submit"]')
                self.logger.info("ログインボタンをクリックしました")
                
                # ページ変遷を待機
                await page.wait_for_load_state('networkidle')
                
                current_url = page.url
                self.logger.info(f"ログイン試行後のURL: {current_url}")
                
                # 画像選択画面かチェック
                if "member_login" not in current_url and "login" not in current_url.lower():
                    await page.screenshot(path=self.output_dir / 'after_login.png')
                    
                    # 画像選択の分析
                    await self._analyze_image_selection_page(page)
                    
                    # 手動操作を促す
                    self.logger.info("\n" + "="*60)
                    self.logger.info("【手動操作が必要です】")
                    self.logger.info("ブラウザで以下の操作を行ってください:")
                    self.logger.info("1. 画像選択認証を完了させる")
                    self.logger.info("2. ログインが完了したら、このターミナルに戻る")
                    self.logger.info("="*60 + "\n")
                    
                    # ユーザーの操作完了を待つ
                    input("ログインが完了したらEnterキーを押してください: ")
                    
                    # ログイン成功を確認
                    current_url = page.url
                    self.logger.info(f"手動操作後のURL: {current_url}")
                    
                    if "member_login" not in current_url and "login" not in current_url.lower():
                        # セッション状態を保存
                        storage_state = await context.storage_state()
                        
                        with open(self.session_file, 'w', encoding='utf-8') as f:
                            json.dump({
                                'timestamp': datetime.now().isoformat(),
                                'storage_state': storage_state,
                                'url': current_url
                            }, f, ensure_ascii=False, indent=2)
                        
                        self.logger.info(f"✓ セッション状態を保存しました: {self.session_file}")
                        
                        # 成功確認のスクリーンショット
                        await page.screenshot(path=self.output_dir / 'login_success.png')
                        
                        return True
                    else:
                        self.logger.error("ログインに失敗しました")
                        return False
                else:
                    self.logger.error("ログインページから進めませんでした")
                    return False
                    
            except Exception as e:
                self.logger.error(f"対話的ログインエラー: {e}")
                return False
            finally:
                await browser.close()
    
    async def _analyze_image_selection_page(self, page: Page):
        """画像選択ページの分析"""
        try:
            self.logger.info("画像選択ページを分析中...")
            
            # ページ情報を収集
            analysis = {
                'timestamp': datetime.now().isoformat(),
                'url': page.url,
                'title': await page.title(),
                'images': [],
                'forms': [],
                'clickable_elements': []
            }
            
            # 全ての画像を分析
            images = await page.query_selector_all('img')
            for i, img in enumerate(images):
                try:
                    img_info = {
                        'index': i,
                        'src': await img.get_attribute('src'),
                        'alt': await img.get_attribute('alt'),
                        'class': await img.get_attribute('class'),
                        'id': await img.get_attribute('id'),
                        'bounding_box': await img.bounding_box() if await img.is_visible() else None
                    }
                    analysis['images'].append(img_info)
                except Exception as e:
                    self.logger.debug(f"画像{i}の分析エラー: {e}")
            
            # フォームを分析
            forms = await page.query_selector_all('form')
            for i, form in enumerate(forms):
                try:
                    form_info = {
                        'index': i,
                        'action': await form.get_attribute('action'),
                        'method': await form.get_attribute('method'),
                        'id': await form.get_attribute('id'),
                        'class': await form.get_attribute('class')
                    }
                    analysis['forms'].append(form_info)
                except Exception as e:
                    self.logger.debug(f"フォーム{i}の分析エラー: {e}")
            
            # クリック可能な要素を分析
            clickable_selectors = [
                'input[type="checkbox"]',
                'input[type="radio"]', 
                'input[type="submit"]',
                'button',
                'a[href]',
                '[onclick]'
            ]
            
            for selector in clickable_selectors:
                try:
                    elements = await page.query_selector_all(selector)
                    for elem in elements:
                        elem_info = {
                            'selector': selector,
                            'type': await elem.get_attribute('type'),
                            'value': await elem.get_attribute('value'),
                            'text': (await elem.text_content())[:50] if await elem.text_content() else '',
                            'onclick': await elem.get_attribute('onclick')
                        }
                        analysis['clickable_elements'].append(elem_info)
                except Exception as e:
                    self.logger.debug(f"要素分析エラー {selector}: {e}")
            
            # 分析結果を保存
            with open(self.output_dir / 'image_selection_analysis.json', 'w', encoding='utf-8') as f:
                json.dump(analysis, f, ensure_ascii=False, indent=2)
            
            self.logger.info(f"画像選択ページの分析を完了: {len(analysis['images'])}個の画像")
            
        except Exception as e:
            self.logger.error(f"画像選択ページ分析エラー: {e}")
    
    async def headless_analysis_with_session(self) -> bool:
        """保存されたセッションでヘッドレス分析"""
        if not self.session_file.exists():
            self.logger.error("保存されたセッションが見つかりません")
            return False
        
        try:
            # セッション情報を読み込み
            with open(self.session_file, 'r', encoding='utf-8') as f:
                session_data = json.load(f)
            
            # セッションの有効期限チェック（24時間）
            saved_time = datetime.fromisoformat(session_data['timestamp'])
            if (datetime.now() - saved_time).total_seconds() > 24 * 3600:
                self.logger.warning("セッションが古すぎます（24時間以上）")
                return False
            
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                
                try:
                    # 保存されたセッション状態でコンテキストを作成
                    context = await browser.new_context(
                        storage_state=session_data['storage_state'],
                        viewport={'width': 1920, 'height': 1080}
                    )
                    
                    page = await context.new_page()
                    
                    # セッションの有効性を確認
                    deck_list_url = f"{self.base_url}/yugiohdb/deck_list.action"
                    await page.goto(deck_list_url)
                    await page.wait_for_load_state('networkidle')
                    
                    if "member_login" in page.url or "login" in page.url.lower():
                        self.logger.error("セッションが無効です（ログインページにリダイレクト）")
                        return False
                    
                    self.logger.info("セッションは有効です。ヘッドレス分析を開始...")
                    
                    # 分析対象ページ
                    pages_to_analyze = [
                        {'url': f"{self.base_url}/yugiohdb/deck_list.action", 'name': 'deck_list'},
                        {'url': f"{self.base_url}/yugiohdb/deck_edit.action", 'name': 'deck_edit'},
                        {'url': f"{self.base_url}/yugiohdb/card_search.action", 'name': 'card_search'},
                        {'url': f"{self.base_url}/yugiohdb/member.action", 'name': 'member_page'}
                    ]
                    
                    # 各ページを分析
                    for page_info in pages_to_analyze:
                        try:
                            self.logger.info(f"ページ分析: {page_info['name']}")
                            
                            await page.goto(page_info['url'])
                            await page.wait_for_load_state('networkidle')
                            
                            # スクリーンショット
                            await page.screenshot(path=self.output_dir / f"{page_info['name']}.png")
                            
                            # ページ分析
                            analysis_data = await self._analyze_page_structure(page, page_info['name'])
                            
                            # 結果保存
                            output_file = self.output_dir / f"{page_info['name']}_analysis.json"
                            with open(output_file, 'w', encoding='utf-8') as f:
                                json.dump(analysis_data, f, ensure_ascii=False, indent=2)
                            
                            self.logger.info(f"✓ {page_info['name']} 分析完了")
                            
                        except Exception as e:
                            self.logger.error(f"ページ分析エラー {page_info['name']}: {e}")
                    
                    return True
                    
                except Exception as e:
                    self.logger.error(f"ヘッドレス分析エラー: {e}")
                    return False
                finally:
                    await browser.close()
                    
        except Exception as e:
            self.logger.error(f"セッション読み込みエラー: {e}")
            return False
    
    async def _analyze_page_structure(self, page: Page, page_name: str) -> Dict:
        """ページ構造を分析"""
        analysis = {
            'timestamp': datetime.now().isoformat(),
            'page_name': page_name,
            'url': page.url,
            'title': await page.title(),
            'elements': {}
        }
        
        # 重要な要素を分析
        selectors = {
            'forms': 'form',
            'tables': 'table',
            'deck_elements': '[class*="deck"], [id*="deck"]',
            'card_elements': '[class*="card"], [id*="card"]',
            'main_elements': '[class*="main"], [id*="main"]',
            'extra_elements': '[class*="extra"], [id*="extra"]',
            'side_elements': '[class*="side"], [id*="side"]',
            'buttons': 'input[type="submit"], button',
            'inputs': 'input, select, textarea',
            'links': 'a[href]'
        }
        
        for name, selector in selectors.items():
            try:
                elements = await page.query_selector_all(selector)
                analysis['elements'][name] = {
                    'count': len(elements),
                    'samples': []
                }
                
                # 最初の3つの要素の詳細を収集
                for i, elem in enumerate(elements[:3]):
                    try:
                        sample = {
                            'index': i,
                            'tag': await elem.evaluate('el => el.tagName'),
                            'text': (await elem.text_content())[:100] if await elem.text_content() else '',
                            'class': await elem.get_attribute('class'),
                            'id': await elem.get_attribute('id'),
                            'type': await elem.get_attribute('type'),
                            'name': await elem.get_attribute('name'),
                            'value': await elem.get_attribute('value')
                        }
                        analysis['elements'][name]['samples'].append(sample)
                    except Exception as e:
                        self.logger.debug(f"要素サンプル収集エラー {name}[{i}]: {e}")
                        
            except Exception as e:
                self.logger.debug(f"要素分析エラー {name}: {e}")
        
        return analysis
    
    async def run_hybrid_analysis(self) -> bool:
        """ハイブリッド分析の実行"""
        self.logger.info("Playwright版ハイブリッド分析を開始します")
        
        # Step 1: 既存セッションでの分析を試行
        if await self.headless_analysis_with_session():
            self.logger.info("✓ 既存セッションでヘッドレス分析が完了しました")
            return True
        
        # Step 2: 対話的ログインとセッション保存
        self.logger.info("対話的ログインを開始します")
        if not await self.interactive_login_and_save_session():
            self.logger.error("対話的ログインに失敗しました")
            return False
        
        # Step 3: 新しいセッションでヘッドレス分析
        self.logger.info("新しいセッションでヘッドレス分析を開始します")
        if not await self.headless_analysis_with_session():
            self.logger.error("ヘッドレス分析に失敗しました")
            return False
        
        self.logger.info("✓ ハイブリッド分析が完了しました")
        return True


async def main():
    """メイン関数"""
    analyzer = PlaywrightYGOAnalyzer()
    success = await analyzer.run_hybrid_analysis()
    
    if success:
        print("\n✓ Playwright版ハイブリッド分析が完了しました")
        print(f"  - 分析結果: {analyzer.output_dir}")
        print(f"  - セッション: {analyzer.session_dir}")
    else:
        print("\n✗ 分析に失敗しました")


if __name__ == "__main__":
    asyncio.run(main())