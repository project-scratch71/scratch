import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import { FaSearch, FaTimes } from 'react-icons/fa';
import styles from './filter.css';

const FilterComponent = props => {
    const {
        className,
        onChange,
        onClear,
        placeholderText,
        filterQuery,
        inputClassName
    } = props;
    return (
        <div
            className={classNames(className, styles.filter, {
                [styles.isActive]: filterQuery.length > 0
            })}
        >
            <FaSearch
                className={styles.filterIcon}
                size={16}
            />
            <input
                className={classNames(styles.filterInput, inputClassName)}
                placeholder={placeholderText}
                type="text"
                value={filterQuery}
                onChange={onChange}
            />
            <div
                className={styles.xIconWrapper}
                onClick={onClear}
            >
                <FaTimes
                    className={styles.xIcon}
                    size={14}
                />
            </div>
        </div>
    );
};

FilterComponent.propTypes = {
    className: PropTypes.string,
    filterQuery: PropTypes.string,
    inputClassName: PropTypes.string,
    onChange: PropTypes.func,
    onClear: PropTypes.func,
    placeholderText: PropTypes.string
};
FilterComponent.defaultProps = {
    placeholderText: 'Search'
};
export default FilterComponent;
