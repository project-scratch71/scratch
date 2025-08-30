import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import styles from './resize-handle.css';

const ResizeHandle = ({ onResize, currentWidth, onDragStart, onDragEnd }) => {
    const [isDragging, setIsDragging] = useState(false);
    const dragDataRef = useRef({ startX: 0, initialWidth: 0 });
    const onResizeRef = useRef(onResize);

    onResizeRef.current = onResize;

    const getClientX = (e) => {
        return e.touches ? e.touches[0].clientX : e.clientX;
    };

    const handleStart = useCallback((e) => {
        e.preventDefault();
        const clientX = getClientX(e);
        dragDataRef.current = {
            startX: clientX,
            initialWidth: currentWidth
        };
        setIsDragging(true);
        onDragStart?.();
    }, [currentWidth, onDragStart]);

    const handleMove = useCallback((e) => {
        if (!isDragging) return;
        e.preventDefault();
        const { startX, initialWidth } = dragDataRef.current;
        const clientX = getClientX(e);
        const deltaX = clientX - startX;
        const minWidth = 100;
        const maxWidth = window.innerWidth - 100;
        const newWidth = Math.max(minWidth, Math.min(maxWidth, initialWidth + deltaX));
        onResizeRef.current(newWidth);
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
            className={styles.resizeHandle}
            onMouseDown={handleStart}
            onTouchStart={handleStart}
        >
            <div className={styles.lowerLine} />
        </div>
    );
};

ResizeHandle.propTypes = {
    onResize: PropTypes.func.isRequired,
    currentWidth: PropTypes.number.isRequired,
    onDragStart: PropTypes.func,
    onDragEnd: PropTypes.func
};

export default ResizeHandle;