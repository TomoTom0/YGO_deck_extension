#!/usr/bin/env python3
"""
既存Chromeプロファイルを使用するPlaywright分析
"""

import os
import sys
import json
import asyncio
from pathlib import Path
from datetime import datetime
from typing import Optional

from playwright.async_api import async_playwright, Browser, BrowserContext, Page
from dotenv import load_dotenv

# プロジェクトルートをPythonパスに追加
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from src.utils.logger import setup_logger
from src.profile_selector import get_chrome_profile_path


class ProfilePlaywrightAnalyzer:
    """既存Chromeプロファイルを使用する分析クラス"""
    
    def __init__(self):
        load_dotenv()
        self.logger = setup_logger()
        
        # URLs
        self.base_url = os.getenv('YGO_BASE_URL', 'https://www.db.yugioh-card.com')
        
        # 出力ディレクトリ
        self.output_dir = Path('data/profile_analysis')
        self.output_dir.mkdir(exist_ok=True, parents=True)
        
        # プロファイルパス
        self.profile_path = None
    
    def select_profile(self):
        """プロファイルを選択"""
        self.profile_path = get_chrome_profile_path()
        return self.profile_path is not None
    
    async def analyze_with_existing_profile(self) -> bool:
        """既存プロファイルで分析"""
        if not self.profile_path:
            self.logger.error("Chromeプロファイルが見つからないため、通常モードで実行します")
            return await self._analyze_without_profile()
        
        async with async_playwright() as p:
            try:
                # 既存プロファイルでブラウザを起動
                self.logger.info(f"既存プロファイルでChrome起動: {self.profile_path}")
                
                context = await p.chromium.launch_persistent_context(
                    user_data_dir=self.profile_path,
                    headless=False,  # 既存プロファイル使用時はheadlessモードは制限あり
                    args=['--window-size=1920,1080']
                )
                
                page = await context.new_page()
                
                # 遊戯王DBにアクセス
                deck_list_url = f"{self.base_url}/yugiohdb/deck_list.action"
                self.logger.info(f"遊戯王DBにアクセス: {deck_list_url}")
                await page.goto(deck_list_url)
                await page.wait_for_load_state('networkidle')
                
                current_url = page.url
                self.logger.info(f"現在のURL: {current_url}")
                
                # ログイン状態をチェック
                if "member_login" in current_url or "login" in current_url.lower():
                    self.logger.info("ログインが必要です")
                    
                    # 手動ログインを促す
                    self.logger.info("\n" + "="*60)
                    self.logger.info("【手動ログインが必要です】")
                    self.logger.info("ブラウザで遊戯王DBにログインしてください:")
                    self.logger.info("1. ユーザー名・パスワードを入力")
                    self.logger.info("2. 画像選択認証を完了")
                    self.logger.info("3. ログイン完了後、このターミナルに戻る")
                    self.logger.info("="*60 + "\n")
                    
                    input("ログインが完了したらEnterキーを押してください: ")
                
                # 分析実行
                await self._run_page_analysis(page)
                
                # プロファイルは既存なので手動で閉じる指示
                self.logger.info("\n" + "="*60)
                self.logger.info("【分析完了】")
                self.logger.info("ブラウザは手動で閉じてください")
                self.logger.info("="*60 + "\n")
                
                input("ブラウザを閉じたらEnterキーを押してください: ")
                
                return True
                
            except Exception as e:
                self.logger.error(f"既存プロファイル分析エラー: {e}")
                return False
            finally:
                try:
                    await context.close()
                except:
                    pass
    
    async def _analyze_without_profile(self) -> bool:
        """通常モード（一時プロファイル）で分析"""
        self.logger.info("一時プロファイルで分析を実行")
        
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=False)
            
            try:
                context = await browser.new_context(
                    viewport={'width': 1920, 'height': 1080}
                )
                page = await context.new_page()
                
                # ログインページに移動
                login_url = f"{self.base_url}/yugiohdb/member_login.action"
                await page.goto(login_url)
                
                self.logger.info("\n" + "="*60)
                self.logger.info("【手動ログインが必要です】")
                self.logger.info("一時プロファイルのため、ログインが必要です")
                self.logger.info("="*60 + "\n")
                
                input("ログインが完了したらEnterキーを押してください: ")
                
                # 分析実行
                await self._run_page_analysis(page)
                
                return True
                
            except Exception as e:
                self.logger.error(f"一時プロファイル分析エラー: {e}")
                return False
            finally:
                await browser.close()
    
    async def _run_page_analysis(self, page: Page):
        """ページ分析を実行"""
        # 分析対象ページ
        pages_to_analyze = [
            {'url': f"{self.base_url}/yugiohdb/deck_list.action", 'name': 'deck_list'},
            {'url': f"{self.base_url}/yugiohdb/deck_edit.action", 'name': 'deck_edit'},
            {'url': f"{self.base_url}/yugiohdb/card_search.action", 'name': 'card_search'},
        ]
        
        for page_info in pages_to_analyze:
            try:
                self.logger.info(f"ページ分析: {page_info['name']}")
                
                await page.goto(page_info['url'])
                await page.wait_for_load_state('networkidle')
                
                # スクリーンショット
                await page.screenshot(path=self.output_dir / f"{page_info['name']}.png")
                
                # 簡易分析
                analysis = {
                    'timestamp': datetime.now().isoformat(),
                    'page_name': page_info['name'],
                    'url': page.url,
                    'title': await page.title(),
                    'forms_count': len(await page.query_selector_all('form')),
                    'tables_count': len(await page.query_selector_all('table')),
                    'deck_elements_count': len(await page.query_selector_all('[class*="deck"], [id*="deck"]')),
                    'card_elements_count': len(await page.query_selector_all('[class*="card"], [id*="card"]'))
                }
                
                # 結果保存
                output_file = self.output_dir / f"{page_info['name']}_analysis.json"
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(analysis, f, ensure_ascii=False, indent=2)
                
                self.logger.info(f"✓ {page_info['name']} 分析完了")
                
            except Exception as e:
                self.logger.error(f"ページ分析エラー {page_info['name']}: {e}")


async def main():
    """メイン関数"""
    analyzer = ProfilePlaywrightAnalyzer()
    
    print("=== Chrome プロファイル選択分析 ===\n")
    
    # プロファイル選択
    if analyzer.select_profile():
        success = await analyzer.analyze_with_existing_profile()
    else:
        success = await analyzer._analyze_without_profile()
    
    if success:
        print(f"\n✓ 分析が完了しました: {analyzer.output_dir}")
    else:
        print("\n✗ 分析に失敗しました")


if __name__ == "__main__":
    asyncio.run(main())