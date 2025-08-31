import paper from '@scratch/paper';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import React from 'react';
import PropTypes from 'prop-types';
import {
    FaUndo,
    FaRedo,
    FaCompressArrowsAlt,
    FaExpandArrowsAlt,
    FaArrowUp,
    FaArrowDown,
    FaArrowCircleUp,
    FaArrowCircleDown,
    FaCrosshairs,
    FaPaintBrush,
    FaPen,
    FaMagic,
    FaFillDrip,
    FaFont,
    FaMinus,
    FaCircle,
    FaSquare,
    FaSearchPlus,
    FaSearchMinus,
    FaExpand,
    FaTh
    
} from 'react-icons/fa';

// Scratch Paint の必要なコンポーネントをimport
import PaperCanvas from 'scratch-paint/src/containers/paper-canvas.jsx';
import ScrollableCanvas from 'scratch-paint/src/containers/scrollable-canvas.jsx';
import FillColorIndicatorComponent from 'scratch-paint/src/containers/fill-color-indicator.jsx';
import StrokeColorIndicatorComponent from 'scratch-paint/src/containers/stroke-color-indicator.jsx';
import ModeToolsContainer from '../../containers/mode-tools-container.jsx';
import Loupe from 'scratch-paint/src/components/loupe/loupe.jsx';
import BufferedInputHOC from 'scratch-paint/src/components/forms/buffered-input-hoc.jsx';
import Input from 'scratch-paint/src/components/forms/input.jsx';

// 元のモードコンテナ（Paper.jsツール初期化のため非表示で使用）
import BitBrushMode from 'scratch-paint/src/containers/bit-brush-mode.jsx';
import BitLineMode from 'scratch-paint/src/containers/bit-line-mode.jsx';
import BitOvalMode from 'scratch-paint/src/containers/bit-oval-mode.jsx';
import BitRectMode from 'scratch-paint/src/containers/bit-rect-mode.jsx';
import BitFillMode from 'scratch-paint/src/containers/bit-fill-mode.jsx';
import BitEraserMode from 'scratch-paint/src/containers/bit-eraser-mode.jsx';
import BitSelectMode from 'scratch-paint/src/containers/bit-select-mode.jsx';
import BrushMode from 'scratch-paint/src/containers/brush-mode.jsx';
import EraserMode from 'scratch-paint/src/containers/eraser-mode.jsx';
import FillMode from 'scratch-paint/src/containers/fill-mode.jsx';
import LineMode from 'scratch-paint/src/containers/line-mode.jsx';
import OvalMode from 'scratch-paint/src/containers/oval-mode.jsx';
import RectMode from 'scratch-paint/src/containers/rect-mode.jsx';
import ReshapeMode from 'scratch-paint/src/containers/reshape-mode.jsx';
import SelectMode from 'scratch-paint/src/containers/select-mode.jsx';
import TextMode from 'scratch-paint/src/containers/text-mode.jsx';

// Scratch Paint のヘルパー関数とreducers
import {changeMode} from 'scratch-paint/src/reducers/modes';
import {changeFormat} from 'scratch-paint/src/reducers/format';
import {clearSelectedItems, setSelectedItems} from 'scratch-paint/src/reducers/selected-items';
import {groupSelection, ungroupSelection} from 'scratch-paint/src/helper/group';
import {bringToFront, sendBackward, sendToBack, bringForward} from 'scratch-paint/src/helper/order';
import {getSelectedLeafItems} from 'scratch-paint/src/helper/selection';

import Modes from 'scratch-paint/src/lib/modes';
import Formats, {isBitmap, isVector} from 'scratch-paint/src/lib/format';

import {connect} from 'react-redux';

import styles from './paint-editor.css';

const BufferedInput = BufferedInputHOC(Input);

const messages = defineMessages({
    costume: {
        id: 'paint.paintEditor.costume',
        description: 'Label for the name of a costume',
        defaultMessage: 'Costume'
    },
    bitmap: {
        defaultMessage: 'Convert to Bitmap',
        description: 'Label for button that converts the paint editor to bitmap mode',
        id: 'paint.paintEditor.bitmap'
    },
    vector: {
        defaultMessage: 'Convert to Vector',
        description: 'Label for button that converts the paint editor to vector mode',
        id: 'paint.paintEditor.vector'
    },
    // Mode messages
    select: {
        defaultMessage: 'Select',
        description: 'Label for the select tool',
        id: 'paint.modeTools.select'
    },
    reshape: {
        defaultMessage: 'Reshape',
        description: 'Label for the reshape tool',
        id: 'paint.modeTools.reshape'
    },
    brush: {
        defaultMessage: 'Brush',
        description: 'Label for the brush tool',
        id: 'paint.modeTools.brush'
    },
    eraser: {
        defaultMessage: 'Eraser',
        description: 'Label for the eraser tool',
        id: 'paint.modeTools.eraser'
    },
    fill: {
        defaultMessage: 'Fill',
        description: 'Label for the fill tool',
        id: 'paint.modeTools.fill'
    },
    text: {
        defaultMessage: 'Text',
        description: 'Label for the text tool',
        id: 'paint.modeTools.text'
    },
    line: {
        defaultMessage: 'Line',
        description: 'Label for the line tool',
        id: 'paint.modeTools.line'
    },
    oval: {
        defaultMessage: 'Circle',
        description: 'Label for the oval tool',
        id: 'paint.modeTools.oval'
    },
    rect: {
        defaultMessage: 'Rectangle',
        description: 'Label for the rectangle tool',
        id: 'paint.modeTools.rect'
    },
    // Fixed tools messages
    group: {
        defaultMessage: 'Group',
        description: 'Label for the button to group shapes',
        id: 'paint.paintEditor.group'
    },
    ungroup: {
        defaultMessage: 'Ungroup',
        description: 'Label for the button to ungroup shapes',
        id: 'paint.paintEditor.ungroup'
    },
    undo: {
        defaultMessage: 'Undo',
        description: 'Alt to image for the button to undo an action',
        id: 'paint.paintEditor.undo'
    },
    redo: {
        defaultMessage: 'Redo',
        description: 'Alt to image for the button to redo an action',
        id: 'paint.paintEditor.redo'
    },
    forward: {
        defaultMessage: 'Forward',
        description: 'Label for the `Send forward on canvas` button',
        id: 'paint.paintEditor.forward'
    },
    backward: {
        defaultMessage: 'Backward',
        description: 'Label for the `Send backward on canvas` button',
        id: 'paint.paintEditor.backward'
    },
    front: {
        defaultMessage: 'Front',
        description: 'Label for the `Send to front of canvas` button',
        id: 'paint.paintEditor.front'
    },
    back: {
        defaultMessage: 'Back',
        description: 'Label for the `Send to back of canvas` button',
        id: 'paint.paintEditor.back'
    },
    // Color messages
    fillColor: {
        defaultMessage: 'Fill',
        description: 'Label for the color picker for the fill color',
        id: 'paint.paintEditor.fill'
    },
    strokeColor: {
        defaultMessage: 'Outline',
        description: 'Label for the color picker for the outline color',
        id: 'paint.paintEditor.stroke'
    }
});

const PaintEditorComponent = props => {
    const {
        intl,
        canvas,
        name,
        format,
        // Mode state
        mode,
        onChangeMode,
        // Format switching
        onSwitchToBitmap,
        onSwitchToVector,
        // Fixed tools  
        shouldShowRedo,
        shouldShowUndo,
        undoState,
        onRedo,
        onUndo,
        onUpdateName,
        onUpdateImage,
        // Group operations
        clearSelectedItems,
        setSelectedItems,
        // Zoom
        onZoomIn,
        onZoomOut,
        onZoomReset,
    } = props;

    const isVectorFormat = isVector(format);
    const isBitmapFormat = isBitmap(format);
    
    // Undo/Redo availability based on undoState
    const canUndo = undoState && undoState.pointer > 0;
    const canRedo = undoState && undoState.pointer > -1 && undoState.pointer !== (undoState.stack.length - 1);

    // Group/Ungroup handlers
    const handleGroup = () => {
        if (clearSelectedItems && setSelectedItems && onUpdateImage) {
            groupSelection(clearSelectedItems, setSelectedItems, onUpdateImage);
        }
    };

    const handleUngroup = () => {
        if (clearSelectedItems && setSelectedItems && onUpdateImage) {
            ungroupSelection(clearSelectedItems, setSelectedItems, onUpdateImage);
        }
    };

    // Layer order handlers
    const handleSendForward = () => {
        if (onUpdateImage) bringForward(onUpdateImage);
    };

    const handleSendBackward = () => {
        if (onUpdateImage) sendBackward(onUpdateImage);
    };

    const handleSendToFront = () => {
        if (onUpdateImage) bringToFront(onUpdateImage);
    };

    const handleSendToBack = () => {
        if (onUpdateImage) sendToBack(onUpdateImage);
    };

    // Mode buttons configuration - 元のScratch Paintと同じ順序、より適切なアイコンを使用
    const modeButtons = isVectorFormat ? [
        { mode: Modes.SELECT, icon: FaCrosshairs, message: messages.select },
        { mode: Modes.RESHAPE, icon: FaPen, message: messages.reshape },
        { mode: Modes.BRUSH, icon: FaPaintBrush, message: messages.brush },
        { mode: Modes.ERASER, icon: FaMagic, message: messages.eraser },
        { mode: Modes.FILL, icon: FaFillDrip, message: messages.fill },
        { mode: Modes.TEXT, icon: FaFont, message: messages.text },
        { mode: Modes.LINE, icon: FaMinus, message: messages.line },
        { mode: Modes.OVAL, icon: FaCircle, message: messages.oval },
        { mode: Modes.RECT, icon: FaSquare, message: messages.rect }
    ] : [
        { mode: Modes.BIT_BRUSH, icon: FaPaintBrush, message: messages.brush },
        { mode: Modes.BIT_LINE, icon: FaMinus, message: messages.line },
        { mode: Modes.BIT_OVAL, icon: FaCircle, message: messages.oval },
        { mode: Modes.BIT_RECT, icon: FaSquare, message: messages.rect },
        { mode: Modes.TEXT, icon: FaFont, message: messages.text },
        { mode: Modes.BIT_FILL, icon: FaFillDrip, message: messages.fill },
        { mode: Modes.BIT_ERASER, icon: FaMagic, message: messages.eraser },
        { mode: Modes.BIT_SELECT, icon: FaCrosshairs, message: messages.select }
    ];

    return (
        <div
            className={styles.editorContainer}
            dir={props.rtl ? 'rtl' : 'ltr'}
        >
            {canvas !== null && (
                <div className={styles.editorContainerTop}>
                    {/* Fixed Tools Row */}
                    <div className={styles.row}>
                        <div className={styles.fixedTools}>
                            <div className={styles.headerSection}>
                                <BufferedInput
                                    className={styles.nameInput}
                                    placeholder="Costume name"
                                    type="text"
                                    value={name}
                                    onSubmit={onUpdateName}
                                />
                                <div className={styles.historyButtons}>
                                    <button
                                        className={styles.iconButton}
                                        disabled={!canUndo}
                                        title={intl.formatMessage(messages.undo)}
                                        onClick={onUndo}
                                    >
                                        <FaUndo size="1.1rem" />
                                    </button>
                                    <button
                                        className={styles.iconButton}
                                        disabled={!canRedo}
                                        title={intl.formatMessage(messages.redo)}
                                        onClick={onRedo}
                                    >
                                        <FaRedo size="1.1rem" />
                                    </button>
                                </div>
                            </div>

                            <div className={styles.compactButtonRow}>
                                <button
                                    className={styles.iconButton}
                                    title={intl.formatMessage(messages.group)}
                                    onClick={handleGroup}
                                >
                                    <FaCompressArrowsAlt size="1.1rem" />
                                </button>
                                <button
                                    className={styles.iconButton}
                                    title={intl.formatMessage(messages.ungroup)}
                                    onClick={handleUngroup}
                                >
                                    <FaExpandArrowsAlt size="1.1rem" />
                                </button>
                                <button
                                    className={styles.iconButton}
                                    title={intl.formatMessage(messages.forward)}
                                    onClick={handleSendForward}
                                >
                                    <FaArrowUp size="1.1rem" />
                                </button>
                                <button
                                    className={styles.iconButton}
                                    title={intl.formatMessage(messages.backward)}
                                    onClick={handleSendBackward}
                                >
                                    <FaArrowDown size="1.1rem" />
                                </button>
                                <button
                                    className={styles.iconButton}
                                    title={intl.formatMessage(messages.front)}
                                    onClick={handleSendToFront}
                                >
                                    <FaArrowCircleUp size="1.1rem" />
                                </button>
                                <button
                                    className={styles.iconButton}
                                    title={intl.formatMessage(messages.back)}
                                    onClick={handleSendToBack}
                                >
                                    <FaArrowCircleDown size="1.1rem" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Color Indicators Row */}
                    <div className={styles.row}>
                        <div className={styles.colorIndicators}>
                            {/* Fill Color */}
                            <FillColorIndicatorComponent
                                className={styles.colorIndicator}
                                onUpdateImage={onUpdateImage}
                            />

                            {/* Stroke Color - only for vector mode */}
                            {isVectorFormat && (
                                <StrokeColorIndicatorComponent
                                    className={styles.colorIndicator}
                                    onUpdateImage={onUpdateImage}
                                />
                            )}
                        </div>

                        {/* Mode Tools */}
                        {(isVectorFormat || isBitmapFormat) && (
                            <div className={styles.modeTools}>
                                <ModeToolsContainer
                                    onUpdateImage={onUpdateImage}
                                />
                            </div>
                        )}

                        {/* Format Toggle */}
                        <div className={styles.colorIndicators}>
                            {isVectorFormat && (
                                <button
                                    className={styles.formatButton}
                                    title={intl.formatMessage(messages.bitmap)}
                                    onClick={onSwitchToBitmap}
                                >
                                    <FaTh size="1rem" />
                                    <span className={styles.buttonText}>{intl.formatMessage(messages.bitmap)}</span>
                                </button>
                            )}
                            {isBitmapFormat && (
                                <button
                                    className={styles.formatButton}
                                    title={intl.formatMessage(messages.vector)}
                                    onClick={onSwitchToVector}
                                >
                                    <FaTh size="1rem" />
                                    <span className={styles.buttonText}>{intl.formatMessage(messages.vector)}</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.topAlignRow}>
                {/* 非表示のモードコンテナ（Paper.jsツール初期化のため） */}
                {canvas !== null && isVectorFormat && (
                    <div style={{display: 'none'}}>
                        <SelectMode onUpdateImage={onUpdateImage} />
                        <ReshapeMode onUpdateImage={onUpdateImage} />
                        <BrushMode onUpdateImage={onUpdateImage} />
                        <EraserMode onUpdateImage={onUpdateImage} />
                        <FillMode onUpdateImage={onUpdateImage} />
                        <TextMode textArea={props.textArea} onUpdateImage={onUpdateImage} />
                        <LineMode onUpdateImage={onUpdateImage} />
                        <OvalMode onUpdateImage={onUpdateImage} />
                        <RectMode onUpdateImage={onUpdateImage} />
                    </div>
                )}
                
                {canvas !== null && isBitmapFormat && (
                    <div style={{display: 'none'}}>
                        <BitBrushMode onUpdateImage={onUpdateImage} />
                        <BitLineMode onUpdateImage={onUpdateImage} />
                        <BitOvalMode onUpdateImage={onUpdateImage} />
                        <BitRectMode onUpdateImage={onUpdateImage} />
                        <TextMode isBitmap textArea={props.textArea} onUpdateImage={onUpdateImage} />
                        <BitFillMode onUpdateImage={onUpdateImage} />
                        <BitEraserMode onUpdateImage={onUpdateImage} />
                        <BitSelectMode onUpdateImage={onUpdateImage} />
                    </div>
                )}

                {/* Mode Selector */}
                {canvas !== null && (
                    <div className={styles.modeSelector}>
                        {modeButtons.map(({ mode: buttonMode, icon: Icon, message }) => (
                            <button
                                key={buttonMode}
                                className={`${styles.modeButton} ${mode === buttonMode ? styles.selected : ''}`}
                                title={intl.formatMessage(message)}
                                onClick={() => {
                                    onChangeMode(buttonMode);
                                    // ツール切り替え後に状態を更新
                                    if (onUpdateImage) {
                                        setTimeout(() => onUpdateImage(), 0);
                                    }
                                }}
                            >
                                <Icon size="1.2rem" />
                            </button>
                        ))}
                    </div>
                )}

                {/* Canvas Area */}
                <div className={styles.controlsContainer}>
                    <ScrollableCanvas
                        canvas={canvas}
                        hideScrollbars={props.isEyeDropping}
                        style={styles.canvasContainer}
                    >
                        <PaperCanvas
                            canvasRef={props.setCanvas}
                            image={props.image}
                            imageFormat={props.imageFormat}
                            imageId={props.imageId}
                            rotationCenterX={props.rotationCenterX}
                            rotationCenterY={props.rotationCenterY}
                            zoomLevelId={props.zoomLevelId}
                            onUpdateImage={onUpdateImage}
                        />
                        <textarea
                            className={styles.textArea}
                            ref={props.setTextArea}
                            spellCheck={false}
                        />
                        {props.isEyeDropping &&
                            props.colorInfo !== null &&
                            !props.colorInfo.hideLoupe && (
                                <div className={styles.colorPickerWrapper}>
                                    <Loupe
                                        colorInfo={props.colorInfo}
                                        pixelRatio={paper.project.view.pixelRatio}
                                    />
                                </div>
                            )
                        }
                    </ScrollableCanvas>

                    {/* Canvas Controls */}
                    <div className={styles.canvasControls}>
                        {/* Zoom Controls */}
                        <div className={styles.zoomControls}>
                            <button
                                className={styles.zoomButton}
                                title="Zoom Out"
                                onClick={onZoomOut}
                            >
                                <FaSearchMinus size="1rem" />
                            </button>
                            <button
                                className={styles.zoomButton}
                                title="Reset Zoom"
                                onClick={onZoomReset}
                            >
                                <FaExpand size="1rem" />
                            </button>
                            <button
                                className={styles.zoomButton}
                                title="Zoom In"
                                onClick={onZoomIn}
                            >
                                <FaSearchPlus size="1rem" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

PaintEditorComponent.propTypes = {
    intl: intlShape.isRequired,
    canvas: PropTypes.instanceOf(Element),
    name: PropTypes.string,
    format: PropTypes.oneOf(Object.keys(Formats)),
    mode: PropTypes.string.isRequired,
    onChangeMode: PropTypes.func.isRequired,
    onSwitchToBitmap: PropTypes.func.isRequired,
    onSwitchToVector: PropTypes.func.isRequired,
    shouldShowRedo: PropTypes.func,
    shouldShowUndo: PropTypes.func,
    onRedo: PropTypes.func.isRequired,
    onUndo: PropTypes.func.isRequired,
    onUpdateName: PropTypes.func.isRequired,
    onUpdateImage: PropTypes.func.isRequired,
    clearSelectedItems: PropTypes.func.isRequired,
    setSelectedItems: PropTypes.func.isRequired,
    // Color props
    fillColor: PropTypes.string,
    fillColor2: PropTypes.string,
    fillColorModalVisible: PropTypes.bool.isRequired,
    fillGradientType: PropTypes.string.isRequired,
    fillDisabled: PropTypes.bool.isRequired,
    onChangeFillColor: PropTypes.func.isRequired,
    onChangeFillGradientType: PropTypes.func.isRequired,
    onOpenFillColor: PropTypes.func.isRequired,
    onCloseFillColor: PropTypes.func.isRequired,
    strokeColor: PropTypes.string,
    strokeColor2: PropTypes.string,
    strokeColorModalVisible: PropTypes.bool.isRequired,
    strokeGradientType: PropTypes.string.isRequired,
    strokeDisabled: PropTypes.bool.isRequired,
    onChangeStrokeColor: PropTypes.func.isRequired,
    onChangeStrokeGradientType: PropTypes.func.isRequired,
    onOpenStrokeColor: PropTypes.func.isRequired,
    onCloseStrokeColor: PropTypes.func.isRequired,
    shouldShowGradientTools: PropTypes.bool.isRequired,
    onZoomIn: PropTypes.func.isRequired,
    onZoomOut: PropTypes.func.isRequired,
    onZoomReset: PropTypes.func.isRequired,
    undoState: PropTypes.shape({
        stack: PropTypes.arrayOf(PropTypes.object).isRequired,
        pointer: PropTypes.number.isRequired
    })
};

// Redux connection
const mapStateToProps = state => {
    // フォーマットに応じた適切なデフォルトモードを設定
    const format = state.scratchPaint.format;
    const defaultMode = format === Formats.BITMAP ? Modes.BIT_BRUSH : Modes.BRUSH;
    
    return {
        // Mode state
        mode: state.scratchPaint && state.scratchPaint.mode ? state.scratchPaint.mode : defaultMode,
        format: format,
    };
};

const mapDispatchToProps = dispatch => ({
    // Mode actions
    onChangeMode: mode => {
        dispatch(changeMode(mode));
    },
    onSwitchToBitmap: () => {
        dispatch(changeFormat(Formats.BITMAP));
    },
    onSwitchToVector: () => {
        dispatch(changeFormat(Formats.VECTOR));
    },
    // Selection actions
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
)(injectIntl(PaintEditorComponent));