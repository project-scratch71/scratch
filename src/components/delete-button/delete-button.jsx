import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import { FaTrash } from 'react-icons/fa';

import styles from './delete-button.css';

const DeleteButton = props => (
    <div
        aria-label="Delete"
        className={classNames(
            styles.deleteButton,
            props.className
        )}
        role="button"
        tabIndex={props.tabIndex}
        onClick={props.onClick}
    >
        <div
            className={classNames(styles.deleteButtonVisible, {
                [styles.deleteButtonClicked]: props.isConfirmationModalOpened
            })}
        >
            <FaTrash
                className={styles.deleteIcon}
                size={14}
            />
        </div>
    </div>

);

DeleteButton.propTypes = {
    className: PropTypes.string,
    onClick: PropTypes.func.isRequired,
    isConfirmationModalOpened: PropTypes.bool,
    tabIndex: PropTypes.number
};

DeleteButton.defaultProps = {
    tabIndex: 0
};

export default DeleteButton;
