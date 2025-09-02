import React, {useState} from 'react';
import Box from '../box/box.jsx';
import styles from './custom-instruction-viewer.css';

const CustomInstructionViewerComponent = ({ isDragging }) => {
    const [instructionUrl, setInstructionUrl] = useState(process.env.MD_VIEWER_PATH);


    const isYouTubeUrl = (url) => {
        return url.includes('youtube.com') || url.includes('youtu.be');
    };

    const getEmbedUrl = (url) => {
        if (isYouTubeUrl(url)) {
            const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
            if (videoId) {
                return `https://www.youtube.com/embed/${videoId[1]}`;
            }
        }
        return url;
    };

    return (
        <Box className={styles.content}>
                <iframe
                    src={getEmbedUrl(instructionUrl)}
                    className={styles.iframe}
                    style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
        </Box>
    );
};

export default CustomInstructionViewerComponent;