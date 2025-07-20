/**
 * カスタムテキストメッセージ管理システム
 * 公式のscratch-l10nから独立したテキスト管理
 */

// 日本語メッセージ定義
const japaneseMessages = {
    // ===== メイン界面要素 =====
    
    // メニューバー & ナビゲーション
    'gui.menuBar.file': 'ファイル',
    'gui.menuBar.edit': '編集',
    'gui.menuBar.new': '新規',
    'gui.menuBar.saveNow': '今すぐ保存',
    'gui.menuBar.saveAsCopy': 'コピーとして保存',
    'gui.menuBar.downloadToComputer': 'コンピューターに保存',
    'gui.menuBar.remix': 'リミックス',
    'gui.menuBar.share': '共有',
    'gui.menuBar.seeProjectPage': 'プロジェクトページを見る',
    'gui.menuBar.joinScratch': 'Scratchに参加',
    'gui.menuBar.signIn': 'サインイン',
    'gui.menuBar.settings': '設定',
    'gui.menuBar.language': '言語',
    'gui.menuBar.colorMode': 'カラーモード',
    'gui.menuBar.restore': '復元',
    'gui.menuBar.restoreSprite': 'スプライトを復元',
    'gui.menuBar.restoreSound': '音を復元',
    'gui.menuBar.restoreCostume': 'コスチュームを復元',
    'gui.menuBar.turboModeOn': 'ターボモードをオン',
    'gui.menuBar.turboModeOff': 'ターボモードをオフ',
    'gui.menuBar.modeMenu': 'モード',
    'gui.menuBar.normalMode': 'ノーマルモード',
    'gui.menuBar.caturdayMode': 'キャタデーモード',
    
    // メインタブ & エリア
    'gui.gui.codeTab': 'コード',
    'gui.gui.costumesTab': 'コスチューム',
    'gui.gui.soundsTab': '音',
    'gui.gui.backdropsTab': 'ページ',
    'gui.gui.addExtension': '拡張機能を追加',
    
    // ===== ステージ & スプライト管理 =====
    
    'gui.stageSelector.stage': 'スライド',
    'gui.stageSelector.backdrops': 'ページ',
    'gui.stageHeader.stageSizeLarge': '大きな実行画面に切り替え',
    'gui.stageHeader.stageSizeSmall': '小さい実行画面に切り替える',
    'gui.stageHeader.stageSizeFull': '実行画面を全画面表示にする',
    'gui.stageHeader.stageSizeUnFull': '実行画面の全画面表示をやめる',
    'videoSensing.stage': '実行画面',
    
    // スプライト情報 & コントロール
    'gui.SpriteInfo.sprite': 'スプライト',
    'gui.SpriteInfo.show': '表示',
    'gui.SpriteInfo.size': 'サイズ',
    'gui.SpriteInfo.direction': '向き',
    'gui.SpriteInfo.spritePlaceholder': '名前',
    'gui.SpriteInfo.showSpriteAction': 'スプライトを表示',
    'gui.SpriteInfo.hideSpriteAction': 'スプライトを隠す',
    
    // スプライト関連
    'gui.spriteSelector.sprite': 'スプライト',
    'gui.spriteSelector.addSprite': 'スプライトを追加',
    'gui.spriteSelectorItem.contextMenuDuplicate': '複製',
    'gui.spriteSelectorItem.contextMenuExport': 'エクスポート',
    'gui.spriteSelectorItem.contextMenuDelete': '削除',
    
    // 背景関連
    'gui.stageSelector.backdrop': 'ページ',
    'gui.stageSelector.addBackdrop': 'ページを追加',
    
    // ===== ファイル操作 & プロジェクト管理 =====
    
    // 保存/読み込みメッセージ
    'gui.sharedMessages.replaceProjectWarning': '現在のプロジェクトの内容を置き換えますか？',
    'gui.sharedMessages.loadFromComputerTitle': 'コンピューターから読み込み',
    'gui.menuBar.saveNowLink': '今すぐ保存',
    'gui.menuBar.isShared': '共有済み',
    
    // プロジェクト名
    'gui.sharedMessages.sprite': 'スプライト{index}',
    'gui.sharedMessages.costume': 'コスチューム{index}',
    'gui.sharedMessages.backdrop': 'ページ{index}',
    'gui.sharedMessages.pop': 'ポップ',
    
    // ===== アラート & ステータスメッセージ =====
    
    // プロジェクト操作
    'gui.alerts.createsuccess': '新しいプロジェクトを作成しました。',
    'gui.alerts.createcopysuccess': 'プロジェクトをコピーとして保存しました。',
    'gui.alerts.createremixsuccess': 'プロジェクトをリミックスとして保存しました。',
    'gui.alerts.savesuccess': 'プロジェクトを保存しました。',
    'gui.alerts.creating': '新規作成中…',
    'gui.alerts.creatingCopy': 'プロジェクトをコピー中…',
    'gui.alerts.creatingRemix': 'プロジェクトをリミックス中…',
    'gui.alerts.saving': 'プロジェクトを保存中…',
    'gui.alerts.importing': 'インポート中…',
    'gui.alerts.creatingError': 'プロジェクトを作成できませんでした。もう一度試してください！',
    'gui.alerts.savingError': 'プロジェクトを保存できませんでした。',
    
    // 接続アラート
    'gui.alerts.lostPeripheralConnection': '接続が失われました',
    'gui.alerts.tryAgain': 'もう一度試す',
    'gui.alerts.download': 'ダウンロード',
    'gui.connection.reconnect': '再接続',
    
    // 共通ボタン
    'gui.alerts.ok': 'OK',
    'gui.alerts.cancel': 'キャンセル',
    'gui.alerts.save': '保存',
    'gui.alerts.load': '読み込み',
    'gui.alerts.delete': '削除',
    'gui.alerts.duplicate': '複製',
    'gui.alerts.rename': '名前を変更',
    
    // ===== ライブラリ & 拡張機能 =====
    
    // 拡張機能ライブラリ
    'gui.extensionLibrary.chooseAnExtension': '拡張機能を選択',
    'gui.extensionLibrary.extensionUrl': '拡張機能のURL',
    'gui.extensionLibrary.comingSoon': '近日公開',
    'gui.extensionLibrary.requires': '要求',
    'gui.extensionLibrary.collaboration': 'とのコラボレーション',
    
    // 拡張機能名 & 説明
    'gui.extension.music.name': '音楽',
    'gui.extension.music.description': '楽器やドラムを演奏する。',
    'gui.extension.pen.name': 'ペン',
    'gui.extension.pen.description': 'スプライトで描画する。',
    'gui.extension.videosensing.name': 'ビデオ認識',
    'gui.extension.videosensing.description': 'カメラで動きを検出する。',
    'gui.extension.text2speech.name': 'テキスト読み上げ',
    'gui.extension.text2speech.description': 'プロジェクトに話させる。',
    'gui.extension.translate.name': '翻訳',
    'gui.extension.translate.description': 'テキストを多言語に翻訳する。',
    'gui.extension.makeymakey.description': 'あらゆるものをキーにする。',
    'gui.extension.microbit.description': 'プロジェクトを世界と接続する。',
    'gui.extension.ev3.description': 'インタラクティブなロボットなどを構築する。',
    'gui.extension.boost.description': 'ロボット創作に命を吹き込む。',
    'gui.extension.wedo2.description': 'モーターとセンサーで構築する。',
    'gui.extension.gdxfor.description': '押す、引く、動き、回転を感知する。',
    
    // ライブラリタグ
    'gui.libraryTags.all': 'すべて',
    'gui.libraryTags.animals': '動物',
    'gui.libraryTags.dance': 'ダンス',
    'gui.libraryTags.effects': 'エフェクト',
    'gui.libraryTags.fantasy': 'ファンタジー',
    'gui.libraryTags.fashion': 'ファッション',
    'gui.libraryTags.food': '食べ物',
    'gui.libraryTags.games': 'ゲーム',
    'gui.libraryTags.music': '音楽',
    'gui.libraryTags.people': '人々',
    'gui.libraryTags.space': '宇宙',
    'gui.libraryTags.sports': 'スポーツ',
    'gui.libraryTags.stories': 'ストーリー',
    
    // ライブラリ関連
    'gui.library.spriteLibrary': 'スプライトライブラリ',
    'gui.library.costumeLibrary': 'コスチュームライブラリ',
    'gui.library.soundLibrary': '音ライブラリ',
    'gui.library.backdropLibrary': 'ページ背景ライブラリ',
    
    // ===== 共通アクション & ダイアログ =====
    
    // ダイアログボタン
    'gui.prompt.ok': 'OK',
    'gui.prompt.cancel': 'キャンセル',
    'gui.modal.back': '戻る',
    'gui.modal.help': 'ヘルプ',
    'gui.sliderPrompt.ok': 'OK',
    'gui.sliderPrompt.cancel': 'キャンセル',
    
    // カスタムプロシージャ
    'gui.customProcedures.addAnInputNumberText': '入力を追加',
    'gui.customProcedures.addAnInputBoolean': '入力を追加',
    'gui.customProcedures.addALabel': 'ラベルを追加',
    'gui.customProcedures.runWithoutScreenRefresh': '画面更新なしで実行',
    'gui.customProcedures.cancel': 'キャンセル',
    'gui.customProcedures.ok': 'OK',
    'gui.customProcedures.numberTextType': '数値またはテキスト',
    'gui.customProcedures.booleanType': '真偽値',
    
    // ===== モニター & 変数表示 =====
    
    'gui.monitor.contextMenu.default': '通常の読み取り',
    'gui.monitor.contextMenu.large': '大きな読み取り',
    'gui.monitor.contextMenu.slider': 'スライダー',
    'gui.monitor.contextMenu.hide': '隠す',
    'gui.monitor.listMonitor.empty': '(空)',
    'gui.monitor.listMonitor.listLength': '長さ {length}',
    
    // ===== バックパック & アセット管理 =====
    
    'gui.backpack.header': 'バックパック',
    'gui.backpack.emptyBackpack': 'バックパックは空です',
    'gui.backpack.loadingBackpack': '読み込み中...',
    'gui.backpack.errorBackpack': 'バックパックの読み込みエラー',
    'gui.backpack.more': 'もっと見る',
    
    // ===== オペコードラベル (ブロック名) =====
    
    'gui.opcodeLabels.direction': '向き',
    'gui.opcodeLabels.size': 'サイズ',
    'gui.opcodeLabels.costumename': 'コスチューム名',
    'gui.opcodeLabels.costumenumber': 'コスチューム番号',
    'gui.opcodeLabels.backdropname': 'ページ名',
    'gui.opcodeLabels.backdropnumber': 'ページ番号',
    'gui.opcodeLabels.loudness': '音量',
    'gui.opcodeLabels.timer': 'タイマー',
    'gui.opcodeLabels.answer': '答え',
    'gui.opcodeLabels.username': 'ユーザー名',
    'gui.opcodeLabels.year': '年',
    'gui.opcodeLabels.month': '月',
    'gui.opcodeLabels.date': '日',
    'gui.opcodeLabels.dayofweek': '曜日',
    'gui.opcodeLabels.hour': '時',
    'gui.opcodeLabels.minute': '分',
    'gui.opcodeLabels.second': '秒',
    
    // ===== チュートリアル & カードシステム =====
    
    'gui.cards.all-tutorials': 'チュートリアル',
    'gui.cards.close': '閉じる',
    'gui.cards.more-things-to-try': 'もっと試してみよう！',
    'gui.cards.see-more': 'もっと見る',
    'gui.cards.shrink': '縮小',
    'gui.cards.expand': '拡大',
    
    // ===== ローダーメッセージ =====
    
    'gui.loader.headline': 'プロジェクトを読み込み中',
    'gui.loader.creating': 'プロジェクトを作成中',
    'gui.loader.message1': 'ブロックを作成中 …',
    'gui.loader.message2': 'スプライトを読み込み中 …',
    'gui.loader.message3': '音を読み込み中 …',
    'gui.loader.message4': '拡張機能を読み込み中 …',
    'gui.loader.message5': '猫を集めています …',
    'gui.loader.message6': 'ナノ粒子を送信中 …',
    'gui.loader.message7': 'ゴブリンを膨らませています …',
    'gui.loader.message8': '絵文字を準備中 …',
    
    // ===== 追加の重要なメッセージ =====
    
    // タブ関連
    'gui.costumeTab.costumes': 'コスチューム',
    'gui.soundTab.sounds': '音',
    'gui.codeTab.code': 'コード',
    
    // プロジェクト関連
    'gui.projectLoader.loadProject': 'プロジェクトを読み込み',
    'gui.projectLoader.saveProject': 'プロジェクトを保存',
    'gui.projectLoader.createProject': 'プロジェクトを作成',
    
    // ===== 音タブ関連 =====
    
    'gui.soundTab.fileUploadSound': '音をアップロード',
    'gui.soundTab.surpriseSound': 'サプライズ',
    'gui.soundTab.recordSound': '録音',
    'gui.soundTab.addSoundFromLibrary': '音を選ぶ',
    
    // 録音モーダル
    'gui.recordModal.title': '音を録音',
    'gui.recordingStep.beginRecord': '下のボタンをクリックして録音を開始',
    'gui.recordingStep.permission': '{arrow}マイクの使用許可が必要です',
    'gui.recordingStep.stop': '録音停止',
    'gui.recordingStep.record': '録音',
    'gui.playbackStep.stopMsg': '停止',
    'gui.playbackStep.playMsg': '再生',
    'gui.playbackStep.loadingMsg': '読み込み中...',
    'gui.playbackStep.saveMsg': '保存',
    'gui.playbackStep.reRecordMsg': '再録音',
    
    // ===== コスチュームタブ関連 =====
    
    'gui.costumeTab.addBackdropFromLibrary': 'ページ背景を選ぶ',
    'gui.costumeTab.addCostumeFromLibrary': 'コスチュームを選ぶ',
    'gui.costumeTab.addBlankCostume': '描く',
    'gui.costumeTab.addSurpriseCostume': 'サプライズ',
    'gui.costumeTab.addFileBackdrop': 'ページ背景をアップロード',
    'gui.costumeTab.addFileCostume': 'コスチュームをアップロード',
    
    // ===== 削除確認ダイアログ =====
    
    'gui.gui.shouldDeleteSprite': 'このスプライトを削除してもよろしいですか？',
    'gui.gui.shouldDeleteCostume': 'このコスチュームを削除してもよろしいですか？',
    'gui.gui.shouldDeleteSound': 'この音を削除してもよろしいですか？',
    'gui.gui.confirm': 'はい',
    'gui.gui.cancel': 'いいえ',
    'gui.gui.deleteAssetHeading': 'アセットの削除を確認',
    
    // 変数スコープオプション
    'gui.gui.variableScopeOptionAllSprites': 'すべてのスプライト用',
    'gui.gui.variableScopeOptionSpriteOnly': 'このスプライトのみ',
    'gui.gui.cloudVariableOption': 'クラウド変数（サーバーに保存）',
    'gui.gui.variablePromptAllSpritesMessage': 'この変数はすべてのスプライトで利用できます。',
    'gui.gui.listPromptAllSpritesMessage': 'このリストはすべてのスプライトで利用できます。',
    
    // ===== アセット追加フロートボタン =====
    
    // スプライト選択
    'gui.spriteSelector.addSpriteFromLibrary': 'スプライトを選ぶ',
    'gui.spriteSelector.addSpriteFromPaint': '描く',
    'gui.spriteSelector.addSpriteFromSurprise': 'サプライズ',
    'gui.spriteSelector.addSpriteFromFile': 'スプライトをアップロード',
    
    // ステージ選択
    'gui.spriteSelector.addBackdropFromLibrary': 'ページ背景を選ぶ',
    'gui.stageSelector.addBackdropFromPaint': '描く',
    'gui.stageSelector.addBackdropFromSurprise': 'サプライズ',
    'gui.stageSelector.addBackdropFromFile': 'ページ背景をアップロード',
    
    // ===== ライブラリ関連 =====
    
    'gui.library.filterPlaceholder': '検索',
    'gui.library.allTag': 'すべて',
    'gui.library.gettingStarted': 'はじめよう',
    'gui.library.basics': '基本',
    'gui.library.intermediate': '中級',
    'gui.library.prompts': 'ヒント',
    
    // ===== 音エディター内部 =====
    
    // 基本コントロール
    'gui.soundEditor.sound': '音',
    'gui.soundEditor.play': '再生',
    'gui.soundEditor.stop': '停止',
    'gui.soundEditor.save': '保存',
    'gui.soundEditor.undo': '元に戻す',
    'gui.soundEditor.redo': 'やり直し',
    
    // 編集アクション
    'gui.soundEditor.copy': 'コピー',
    'gui.soundEditor.paste': '貼り付け',
    'gui.soundEditor.copyToNew': '新規にコピー',
    'gui.soundEditor.delete': '削除',
    
    // 音響効果
    'gui.soundEditor.faster': '速く',
    'gui.soundEditor.slower': '遅く',
    'gui.soundEditor.louder': '大きく',
    'gui.soundEditor.softer': '小さく',
    'gui.soundEditor.echo': 'エコー',
    'gui.soundEditor.robot': 'ロボット',
    'gui.soundEditor.reverse': '逆再生',
    'gui.soundEditor.fadeIn': 'フェードイン',
    'gui.soundEditor.fadeOut': 'フェードアウト',
    'gui.soundEditor.mute': 'ミュート',
    
    // ===== ペイントエディター内部 =====
    
    // モード変換
    'paint.paintEditor.bitmap': 'ビットマップに変換',
    'paint.paintEditor.vector': 'ベクターに変換',
    
    // ペイントエディターコントロール
    'paint.paintEditor.costume': 'コスチューム',
    'paint.paintEditor.undo': '元に戻す',
    'paint.paintEditor.redo': 'やり直し',
    'paint.paintEditor.group': 'グループ化',
    'paint.paintEditor.ungroup': 'グループ解除',
    'paint.paintEditor.forward': '前へ',
    'paint.paintEditor.backward': '後ろへ',
    'paint.paintEditor.front': '最前面へ',
    'paint.paintEditor.back': '最背面へ',
    'paint.paintEditor.more': 'その他',
    
    // ペイントツール
    'paint.brushMode.brush': 'ブラシ',
    'paint.eraserMode.eraser': '消しゴム',
    'paint.fillMode.fill': '塗りつぶし',
    'paint.lineMode.line': '線',
    'paint.ovalMode.oval': '円',
    'paint.rectMode.rect': '四角形',
    'paint.reshapeMode.reshape': '変形',
    'paint.roundedRectMode.roundedRect': '角丸四角形',
    'paint.selectMode.select': '選択',
    'paint.textMode.text': 'テキスト',
    
    // ツールオプション
    'paint.modeTools.copy': 'コピー',
    'paint.modeTools.paste': '貼り付け',
    'paint.modeTools.delete': '削除',
    'paint.modeTools.curved': '曲線',
    'paint.modeTools.pointed': '角あり',
    'paint.modeTools.thickness': '太さ',
    'paint.modeTools.brushSize': 'サイズ',
    'paint.modeTools.eraserSize': '消しゴムサイズ',
    'paint.modeTools.flipHorizontal': '水平反転',
    'paint.modeTools.flipVertical': '垂直反転',
    'paint.modeTools.filled': '塗りつぶし',
    'paint.modeTools.outlined': '輪郭',
    
    // プロパティ
    'paint.paintEditor.fill': '塗り',
    'paint.paintEditor.stroke': '輪郭',
    'paint.paintEditor.hue': '色',
    'paint.paintEditor.saturation': '彩度',
    'paint.paintEditor.brightness': '明度',
    'paint.colorPicker.swap': '入れ替え',
    
    // ===== デフォルトプロジェクト関連 =====
    
    'gui.defaultProject.variable': '変数',
    'gui.defaultProject.meow': 'meow',
    
    // ===== コントロール関連 =====
    
    'gui.controls.go': '開始',
    'gui.controls.stop': '停止',
    
    // ===== プロジェクトタイトル関連 =====
    
    'gui.gui.defaultProjectTitle': '無題のプロジェクト',
    
};

// 英語メッセージ定義（フォールバック用）
const englishMessages = {
    // Menu Bar & Navigation
    'gui.menuBar.file': 'File',
    'gui.menuBar.edit': 'Edit',
    'gui.menuBar.new': 'New',
    'gui.menuBar.saveNow': 'Save now',
    'gui.menuBar.saveAsCopy': 'Save as a copy',
    'gui.menuBar.downloadToComputer': 'Save to your computer',
    'gui.menuBar.remix': 'Remix',
    'gui.menuBar.share': 'Share',
    'gui.menuBar.seeProjectPage': 'See project page',
    'gui.menuBar.joinScratch': 'Join Scratch',
    'gui.menuBar.signIn': 'Sign in',
    'gui.menuBar.settings': 'Settings',
    'gui.menuBar.language': 'Language',
    'gui.menuBar.colorMode': 'Color Mode',
    'gui.menuBar.restore': 'Restore',
    'gui.menuBar.restoreSprite': 'Restore Sprite',
    'gui.menuBar.restoreSound': 'Restore Sound',
    'gui.menuBar.restoreCostume': 'Restore Costume',
    'gui.menuBar.turboModeOn': 'Turn on Turbo Mode',
    'gui.menuBar.turboModeOff': 'Turn off Turbo Mode',
    'gui.menuBar.modeMenu': 'Mode',
    'gui.menuBar.normalMode': 'Normal mode',
    'gui.menuBar.caturdayMode': 'Caturday mode',
    
    // Main Tabs
    'gui.gui.codeTab': 'Code',
    'gui.gui.costumesTab': 'Costumes',
    'gui.gui.soundsTab': 'Sounds',
    'gui.gui.backdropsTab': 'Backdrops',
    'gui.gui.addExtension': 'Add Extension',
    
    // Stage & Sprite Areas
    'gui.stageSelector.stage': 'Stage',
    'gui.stageSelector.backdrops': 'Backdrops',
    'gui.stageHeader.stageSizeLarge': 'Switch to large stage',
    'gui.stageHeader.stageSizeSmall': 'Switch to small stage',
    'gui.stageHeader.stageSizeFull': 'Enter full screen mode',
    'gui.stageHeader.stageSizeUnFull': 'Exit full screen mode',
    'videoSensing.stage': 'Stage',
    
    // Sprite Info
    'gui.SpriteInfo.sprite': 'Sprite',
    'gui.SpriteInfo.show': 'Show',
    'gui.SpriteInfo.size': 'Size',
    'gui.SpriteInfo.direction': 'Direction',
    'gui.SpriteInfo.spritePlaceholder': 'Name',
    'gui.SpriteInfo.showSpriteAction': 'Show sprite',
    'gui.SpriteInfo.hideSpriteAction': 'Hide sprite',
    
    'gui.spriteSelector.sprite': 'Sprite',
    'gui.spriteSelector.addSprite': 'Add Sprite',
    'gui.spriteSelectorItem.contextMenuDuplicate': 'duplicate',
    'gui.spriteSelectorItem.contextMenuExport': 'export',
    'gui.spriteSelectorItem.contextMenuDelete': 'delete',
    
    'gui.stageSelector.backdrop': 'Backdrop',
    'gui.stageSelector.addBackdrop': 'Add Backdrop',
    
    // File Operations
    'gui.sharedMessages.replaceProjectWarning': 'Replace contents of the current project?',
    'gui.sharedMessages.loadFromComputerTitle': 'Load from your computer',
    'gui.menuBar.saveNowLink': 'Save now',
    'gui.menuBar.isShared': 'Shared',
    'gui.sharedMessages.sprite': 'Sprite{index}',
    'gui.sharedMessages.costume': 'costume{index}',
    'gui.sharedMessages.backdrop': 'backdrop{index}',
    'gui.sharedMessages.pop': 'pop',
    
    // Alerts
    'gui.alerts.createsuccess': 'New project created.',
    'gui.alerts.createcopysuccess': 'Project saved as a copy.',
    'gui.alerts.createremixsuccess': 'Project saved as a remix.',
    'gui.alerts.savesuccess': 'Project saved.',
    'gui.alerts.creating': 'Creating new…',
    'gui.alerts.creatingCopy': 'Copying project…',
    'gui.alerts.creatingRemix': 'Remixing project…',
    'gui.alerts.saving': 'Saving project…',
    'gui.alerts.importing': 'Importing…',
    'gui.alerts.creatingError': 'Could not create the project. Please try again!',
    'gui.alerts.savingError': 'Project could not save.',
    'gui.alerts.lostPeripheralConnection': 'Lost connection',
    'gui.alerts.tryAgain': 'Try again',
    'gui.alerts.download': 'Download',
    'gui.connection.reconnect': 'Reconnect',
    'gui.alerts.ok': 'OK',
    'gui.alerts.cancel': 'Cancel',
    'gui.alerts.save': 'Save',
    'gui.alerts.load': 'Load',
    'gui.alerts.delete': 'Delete',
    'gui.alerts.duplicate': 'Duplicate',
    'gui.alerts.rename': 'Rename',
    
    // Extensions
    'gui.extensionLibrary.chooseAnExtension': 'Choose an Extension',
    'gui.extensionLibrary.extensionUrl': 'Extension URL',
    'gui.extensionLibrary.comingSoon': 'Coming Soon',
    'gui.extensionLibrary.requires': 'Requires',
    'gui.extensionLibrary.collaboration': 'Collaboration with',
    'gui.extension.music.name': 'Music',
    'gui.extension.music.description': 'Play instruments and drums.',
    'gui.extension.pen.name': 'Pen',
    'gui.extension.pen.description': 'Draw with your sprites.',
    'gui.extension.videosensing.name': 'Video Sensing',
    'gui.extension.videosensing.description': 'Sense motion with the camera.',
    'gui.extension.text2speech.name': 'Text to Speech',
    'gui.extension.text2speech.description': 'Make your projects talk.',
    'gui.extension.translate.name': 'Translate',
    'gui.extension.translate.description': 'Translate text into many languages.',
    'gui.extension.makeymakey.description': 'Make anything into a key.',
    'gui.extension.microbit.description': 'Connect your projects with the world.',
    'gui.extension.ev3.description': 'Build interactive robots and more.',
    'gui.extension.boost.description': 'Bring robotic creations to life.',
    'gui.extension.wedo2.description': 'Build with motors and sensors.',
    'gui.extension.gdxfor.description': 'Sense push, pull, motion, and spin.',
    
    // Library Tags
    'gui.libraryTags.all': 'All',
    'gui.libraryTags.animals': 'Animals',
    'gui.libraryTags.dance': 'Dance',
    'gui.libraryTags.effects': 'Effects',
    'gui.libraryTags.fantasy': 'Fantasy',
    'gui.libraryTags.fashion': 'Fashion',
    'gui.libraryTags.food': 'Food',
    'gui.libraryTags.games': 'Games',
    'gui.libraryTags.music': 'Music',
    'gui.libraryTags.people': 'People',
    'gui.libraryTags.space': 'Space',
    'gui.libraryTags.sports': 'Sports',
    'gui.libraryTags.stories': 'Stories',
    
    'gui.library.spriteLibrary': 'Sprite Library',
    'gui.library.costumeLibrary': 'Costume Library',
    'gui.library.soundLibrary': 'Sound Library',
    'gui.library.backdropLibrary': 'Backdrop Library',
    
    // Dialogs
    'gui.prompt.ok': 'OK',
    'gui.prompt.cancel': 'Cancel',
    'gui.modal.back': 'Back',
    'gui.modal.help': 'Help',
    'gui.sliderPrompt.ok': 'OK',
    'gui.sliderPrompt.cancel': 'Cancel',
    
    // Custom Procedures
    'gui.customProcedures.addAnInputNumberText': 'Add an input',
    'gui.customProcedures.addAnInputBoolean': 'Add an input',
    'gui.customProcedures.addALabel': 'Add a label',
    'gui.customProcedures.runWithoutScreenRefresh': 'Run without screen refresh',
    'gui.customProcedures.cancel': 'Cancel',
    'gui.customProcedures.ok': 'OK',
    'gui.customProcedures.numberTextType': 'number or text',
    'gui.customProcedures.booleanType': 'boolean',
    
    // Monitors
    'gui.monitor.contextMenu.default': 'normal readout',
    'gui.monitor.contextMenu.large': 'large readout',
    'gui.monitor.contextMenu.slider': 'slider',
    'gui.monitor.contextMenu.hide': 'hide',
    'gui.monitor.listMonitor.empty': '(empty)',
    'gui.monitor.listMonitor.listLength': 'length {length}',
    
    // Backpack
    'gui.backpack.header': 'Backpack',
    'gui.backpack.emptyBackpack': 'Backpack is empty',
    'gui.backpack.loadingBackpack': 'Loading...',
    'gui.backpack.errorBackpack': 'Error loading backpack',
    'gui.backpack.more': 'More',
    
    // Opcode Labels
    'gui.opcodeLabels.direction': 'direction',
    'gui.opcodeLabels.size': 'size',
    'gui.opcodeLabels.costumename': 'costume name',
    'gui.opcodeLabels.costumenumber': 'costume #',
    'gui.opcodeLabels.backdropname': 'backdrop name',
    'gui.opcodeLabels.backdropnumber': 'backdrop #',
    'gui.opcodeLabels.loudness': 'loudness',
    'gui.opcodeLabels.timer': 'timer',
    'gui.opcodeLabels.answer': 'answer',
    'gui.opcodeLabels.username': 'username',
    'gui.opcodeLabels.year': 'year',
    'gui.opcodeLabels.month': 'month',
    'gui.opcodeLabels.date': 'date',
    'gui.opcodeLabels.dayofweek': 'day of week',
    'gui.opcodeLabels.hour': 'hour',
    'gui.opcodeLabels.minute': 'minute',
    'gui.opcodeLabels.second': 'second',
    
    // Cards
    'gui.cards.all-tutorials': 'Tutorials',
    'gui.cards.close': 'Close',
    'gui.cards.more-things-to-try': 'More things to try!',
    'gui.cards.see-more': 'See more',
    'gui.cards.shrink': 'Shrink',
    'gui.cards.expand': 'Expand',
    
    // Loader
    'gui.loader.headline': 'Loading Project',
    'gui.loader.creating': 'Creating Project',
    'gui.loader.message1': 'Creating blocks …',
    'gui.loader.message2': 'Loading sprites …',
    'gui.loader.message3': 'Loading sounds …',
    'gui.loader.message4': 'Loading extensions …',
    'gui.loader.message5': 'Herding cats …',
    'gui.loader.message6': 'Transmitting nano-particles …',
    'gui.loader.message7': 'Inflating goblins …',
    'gui.loader.message8': 'Preparing emojis …',
    
    // Tabs
    'gui.costumeTab.costumes': 'Costumes',
    'gui.soundTab.sounds': 'Sounds',
    'gui.codeTab.code': 'Code',
    
    // Project
    'gui.projectLoader.loadProject': 'Load Project',
    'gui.projectLoader.saveProject': 'Save Project',
    'gui.projectLoader.createProject': 'Create Project',
    
    // Sound Tab
    'gui.soundTab.fileUploadSound': 'Upload Sound',
    'gui.soundTab.surpriseSound': 'Surprise',
    'gui.soundTab.recordSound': 'Record',
    'gui.soundTab.addSoundFromLibrary': 'Choose a Sound',
    
    // Recording Modal
    'gui.recordModal.title': 'Record Sound',
    'gui.recordingStep.beginRecord': 'Begin recording by clicking the button below',
    'gui.recordingStep.permission': '{arrow}We need your permission to use your microphone',
    'gui.recordingStep.stop': 'Stop recording',
    'gui.recordingStep.record': 'Record',
    'gui.playbackStep.stopMsg': 'Stop',
    'gui.playbackStep.playMsg': 'Play',
    'gui.playbackStep.loadingMsg': 'Loading...',
    'gui.playbackStep.saveMsg': 'Save',
    'gui.playbackStep.reRecordMsg': 'Re-record',
    
    // Costume Tab
    'gui.costumeTab.addBackdropFromLibrary': 'Choose a Backdrop',
    'gui.costumeTab.addCostumeFromLibrary': 'Choose a Costume',
    'gui.costumeTab.addBlankCostume': 'Paint',
    'gui.costumeTab.addSurpriseCostume': 'Surprise',
    'gui.costumeTab.addFileBackdrop': 'Upload Backdrop',
    'gui.costumeTab.addFileCostume': 'Upload Costume',
    
    // Delete Confirmation
    'gui.gui.shouldDeleteSprite': 'Are you sure you want to delete this sprite?',
    'gui.gui.shouldDeleteCostume': 'Are you sure you want to delete this costume?',
    'gui.gui.shouldDeleteSound': 'Are you sure you want to delete this sound?',
    'gui.gui.confirm': 'yes',
    'gui.gui.cancel': 'no',
    'gui.gui.deleteAssetHeading': 'Confirm Asset Deletion',
    
    // Variable Scope Options
    'gui.gui.variableScopeOptionAllSprites': 'For all sprites',
    'gui.gui.variableScopeOptionSpriteOnly': 'For this sprite only',
    'gui.gui.cloudVariableOption': 'Cloud variable (stored on server)',
    'gui.gui.variablePromptAllSpritesMessage': 'This variable will be available to all sprites.',
    'gui.gui.listPromptAllSpritesMessage': 'This list will be available to all sprites.',
    
    // Asset Addition Buttons
    'gui.spriteSelector.addSpriteFromLibrary': 'Choose a Sprite',
    'gui.spriteSelector.addSpriteFromPaint': 'Paint',
    'gui.spriteSelector.addSpriteFromSurprise': 'Surprise',
    'gui.spriteSelector.addSpriteFromFile': 'Upload Sprite',
    'gui.spriteSelector.addBackdropFromLibrary': 'Choose a Backdrop',
    'gui.stageSelector.addBackdropFromPaint': 'Paint',
    'gui.stageSelector.addBackdropFromSurprise': 'Surprise',
    'gui.stageSelector.addBackdropFromFile': 'Upload Backdrop',
    
    // Library
    'gui.library.filterPlaceholder': 'Search',
    'gui.library.allTag': 'All',
    'gui.library.gettingStarted': 'Getting Started',
    'gui.library.basics': 'Basics',
    'gui.library.intermediate': 'Intermediate',
    'gui.library.prompts': 'Prompts',
    
    // Sound Editor
    'gui.soundEditor.sound': 'Sound',
    'gui.soundEditor.play': 'Play',
    'gui.soundEditor.stop': 'Stop',
    'gui.soundEditor.save': 'Save',
    'gui.soundEditor.undo': 'Undo',
    'gui.soundEditor.redo': 'Redo',
    'gui.soundEditor.copy': 'Copy',
    'gui.soundEditor.paste': 'Paste',
    'gui.soundEditor.copyToNew': 'Copy to New',
    'gui.soundEditor.delete': 'Delete',
    'gui.soundEditor.faster': 'Faster',
    'gui.soundEditor.slower': 'Slower',
    'gui.soundEditor.louder': 'Louder',
    'gui.soundEditor.softer': 'Softer',
    'gui.soundEditor.echo': 'Echo',
    'gui.soundEditor.robot': 'Robot',
    'gui.soundEditor.reverse': 'Reverse',
    'gui.soundEditor.fadeIn': 'Fade in',
    'gui.soundEditor.fadeOut': 'Fade out',
    'gui.soundEditor.mute': 'Mute',
    
    // Paint Editor
    'paint.paintEditor.bitmap': 'Convert to Bitmap',
    'paint.paintEditor.vector': 'Convert to Vector',
    'paint.paintEditor.costume': 'Costume',
    'paint.paintEditor.undo': 'Undo',
    'paint.paintEditor.redo': 'Redo',
    'paint.paintEditor.group': 'Group',
    'paint.paintEditor.ungroup': 'Ungroup',
    'paint.paintEditor.forward': 'Forward',
    'paint.paintEditor.backward': 'Backward',
    'paint.paintEditor.front': 'Front',
    'paint.paintEditor.back': 'Back',
    'paint.paintEditor.more': 'More',
    'paint.brushMode.brush': 'Brush',
    'paint.eraserMode.eraser': 'Eraser',
    'paint.fillMode.fill': 'Fill',
    'paint.lineMode.line': 'Line',
    'paint.ovalMode.oval': 'Circle',
    'paint.rectMode.rect': 'Rectangle',
    'paint.reshapeMode.reshape': 'Reshape',
    'paint.roundedRectMode.roundedRect': 'Rounded Rectangle',
    'paint.selectMode.select': 'Select',
    'paint.textMode.text': 'Text',
    'paint.modeTools.copy': 'Copy',
    'paint.modeTools.paste': 'Paste',
    'paint.modeTools.delete': 'Delete',
    'paint.modeTools.curved': 'Curved',
    'paint.modeTools.pointed': 'Pointed',
    'paint.modeTools.thickness': 'Thickness',
    'paint.modeTools.brushSize': 'Size',
    'paint.modeTools.eraserSize': 'Eraser size',
    'paint.modeTools.flipHorizontal': 'Flip Horizontal',
    'paint.modeTools.flipVertical': 'Flip Vertical',
    'paint.modeTools.filled': 'Filled',
    'paint.modeTools.outlined': 'Outlined',
    'paint.paintEditor.fill': 'Fill',
    'paint.paintEditor.stroke': 'Outline',
    'paint.paintEditor.hue': 'Color',
    'paint.paintEditor.saturation': 'Saturation',
    'paint.paintEditor.brightness': 'Brightness',
    'paint.colorPicker.swap': 'Swap',
    
    // Default Project
    'gui.defaultProject.variable': 'variable',
    'gui.defaultProject.meow': 'Meow',
    
    // Controls
    'gui.controls.go': 'Go',
    'gui.controls.stop': 'Stop',
    
    // Project Title
    'gui.gui.defaultProjectTitle': 'Untitled Project',

};

// カスタムメッセージコレクション
const customMessages = {
    ja: japaneseMessages,
    en: englishMessages
};

/**
 * 指定された言語のメッセージを取得
 * @param {string} locale - 言語コード (ja, en)
 * @returns {object} メッセージオブジェクト
 */
export const getCustomMessages = (locale = 'en') => {
    return customMessages[locale] || customMessages.en;
};

/**
 * 全言語のメッセージを取得
 * @returns {object} 全言語のメッセージオブジェクト
 */
export const getAllCustomMessages = () => {
    return customMessages;
};

/**
 * 新しいメッセージを追加
 * @param {string} locale - 言語コード
 * @param {string} messageId - メッセージID
 * @param {string} message - メッセージ内容
 */
export const addCustomMessage = (locale, messageId, message) => {
    if (!customMessages[locale]) {
        customMessages[locale] = {};
    }
    customMessages[locale][messageId] = message;
};

/**
 * メッセージを更新
 * @param {string} locale - 言語コード
 * @param {object} messages - 更新するメッセージオブジェクト
 */
export const updateCustomMessages = (locale, messages) => {
    if (!customMessages[locale]) {
        customMessages[locale] = {};
    }
    customMessages[locale] = {
        ...customMessages[locale],
        ...messages
    };
};

export default customMessages;