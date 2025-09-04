import PropTypes from 'prop-types';
import React from 'react';

import Box from '../box/box.jsx';
import SpriteList from './sprite-list.jsx';

import styles from './custom-sprite-selector.css';

const CustomSpriteSelectorComponent = function (props) {
    const {
        editingTarget,
        hoveredTarget,
        onDrop,
        onDeleteSprite,
        onDuplicateSprite,
        onExportSprite,
        onNewSpriteClick,
        onSelectSprite,
        raised,
        selectedId,
        sprites,
        stage,
        vm,
        // Custom props that should not be passed to DOM
        spriteFileInput,
        stageSize,
        setProjectId,
        isRtl,
        onChangeSpriteDirection,
        onChangeSpriteName,
        onChangeSpriteRotationStyle,
        onChangeSpriteSize,
        onChangeSpriteVisibility,
        onChangeSpriteX,
        onChangeSpriteY,
        onFileUploadClick,
        onPaintSpriteClick,
        onSpriteUpload,
        onSurpriseSpriteClick,
        ...componentProps
    } = props;
    return (
        <Box
            className={styles.spriteSelector}
            {...componentProps}
        >
            <SpriteList
                editingTarget={editingTarget}
                hoveredTarget={hoveredTarget}
                items={Object.keys(sprites).map(id => sprites[id])}
                raised={raised}
                selectedId={selectedId}
                stage={stage}
                vm={vm}
                onAddSprite={onNewSpriteClick}
                onDeleteSprite={onDeleteSprite}
                onDrop={onDrop}
                onDuplicateSprite={onDuplicateSprite}
                onExportSprite={onExportSprite}
                onSelectSprite={onSelectSprite}
            />
        </Box>
    );
};

CustomSpriteSelectorComponent.propTypes = {
    editingTarget: PropTypes.string,
    hoveredTarget: PropTypes.shape({
        hoveredSprite: PropTypes.string,
        receivedBlocks: PropTypes.bool
    }),
    onDeleteSprite: PropTypes.func,
    onDrop: PropTypes.func,
    onDuplicateSprite: PropTypes.func,
    onExportSprite: PropTypes.func,
    onNewSpriteClick: PropTypes.func,
    onSelectSprite: PropTypes.func,
    raised: PropTypes.bool,
    selectedId: PropTypes.string,
    sprites: PropTypes.shape({
        id: PropTypes.shape({
            costume: PropTypes.shape({
                url: PropTypes.string,
                name: PropTypes.string.isRequired,
                bitmapResolution: PropTypes.number.isRequired,
                rotationCenterX: PropTypes.number.isRequired,
                rotationCenterY: PropTypes.number.isRequired
            }),
            name: PropTypes.string.isRequired,
            order: PropTypes.number.isRequired
        })
    }),
    stage: PropTypes.shape({
        id: PropTypes.string,
        costume: PropTypes.object,
        costumeCount: PropTypes.number
    }),
    vm: PropTypes.shape({})
};

export default CustomSpriteSelectorComponent;
