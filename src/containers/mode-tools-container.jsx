import paper from '@scratch/paper';
import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import bindAll from 'lodash.bindall';

import CopyPasteHOC from 'scratch-paint/src/hocs/copy-paste-hoc.jsx';
import ModeToolsComponent from '../components/mode-tools/mode-tools.jsx';
import {clearSelectedItems, setSelectedItems} from 'scratch-paint/src/reducers/selected-items';
import {
    deleteSelection,
    getSelectedLeafItems,
    getSelectedRootItems,
    getAllRootItems,
    selectAllSegments
} from 'scratch-paint/src/helper/selection';
import {HANDLE_RATIO, ensureClockwise} from 'scratch-paint/src/helper/math';
import {getRaster} from 'scratch-paint/src/helper/layer';
import {flipBitmapHorizontal, flipBitmapVertical} from 'scratch-paint/src/helper/bitmap';
import Formats, {isBitmap} from 'scratch-paint/src/lib/format';
import Modes from 'scratch-paint/src/lib/modes';

class ModeToolsContainer extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            '_getSelectedUncurvedPoints',
            '_getSelectedUnpointedPoints',
            'hasSelectedUncurvedPoints',
            'hasSelectedUnpointedPoints',
            'handleCurvePoints',
            'handleFlipHorizontal',
            'handleFlipVertical',
            'handleDelete',
            'handlePasteFromClipboard',
            'handlePointPoints'
        ]);
    }
    
    _getSelectedUncurvedPoints () {
        const items = [];
        const selectedItems = getSelectedLeafItems();
        for (const item of selectedItems) {
            if (!item.segments) continue;
            for (const seg of item.segments) {
                if (seg.selected) {
                    const prev = seg.getPrevious();
                    const next = seg.getNext();
                    const isCurved =
                        (!prev || seg.handleIn.length > 0) &&
                        (!next || seg.handleOut.length > 0) &&
                        (prev && next ? seg.handleOut.isColinear(seg.handleIn) : true);
                    if (!isCurved) items.push(seg);
                }
            }
        }
        return items;
    }
    
    _getSelectedUnpointedPoints () {
        const points = [];
        const selectedItems = getSelectedLeafItems();
        for (const item of selectedItems) {
            if (!item.segments) continue;
            for (const seg of item.segments) {
                if (seg.selected) {
                    if (seg.handleIn.length > 0 || seg.handleOut.length > 0) {
                        points.push(seg);
                    }
                }
            }
        }
        return points;
    }
    
    hasSelectedUncurvedPoints () {
        const points = this._getSelectedUncurvedPoints();
        return points.length > 0;
    }
    
    hasSelectedUnpointedPoints () {
        const points = this._getSelectedUnpointedPoints();
        return points.length > 0;
    }
    
    handleCurvePoints () {
        let changed;
        const points = this._getSelectedUncurvedPoints();
        for (const point of points) {
            const prev = point.getPrevious();
            const next = point.getNext();
            const noHandles = point.handleIn.length === 0 && point.handleOut.length === 0;
            if (!prev && !next) {
                continue;
            } else if (prev && next && noHandles) {
                point.handleIn = prev.point.subtract(next.point)
                    .normalize()
                    .multiply(prev.getCurve().length * HANDLE_RATIO);
            } else if (prev && !next && point.handleIn.length === 0) {
                point.handleIn = prev.point.subtract(point.point)
                    .normalize()
                    .multiply(prev.getCurve().length * HANDLE_RATIO);
            } else if (!prev && next && point.handleOut.length === 0) {
                point.handleOut = next.point.subtract(point.point)
                    .normalize()
                    .multiply(next.getCurve().length * HANDLE_RATIO);
            }
            point.handleOut = point.handleIn.multiply(-1);
            changed = true;
        }
        if (changed) {
            this.props.setSelectedItems(this.props.format);
            this.props.onUpdateImage();
        }
    }
    
    handlePointPoints () {
        let changed;
        const points = this._getSelectedUnpointedPoints();
        for (const point of points) {
            if (point.handleIn.length > 0 || point.handleOut.length > 0) {
                point.handleIn = null;
                point.handleOut = null;
                changed = true;
            }
        }
        if (changed) {
            this.props.setSelectedItems(this.props.format);
            this.props.onUpdateImage();
        }
    }
    
    _handleFlip (horizontalScale, verticalScale, selectedItems) {
        if (selectedItems.length === 0) {
            // If nothing is selected, select everything
            selectedItems = getAllRootItems();
        }
        // Record old indices
        for (const item of selectedItems) {
            item.data.index = item.index;
        }

        // Group items so that they flip as a unit
        const itemGroup = new paper.Group(selectedItems);
        // Flip
        itemGroup.scale(horizontalScale, verticalScale);
        ensureClockwise(itemGroup);

        // Remove flipped item from group and insert at old index. Must insert from bottom index up.
        for (let i = 0; i < selectedItems.length; i++) {
            itemGroup.layer.insertChild(selectedItems[i].data.index, selectedItems[i]);
            selectedItems[i].data.index = null;
        }
        itemGroup.remove();

        this.props.onUpdateImage();
    }

    handleFlipHorizontal () {
        const selectedItems = getSelectedRootItems();
        if (isBitmap(this.props.format) && selectedItems.length === 0) {
            getRaster().canvas = flipBitmapHorizontal(getRaster().canvas);
            this.props.onUpdateImage();
        } else {
            this._handleFlip(-1, 1, selectedItems);
        }
    }
    
    handleFlipVertical () {
        const selectedItems = getSelectedRootItems();
        if (isBitmap(this.props.format) && selectedItems.length === 0) {
            getRaster().canvas = flipBitmapVertical(getRaster().canvas);
            this.props.onUpdateImage();
        } else {
            this._handleFlip(1, -1, selectedItems);
        }
    }
    
    handleDelete () {
        if (deleteSelection(this.props.mode, this.props.onUpdateImage)) {
            this.props.setSelectedItems(this.props.format);
        }
    }
    
    handlePasteFromClipboard () {
        this.props.onPasteFromClipboard();
        this.props.setSelectedItems(this.props.format);
        this.props.onUpdateImage();
    }
    
    render () {
        return (
            <ModeToolsComponent
                hasSelectedUncurvedPoints={this.hasSelectedUncurvedPoints()}
                hasSelectedUnpointedPoints={this.hasSelectedUnpointedPoints()}
                onCopyToClipboard={this.props.onCopyToClipboard}
                onCurvePoints={this.handleCurvePoints}
                onDelete={this.handleDelete}
                onFlipHorizontal={this.handleFlipHorizontal}
                onFlipVertical={this.handleFlipVertical}
                onPasteFromClipboard={this.handlePasteFromClipboard}
                onPointPoints={this.handlePointPoints}
                onUpdateImage={this.props.onUpdateImage}
                {...this.props}
            />
        );
    }
}

ModeToolsContainer.propTypes = {
    clearSelectedItems: PropTypes.func.isRequired,
    clipboardItems: PropTypes.arrayOf(PropTypes.array),
    format: PropTypes.oneOf(Object.keys(Formats)),
    mode: PropTypes.oneOf(Object.keys(Modes)),
    onCopyToClipboard: PropTypes.func.isRequired,
    onPasteFromClipboard: PropTypes.func.isRequired,
    onUpdateImage: PropTypes.func.isRequired,
    setSelectedItems: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    clipboardItems: state.scratchPaint.clipboard.items,
    format: state.scratchPaint.format,
    mode: state.scratchPaint.mode,
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

export default CopyPasteHOC(connect(
    mapStateToProps,
    mapDispatchToProps
)(ModeToolsContainer));