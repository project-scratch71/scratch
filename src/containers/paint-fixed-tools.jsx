import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import bindAll from 'lodash.bindall';

import FixedToolsComponent from '../components/paint-editor-fixed-tools/fixed-tools.jsx';

import {shouldShowGroup, shouldShowUngroup} from '../../node_modules/scratch-paint/src/helper/group';
import {shouldShowBringForward, shouldShowSendBackward} from '../../node_modules/scratch-paint/src/helper/order';
import {getSelectedLeafItems} from '../../node_modules/scratch-paint/src/helper/selection';
import {bringToFront, sendBackward, sendToBack, bringForward} from '../../node_modules/scratch-paint/src/helper/order';
import {groupSelection, ungroupSelection} from '../../node_modules/scratch-paint/src/helper/group';
import {setSelectedItems, clearSelectedItems} from '../../node_modules/scratch-paint/src/reducers/selected-items';
import Formats, {isBitmap} from '../../node_modules/scratch-paint/src/lib/format';

class PaintFixedTools extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleSendBackward',
            'handleSendForward',
            'handleSendToBack',
            'handleSendToFront',
            'handleSetSelectedItems',
            'handleGroup',
            'handleUngroup'
        ]);
    }
    handleGroup () {
        groupSelection(this.props.clearSelectedItems, this.handleSetSelectedItems, this.props.onUpdateImage);
    }
    handleUngroup () {
        ungroupSelection(this.props.clearSelectedItems, this.handleSetSelectedItems, this.props.onUpdateImage);
    }
    handleSendBackward () {
        sendBackward(this.props.onUpdateImage);
    }
    handleSendForward () {
        bringForward(this.props.onUpdateImage);
    }
    handleSendToBack () {
        sendToBack(this.props.onUpdateImage);
    }
    handleSendToFront () {
        bringToFront(this.props.onUpdateImage);
    }
    handleSetSelectedItems () {
        this.props.setSelectedItems(this.props.format);
    }
    render () {
        return (
            <FixedToolsComponent
                canRedo={this.props.canRedo}
                canUndo={this.props.canUndo}
                name={this.props.name}
                onGroup={this.handleGroup}
                onRedo={this.props.onRedo}
                onSendBackward={this.handleSendBackward}
                onSendForward={this.handleSendForward}
                onSendToBack={this.handleSendToBack}
                onSendToFront={this.handleSendToFront}
                onUndo={this.props.onUndo}
                onUngroup={this.handleUngroup}
                onUpdateImage={this.props.onUpdateImage}
                onUpdateName={this.props.onUpdateName}
            />
        );
    }
}

PaintFixedTools.propTypes = {
    canRedo: PropTypes.func.isRequired,
    canUndo: PropTypes.func.isRequired,
    clearSelectedItems: PropTypes.func.isRequired,
    format: PropTypes.oneOf(Object.keys(Formats)),
    name: PropTypes.string,
    onRedo: PropTypes.func.isRequired,
    onUndo: PropTypes.func.isRequired,
    onUpdateImage: PropTypes.func.isRequired,
    onUpdateName: PropTypes.func.isRequired,
    setSelectedItems: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    format: state.scratchPaint.format,
    selectedItems: state.scratchPaint.selectedItems
});

const mapDispatchToProps = dispatch => ({
    clearSelectedItems: () => {
        dispatch(clearSelectedItems());
    },
    setSelectedItems: format => {
        dispatch(setSelectedItems(getSelectedLeafItems(), isBitmap(format)));
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PaintFixedTools);