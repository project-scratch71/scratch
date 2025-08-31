import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import VM from 'scratch-vm';

import backdropTags from '../lib/libraries/backdrop-tags';
import LibraryComponent from '../components/library/library.jsx';

const messages = defineMessages({
    libraryTitle: {
        defaultMessage: 'Choose a Backdrop',
        description: 'Heading for the backdrop library',
        id: 'gui.costumeLibrary.chooseABackdrop'
    }
});


class BackdropLibrary extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleItemSelect'
        ]);
        this.state = {
            backdropLibraryContent: [],
            loading: true,
            error: null
        };
    }
    
    async componentDidMount() {
        try {
            const assetHost = process.env.ASSET_HOST || 'http://localhost:3000/api/assets';
            const baseUrl = assetHost.replace('/api/assets', '');
            const url = `${baseUrl}/api/backdrops/available`;
            
            console.log('Fetching backdrops from:', url);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch available backdrops: ${response.status}`);
            }
            
            const backdropLibraryContent = await response.json();
            console.log('Loaded backdrops:', backdropLibraryContent.length, 'backdrops');
            
            this.setState({ 
                backdropLibraryContent, 
                loading: false 
            });
        } catch (error) {
            console.error('Error loading available backdrops:', error);
            this.setState({ 
                error: error.message, 
                loading: false 
            });
        }
    }
    handleItemSelect (item) {
        const vmBackdrop = {
            name: item.name,
            rotationCenterX: item.rotationCenterX,
            rotationCenterY: item.rotationCenterY,
            bitmapResolution: item.bitmapResolution,
            skinId: null
        };
        // Do not switch to stage, just add the backdrop
        this.props.vm.addBackdrop(item.md5ext, vmBackdrop);
    }
    render () {
        if (this.state.loading) {
            return (
                <LibraryComponent
                    data={[]}
                    id="backdropLibrary"
                    tags={backdropTags}
                    title="Loading backdrops..."
                    onItemSelected={this.handleItemSelect}
                    onRequestClose={this.props.onRequestClose}
                />
            );
        }
        
        if (this.state.error) {
            return (
                <LibraryComponent
                    data={[]}
                    id="backdropLibrary"
                    tags={backdropTags}
                    title={`Error: ${this.state.error}`}
                    onItemSelected={this.handleItemSelect}
                    onRequestClose={this.props.onRequestClose}
                />
            );
        }
        
        return (
            <LibraryComponent
                data={this.state.backdropLibraryContent}
                id="backdropLibrary"
                tags={backdropTags}
                title={this.props.intl.formatMessage(messages.libraryTitle)}
                onItemSelected={this.handleItemSelect}
                onRequestClose={this.props.onRequestClose}
            />
        );
    }
}

BackdropLibrary.propTypes = {
    intl: intlShape.isRequired,
    onRequestClose: PropTypes.func,
    vm: PropTypes.instanceOf(VM).isRequired
};

export default injectIntl(BackdropLibrary);
