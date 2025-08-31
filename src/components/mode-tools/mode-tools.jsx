import classNames from 'classnames';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';
import {
    FaPaintBrush,
    FaEyeDropper,
    FaCopy,
    FaPaste,
    FaTrash,
    FaExchangeAlt,
    FaPen,
    FaCrop,
    FaCircle,
    FaSquare,
    FaVectorSquare
} from 'react-icons/fa';

import {changeBrushSize} from 'scratch-paint/src/reducers/brush-mode';
import {changeBrushSize as changeEraserSize} from 'scratch-paint/src/reducers/eraser-mode';
import {changeBitBrushSize} from 'scratch-paint/src/reducers/bit-brush-size';
import {changeBitEraserSize} from 'scratch-paint/src/reducers/bit-eraser-size';
import {setShapesFilled} from 'scratch-paint/src/reducers/fill-bitmap-shapes';

import FontDropdown from 'scratch-paint/src/containers/font-dropdown.jsx';
import LiveInputHOC from 'scratch-paint/src/components/forms/live-input-hoc.jsx';
import Label from 'scratch-paint/src/components/forms/label.jsx';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import Input from 'scratch-paint/src/components/forms/input.jsx';
import InputGroup from 'scratch-paint/src/components/input-group/input-group.jsx';
import Modes from 'scratch-paint/src/lib/modes';
import Formats, {isBitmap, isVector} from 'scratch-paint/src/lib/format';
import {hideLabel} from 'scratch-paint/src/lib/hide-label';

import {MAX_STROKE_WIDTH} from 'scratch-paint/src/reducers/stroke-width';

import styles from './mode-tools.css';

const LiveInput = LiveInputHOC(Input);

const CustomIconButton = ({icon: Icon, title, onClick, disabled, highlighted, size = "1rem"}) => (
    <button
        className={`${styles.iconButton} ${highlighted ? styles.highlighted : ''}`}
        disabled={disabled}
        title={title}
        onClick={onClick}
    >
        <Icon size={size} />
    </button>
);

const ModeToolsComponent = props => {
    const messages = defineMessages({
        brushSize: {
            defaultMessage: 'Size',
            description: 'Label for the brush size input',
            id: 'paint.modeTools.brushSize'
        },
        eraserSize: {
            defaultMessage: 'Eraser size',
            description: 'Label for the eraser size input',
            id: 'paint.modeTools.eraserSize'
        },
        copy: {
            defaultMessage: 'Copy',
            description: 'Label for the copy button',
            id: 'paint.modeTools.copy'
        },
        paste: {
            defaultMessage: 'Paste',
            description: 'Label for the paste button',
            id: 'paint.modeTools.paste'
        },
        delete: {
            defaultMessage: 'Delete',
            description: 'Label for the delete button',
            id: 'paint.modeTools.delete'
        },
        curved: {
            defaultMessage: 'Curved',
            description: 'Label for the button that converts selected points to curves',
            id: 'paint.modeTools.curved'
        },
        pointed: {
            defaultMessage: 'Pointed',
            description: 'Label for the button that converts selected points to sharp points',
            id: 'paint.modeTools.pointed'
        },
        thickness: {
            defaultMessage: 'Thickness',
            description: 'Label for the number input to choose the line thickness',
            id: 'paint.modeTools.thickness'
        },
        flipHorizontal: {
            defaultMessage: 'Flip Horizontal',
            description: 'Label for the button to flip the image horizontally',
            id: 'paint.modeTools.flipHorizontal'
        },
        flipVertical: {
            defaultMessage: 'Flip Vertical',
            description: 'Label for the button to flip the image vertically',
            id: 'paint.modeTools.flipVertical'
        },
        filled: {
            defaultMessage: 'Filled',
            description: 'Label for the button that sets the bitmap rectangle/oval mode to draw filled shapes',
            id: 'paint.modeTools.filled'
        },
        outlined: {
            defaultMessage: 'Outlined',
            description: 'Label for the button that sets the bitmap rectangle/oval mode to draw outlined shapes',
            id: 'paint.modeTools.outlined'
        }
    });

    switch (props.mode) {
    case Modes.BRUSH:
    case Modes.BIT_BRUSH:
    case Modes.BIT_LINE:
    {
        const currentIcon = props.mode === Modes.BIT_LINE ? FaVectorSquare : FaPaintBrush;
        const currentBrushValue = isBitmap(props.format) ? props.bitBrushSize : props.brushValue;
        const changeFunction = isBitmap(props.format) ? props.onBitBrushSliderChange : props.onBrushSliderChange;
        const currentMessage = props.mode === Modes.BIT_LINE ? messages.thickness : messages.brushSize;
        return (
            <div className={classNames(props.className, styles.modeTools)}>
                <div className={styles.iconContainer}>
                    <currentIcon size="1.2rem" />
                </div>
                <LiveInput
                    range
                    small
                    max={MAX_STROKE_WIDTH}
                    min="1"
                    type="number"
                    value={currentBrushValue}
                    onSubmit={changeFunction}
                />
            </div>
        );
    }
    case Modes.BIT_ERASER:
    case Modes.ERASER:
    {
        const currentEraserValue = isBitmap(props.format) ? props.bitEraserSize : props.eraserValue;
        const changeFunction = isBitmap(props.format) ? props.onBitEraserSliderChange : props.onEraserSliderChange;
        return (
            <div className={classNames(props.className, styles.modeTools)}>
                <div className={styles.iconContainer}>
                    <FaEyeDropper size="1.2rem" />
                </div>
                <LiveInput
                    range
                    small
                    max={MAX_STROKE_WIDTH}
                    min="1"
                    type="number"
                    value={currentEraserValue}
                    onSubmit={changeFunction}
                />
            </div>
        );
    }
    case Modes.RESHAPE:
        return (
            <div className={classNames(props.className, styles.modeTools)}>
                <InputGroup className={styles.buttonGroup}>
                    <CustomIconButton
                        icon={FaCrop}
                        title={props.intl.formatMessage(messages.curved)}
                        disabled={!props.hasSelectedUncurvedPoints}
                        onClick={props.onCurvePoints}
                    />
                    <CustomIconButton
                        icon={FaPen}
                        title={props.intl.formatMessage(messages.pointed)}
                        disabled={!props.hasSelectedUnpointedPoints}
                        onClick={props.onPointPoints}
                    />
                </InputGroup>
                <InputGroup className={styles.buttonGroup}>
                    <CustomIconButton
                        icon={FaTrash}
                        title={props.intl.formatMessage(messages.delete)}
                        onClick={props.onDelete}
                    />
                </InputGroup>
            </div>
        );
    case Modes.BIT_SELECT:
    case Modes.SELECT:
        return (
            <div className={classNames(props.className, styles.modeTools)}>
                <InputGroup className={styles.buttonGroup}>
                    <CustomIconButton
                        icon={FaCopy}
                        title={props.intl.formatMessage(messages.copy)}
                        onClick={props.onCopyToClipboard}
                    />
                    <CustomIconButton
                        icon={FaPaste}
                        title={props.intl.formatMessage(messages.paste)}
                        disabled={!(props.clipboardItems.length > 0)}
                        onClick={props.onPasteFromClipboard}
                    />
                </InputGroup>
                <InputGroup className={styles.buttonGroup}>
                    <CustomIconButton
                        icon={FaTrash}
                        title={props.intl.formatMessage(messages.delete)}
                        onClick={props.onDelete}
                    />
                </InputGroup>
                <InputGroup className={styles.buttonGroup}>
                    <CustomIconButton
                        icon={FaExchangeAlt}
                        title={props.intl.formatMessage(messages.flipHorizontal)}
                        onClick={props.onFlipHorizontal}
                    />
                    <button
                        className={`${styles.iconButton}`}
                        title={props.intl.formatMessage(messages.flipVertical)}
                        onClick={props.onFlipVertical}
                    >
                        <FaExchangeAlt size="1rem" style={{transform: 'rotate(90deg)'}} />
                    </button>
                </InputGroup>
            </div>
        );
    case Modes.BIT_TEXT:
    case Modes.TEXT:
        return (
            <div className={classNames(props.className, styles.modeTools)}>
                <InputGroup>
                    <FontDropdown
                        onUpdateImage={props.onUpdateImage}
                    />
                </InputGroup>
            </div>
        );
    case Modes.BIT_RECT:
    case Modes.BIT_OVAL:
    {
        const fillIcon = props.mode === Modes.BIT_RECT ? FaSquare : FaCircle;
        return (
            <div className={classNames(props.className, styles.modeTools)}>
                <InputGroup className={styles.buttonGroup}>
                    <CustomIconButton
                        icon={fillIcon}
                        title={props.intl.formatMessage(messages.filled)}
                        highlighted={props.fillBitmapShapes}
                        onClick={props.onFillShapes}
                    />
                </InputGroup>
                <InputGroup className={styles.buttonGroup}>
                    <CustomIconButton
                        icon={fillIcon}
                        title={props.intl.formatMessage(messages.outlined)}
                        highlighted={!props.fillBitmapShapes}
                        onClick={props.onOutlineShapes}
                    />
                </InputGroup>
                {props.fillBitmapShapes ? null : (
                    <InputGroup className={styles.thicknessGroup}>
                        <Label text={props.intl.formatMessage(messages.thickness)}>
                            <LiveInput
                                range
                                small
                                max={MAX_STROKE_WIDTH}
                                min="1"
                                type="number"
                                value={props.bitBrushSize}
                                onSubmit={props.onBitBrushSliderChange}
                            />
                        </Label>
                    </InputGroup>)
                }
            </div>
        );
    }
    default:
        return (
            <div className={classNames(props.className, styles.modeTools)} />
        );
    }
};

ModeToolsComponent.propTypes = {
    bitBrushSize: PropTypes.number,
    bitEraserSize: PropTypes.number,
    brushValue: PropTypes.number,
    className: PropTypes.string,
    clipboardItems: PropTypes.arrayOf(PropTypes.array),
    eraserValue: PropTypes.number,
    fillBitmapShapes: PropTypes.bool,
    format: PropTypes.oneOf(Object.keys(Formats)),
    hasSelectedUncurvedPoints: PropTypes.bool,
    hasSelectedUnpointedPoints: PropTypes.bool,
    intl: intlShape.isRequired,
    mode: PropTypes.string.isRequired,
    onBitBrushSliderChange: PropTypes.func.isRequired,
    onBitEraserSliderChange: PropTypes.func.isRequired,
    onBrushSliderChange: PropTypes.func.isRequired,
    onCopyToClipboard: PropTypes.func.isRequired,
    onCurvePoints: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onEraserSliderChange: PropTypes.func,
    onFillShapes: PropTypes.func.isRequired,
    onFlipHorizontal: PropTypes.func.isRequired,
    onFlipVertical: PropTypes.func.isRequired,
    onOutlineShapes: PropTypes.func.isRequired,
    onPasteFromClipboard: PropTypes.func.isRequired,
    onPointPoints: PropTypes.func.isRequired,
    onUpdateImage: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    mode: state.scratchPaint.mode,
    format: state.scratchPaint.format,
    fillBitmapShapes: state.scratchPaint.fillBitmapShapes,
    bitBrushSize: state.scratchPaint.bitBrushSize,
    bitEraserSize: state.scratchPaint.bitEraserSize,
    brushValue: state.scratchPaint.brushMode.brushSize,
    clipboardItems: state.scratchPaint.clipboard.items,
    eraserValue: state.scratchPaint.eraserMode.brushSize
});

const mapDispatchToProps = dispatch => ({
    onBrushSliderChange: brushSize => {
        dispatch(changeBrushSize(brushSize));
    },
    onBitBrushSliderChange: bitBrushSize => {
        dispatch(changeBitBrushSize(bitBrushSize));
    },
    onBitEraserSliderChange: eraserSize => {
        dispatch(changeBitEraserSize(eraserSize));
    },
    onEraserSliderChange: eraserSize => {
        dispatch(changeEraserSize(eraserSize));
    },
    onFillShapes: () => {
        dispatch(setShapesFilled(true));
    },
    onOutlineShapes: () => {
        dispatch(setShapesFilled(false));
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(injectIntl(ModeToolsComponent));