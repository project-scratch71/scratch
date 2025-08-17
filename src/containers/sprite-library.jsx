import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import {injectIntl, intlShape, defineMessages} from 'react-intl';
import VM from 'scratch-vm';
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
        this.state = {
            spriteLibraryContent: [],
            loading: true,
            error: null
        };
    }
    
    async componentDidMount() {
        try {
            const assetHost = process.env.ASSET_HOST || 'http://localhost:3000/api/assets';
            const baseUrl = assetHost.replace('/api/assets', '');
            const url = `${baseUrl}/api/sprites/available`;
            
            console.log('Fetching sprites from:', url);
            console.log('ASSET_HOST:', process.env.ASSET_HOST);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch available sprites: ${response.status}`);
            }
            
            const spriteLibraryContent = await response.json();
            console.log('Raw API response:', response.status, response.url);
            console.log('Response headers:', [...response.headers.entries()]);
            console.log('Loaded sprites:', spriteLibraryContent.length, 'sprites');
            console.log('First 3 sprites:', spriteLibraryContent.slice(0, 3));
            console.log('All sprite names:', spriteLibraryContent.map(s => s.name).slice(0, 10));
            
            this.setState({ 
                spriteLibraryContent, 
                loading: false 
            }, () => {
                console.log('After setState - sprites in state:', this.state.spriteLibraryContent.length);
                console.log('After setState - first sprite:', this.state.spriteLibraryContent[0]);
            });
        } catch (error) {
            console.error('Error loading available sprites:', error);
            this.setState({ 
                error: error.message, 
                loading: false 
            });
        }
    }
    handleItemSelect (item) {
        // Randomize position of library sprite
        randomizeSpritePosition(item);
        this.props.vm.addSprite(JSON.stringify(item)).then(() => {
            this.props.onActivateBlocksTab();
        });
    }
    render () {
        if (this.state.loading) {
            return (
                <LibraryComponent
                    data={[]}
                    id="spriteLibrary"
                    tags={spriteTags}
                    title="Loading sprites..."
                    onItemSelected={this.handleItemSelect}
                    onRequestClose={this.props.onRequestClose}
                />
            );
        }
        
        if (this.state.error) {
            return (
                <LibraryComponent
                    data={[]}
                    id="spriteLibrary"
                    tags={spriteTags}
                    title={`Error: ${this.state.error}`}
                    onItemSelected={this.handleItemSelect}
                    onRequestClose={this.props.onRequestClose}
                />
            );
        }
        
        console.log('Rendering LibraryComponent with data:', this.state.spriteLibraryContent.length, 'items');
        console.log('First item in render:', this.state.spriteLibraryContent[0]);
        
        return (
            <LibraryComponent
                data={this.state.spriteLibraryContent}
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