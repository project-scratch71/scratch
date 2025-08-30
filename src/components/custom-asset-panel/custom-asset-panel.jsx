import React from 'react';

import Box from '../box/box.jsx';
import Selector from './custom-selector.jsx';
import styles from './custom-asset-panel.css';

const AssetPanel = props => (
    <Box className={styles.wrapper} style={props.style}>
        <Selector
            className={styles.selector}
            {...props}
        />
        <Box className={styles.detailArea}>
            {props.children}
        </Box>
    </Box>
);

AssetPanel.propTypes = {
    ...Selector.propTypes
};

export default AssetPanel;
