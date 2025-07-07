import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import {injectIntl, intlShape, defineMessages} from 'react-intl';
import VM from 'scratch-vm';

// ====================================================================================
// FetchWorkerTool問題の修正: Worker無効化してFetchToolを使用
// ====================================================================================
const originalAddSprite = VM.prototype.addSprite;

VM.prototype.addSprite = function patchedAddSprite(input) {
    console.log('🟡 addSprite パッチが実行されました');
    
    // 先ほどの調査結果に基づく直接アクセス
    const helpers = this.runtime.storage._helpers.map(x => x.helper);
    const assetTool = helpers[1].assetTool;
    
    console.log('🔧 assetTool:', assetTool);
    console.log('🔧 assetTool.constructor.name:', assetTool.constructor.name);
    console.log('🔧 assetTool.tools:', assetTool.tools);
    console.log('🔧 tools length:', assetTool.tools.length);
    
    assetTool.tools.forEach((tool, index) => {
        console.log(`🔧 Tool[${index}]:`, tool.constructor.name, 'isGetSupported:', tool.isGetSupported);
    });
    
    if (assetTool.tools.length >= 2) {
        const fetchWorkerTool = assetTool.tools[0]; // PublicFetchWorkerTool
        const fetchTool = assetTool.tools[1]; // FetchTool
        
        console.log('🔧 FetchWorkerTool before:', fetchWorkerTool.isGetSupported);
        
        // FetchWorkerToolのisGetSupportedを無効化
        // Object.defineProperty(fetchWorkerTool, 'isGetSupported', {
        //     get: () => false,
        //     configurable: true
        // });
        
        console.log('🔧 FetchWorkerTool after:', fetchWorkerTool.isGetSupported);
        console.log('🔧 FetchTool supported:', fetchTool.isGetSupported);
        console.log('🔧 FetchWorkerTool無効化完了 → FetchTool使用');
    }
    
    // 元のaddSprite処理を実行
    console.log('🔧 元のaddSprite処理を実行');
    return originalAddSprite.call(this, input);
};

import spriteLibraryContent from '../lib/libraries/sprites.json';
import randomizeSpritePosition from '../lib/randomize-sprite-position';
import spriteTags from '../lib/libraries/sprite-tags';

import LibraryComponent from '../components/library/library.jsx';

const messages = defineMessages({
    libraryTitle: {
        defaultMessage: 'Choose a Sprite',
        description: 'Heading for the sprite library',
        id: 'gui.spriteLibrary.chooseASprite'
    }
});

class SpriteLibrary extends React.PureComponent {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleItemSelect'
        ]);
    }
    handleItemSelect (item) {
        // Randomize position of library sprite
        randomizeSpritePosition(item);
        this.props.vm.addSprite(JSON.stringify(item)).then(() => {
            this.props.onActivateBlocksTab();
        });
    }
    render () {
        return (
            <LibraryComponent
                data={spriteLibraryContent}
                id="spriteLibrary"
                tags={spriteTags}
                title={this.props.intl.formatMessage(messages.libraryTitle)}
                onItemSelected={this.handleItemSelect}
                onRequestClose={this.props.onRequestClose}
            />
        );
    }
}

SpriteLibrary.propTypes = {
    intl: intlShape.isRequired,
    onActivateBlocksTab: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func,
    vm: PropTypes.instanceOf(VM).isRequired
};

export default injectIntl(SpriteLibrary);