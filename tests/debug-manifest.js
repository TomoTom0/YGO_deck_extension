// Chrome拡張機能 manifest.json デバッグツール
const fs = require('fs');
const path = require('path');

function checkManifest() {
    console.log('🔍 Chrome拡張機能 manifest.json デバッグ');
    console.log('=' .repeat(50));
    
    const srcDir = './src';
    const manifestPath = path.join(srcDir, 'manifest.json');
    
    // 1. ディレクトリ存在確認
    if (!fs.existsSync(srcDir)) {
        console.log('❌ srcディレクトリが存在しません');
        return;
    }
    
    // 2. manifest.json存在確認
    if (!fs.existsSync(manifestPath)) {
        console.log('❌ manifest.jsonが存在しません');
        return;
    }
    
    // 3. manifest.json読み込み・パース
    let manifest;
    try {
        const content = fs.readFileSync(manifestPath, 'utf8');
        manifest = JSON.parse(content);
        console.log('✅ manifest.json読み込み成功');
    } catch (error) {
        console.log('❌ manifest.json読み込みエラー:', error.message);
        return;
    }
    
    // 4. 必須フィールドチェック
    const requiredFields = ['name', 'version', 'manifest_version'];
    console.log('\n📋 必須フィールドチェック:');
    requiredFields.forEach(field => {
        if (manifest[field]) {
            console.log(`✅ ${field}: ${manifest[field]}`);
        } else {
            console.log(`❌ ${field}: 未定義`);
        }
    });
    
    // 5. Manifest v3チェック
    console.log('\n🔧 Manifest v3チェック:');
    if (manifest.manifest_version === 3) {
        console.log('✅ Manifest v3対応');
    } else {
        console.log('❌ Manifest v3ではありません');
    }
    
    // 6. 参照ファイル存在チェック
    console.log('\n📁 参照ファイル存在チェック:');
    
    // アイコンファイル
    if (manifest.icons) {
        Object.entries(manifest.icons).forEach(([size, iconPath]) => {
            const fullPath = path.join(srcDir, iconPath);
            if (fs.existsSync(fullPath)) {
                console.log(`✅ アイコン ${size}px: ${iconPath}`);
            } else {
                console.log(`❌ アイコン ${size}px: ${iconPath} (ファイルなし)`);
            }
        });
    }
    
    // コンテンツスクリプト
    if (manifest.content_scripts) {
        manifest.content_scripts.forEach((script, index) => {
            console.log(`\n📜 コンテンツスクリプト ${index + 1}:`);
            
            // JSファイル
            if (script.js) {
                script.js.forEach(jsFile => {
                    const fullPath = path.join(srcDir, jsFile);
                    if (fs.existsSync(fullPath)) {
                        console.log(`✅ JS: ${jsFile}`);
                    } else {
                        console.log(`❌ JS: ${jsFile} (ファイルなし)`);
                    }
                });
            }
            
            // CSSファイル
            if (script.css) {
                script.css.forEach(cssFile => {
                    const fullPath = path.join(srcDir, cssFile);
                    if (fs.existsSync(fullPath)) {
                        console.log(`✅ CSS: ${cssFile}`);
                    } else {
                        console.log(`❌ CSS: ${cssFile} (ファイルなし)`);
                    }
                });
            }
            
            // マッチパターン
            if (script.matches) {
                console.log(`🎯 マッチパターン: ${script.matches.join(', ')}`);
            }
        });
    }
    
    // ポップアップとオプション
    if (manifest.action && manifest.action.default_popup) {
        const popupPath = path.join(srcDir, manifest.action.default_popup);
        if (fs.existsSync(popupPath)) {
            console.log(`✅ ポップアップ: ${manifest.action.default_popup}`);
        } else {
            console.log(`❌ ポップアップ: ${manifest.action.default_popup} (ファイルなし)`);
        }
    }
    
    if (manifest.options_page) {
        const optionsPath = path.join(srcDir, manifest.options_page);
        if (fs.existsSync(optionsPath)) {
            console.log(`✅ オプション: ${manifest.options_page}`);
        } else {
            console.log(`❌ オプション: ${manifest.options_page} (ファイルなし)`);
        }
    }
    
    // 7. 権限チェック
    console.log('\n🔐 権限チェック:');
    if (manifest.permissions) {
        console.log('📝 基本権限:', manifest.permissions.join(', '));
    }
    if (manifest.host_permissions) {
        console.log('🌐 ホスト権限:', manifest.host_permissions.join(', '));
    }
    
    // 8. 潜在的な問題チェック
    console.log('\n⚠️  潜在的な問題チェック:');
    
    // JSファイルの構文チェック（基本）
    if (manifest.content_scripts) {
        manifest.content_scripts.forEach(script => {
            if (script.js) {
                script.js.forEach(jsFile => {
                    const fullPath = path.join(srcDir, jsFile);
                    if (fs.existsSync(fullPath)) {
                        try {
                            const content = fs.readFileSync(fullPath, 'utf8');
                            // 基本的な構文チェック（実際のパースはしない）
                            if (content.includes('chrome.') || content.includes('browser.')) {
                                console.log(`✅ ${jsFile}: Chrome API使用検出`);
                            }
                            if (content.trim().length === 0) {
                                console.log(`⚠️  ${jsFile}: ファイルが空です`);
                            }
                        } catch (error) {
                            console.log(`❌ ${jsFile}: 読み込みエラー`);
                        }
                    }
                });
            }
        });
    }
    
    console.log('\n✨ デバッグ完了');
}

checkManifest();