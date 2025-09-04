import React, {useState, useEffect, useRef} from 'react';
import Box from '../box/box.jsx';
import styles from './custom-instruction-viewer.css';
import iframeCommunication from '../../lib/iframe-communication.js';

const CustomInstructionViewerComponent = ({ isDragging }) => {
    const [instructionUrl, setInstructionUrl] = useState(null);
    const containerRef = useRef(null);

    // Method to be called directly by iframe communication
    const updateMaterialId = (materialId) => {
        if (materialId) {
            const newUrl = `${process.env.MATERIAL_VIEWER_BASE_URL}/materials/${materialId}/viewer`;
            setInstructionUrl(newUrl);
        } else {
            setInstructionUrl(`${process.env.MATERIAL_VIEWER_BASE_URL}/materials/sample/viewer`);
        }
    };

    useEffect(() => {
        // Set component reference in iframe communication (like blocks.jsx does)
        iframeCommunication.setInstructionViewerComponent({ updateMaterialId });
        
        return () => {
            // Clean up reference
            iframeCommunication.setInstructionViewerComponent(null);
        };
    }, []);

    const isYouTubeUrl = (url) => {
        return url.includes('youtube.com') || url.includes('youtu.be');
    };

    const getEmbedUrl = (url) => {
        if (isYouTubeUrl(url)) {
            const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
            if (videoId) {
                // 広告とトラッキングを無効化するパラメータを追加
                return `https://www.youtube.com/embed/${videoId[1]}?rel=0&modestbranding=1&iv_load_policy=3&cc_load_policy=0&disablekb=1&fs=1&origin=${encodeURIComponent(window.location.origin)}`;
            }
        }
        return url;
    };

    return (
        <Box className={`${styles.content} custom-instruction-viewer`} ref={containerRef}>
            {instructionUrl ? (
                <iframe
                    src={getEmbedUrl(instructionUrl)}
                    className={styles.iframe}
                    style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; presentation; fullscreen"
                    key={instructionUrl} // Force re-render when URL changes
                />
            ) : (
                <div className={styles.loading}>
                    <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        height: '100%',
                        color: '#666',
                        fontSize: '14px'
                    }}>
                        <div style={{ marginBottom: '8px' }}>📚</div>
                        <div>教材を読み込み中...</div>
                    </div>
                </div>
            )}
        </Box>
    );
};

export default CustomInstructionViewerComponent;