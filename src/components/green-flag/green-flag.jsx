import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { MdFlag } from 'react-icons/md';

import styles from './green-flag.css';

const GreenFlagComponent = function (props) {
    const {
        active,
        className,
        onClick,
        title,
        ...componentProps
    } = props;
    return (
        <MdFlag
            className={classNames(
                className,
                styles.greenFlag,
                {
                    [styles.isActive]: active
                }
            )}
            title={title}
            onClick={onClick}
            size={20}
            {...componentProps}
        />
    );
};
GreenFlagComponent.propTypes = {
    active: PropTypes.bool,
    className: PropTypes.string,
    onClick: PropTypes.func.isRequired,
    title: PropTypes.string
};
GreenFlagComponent.defaultProps = {
    active: false,
    title: 'Go'
};
export default GreenFlagComponent;
