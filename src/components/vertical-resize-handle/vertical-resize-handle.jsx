import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import styles from './vertical-resize-handle.css';

const VerticalResizeHandle = ({ onResize, currentHeight, onDragStart, onDragEnd }) => {
    const [isDragging, setIsDragging] = useState(false);
    const dragDataRef = useRef({ startY: 0, initialHeight: 0 });
    const onResizeRef = useRef(onResize);

    onResizeRef.current = onResize;

    const getClientY = (e) => {
        return e.touches ? e.touches[0].clientY : e.clientY;
    };

    const handleStart = useCallback((e) => {
        e.preventDefault();
        const clientY = getClientY(e);
        dragDataRef.current = {
            startY: clientY,
            initialHeight: currentHeight
        };
        setIsDragging(true);
        onDragStart?.();
    }, [currentHeight, onDragStart]);

    const handleMove = useCallback((e) => {
        if (!isDragging) return;
        e.preventDefault();
        const { startY, initialHeight } = dragDataRef.current;
        const clientY = getClientY(e);
        const deltaY = clientY - startY;
        const minHeight = 50;
        const maxHeight = window.innerHeight - 50;
        const newHeight = Math.max(minHeight, Math.min(maxHeight, initialHeight - deltaY));
        onResizeRef.current(newHeight);
    }, [isDragging]);

    const handleEnd = useCallback(() => {
        setIsDragging(false);
        onDragEnd?.();
    }, [onDragEnd]);

    useEffect(() => {
        if (!isDragging) return;
        
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('touchmove', handleMove, { passive: false });
        window.addEventListener('mouseup', handleEnd);
        window.addEventListener('touchend', handleEnd);
        
        return () => {
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('touchmove', handleMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchend', handleEnd);
        };
    }, [isDragging, handleMove, handleEnd]);

    return (
        <div 
            className={styles.verticalResizeHandle}
            onMouseDown={handleStart}
            onTouchStart={handleStart}
        >
            <div className={styles.rightLine} />
        </div>
    );
};

VerticalResizeHandle.propTypes = {
    onResize: PropTypes.func.isRequired,
    currentHeight: PropTypes.number.isRequired,
    onDragStart: PropTypes.func,
    onDragEnd: PropTypes.func
};

export default VerticalResizeHandle;