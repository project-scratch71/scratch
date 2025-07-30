import React from 'react';

import Box from '../box/box.jsx';
import Selector from './custom-selector.jsx';
import styles from './custom-asset-panel.css';

const AssetPanel = props => (
    <Box className={styles.wrapper} style={props.style}>
        <Box className={styles.detailArea}>
            {props.children}
        </Box>
        <Selector
            className={styles.selector}
            {...props}
        />
    </Box>
);

AssetPanel.propTypes = {
    ...Selector.propTypes
};

export default AssetPanel;
