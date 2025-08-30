import PropTypes from 'prop-types';
import React, { useState } from 'react';
import classNames from 'classnames';
import SpriteSelectorItem from '../../containers/sprite-selector-item.jsx';
import Box from '../box/box.jsx';
import SortableAsset from './custom-sortable-asset.jsx';
import SortableHOC from '../../lib/sortable-hoc.jsx';
import DragConstants from '../../lib/drag-constants';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';

import styles from './custom-selector.css';

const Selector = props => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const {
        buttons,
        containerRef,
        dragType,
        items,
        selectedItemIndex,
        draggingIndex,
        draggingType,
        ordering,
        onAddSortable,
        onRemoveSortable,
        onDeleteClick,
        onDuplicateClick,
        onExportClick,
        onItemClick
    } = props;

    const isRelevantDrag = draggingType === dragType;

    return (
        <Box className={styles.container}>
            <Box
                className={classNames(styles.wrapper, { [styles.collapsed]: isCollapsed })}
                componentRef={containerRef}
            >
                <Box 
                    className={classNames(styles.scrollWrapper, { [styles.hidden]: isCollapsed })}
                >
                    <Box className={styles.listArea}>
                        {items.map((item, index) => (
                            <SortableAsset
                                id={item.name}
                                index={isRelevantDrag ? ordering.indexOf(index) : index}
                                key={item.name}
                                onAddSortable={onAddSortable}
                                onRemoveSortable={onRemoveSortable}
                            >
                                <SpriteSelectorItem
                                    asset={item.asset}
                                    className={classNames(styles.listItem, {
                                        [styles.placeholder]: isRelevantDrag && index === draggingIndex
                                    })}
                                    costumeURL={item.url}
                                    details={item.details}
                                    dragPayload={item.dragPayload}
                                    dragType={dragType}
                                    icon={item.icon}
                                    id={index}
                                    index={index}
                                    name={item.name}
                                    number={index + 1 /* 1-indexed */}
                                    selected={index === selectedItemIndex}
                                    withDeleteConfirmation={true}
                                    onClick={onItemClick}
                                    onDeleteButtonClick={onDeleteClick}
                                    onDuplicateButtonClick={onDuplicateClick}
                                    onExportButtonClick={onExportClick}
                                />
                            </SortableAsset>
                        ))}
                        <Box className={classNames(styles.listItem, styles.addButtonWrapper)}>
                            <button 
                                className={styles.addButton}
                                onClick={buttons[0].onClick}
                                title={buttons[0].title}
                                type="button"
                            >
                                +
                            </button>
                        </Box>
                    </Box>
                </Box>
            </Box>
            <button 
                className={styles.toggleButton}
                onClick={() => setIsCollapsed(!isCollapsed)}
                type="button"
            >
                {isCollapsed ? <FaChevronDown /> : <FaChevronUp />}
            </button>
        </Box>
    );
};

Selector.propTypes = {
    buttons: PropTypes.arrayOf(PropTypes.shape({
        title: PropTypes.string.isRequired,
        img: PropTypes.string.isRequired,
        onClick: PropTypes.func
    })),
    containerRef: PropTypes.func,
    dragType: PropTypes.oneOf(Object.keys(DragConstants)),
    draggingIndex: PropTypes.number,
    draggingType: PropTypes.oneOf(Object.keys(DragConstants)),
    items: PropTypes.arrayOf(PropTypes.shape({
        url: PropTypes.string,
        name: PropTypes.string.isRequired
    })),
    onAddSortable: PropTypes.func,
    onDeleteClick: PropTypes.func,
    onDuplicateClick: PropTypes.func,
    onExportClick: PropTypes.func,
    onItemClick: PropTypes.func.isRequired,
    onRemoveSortable: PropTypes.func,
    ordering: PropTypes.arrayOf(PropTypes.number),
    selectedItemIndex: PropTypes.number.isRequired
};

export default SortableHOC(Selector);
