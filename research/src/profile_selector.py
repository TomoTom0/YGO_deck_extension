#!/usr/bin/env python3
"""
Chromeプロファイル選択・管理
"""

import os
import json
from pathlib import Path
from typing import List, Dict, Optional
import platform

from .utils.logger import get_logger


class ChromeProfileSelector:
    """Chromeプロファイル選択クラス"""
    
    def __init__(self):
        self.logger = get_logger(__name__)
    
    def get_chrome_user_data_dirs(self) -> List[Path]:
        """OS別のChromeユーザーデータディレクトリを取得（WSL対応）"""
        system = platform.system()
        home = Path.home()
        
        dirs = []
        
        if system == "Windows":
            dirs = [
                home / "AppData/Local/Google/Chrome/User Data",
                home / "AppData/Local/Chromium/User Data",
                home / "AppData/Local/Microsoft/Edge/User Data"
            ]
        elif system == "Darwin":
            dirs = [
                home / "Library/Application Support/Google/Chrome",
                home / "Library/Application Support/Chromium",
                home / "Library/Application Support/Microsoft Edge"
            ]
        else:  # Linux/WSL
            dirs = [
                # Linux環境のChrome
                home / ".config/google-chrome",
                home / ".config/chromium",
                home / ".config/microsoft-edge",
            ]
            
            # WSL環境でWindowsのChromeプロファイルを検索
            if self._is_wsl():
                wsl_windows_dirs = self._get_wsl_windows_chrome_dirs()
                dirs.extend(wsl_windows_dirs)
        
        # 存在するディレクトリのみ返す
        return [d for d in dirs if d.exists()]
    
    def _is_wsl(self) -> bool:
        """WSL環境かどうかを判定"""
        try:
            # WSLの場合、/proc/versionにMicrosoftが含まれる
            with open('/proc/version', 'r') as f:
                version_info = f.read().lower()
                return 'microsoft' in version_info or 'wsl' in version_info
        except:
            return False
    
    def _get_wsl_windows_chrome_dirs(self) -> List[Path]:
        """WSL環境でWindowsのChromeディレクトリを取得"""
        dirs = []
        
        # 一般的なWindowsユーザーディレクトリを検索
        windows_users_dir = Path("/mnt/c/Users")
        
        if windows_users_dir.exists():
            for user_dir in windows_users_dir.iterdir():
                if user_dir.is_dir():
                    chrome_dirs = [
                        user_dir / "AppData/Local/Google/Chrome/User Data",
                        user_dir / "AppData/Local/Chromium/User Data",
                        user_dir / "AppData/Local/Microsoft/Edge/User Data"
                    ]
                    dirs.extend(chrome_dirs)
        
        return dirs
    
    def find_profiles(self, user_data_dir: Path) -> List[Dict]:
        """指定されたユーザーデータディレクトリ内のプロファイルを検索"""
        profiles = []
        
        try:
            # Local State ファイルからプロファイル情報を読み取り
            local_state_file = user_data_dir / "Local State"
            if local_state_file.exists():
                with open(local_state_file, 'r', encoding='utf-8') as f:
                    local_state = json.load(f)
                
                profile_info = local_state.get('profile', {}).get('info_cache', {})
                
                for profile_name, info in profile_info.items():
                    profile_path = user_data_dir / profile_name
                    if profile_path.exists():
                        profiles.append({
                            'name': profile_name,
                            'display_name': info.get('name', profile_name),
                            'path': str(profile_path),
                            'user_data_dir': str(user_data_dir),
                            'browser': self._detect_browser_type(user_data_dir)
                        })
            
            # Local State がない場合の フォールバック
            if not profiles:
                common_profiles = ['Default', 'Profile 1', 'Profile 2', 'Profile 3']
                for profile_name in common_profiles:
                    profile_path = user_data_dir / profile_name
                    if profile_path.exists():
                        profiles.append({
                            'name': profile_name,
                            'display_name': profile_name,
                            'path': str(profile_path),
                            'user_data_dir': str(user_data_dir),
                            'browser': self._detect_browser_type(user_data_dir)
                        })
        
        except Exception as e:
            self.logger.debug(f"プロファイル検索エラー {user_data_dir}: {e}")
        
        return profiles
    
    def _detect_browser_type(self, user_data_dir: Path) -> str:
        """ブラウザタイプを検出"""
        path_str = str(user_data_dir).lower()
        if 'chrome' in path_str:
            return 'Chrome'
        elif 'chromium' in path_str:
            return 'Chromium'
        elif 'edge' in path_str:
            return 'Edge'
        else:
            return 'Unknown'
    
    def list_all_profiles(self) -> List[Dict]:
        """全てのプロファイルを一覧表示"""
        all_profiles = []
        
        user_data_dirs = self.get_chrome_user_data_dirs()
        
        for user_data_dir in user_data_dirs:
            self.logger.info(f"プロファイル検索中: {user_data_dir}")
            profiles = self.find_profiles(user_data_dir)
            all_profiles.extend(profiles)
        
        return all_profiles
    
    def get_profile_from_env(self) -> Optional[str]:
        """環境変数からプロファイルパスを取得"""
        # 直接パス指定
        profile_path = os.getenv('CHROME_PROFILE_PATH')
        if profile_path and Path(profile_path).exists():
            return profile_path
        
        # ユーザーデータディレクトリ + プロファイル名
        user_data_dir = os.getenv('CHROME_USER_DATA_DIR')
        profile_name = os.getenv('CHROME_PROFILE_NAME', 'Default')
        
        if user_data_dir:
            full_path = Path(user_data_dir) / profile_name
            if full_path.exists():
                return str(full_path)
        
        return None
    
    def select_profile_interactive(self) -> Optional[str]:
        """対話的にプロファイルを選択"""
        profiles = self.list_all_profiles()
        
        if not profiles:
            print("利用可能なChromeプロファイルが見つかりませんでした。")
            return None
        
        print("\n利用可能なChromeプロファイル:")
        print("-" * 80)
        
        for i, profile in enumerate(profiles, 1):
            print(f"{i:2d}. {profile['browser']} - {profile['display_name']} ({profile['name']})")
            print(f"     パス: {profile['path']}")
            print()
        
        print(f"{len(profiles) + 1:2d}. 一時プロファイルを使用（毎回ログインが必要）")
        print()
        
        while True:
            try:
                choice = input(f"選択してください (1-{len(profiles) + 1}): ").strip()
                choice_num = int(choice)
                
                if 1 <= choice_num <= len(profiles):
                    selected = profiles[choice_num - 1]
                    print(f"\n選択されたプロファイル: {selected['browser']} - {selected['display_name']}")
                    return selected['user_data_dir']  # user_data_dirを返す
                elif choice_num == len(profiles) + 1:
                    print("\n一時プロファイルを使用します")
                    return None
                else:
                    print(f"1から{len(profiles) + 1}の間で選択してください")
                    
            except ValueError:
                print("数字を入力してください")
            except KeyboardInterrupt:
                print("\n\n中断されました")
                return None


def get_chrome_profile_path() -> Optional[str]:
    """Chromeプロファイルパスを取得する統合関数"""
    selector = ChromeProfileSelector()
    
    # 1. 環境変数から取得を試行
    env_path = selector.get_profile_from_env()
    if env_path:
        selector.logger.info(f"環境変数からプロファイルを取得: {env_path}")
        return env_path
    
    # 2. 対話的選択
    return selector.select_profile_interactive()


if __name__ == "__main__":
    # テスト実行
    selector = ChromeProfileSelector()
    profiles = selector.list_all_profiles()
    
    print(f"発見されたプロファイル数: {len(profiles)}")
    for profile in profiles:
        print(f"  {profile['browser']} - {profile['display_name']} ({profile['path']})")
    
    print("\n対話的選択のテスト:")
    selected = get_chrome_profile_path()
    if selected:
        print(f"選択されたパス: {selected}")
    else:
        print("一時プロファイルが選択されました")