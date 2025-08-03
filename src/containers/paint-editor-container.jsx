import paper from '@scratch/paper';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import bindAll from 'lodash.bindall';

import PaintEditor from '../components/paint-editor/paint-editor.jsx';
import KeyboardShortcutsHOC from 'scratch-paint/src/hocs/keyboard-shortcuts-hoc.jsx';
import SelectionHOC from 'scratch-paint/src/hocs/selection-hoc.jsx';
import UndoHOC from 'scratch-paint/src/hocs/undo-hoc.jsx';
import UpdateImageHOC from 'scratch-paint/src/hocs/update-image-hoc.jsx';

import {changeMode} from 'scratch-paint/src/reducers/modes';
import {changeFormat} from 'scratch-paint/src/reducers/format';
import {clearSelectedItems, setSelectedItems} from 'scratch-paint/src/reducers/selected-items';
import {deactivateEyeDropper} from 'scratch-paint/src/reducers/eye-dropper';
import {setTextEditTarget} from 'scratch-paint/src/reducers/text-edit-target';
import {updateViewBounds} from 'scratch-paint/src/reducers/view-bounds';
import {setLayout} from 'scratch-paint/src/reducers/layout';

import {getSelectedLeafItems} from 'scratch-paint/src/helper/selection';
import {convertToBitmap, convertToVector} from 'scratch-paint/src/helper/bitmap';
import {resetZoom, zoomOnSelection, OUTERMOST_ZOOM_LEVEL} from 'scratch-paint/src/helper/view';
import EyeDropperTool from 'scratch-paint/src/helper/tools/eye-dropper';

import Modes, {BitmapModes, VectorModes} from 'scratch-paint/src/lib/modes';
import Formats, {isBitmap, isVector} from 'scratch-paint/src/lib/format';

class PaintEditorContainer extends React.Component {
    static get ZOOM_INCREMENT () {
        return 0.5;
    }
    
    constructor (props) {
        super(props);
        bindAll(this, [
            'switchModeForFormat',
            'onMouseDown',
            'onMouseUp',
            'setCanvas',
            'setTextArea',
            'startEyeDroppingLoop',
            'stopEyeDroppingLoop',
            'handleSetSelectedItems',
            'handleZoomIn',
            'handleZoomOut',
            'handleZoomReset'
        ]);
        this.state = {
            canvas: null,
            colorInfo: null
        };
        this.props.setLayout(this.props.rtl ? 'rtl' : 'ltr');
    }
    
    componentDidMount () {
        document.addEventListener('keydown', this.props.onKeyPress);
        // document listeners used to detect if a mouse is down outside of the
        // canvas, and should therefore stop the eye dropper
        document.addEventListener('mousedown', this.onMouseDown);
        document.addEventListener('touchstart', this.onMouseDown);
        document.addEventListener('mouseup', this.onMouseUp);
        document.addEventListener('touchend', this.onMouseUp);
    }
    
    componentWillReceiveProps (newProps) {
        if (!isBitmap(this.props.format) && isBitmap(newProps.format)) {
            this.switchModeForFormat(Formats.BITMAP);
        } else if (!isVector(this.props.format) && isVector(newProps.format)) {
            this.switchModeForFormat(Formats.VECTOR);
        }
        if (newProps.rtl !== this.props.rtl) {
            this.props.setLayout(newProps.rtl ? 'rtl' : 'ltr');
        }
    }
    
    componentDidUpdate (prevProps) {
        if (this.props.isEyeDropping && !prevProps.isEyeDropping) {
            this.startEyeDroppingLoop();
        } else if (!this.props.isEyeDropping && prevProps.isEyeDropping) {
            this.stopEyeDroppingLoop();
        } else if (this.props.isEyeDropping && this.props.viewBounds !== prevProps.viewBounds) {
            if (this.props.previousTool) this.props.previousTool.activate();
            this.props.onDeactivateEyeDropper();
            this.stopEyeDroppingLoop();
        }

        if (this.props.format === Formats.VECTOR && isBitmap(prevProps.format)) {
            convertToVector(this.props.clearSelectedItems, this.props.onUpdateImage);
        } else if (isVector(prevProps.format) && this.props.format === Formats.BITMAP) {
            convertToBitmap(this.props.clearSelectedItems, this.props.onUpdateImage, this.props.fontInlineFn);
        }

        if (this.props.imageId !== prevProps.imageId) {
            this.switchModeForFormat(this.props.format);
        }

        if (this.props.format !== prevProps.format) {
            this.switchModeForFormat(this.props.format);
        }

        if (this.props.zoomLevelId !== prevProps.zoomLevelId) {
            resetZoom();
        }
    }
    
    componentWillUnmount () {
        document.removeEventListener('keydown', this.props.onKeyPress);
        this.stopEyeDroppingLoop();
        document.removeEventListener('mousedown', this.onMouseDown);
        document.removeEventListener('touchstart', this.onMouseDown);
        document.removeEventListener('mouseup', this.onMouseUp);
        document.removeEventListener('touchend', this.onMouseUp);
    }
    
    switchModeForFormat (newFormat) {
        if ((isVector(newFormat) && (this.props.mode in VectorModes)) ||
            (isBitmap(newFormat) && (this.props.mode in BitmapModes))) {
            // Format didn't change; no mode change needed
            return;
        }
        if (isVector(newFormat)) {
            switch (this.props.mode) {
            case Modes.BIT_BRUSH:
                this.props.changeMode(Modes.BRUSH);
                break;
            case Modes.BIT_LINE:
                this.props.changeMode(Modes.LINE);
                break;
            case Modes.BIT_OVAL:
                this.props.changeMode(Modes.OVAL);
                break;
            case Modes.BIT_RECT:
                this.props.changeMode(Modes.RECT);
                break;
            case Modes.BIT_TEXT:
                this.props.changeMode(Modes.TEXT);
                break;
            case Modes.BIT_FILL:
                this.props.changeMode(Modes.FILL);
                break;
            case Modes.BIT_ERASER:
                this.props.changeMode(Modes.ERASER);
                break;
            case Modes.BIT_SELECT:
                this.props.changeMode(Modes.SELECT);
                break;
            default:
                this.props.changeMode(Modes.BRUSH);
            }
        } else if (isBitmap(newFormat)) {
            switch (this.props.mode) {
            case Modes.BRUSH:
                this.props.changeMode(Modes.BIT_BRUSH);
                break;
            case Modes.LINE:
                this.props.changeMode(Modes.BIT_LINE);
                break;
            case Modes.OVAL:
                this.props.changeMode(Modes.BIT_OVAL);
                break;
            case Modes.RECT:
                this.props.changeMode(Modes.BIT_RECT);
                break;
            case Modes.TEXT:
                this.props.changeMode(Modes.BIT_TEXT);
                break;
            case Modes.FILL:
                this.props.changeMode(Modes.BIT_FILL);
                break;
            case Modes.ERASER:
                this.props.changeMode(Modes.BIT_ERASER);
                break;
            case Modes.RESHAPE:
            case Modes.SELECT:
                this.props.changeMode(Modes.BIT_SELECT);
                break;
            default:
                this.props.changeMode(Modes.BIT_BRUSH);
            }
        }
    }
    
    onMouseDown (event) {
        if (event.target === paper.view.element &&
                document.activeElement instanceof HTMLInputElement) {
            document.activeElement.blur();
        }

        if (event.target !== paper.view.element && event.target !== this.state.textArea) {
            // Exit text edit mode if you click anywhere outside of canvas
            this.props.removeTextEditTarget();
        }
    }
    
    onMouseUp (event) {
        if (this.props.isEyeDropping) {
            const colorString = this.eyeDropper.colorString;
            const callback = this.props.changeColorToEyeDropper;

            this.eyeDropper.remove();
            if (!this.eyeDropper.hideLoupe) {
                // If not hide loupe, that means the click is inside the canvas,
                // so apply the new color
                callback(colorString);
            }
            if (this.props.previousTool) this.props.previousTool.activate();
            this.props.onDeactivateEyeDropper();
            this.stopEyeDroppingLoop();
        }
    }
    
    setCanvas (canvas) {
        this.setState({canvas: canvas});
        this.updateViewBounds();
    }
    
    setTextArea (element) {
        this.setState({textArea: element});
    }
    
    updateViewBounds () {
        if (this.state.canvas) {
            this.props.updateViewBounds(paper.view.bounds);
        }
    }
    
    startEyeDroppingLoop () {
        this.eyeDropper = new EyeDropperTool(
            this.state.canvas,
            paper.project.view.bounds.width,
            paper.project.view.bounds.height,
            paper.project.view.pixelRatio,
            paper.view.zoom,
            paper.project.view.bounds.x,
            paper.project.view.bounds.y,
            isBitmap(this.props.format)
        );
        this.eyeDropper.pickX = -1;
        this.eyeDropper.pickY = -1;
        this.eyeDropper.activate();

        this.intervalId = setInterval(() => {
            const colorInfo = this.eyeDropper.getColorInfo(
                this.eyeDropper.pickX,
                this.eyeDropper.pickY,
                this.eyeDropper.hideLoupe
            );
            if (!colorInfo) return;
            if (
                this.state.colorInfo === null ||
                this.state.colorInfo.x !== colorInfo.x ||
                this.state.colorInfo.y !== colorInfo.y
            ) {
                this.setState({
                    colorInfo: colorInfo
                });
            }
        }, 30);
    }
    
    stopEyeDroppingLoop () {
        clearInterval(this.intervalId);
        this.setState({colorInfo: null});
    }
    
    handleSetSelectedItems () {
        this.props.setSelectedItems(this.props.format);
    }
    
    handleZoomIn () {
        // Make the "next step" after the outermost zoom level be the default
        // zoom level (0.5)
        let zoomIncrement = PaintEditorContainer.ZOOM_INCREMENT;
        if (paper.view.zoom === OUTERMOST_ZOOM_LEVEL) {
            zoomIncrement = 0.5 - OUTERMOST_ZOOM_LEVEL;
        }
        zoomOnSelection(zoomIncrement);
        this.props.updateViewBounds(paper.view.matrix);
        this.handleSetSelectedItems();
    }
    
    handleZoomOut () {
        zoomOnSelection(-PaintEditorContainer.ZOOM_INCREMENT);
        this.props.updateViewBounds(paper.view.matrix);
        this.handleSetSelectedItems();
    }
    
    handleZoomReset () {
        resetZoom();
        this.props.updateViewBounds(paper.view.matrix);
        this.handleSetSelectedItems();
    }
    
    render () {
        return (
            <PaintEditor
                canvas={this.state.canvas}
                shouldShowRedo={this.props.shouldShowRedo}
                shouldShowUndo={this.props.shouldShowUndo}
                undoState={this.props.undoState}
                colorInfo={this.state.colorInfo}
                format={this.props.format}
                mode={this.props.mode}
                onChangeMode={this.props.changeMode}
                image={this.props.image}
                imageFormat={this.props.imageFormat}
                imageId={this.props.imageId}
                isEyeDropping={this.props.isEyeDropping}
                name={this.props.name}
                onRedo={this.props.onRedo}
                onUndo={this.props.onUndo}
                onUpdateImage={this.props.onUpdateImage}
                onUpdateName={this.props.onUpdateName}
                onZoomIn={this.handleZoomIn}
                onZoomOut={this.handleZoomOut}
                onZoomReset={this.handleZoomReset}
                rotationCenterX={this.props.rotationCenterX}
                rotationCenterY={this.props.rotationCenterY}
                rtl={this.props.rtl}
                setCanvas={this.setCanvas}
                setTextArea={this.setTextArea}
                textArea={this.state.textArea}
                zoomLevelId={this.props.zoomLevelId}
            />
        );
    }
}

PaintEditorContainer.propTypes = {
    changeColorToEyeDropper: PropTypes.func,
    changeMode: PropTypes.func.isRequired,
    clearSelectedItems: PropTypes.func.isRequired,
    fontInlineFn: PropTypes.func,
    format: PropTypes.oneOf(Object.keys(Formats)),
    image: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.instanceOf(HTMLImageElement)
    ]),
    imageFormat: PropTypes.string,
    imageId: PropTypes.string,
    isEyeDropping: PropTypes.bool,
    mode: PropTypes.oneOf(Object.keys(Modes)),
    name: PropTypes.string,
    onDeactivateEyeDropper: PropTypes.func.isRequired,
    onKeyPress: PropTypes.func.isRequired,
    onRedo: PropTypes.func.isRequired,
    onUndo: PropTypes.func.isRequired,
    onUpdateImage: PropTypes.func.isRequired,
    onUpdateName: PropTypes.func.isRequired,
    previousTool: PropTypes.shape({
        activate: PropTypes.func.isRequired
    }),
    removeTextEditTarget: PropTypes.func.isRequired,
    rotationCenterX: PropTypes.number,
    rotationCenterY: PropTypes.number,
    rtl: PropTypes.bool,
    setLayout: PropTypes.func.isRequired,
    setSelectedItems: PropTypes.func.isRequired,
    shouldShowRedo: PropTypes.func.isRequired,
    shouldShowUndo: PropTypes.func.isRequired,
    updateViewBounds: PropTypes.func.isRequired,
    viewBounds: PropTypes.object,
    zoomLevelId: PropTypes.string
};

const mapStateToProps = state => ({
    changeColorToEyeDropper: state.scratchPaint.color.eyeDropper.callback,
    format: state.scratchPaint.format,
    isEyeDropping: state.scratchPaint.color.eyeDropper.active,
    mode: state.scratchPaint.mode,
    pasteOffset: state.scratchPaint.clipboard.pasteOffset,
    previousTool: state.scratchPaint.color.eyeDropper.previousTool,
    selectedItems: state.scratchPaint.selectedItems,
    undoState: state.scratchPaint.undo,
    viewBounds: state.scratchPaint.viewBounds
});

const mapDispatchToProps = dispatch => ({
    changeMode: mode => {
        dispatch(changeMode(mode));
    },
    clearSelectedItems: () => {
        dispatch(clearSelectedItems());
    },
    handleSwitchToBitmap: () => {
        dispatch(changeFormat(Formats.BITMAP));
    },
    handleSwitchToVector: () => {
        dispatch(changeFormat(Formats.VECTOR));
    },
    removeTextEditTarget: () => {
        dispatch(setTextEditTarget());
    },
    setLayout: layout => {
        dispatch(setLayout(layout));
    },
    setSelectedItems: format => {
        dispatch(setSelectedItems(getSelectedLeafItems(), isBitmap(format)));
    },
    updateViewBounds: bounds => {
        dispatch(updateViewBounds(bounds));
    },
    onDeactivateEyeDropper: () => {
        dispatch(deactivateEyeDropper());
    },
    removeTextEditTarget: () => {
        dispatch(setTextEditTarget());
    }
});

export default UpdateImageHOC(
    SelectionHOC(
        UndoHOC(
            KeyboardShortcutsHOC(
                connect(
                    mapStateToProps,
                    mapDispatchToProps
                )(PaintEditorContainer)
            )
        )
    )
);