import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import Box from '../box/box.jsx';
import styles from './custom-stage-selector.css';

const CustomStageSelector = props => {
    const {
        backdropCount,
        containerRef,
        dragOver,
        selected,
        raised,
        receivedBlocks,
        url,
        onClick,
        onMouseEnter,
        onMouseLeave,
        ...componentProps
    } = props;
    return (
        <Box
            className={styles.stageSelector}
            {...componentProps}
        >
            <div className={styles.header}>
                <div className={styles.headerTitle}>
                    <FormattedMessage
                        defaultMessage="Stage"
                        description="Label for the stage in the stage selector"
                        id="gui.stageSelector.stage"
                    />
                </div>
            </div>
            <Box className={styles.itemsWrapper}>
                <div className={styles.stageWrapper}>
                    <div
                        className={classNames(styles.stage, {
                            [styles.isSelected]: selected,
                            [styles.raised]: raised || dragOver,
                            [styles.receivedBlocks]: receivedBlocks
                        })}
                        onClick={onClick}
                        onMouseEnter={onMouseEnter}
                        onMouseLeave={onMouseLeave}
                        ref={containerRef}
                    >
                        {url ? (
                            <div className={styles.stageImageOuter}>
                                <div className={styles.stageImageInner}>
                                    <img
                                        className={styles.stageImage}
                                        draggable={false}
                                        src={url}
                                    />
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </Box>
            <div className={styles.label}>
                {backdropCount}
                {" "}
                <FormattedMessage
                    defaultMessage="Backdrops"
                    description="Label for the backdrops in the stage selector"
                    id="gui.stageSelector.backdrops"
                />
            </div>
        </Box>
    );
};

CustomStageSelector.propTypes = {
    backdropCount: PropTypes.number.isRequired,
    containerRef: PropTypes.func,
    dragOver: PropTypes.bool,
    onClick: PropTypes.func,
    onMouseEnter: PropTypes.func,
    onMouseLeave: PropTypes.func,
    raised: PropTypes.bool.isRequired,
    receivedBlocks: PropTypes.bool.isRequired,
    selected: PropTypes.bool.isRequired,
    url: PropTypes.string
};

export default CustomStageSelector;
