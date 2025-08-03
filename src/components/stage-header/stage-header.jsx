import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import VM from 'scratch-vm';
import {MdFullscreen, MdFullscreenExit} from 'react-icons/md';

import Box from '../box/box.jsx';
import Button from '../button/button.jsx';
import Controls from '../../containers/controls.jsx';
import {getStageDimensions} from '../../lib/screen-utils';

import styles from './stage-header.css';


const StageHeaderComponent = function (props) {
    const {
        isFullScreen,
        onSetStageFull,
        onSetStageUnFull,
        vm
    } = props;

    if (isFullScreen) {
        const stageDimensions = getStageDimensions(null, true);
        return (
            <Box className={styles.stageHeaderWrapperOverlay}>
                <Box
                    className={styles.stageMenuWrapper}
                    style={{width: stageDimensions.width}}
                >
                    <Controls vm={vm} />
                    <Button
                        className={styles.stageButton}
                        onClick={onSetStageUnFull}
                    >
                        <MdFullscreenExit className={styles.stageButtonIcon} />
                    </Button>
                </Box>
            </Box>
        );
    }

    return (
        <Box className={styles.stageHeaderWrapper}>
            <Box className={styles.stageMenuWrapper}>
                <Controls vm={vm} />
                <Button
                    className={styles.stageButton}
                    onClick={onSetStageFull}
                >
                    <MdFullscreen className={styles.stageButtonIcon} />
                </Button>
            </Box>
        </Box>
    );
};

const mapStateToProps = () => ({});

StageHeaderComponent.propTypes = {
    isFullScreen: PropTypes.bool.isRequired,
    onSetStageFull: PropTypes.func.isRequired,
    onSetStageUnFull: PropTypes.func.isRequired,
    vm: PropTypes.instanceOf(VM).isRequired
};


export default connect(
    mapStateToProps
)(StageHeaderComponent);
