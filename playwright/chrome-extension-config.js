/**
 * Chrome拡張機能テスト用設定
 */
const path = require('path');

const EXTENSION_PATH = path.resolve(__dirname, '../src');
const CHROME_PROFILE_PATH = '/mnt/c/Users/tomo/AppData/Local/Google/Chrome/User Data/Profile 2';

module.exports = {
  channel: 'chrome',
  
  // 拡張機能用のlaunchOptions
  launchOptions: {
    args: [
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
      '--disable-web-security',
      '--no-sandbox',
      '--disable-http2',
      '--disable-dev-shm-usage',
      '--disable-setuid-sandbox',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-background-timer-throttling',
      '--disable-blink-features=AutomationControlled'
    ],
    ignoreDefaultArgs: ['--disable-extensions'],
    ignoreHTTPSErrors: true,
    headless: false
  },
  
  // コンテキストオプション
  contextOptions: {
    ignoreHTTPSErrors: true,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    extraHTTPHeaders: {
      'Accept-Language': 'ja-JP,ja;q=0.9,en;q=0.8'
    }
  }
};