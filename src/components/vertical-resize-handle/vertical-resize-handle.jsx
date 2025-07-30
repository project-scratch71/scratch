import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import styles from './vertical-resize-handle.css';

const VerticalResizeHandle = ({ onResize, currentHeight, onDragStart, onDragEnd }) => {
    const [isDragging, setIsDragging] = useState(false);
    const dragDataRef = useRef({ startY: 0, initialHeight: 0 });
    const onResizeRef = useRef(onResize);

    // 最新のonResizeを常に参照
    onResizeRef.current = onResize;

    const handleMouseDown = useCallback((e) => {
        e.preventDefault();
        dragDataRef.current = {
            startY: e.clientY,
            initialHeight: currentHeight
        };
        setIsDragging(true);
        onDragStart?.();
    }, [currentHeight, onDragStart]);

    const handleMouseMove = useCallback((e) => {
        const { startY, initialHeight } = dragDataRef.current;
        const deltaY = e.clientY - startY;
        const minPosition = 200; // StageWrapperの最小高さ
        const maxPosition = window.innerHeight - 100; // Viewerの最小高さ
        const newPosition = Math.max(minPosition, Math.min(maxPosition, initialHeight + deltaY));
        onResizeRef.current(newPosition);
    }, []);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        onDragEnd?.();
    }, [onDragEnd]);

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    return (
        <div 
            className={styles.verticalResizeHandle}
            onMouseDown={handleMouseDown}
        />
    );
};

VerticalResizeHandle.propTypes = {
    onResize: PropTypes.func.isRequired,
    currentHeight: PropTypes.number.isRequired,
    onDragStart: PropTypes.func,
    onDragEnd: PropTypes.func
};

export default VerticalResizeHandle;