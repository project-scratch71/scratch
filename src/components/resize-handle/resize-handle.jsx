import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import styles from './resize-handle.css';

const ResizeHandle = ({ onResize, currentWidth, onDragStart, onDragEnd }) => {
    const [isDragging, setIsDragging] = useState(false);
    const dragDataRef = useRef({ startX: 0, initialWidth: 0 });
    const onResizeRef = useRef(onResize);

    onResizeRef.current = onResize;

    const handleMouseDown = useCallback((e) => {
        e.preventDefault();
        dragDataRef.current = {
            startX: e.clientX,
            initialWidth: currentWidth
        };
        setIsDragging(true);
        onDragStart?.();
    }, [currentWidth, onDragStart]);

    const handleMouseMove = useCallback((e) => {
        const { startX, initialWidth } = dragDataRef.current;
        const deltaX = e.clientX - startX;
        const minWidth = 600;
        const maxWidth = window.innerWidth - 300;
        const newWidth = Math.max(minWidth, Math.min(maxWidth, initialWidth + deltaX));
        onResizeRef.current(newWidth);
    }, []);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        onDragEnd?.();
    }, [onDragEnd]);

    useEffect(() => {
        if (!isDragging) return;
        
        document.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    return (
        <div 
            className={styles.resizeHandle}
            onMouseDown={handleMouseDown}
        />
    );
};

ResizeHandle.propTypes = {
    onResize: PropTypes.func.isRequired,
    currentWidth: PropTypes.number.isRequired,
    onDragStart: PropTypes.func,
    onDragEnd: PropTypes.func
};

export default ResizeHandle;