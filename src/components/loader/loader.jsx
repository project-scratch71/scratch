import React from 'react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import styles from './loader.css';
const mainMessages = {
    'gui.loader.headline': <FormattedMessage defaultMessage="Loading Project" id="gui.loader.headline" />,
    'gui.loader.creating': <FormattedMessage defaultMessage="Creating Project" id="gui.loader.creating" />
};

const LoaderComponent = ({ isFullScreen, messageId }) => {
    return (
        <div className={classNames(styles.background, { [styles.fullscreen]: isFullScreen })}>
            <div className={styles.container}>
                <div className={styles.title}>
                    {mainMessages[messageId]}
                </div>
                <div className={styles.progressBar}>
                    <div className={styles.progressFill}></div>
                </div>
            </div>
        </div>
    );
};

LoaderComponent.propTypes = {
    isFullScreen: PropTypes.bool,
    messageId: PropTypes.string
};
LoaderComponent.defaultProps = {
    isFullScreen: false,
    messageId: 'gui.loader.headline'
};

export default LoaderComponent;
