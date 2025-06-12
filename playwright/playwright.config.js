/**
 * Playwright設定ファイル - 遊戯王DBデッキサポート拡張機能テスト用
 */
module.exports = {
  // テストディレクトリ
  testDir: './tests',
  
  // テストファイルパターン
  testMatch: '**/*.spec.js',
  
  // グローバルタイムアウト
  timeout: 120000,
  
  // 並列実行の設定
  workers: 1, // Chrome拡張機能テストのため1つのワーカーのみ使用
  
  // リトライ設定
  retries: process.env.CI ? 2 : 1,
  
  // レポーター設定
  reporter: [
    ['html', { outputFolder: '../test-results/html-report' }],
    ['json', { outputFile: '../test-results/results.json' }],
    ['line']
  ],
  
  // グローバル設定
  use: {
    // ベースURL
    baseURL: 'https://www.db.yugioh-card.com/yugiohdb/',
    
    // ブラウザ設定
    headless: false,
    viewport: { width: 1920, height: 1080 },
    
    // スクリーンショット設定
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // トレース設定
    trace: 'on-first-retry',
    
    // その他の設定
    ignoreHTTPSErrors: true,
    
    // タイムアウト設定
    actionTimeout: 30000,
    navigationTimeout: 60000
  },
  
  // プロジェクト設定
  projects: [
    {
      name: 'chrome-extension',
      use: {
        ...require('./chrome-extension-config')
      }
    }
  ],
  
  // テスト結果出力ディレクトリ
  outputDir: '../test-results/artifacts',
  
  // 設定オプション
  expect: {
    // アサーションタイムアウト
    timeout: 10000
  },
  
  // Webサーバー設定（必要に応じて）
  webServer: process.env.CI ? undefined : {
    command: 'echo "Static file server not needed for extension testing"',
    port: 3000,
    reuseExistingServer: !process.env.CI
  }
};