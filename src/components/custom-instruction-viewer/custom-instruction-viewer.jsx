import PropTypes from 'prop-types';
import React, {useState} from 'react';
import classNames from 'classnames';

import Box from '../box/box.jsx';
import styles from './custom-instruction-viewer.css';

const CustomInstructionViewerComponent = function (props) {
    const {width} = props;
    const [instructionUrl, setInstructionUrl] = useState('');

    const handleUrlChange = (url) => {
        setInstructionUrl(url);
    };

    const handleUrlSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const url = formData.get('url');
        if (url) {
            handleUrlChange(url);
        }
    };

    const isValidUrl = (string) => {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    };

    const isYouTubeUrl = (url) => {
        return url.includes('youtube.com') || url.includes('youtu.be');
    };

    const getEmbedUrl = (url) => {
        if (isYouTubeUrl(url)) {
            // Convert YouTube URL to embed URL
            const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
            if (videoId) {
                return `https://www.youtube.com/embed/${videoId[1]}`;
            }
        }
        return url;
    };

    return (
        <Box 
            className={styles.instructionViewer}
            style={{width: `${width}px`}}
        >
            <Box className={styles.content}>
                {instructionUrl && isValidUrl(instructionUrl) ? (
                    <iframe
                        src={getEmbedUrl(instructionUrl)}
                        className={styles.iframe}
                        title="Programming Instruction"
                        frameBorder="0"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                ) : (
                    <Box className={styles.placeholder}>
                        <p>Enter a URL above to load programming tutorials, documentation, or educational videos.</p>
                        <p>Supported: YouTube videos, coding tutorials, documentation sites, and more.</p>
                    </Box>
                )}
            </Box>
            <Box className={styles.header}>
                <form onSubmit={handleUrlSubmit} className={styles.urlForm}>
                    <input
                        type="url"
                        name="url"
                        placeholder="Enter URL for programming tutorial or video..."
                        className={styles.urlInput}
                        required
                    />
                    <button type="submit" className={styles.loadButton}>
                        Load
                    </button>
                </form>
            </Box>
        </Box>
    );
};

CustomInstructionViewerComponent.propTypes = {
    width: PropTypes.number.isRequired
};

export default CustomInstructionViewerComponent;