# Claude Code 自動レポート投稿システム - 完全版指示書

> **対象**: 他プロジェクトのClaude Code  
> **目的**: 開発中に自動的にレポートをgin-arcv.scioj.com/reportsに投稿する機能を追加  
> **前提**: 各プロジェクトの.envにGIN_ARCV_TOKENが既に設定済み

## 🎯 実装目標

Claude Codeが**開発作業中に自動的に**以下のレポートを投稿する：

- **開発進捗レポート**: 実装完了時・マイルストーン到達時
- **品質保証レポート**: テスト結果・バグ修正結果
- **技術調査レポート**: 新技術調査・問題解決過程
- **ユーザー指示実行レポート**: 大きなタスク完了時

## 📋 実装手順

### Step 1: 依存関係追加

```json
// package.jsonに追加
{
  "dependencies": {
    "axios": "^1.6.0",
    "dotenv": "^16.3.0"
  },
  "scripts": {
    "send-reports": "node scripts/send-reports.js",
    "postcommit": "npm run send-reports"
  }
}
```

### Step 2: scripts/send-reports.jsの作成

```javascript
#!/usr/bin/env node
/**
 * Claude Code Report Auto-Sender
 * reports/フォルダのレポートを gin-arcv.scioj.com/reports に自動送信
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const API_BASE_URL = 'https://gin-arcv.scioj.com/reports';
const PROJECT_PATH = process.cwd();
const PROJECT_NAME = path.basename(PROJECT_PATH);
const AUTHOR = 'claude-code';

class ReportSender {
    constructor() {
        this.token = process.env.GIN_ARCV_TOKEN;
        if (!this.token) {
            console.error('❌ GIN_ARCV_TOKEN環境変数が設定されていません');
            process.exit(1);
        }
    }

    collectReports() {
        const reportsDir = path.join(PROJECT_PATH, 'reports');
        if (!fs.existsSync(reportsDir)) return [];
        
        const reports = [];
        this.scanDirectory(reportsDir, '', reports);
        return reports;
    }

    scanDirectory(dirPath, relativePath, reports) {
        const items = fs.readdirSync(dirPath);
        for (const item of items) {
            const fullPath = path.join(dirPath, item);
            const itemRelativePath = relativePath ? \`\${relativePath}/\${item}\` : item;
            
            if (fs.statSync(fullPath).isDirectory()) {
                this.scanDirectory(fullPath, itemRelativePath, reports);
            } else {
                const report = this.processFile(fullPath, itemRelativePath);
                if (report) reports.push(report);
            }
        }
    }

    processFile(filePath, relativePath) {
        const ext = path.extname(filePath).slice(1).toLowerCase();
        if (!['md', 'json', 'html', 'txt'].includes(ext)) return null;

        const content = fs.readFileSync(filePath, 'utf8');
        const stats = fs.statSync(filePath);
        const fileName = path.basename(filePath, path.extname(filePath));
        
        // パス階層とタイトルの自動判定
        let reportPath, title;
        
        if (fileName.includes('progress') || fileName.includes('milestone')) {
            reportPath = \`reports/progress/\${fileName}\`;
            title = \`Development Progress - \${fileName}\`;
        } else if (fileName.includes('test') || fileName.includes('quality')) {
            reportPath = \`reports/quality/\${fileName}\`;
            title = \`Quality Assurance - \${fileName}\`;
        } else if (fileName.includes('investigation') || fileName.includes('research')) {
            reportPath = \`reports/research/\${fileName}\`;
            title = \`Technical Research - \${fileName}\`;
        } else if (fileName.includes('task') || fileName.includes('completion')) {
            reportPath = \`reports/tasks/\${fileName}\`;
            title = \`Task Completion - \${fileName}\`;
        } else if (fileName.includes('PDCA')) {
            const match = fileName.match(/PDCA(\\d+)-(.+)/);
            if (match) {
                reportPath = \`reports/pdca/cycle\${match[1]}-\${match[2].toLowerCase()}\`;
                title = \`PDCA Cycle \${match[1]} - \${match[2]}\`;
            } else {
                reportPath = \`reports/pdca/\${fileName.toLowerCase()}\`;
                title = \`PDCA Report - \${fileName}\`;
            }
        } else {
            reportPath = \`reports/general/\${fileName}\`;
            title = fileName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        }

        // HTMLに変換
        let finalContent = this.convertToHTML(content, ext, title);

        // ラベル生成
        const labels = this.generateLabels(fileName, relativePath, ext, content);

        return {
            timestamp: stats.mtime.toISOString(),
            project: PROJECT_NAME,
            full_project: PROJECT_PATH,
            author: AUTHOR,
            path: reportPath,
            title: title,
            ext: 'html',
            content: finalContent,
            labels: labels
        };
    }

    generateLabels(fileName, relativePath, ext, content) {
        const labels = [];
        
        // ファイルタイプラベル
        labels.push(\`type:\${ext}\`);
        
        // カテゴリラベル
        if (fileName.includes('PDCA')) {
            labels.push('category:pdca');
            const match = fileName.match(/PDCA(\\d+)/);
            if (match) {
                labels.push(\`pdca-cycle:\${match[1]}\`);
            }
            if (fileName.includes('PLAN')) labels.push('phase:plan');
            if (fileName.includes('ACTION')) labels.push('phase:action');
        } else if (fileName.includes('test') || fileName.includes('Test')) {
            labels.push('category:testing');
            if (fileName.includes('standalone')) labels.push('test-type:standalone');
            if (fileName.includes('comprehensive')) labels.push('test-type:comprehensive');
            if (fileName.includes('extension')) labels.push('test-scope:extension');
            if (fileName.includes('ui')) labels.push('test-scope:ui');
            if (fileName.includes('deck')) labels.push('test-scope:deck');
        } else if (fileName.includes('investigation') || fileName.includes('Investigation')) {
            labels.push('category:investigation');
            if (fileName.includes('dom')) labels.push('investigation-type:dom');
            if (fileName.includes('card')) labels.push('investigation-type:card');
            if (fileName.includes('site')) labels.push('investigation-type:site');
        } else if (fileName.includes('PHASE') || fileName.includes('summary')) {
            labels.push('category:milestone');
            const phaseMatch = fileName.match(/PHASE(\\d+)/);
            if (phaseMatch) {
                labels.push(\`phase:\${phaseMatch[1]}\`);
            }
        } else if (fileName === 'README' || relativePath.includes('README')) {
            labels.push('category:documentation');
            labels.push('doc-type:overview');
        }
        
        // プロジェクト固有ラベル（プロジェクト名に基づいて自動生成）
        const projectKey = PROJECT_NAME.toLowerCase().replace(/[^a-z0-9]/g, '-');
        labels.push(\`project:\${projectKey}\`);
        
        // 技術スタックラベル（プロジェクトに応じて調整）
        if (fs.existsSync(path.join(PROJECT_PATH, 'src/manifest.json'))) {
            labels.push('tech:chrome-extension');
        }
        if (fs.existsSync(path.join(PROJECT_PATH, 'package.json'))) {
            labels.push('tech:javascript');
        }
        if (fs.existsSync(path.join(PROJECT_PATH, 'requirements.txt')) || 
            fs.existsSync(path.join(PROJECT_PATH, 'pyproject.toml'))) {
            labels.push('tech:python');
        }
        if (fs.existsSync(path.join(PROJECT_PATH, 'Dockerfile'))) {
            labels.push('tech:docker');
        }
        
        // 品質ラベル（JSONファイルの場合）
        if (ext === 'json' && content) {
            try {
                const data = JSON.parse(content);
                if (data.summary && data.summary.successRate) {
                    const rate = parseFloat(data.summary.successRate);
                    if (rate >= 95) labels.push('quality:excellent');
                    else if (rate >= 85) labels.push('quality:good');
                    else if (rate >= 70) labels.push('quality:fair');
                    else labels.push('quality:needs-improvement');
                }
                if (data.summary && data.summary.totalTests) {
                    const tests = data.summary.totalTests;
                    if (tests >= 20) labels.push('coverage:comprehensive');
                    else if (tests >= 10) labels.push('coverage:moderate');
                    else labels.push('coverage:basic');
                }
            } catch (e) {
                // JSONパースエラーは無視
            }
        }
        
        // 開発フェーズラベル
        if (content && content.includes('Phase 1')) {
            labels.push('dev-phase:1');
        } else if (content && content.includes('Phase 2')) {
            labels.push('dev-phase:2');
        } else if (content && content.includes('Phase 3')) {
            labels.push('dev-phase:3');
        }
        
        // 実装状況ラベル
        if (content && (content.includes('完了') || content.includes('completed') || content.includes('success'))) {
            labels.push('status:completed');
        } else if (content && (content.includes('進行中') || content.includes('in-progress'))) {
            labels.push('status:in-progress');
        } else if (content && (content.includes('計画') || content.includes('plan'))) {
            labels.push('status:planned');
        }
        
        // 自動生成ラベル
        labels.push('auto-generated:claude-code');
        labels.push(\`generated-date:\${new Date().toISOString().split('T')[0]}\`);
        
        return labels;
    }

    convertToHTML(content, ext, title) {
        let html = content;
        
        if (ext === 'md') {
            html = this.markdownToHTML(content);
        } else if (ext === 'json') {
            const jsonData = JSON.parse(content);
            html = this.jsonToHTML(jsonData);
        }

        return this.wrapWithTemplate(html, title);
    }

    markdownToHTML(markdown) {
        return markdown
            .replace(/^# (.+)$/gm, '<h1>$1</h1>')
            .replace(/^## (.+)$/gm, '<h2>$1</h2>')
            .replace(/^### (.+)$/gm, '<h3>$1</h3>')
            .replace(/^\- (.+)$/gm, '<li>$1</li>')
            .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')
            .replace(/\\*(.+?)\\*/g, '<em>$1</em>')
            .replace(/\\`(.+?)\\`/g, '<code>$1</code>')
            .replace(/\\n\\n/g, '</p><p>')
            .replace(/\\n/g, '<br>');
    }

    jsonToHTML(jsonData) {
        let html = '<div class="json-report">';
        
        if (jsonData.summary) {
            html += '<h2>Summary</h2>' + this.objectToTable(jsonData.summary);
        }
        
        if (jsonData.results) {
            html += '<h2>Results</h2><ul>';
            (jsonData.results || []).forEach(result => {
                const status = result.success ? '✅' : '❌';
                html += \`<li>\${status} \${result.name || result.description}</li>\`;
            });
            html += '</ul>';
        }
        
        html += '</div>';
        return html;
    }

    objectToTable(obj) {
        let html = '<table border="1" style="border-collapse: collapse; width: 100%;">';
        for (const [key, value] of Object.entries(obj)) {
            html += \`<tr><td><strong>\${key}</strong></td><td>\${value}</td></tr>\`;
        }
        html += '</table>';
        return html;
    }

    wrapWithTemplate(content, title) {
        const toc = this.generateTOC(content);
        const summary = this.generateSummary(title);
        const nextActions = this.generateNextActions(title);

        return \`<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>\${title}</title>
    <style>
        body { font-family: system-ui, sans-serif; margin: 40px; line-height: 1.6; }
        .header { border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
        .toc { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .summary { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .next-actions { background: #f3e5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .user-actions { background: #fff3e0; padding: 15px; border-left: 4px solid #ff9800; margin: 10px 0; }
        .llm-actions { background: #e8f5e8; padding: 15px; border-left: 4px solid #4caf50; margin: 10px 0; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { padding: 12px; text-align: left; border: 1px solid #ddd; }
        th { background-color: #f2f2f2; }
        code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>\${title}</h1>
        <p><strong>Generated by:</strong> Claude Code | <strong>Project:</strong> \${PROJECT_NAME} | <strong>Timestamp:</strong> \${new Date().toISOString()}</p>
    </div>
    <div class="toc"><h2>📋 目次</h2>\${toc}</div>
    <div class="summary"><h2>📝 要約</h2>\${summary}</div>
    <div class="next-actions"><h2>🎯 Next Actions</h2>\${nextActions}</div>
    <div class="content">\${content}</div>
</body>
</html>\`;
    }

    generateTOC(content) {
        const headings = content.match(/<h[1-6][^>]*>(.+?)<\\/h[1-6]>/g) || [];
        if (headings.length === 0) return '<p>目次なし</p>';
        
        let toc = '<ul>';
        headings.forEach(heading => {
            const text = heading.replace(/<[^>]+>/g, '');
            toc += \`<li>\${text}</li>\`;
        });
        toc += '</ul>';
        return toc;
    }

    generateSummary(title) {
        if (title.includes('Progress')) return '<p>開発進捗と実装状況の記録</p>';
        if (title.includes('Quality')) return '<p>品質保証・テスト結果の記録</p>';
        if (title.includes('Research')) return '<p>技術調査・問題解決の記録</p>';
        if (title.includes('Task')) return '<p>タスク完了・成果物の記録</p>';
        if (title.includes('PDCA')) return '<p>PDCAサイクル実行の記録</p>';
        return '<p>開発作業の記録とドキュメント</p>';
    }

    generateNextActions(title) {
        let userActions = '<li>レポート内容の確認</li><li>次のタスク指示</li>';
        let llmActions = '<li>継続的な品質改善</li><li>次のマイルストーン実装</li>';

        if (title.includes('Progress')) {
            userActions = '<li>進捗状況の確認</li><li>実装方針の調整</li>';
            llmActions = '<li>次の開発フェーズ準備</li><li>品質基準の維持</li>';
        } else if (title.includes('PDCA')) {
            userActions = '<li>PDCAサイクルの評価</li><li>改善点の指摘</li>';
            llmActions = '<li>次のPDCAサイクル計画</li><li>継続的改善実行</li>';
        }

        return \`
            <div class="user-actions"><h3>👤 ユーザー向け</h3><ul>\${userActions}</ul></div>
            <div class="llm-actions"><h3>🤖 LLM向け</h3><ul>\${llmActions}</ul></div>
        \`;
    }

    async sendReport(report) {
        try {
            const response = await axios.post(API_BASE_URL, report, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': \`Bearer \${this.token}\`
                },
                timeout: 30000
            });

            if (response.status === 201) {
                console.log(\`✅ 送信成功: \${report.title}\`);
                return true;
            }
        } catch (error) {
            console.error(\`❌ 送信失敗: \${report.title} - \${error.message}\`);
            return false;
        }
    }

    async sendAllReports() {
        const reports = this.collectReports();
        if (reports.length === 0) return;

        console.log(\`📤 レポート送信中: \${reports.length}件\`);
        
        for (const report of reports) {
            await this.sendReport(report);
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
}

if (require.main === module) {
    const sender = new ReportSender();
    sender.sendAllReports().catch(console.error);
}

module.exports = ReportSender;
```

### Step 3: Git Hookの設定

```bash
# .git/hooks/post-commit を作成
#!/bin/bash
echo "📤 レポート自動送信中..."
cd "$(git rev-parse --show-toplevel)"

if command -v node >/dev/null 2>&1; then
    npm run send-reports 2>/dev/null || {
        echo "⚠️ レポート送信をスキップ（.envファイルの設定が必要）"
        exit 0
    }
fi

# 実行権限付与
chmod +x .git/hooks/post-commit
```

### Step 4: 環境変数設定

```bash
# .env.example を作成
GIN_ARCV_TOKEN=your_token_here

# .env ファイルを作成（実際のトークンを設定）
echo "GIN_ARCV_TOKEN=actual_token_value" > .env
```

## 📊 API仕様

### エンドポイント
- **URL**: `https://gin-arcv.scioj.com/reports`
- **Method**: POST
- **Auth**: Bearer Token (GIN_ARCV_TOKEN)

### 送信データ形式
```json
{
  "timestamp": "2025-06-12T10:30:00.000Z",
  "project": "project_folder_name",
  "full_project": "/absolute/path/to/project",
  "author": "claude-code",
  "path": "reports/pdca/cycle1-action",
  "title": "PDCA Cycle 1 - Action",
  "ext": "html",
  "content": "<!DOCTYPE html>...",
  "labels": [
    "type:md",
    "category:pdca",
    "pdca-cycle:1",
    "phase:action",
    "project:project-name",
    "tech:javascript",
    "status:completed",
    "auto-generated:claude-code",
    "generated-date:2025-06-12"
  ]
}
```

## 🏷️ ラベルシステム

### カテゴリラベル
- `category:pdca` - PDCAサイクルレポート
- `category:testing` - テスト結果レポート
- `category:investigation` - 技術調査レポート
- `category:milestone` - マイルストーン・フェーズレポート
- `category:documentation` - ドキュメント

### プロジェクト・技術ラベル
- `project:project-name` - プロジェクト識別子
- `tech:chrome-extension` - Chrome拡張機能
- `tech:javascript` - JavaScript
- `tech:python` - Python
- `tech:docker` - Docker

### 品質・ステータスラベル
- `quality:excellent` - 95%以上の成功率
- `quality:good` - 85-94%の成功率
- `quality:fair` - 70-84%の成功率
- `status:completed` - 完了状態
- `status:in-progress` - 進行中
- `status:planned` - 計画段階

### フェーズ・テストラベル
- `dev-phase:1` - 開発フェーズ1
- `pdca-cycle:1` - PDCAサイクル番号
- `test-type:standalone` - スタンドアロンテスト
- `test-scope:extension` - 拡張機能テスト

## 🤖 Claude Code向け運用指示

### 自動レポート作成タイミング

Claude Codeは以下の場面で**自動的に**reports/フォルダにレポートを作成し、git commitしてください：

1. **大きなタスク完了時**
   ```
   reports/task-completion-YYYY-MM-DD.md
   - 実装内容
   - 成果物
   - 品質指標
   - 次のステップ
   ```

2. **マイルストーン到達時**
   ```
   reports/milestone-phase-X-YYYY-MM-DD.md
   - フェーズ成果
   - 目標達成度
   - 技術的成果
   - 次フェーズ計画
   ```

3. **品質保証実行時**
   ```
   reports/quality-report-YYYY-MM-DD.json
   {
     "summary": {"totalTests": X, "successRate": "Y%"},
     "results": [{"name": "test1", "success": true}]
   }
   ```

4. **技術調査完了時**
   ```
   reports/research-TOPIC-YYYY-MM-DD.md
   - 調査目的
   - 技術選択
   - 実装方法
   - 推奨事項
   ```

5. **PDCAサイクル実行時**
   ```
   reports/PDCA1-PLAN-YYYY-MM-DD.md
   reports/PDCA1-ACTION-YYYY-MM-DD.md
   - Plan: 計画立案
   - Do: 実装実行
   - Check: 検証・テスト
   - Action: 改善・次計画
   ```

### 重要な自動化ルール

1. **silent operation**: ユーザーに明示的に報告せず、バックグラウンドで実行
2. **fail-safe**: レポート送信エラーでも開発作業は継続
3. **meaningful content**: 具体的で有用な情報を含む
4. **consistent naming**: 日付・カテゴリ・内容が明確なファイル名
5. **automatic labeling**: ファイル名・内容からラベル自動生成

### レポート品質基準

- **目的明確**: なぜこのレポートが必要か
- **結果具体**: 数値・成功率・具体的成果
- **次のアクション**: ユーザー・LLMそれぞれの明確な行動指針
- **技術詳細**: 実装方法・コード例・設定内容
- **ラベル適切**: 検索・分類に有用なラベル付与

## 🔧 設定完了確認

1. `npm install` で依存関係インストール
2. `.env`にGIN_ARCV_TOKENが設定済み確認
3. `npm run send-reports` でテスト実行
4. git commit時の自動送信確認

## 📈 期待される効果

- **プロジェクト可視性**: 全プロジェクトの進捗を一元管理
- **品質向上**: 継続的な品質指標の蓄積
- **知識共有**: 技術的知見の組織横断的活用
- **作業効率**: レポート作成の自動化による開発時間増加
- **検索性向上**: ラベルによる高精度な情報検索
- **分析可能性**: 構造化データによる傾向分析

## 🔍 ラベル活用例

### プロジェクト横断検索
```
category:testing AND quality:excellent  # 高品質テスト結果
project:* AND status:completed         # 全プロジェクトの完了タスク
tech:python AND dev-phase:1            # Python関連Phase1実装
```

### 品質分析
```
quality:needs-improvement               # 改善が必要な項目
test-type:standalone AND coverage:comprehensive  # 包括的スタンドアロンテスト
pdca-cycle:* AND phase:action          # 全PDCAのAction結果
```

---

**この指示書をClaude Codeに提供すると、即座にラベル付き自動レポート投稿機能が追加されます。**