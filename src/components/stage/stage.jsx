import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

import Box from '../box/box.jsx';
import DOMElementRenderer from '../../containers/dom-element-renderer.jsx';
import Loupe from '../loupe/loupe.jsx';
import MonitorList from '../../containers/monitor-list.jsx';
import TargetHighlight from '../../containers/target-highlight.jsx';
import GreenFlagOverlay from '../../containers/green-flag-overlay.jsx';
import Question from '../../containers/question.jsx';
import MicIndicator from '../mic-indicator/mic-indicator.jsx';
import {getParentBasedStageDimensions} from '../../lib/screen-utils.js';
import styles from './stage.css';

const StageComponent = props => {
    const {
        canvas,
        dragRef,
        isColorPicking,
        isFullScreen,
        isStarted,
        colorInfo,
        micIndicator,
        question,
        useEditorDragStyle,
        onDeactivateColorPicker,
        onDoubleClick,
        onQuestionAnswered,
        onStageDimensionsChanged,
        ...boxProps
    } = props;

    const stageWrapperRef = React.useRef(null);
    const [stageDimensions, setStageDimensions] = React.useState({
        width: 480,
        height: 360,
        widthDefault: 480,
        heightDefault: 360,
        scale: 1
    });

    React.useEffect(() => {
        const updateStageDimensions = () => {
            if (stageWrapperRef.current) {
                const rect = stageWrapperRef.current.getBoundingClientRect();
                const newDimensions = getParentBasedStageDimensions(rect.width, rect.height, isFullScreen);
                setStageDimensions(newDimensions);
                // Notify parent component about dimensions change
                if (onStageDimensionsChanged) {
                    onStageDimensionsChanged(newDimensions);
                }
            }
        };

        const timeoutId = setTimeout(updateStageDimensions, 100);
        
        const resizeObserver = new ResizeObserver(updateStageDimensions);
        
        setTimeout(() => {
            if (stageWrapperRef.current) {
                resizeObserver.observe(stageWrapperRef.current);
            }
        }, 200);

        return () => {
            clearTimeout(timeoutId);
            resizeObserver.disconnect();
        };
    }, [isFullScreen]);


    const mainStage = (
        <Box
            componentRef={node => { stageWrapperRef.current = node; }}
            className={classNames(
                styles.stageWrapper,
                {[styles.withColorPicker]: !isFullScreen && isColorPicking})}
            onDoubleClick={onDoubleClick}
        >
            <Box
                className={classNames(
                    styles.stage,
                    {[styles.fullScreen]: isFullScreen}
                )}
                style={{
                    width: `${stageDimensions.width}px`,
                    height: `${stageDimensions.height}px`,
                }}
            >
                <DOMElementRenderer
                    domElement={canvas}
                    style={{
                        width: `${stageDimensions.width}px !important`,
                        height: `${stageDimensions.height}px !important`,
                        borderRadius: "0.5rem",
                        border: "1px solid rgba(128, 128, 128, 0.3)",
                    }}
                    {...boxProps}
                />
                <div className={styles.monitorWrapper}>
                    <MonitorList
                        draggable={useEditorDragStyle}
                        stageSize={stageDimensions}
                    />
                </div>
                <div className={styles.frameWrapper}>
                    <TargetHighlight
                        className={styles.frame}
                        stageHeight={stageDimensions.height}
                        stageWidth={stageDimensions.width}
                    />
                </div>
                {isColorPicking && colorInfo ? (
                    <Loupe colorInfo={colorInfo} />
                ) : null}
            </Box>

            {/* `stageOverlays` is for items that should *not* have their overflow contained within the stage */}
            <Box
                className={classNames(
                    styles.stageOverlays,
                    {[styles.fullScreen]: isFullScreen}
                )}
                style={{
                    width: `${stageDimensions.width}px`,
                    height: `${stageDimensions.height}px`,
                }}
            >
                <div
                    className={styles.stageBottomWrapper}
                    style={{
                        width: stageDimensions.width,
                        height: stageDimensions.height
                    }}
                >
                    {micIndicator ? (
                        <MicIndicator
                            className={styles.micIndicator}
                            stageSize={stageDimensions}
                        />
                    ) : null}
                    {question === null ? null : (
                        <div
                            className={styles.questionWrapper}
                        >
                            <Question
                                question={question}
                                onQuestionAnswered={onQuestionAnswered}
                            />
                        </div>
                    )}
                </div>
                <canvas
                    className={styles.draggingSprite}
                    height={0}
                    ref={dragRef}
                    width={0}
                />
            </Box>
            {isStarted ? null : (
                <GreenFlagOverlay
                    className={styles.greenFlagOverlay}
                    wrapperClass={styles.greenFlagOverlayWrapper}
                />
            )}
        </Box>
    );

    if (isColorPicking) {
        return (
            <React.Fragment>
                {mainStage}
                <Box
                    className={styles.colorPickerBackground}
                    onClick={onDeactivateColorPicker}
                />
            </React.Fragment>
        );
    }

    return mainStage;
};
StageComponent.propTypes = {
    canvas: PropTypes.instanceOf(Element).isRequired,
    colorInfo: Loupe.propTypes.colorInfo,
    dragRef: PropTypes.func,
    isColorPicking: PropTypes.bool,
    isFullScreen: PropTypes.bool.isRequired,
    isStarted: PropTypes.bool,
    micIndicator: PropTypes.bool,
    onDeactivateColorPicker: PropTypes.func,
    onDoubleClick: PropTypes.func,
    onQuestionAnswered: PropTypes.func,
    onStageDimensionsChanged: PropTypes.func,
    question: PropTypes.string,
    useEditorDragStyle: PropTypes.bool
};
StageComponent.defaultProps = {
    dragRef: () => {}
};
export default StageComponent;
