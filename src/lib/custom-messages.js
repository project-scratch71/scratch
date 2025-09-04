/**
 * カスタム翻訳オーバーライドサンプル
 * 特定のメッセージのみを上書きする効率的な方法
 * 
 * 使用例：「コード」→「プログラム」の置き換え
 */

// 特定のメッセージのみをオーバーライド
const messageOverrides = {
    // 日本語
    ja: {
        'gui.gui.codeTab': 'プログラム',
        'gui.codeTab.code': 'プログラム',
        
        // ペイントエディターツールの不足翻訳を補完
        'paint.modeTools.select': '選択',
        'paint.modeTools.reshape': '変形',
        'paint.modeTools.brush': 'ブラシ',
        'paint.modeTools.eraser': '消しゴム',
        'paint.modeTools.fill': '塗りつぶし',
        'paint.modeTools.text': 'テキスト',
        'paint.modeTools.line': '線',
        'paint.modeTools.oval': '円',
        'paint.modeTools.rect': '四角形'
    },
    
    // 英語 (Code → Program)
    en: {
        'gui.gui.codeTab': 'Program',
        'gui.codeTab.code': 'Program'
    },
    
    // スペイン語 (Código → Programa)  
    es: {
        'gui.gui.codeTab': 'Programa',
        'gui.codeTab.code': 'Programa'
    },
    
    // フランス語 (Code → Programme)
    fr: {
        'gui.gui.codeTab': 'Programme', 
        'gui.codeTab.code': 'Programme'
    }
};

/**
 * 公式メッセージにカスタムオーバーライドを適用
 * @param {object} officialMessages - scratch-l10nからの公式メッセージ
 * @returns {object} オーバーライド適用済みメッセージ
 */
export const applyMessageOverrides = (officialMessages) => {
    const result = {};
    
    // 各言語に対してオーバーライドを適用
    Object.keys(officialMessages).forEach(locale => {
        result[locale] = {
            ...officialMessages[locale], // 公式メッセージをベースに
            ...(messageOverrides[locale] || {}) // カスタムオーバーライドを上書き
        };
    });
    
    return result;
};

/**
 * 新しいオーバーライドを追加する関数
 * @param {string} locale - 言語コード（ja, en, es, fr等）
 * @param {string} messageId - メッセージID（例: 'gui.gui.codeTab'）
 * @param {string} customText - カスタムテキスト
 */
export const addMessageOverride = (locale, messageId, customText) => {
    if (!messageOverrides[locale]) {
        messageOverrides[locale] = {};
    }
    messageOverrides[locale][messageId] = customText;
};

/**
 * 複数のオーバーライドを一度に追加
 * @param {string} locale - 言語コード
 * @param {object} overrides - オーバーライドオブジェクト
 */
export const addMultipleOverrides = (locale, overrides) => {
    if (!messageOverrides[locale]) {
        messageOverrides[locale] = {};
    }
    messageOverrides[locale] = {
        ...messageOverrides[locale],
        ...overrides
    };
};

/**
 * 現在のオーバーライド設定を取得
 * @returns {object} 現在のオーバーライド設定
 */
export const getMessageOverrides = () => {
    return messageOverrides;
};

export default messageOverrides;

/* 
===============================
使用方法：
===============================

1. locales.jsで使用する場合：

import editorMessages from 'scratch-l10n/locales/editor-msgs';
import {applyMessageOverrides} from '../lib/custom-messages';

const initialState = {
    isRtl: false,
    locale: 'ja',
    messagesByLocale: applyMessageOverrides(editorMessages), // ← オーバーライド適用
    messages: applyMessageOverrides(editorMessages).ja
};

2. 新しいオーバーライドを追加する場合：

import {addMessageOverride} from '../lib/custom-messages';

// 単一追加
addMessageOverride('ja', 'gui.gui.soundsTab', '効果音');
addMessageOverride('en', 'gui.gui.soundsTab', 'Audio');

// 複数追加
addMultipleOverrides('ja', {
    'gui.gui.soundsTab': '効果音',
    'gui.gui.costumesTab': '見た目'
});

3. よく変更される可能性のあるメッセージID：

- 'gui.gui.codeTab': メインタブの「コード」
- 'gui.gui.costumesTab': メインタブの「コスチューム」  
- 'gui.gui.soundsTab': メインタブの「音」
- 'gui.gui.backdropsTab': メインタブの「背景」
- 'gui.stageSelector.stage': 「ステージ」
- 'gui.spriteSelector.sprite': 「スプライト」
- 'gui.menuBar.file': メニューの「ファイル」
- 'gui.menuBar.edit': メニューの「編集」

===============================
*/