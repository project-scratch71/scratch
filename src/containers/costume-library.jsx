import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import VM from 'scratch-vm';

// import costumeLibraryContent from '../lib/libraries/costumes.json'; // Replaced with dynamic loading
import spriteTags from '../lib/libraries/sprite-tags';
import LibraryComponent from '../components/library/library.jsx';
import { FaTshirt } from 'react-icons/fa';

const messages = defineMessages({
    libraryTitle: {
        defaultMessage: 'Choose a Costume',
        description: 'Heading for the costume library',
        id: 'gui.costumeLibrary.chooseACostume'
    }
});


class CostumeLibrary extends React.PureComponent {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleItemSelected'
        ]);
        this.state = {
            costumeLibraryContent: [],
            loading: true,
            error: null
        };
    }
    
    async componentDidMount() {
        try {
            const assetHost = process.env.ASSET_HOST || 'http://localhost:3000/api/assets';
            const baseUrl = assetHost.replace('/api/assets', '');
            const response = await fetch(`${baseUrl}/api/costumes/available`);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch available costumes: ${response.status}`);
            }
            
            const costumeLibraryContent = await response.json();
            console.log('Loaded costumes:', costumeLibraryContent.length);
            
            this.setState({ 
                costumeLibraryContent, 
                loading: false 
            });
        } catch (error) {
            console.error('Error loading available costumes:', error);
            this.setState({ 
                error: error.message, 
                loading: false 
            });
        }
    }
    handleItemSelected (item) {
        const vmCostume = {
            name: item.name,
            rotationCenterX: item.rotationCenterX,
            rotationCenterY: item.rotationCenterY,
            bitmapResolution: item.bitmapResolution,
            skinId: null
        };
        this.props.vm.addCostumeFromLibrary(item.md5ext, vmCostume);
    }
    render () {
        if (this.state.loading) {
            return (
                <LibraryComponent
                    data={[]}
                    id="costumeLibrary"
                    tags={spriteTags}
                    title="Loading costumes..."
                    onItemSelected={this.handleItemSelected}
                    onRequestClose={this.props.onRequestClose}
                />
            );
        }
        
        if (this.state.error) {
            return (
                <LibraryComponent
                    data={[]}
                    id="costumeLibrary"
                    tags={spriteTags}
                    title={`Error: ${this.state.error}`}
                    onItemSelected={this.handleItemSelected}
                    onRequestClose={this.props.onRequestClose}
                />
            );
        }
        
        const costumeDataWithIcons = this.state.costumeLibraryContent.map(costume => ({
            ...costume,
            icon: <FaTshirt size={48} />
        }));
        
        return (
            <LibraryComponent
                data={costumeDataWithIcons}
                id="costumeLibrary"
                tags={spriteTags}
                title={this.props.intl.formatMessage(messages.libraryTitle)}
                onItemSelected={this.handleItemSelected}
                onRequestClose={this.props.onRequestClose}
            />
        );
    }
}

CostumeLibrary.propTypes = {
    intl: intlShape.isRequired,
    onRequestClose: PropTypes.func,
    vm: PropTypes.instanceOf(VM).isRequired
};

export default injectIntl(CostumeLibrary);
