import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import Renderer from 'scratch-render';
import VM from 'scratch-vm';
import {connect} from 'react-redux';

import {STAGE_DISPLAY_SIZES} from '../lib/layout-constants';
import {getEventXY} from '../lib/touch-utils';
import VideoProvider from '../lib/video/video-provider';
import {BitmapAdapter as V2BitmapAdapter} from 'scratch-svg-renderer';

import StageComponent from '../components/stage/stage.jsx';

import {
    activateColorPicker,
    deactivateColorPicker
} from '../reducers/color-picker';

const colorPickerRadius = 20;
const dragThreshold = 3; // Same as the block drag threshold

class Stage extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'attachMouseEvents',
            'cancelMouseDownTimeout',
            'detachMouseEvents',
            'handleDoubleClick',
            'handleQuestionAnswered',
            'onMouseUp',
            'onMouseMove',
            'onMouseDown',
            'onStartDrag',
            'onStopDrag',
            'onWheel',
            'updateRect',
            'questionListener',
            'setDragCanvas',
            'clearDragCanvas',
            'drawDragCanvas',
            'positionDragCanvas',
            'onStageDimensionsChanged'
        ]);
        this.state = {
            mouseDownTimeoutId: null,
            mouseDownPosition: null,
            isDragging: false,
            dragOffset: null,
            dragId: null,
            colorInfo: null,
            question: null
        };
        // Store actual stage dimensions for accurate coordinate calculations
        this.actualStageDimensions = null;
        if (this.props.vm.renderer) {
            this.renderer = this.props.vm.renderer;
            this.canvas = this.renderer.canvas;
        } else {
            this.canvas = document.createElement('canvas');
            this.renderer = new Renderer(this.canvas);
            this.props.vm.attachRenderer(this.renderer);

            // Only attach a video provider once because it is stateful
            this.props.vm.setVideoProvider(new VideoProvider());

            // Calling draw a single time before any project is loaded just makes
            // the canvas white instead of solid black–needed because it is not
            // possible to use CSS to style the canvas to have a different
            // default color
            this.props.vm.renderer.draw();
        }
        this.props.vm.attachV2BitmapAdapter(new V2BitmapAdapter());
    }
    componentDidMount () {
        this.attachRectEvents();
        this.attachMouseEvents(this.canvas);
        this.updateRect();
        this.props.vm.runtime.addListener('QUESTION', this.questionListener);
    }
    shouldComponentUpdate (nextProps, nextState) {
        return this.props.stageSize !== nextProps.stageSize ||
            this.props.isColorPicking !== nextProps.isColorPicking ||
            this.state.colorInfo !== nextState.colorInfo ||
            this.props.isFullScreen !== nextProps.isFullScreen ||
            this.state.question !== nextState.question ||
            this.props.micIndicator !== nextProps.micIndicator ||
            this.props.isStarted !== nextProps.isStarted;
    }
    componentDidUpdate (prevProps) {
        if (this.props.isColorPicking && !prevProps.isColorPicking) {
            this.startColorPickingLoop();
        } else if (!this.props.isColorPicking && prevProps.isColorPicking) {
            this.stopColorPickingLoop();
        }
        // Use requestAnimationFrame to ensure canvas has been resized before updating renderer
        requestAnimationFrame(() => {
            this.updateRect();
            this.renderer.resize(this.rect.width, this.rect.height);
        });
    }
    componentWillUnmount () {
        this.detachMouseEvents(this.canvas);
        this.detachRectEvents();
        this.stopColorPickingLoop();
        this.props.vm.runtime.removeListener('QUESTION', this.questionListener);
    }
    questionListener (question) {
        this.setState({question: question});
    }
    handleQuestionAnswered (answer) {
        this.setState({question: null}, () => {
            this.props.vm.runtime.emit('ANSWER', answer);
        });
    }
    startColorPickingLoop () {
        this.intervalId = setInterval(() => {
            if (typeof this.pickX === 'number') {
                this.setState({colorInfo: this.getColorInfo(this.pickX, this.pickY)});
            }
        }, 30);
    }
    stopColorPickingLoop () {
        clearInterval(this.intervalId);
    }
    attachMouseEvents (canvas) {
        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mouseup', this.onMouseUp);
        document.addEventListener('touchmove', this.onMouseMove);
        document.addEventListener('touchend', this.onMouseUp);
        canvas.addEventListener('mousedown', this.onMouseDown);
        canvas.addEventListener('touchstart', this.onMouseDown, {passive: false});
        canvas.addEventListener('wheel', this.onWheel, {passive: false});
    }
    detachMouseEvents (canvas) {
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseup', this.onMouseUp);
        document.removeEventListener('touchmove', this.onMouseMove);
        document.removeEventListener('touchend', this.onMouseUp);
        canvas.removeEventListener('mousedown', this.onMouseDown);
        canvas.removeEventListener('touchstart', this.onMouseDown);
        canvas.removeEventListener('wheel', this.onWheel);
    }
    attachRectEvents () {
        window.addEventListener('resize', this.updateRect);
        window.addEventListener('scroll', this.updateRect);
    }
    detachRectEvents () {
        window.removeEventListener('resize', this.updateRect);
        window.removeEventListener('scroll', this.updateRect);
    }
    updateRect () {
        this.rect = this.canvas.getBoundingClientRect();
        // Store the actual canvas position for more accurate coordinate calculations
        this.canvasRect = this.canvas.getBoundingClientRect();
    }
    getScratchCoords (x, y) {
        const nativeSize = this.renderer.getNativeSize();
        // x, y are already canvas-relative coordinates (mousePosition[0], mousePosition[1])
        // So we need to use the canvas dimensions for the transformation
        const canvasRect = this.canvas.getBoundingClientRect();
        
        return [
            (nativeSize[0] / canvasRect.width) * (x - (canvasRect.width / 2)),
            (nativeSize[1] / canvasRect.height) * (y - (canvasRect.height / 2))
        ];
    }
    getColorInfo (x, y) {
        return {
            x: x,
            y: y,
            ...this.renderer.extractColor(x, y, colorPickerRadius)
        };
    }
    handleDoubleClick (e) {
        const {x, y} = getEventXY(e);
        // Set editing target from cursor position, if clicking on a sprite.
        const canvasRect = this.canvas.getBoundingClientRect();
        const mousePosition = [x - canvasRect.left, y - canvasRect.top];
        const drawableId = this.renderer.pick(mousePosition[0], mousePosition[1]);
        if (drawableId === null) return;
        const targetId = this.props.vm.getTargetIdForDrawableId(drawableId);
        if (targetId === null) return;
        this.props.vm.setEditingTarget(targetId);
    }
    /**
     * マウス／タッチムーブ時のハンドラ
     * ドラッグ閾値判定後に onStartDrag を呼び直せるように、
     * ページ座標→相対座標を常に最新のキャンバス位置で計算する。
     */
    onMouseMove(e) {
        const { x: pageX, y: pageY } = getEventXY(e);
        this.updateRect();
        const canvasRect = this.canvas.getBoundingClientRect();
        const relX = pageX - canvasRect.left;
        const relY = pageY - canvasRect.top;

        if (this.props.isColorPicking) {
            // カラーピッカー用位置更新
            this.pickX = relX;
            this.pickY = relY;
        }

        // ドラッグ判定（まだ isDragging じゃない段階）
        if (this.state.mouseDown && !this.state.isDragging) {
            const [startPageX, startPageY] = this.state.mouseDownPage || [];
            const relStartX = startPageX - canvasRect.left;
            const relStartY = startPageY - canvasRect.top;
            const dx = relX - relStartX;
            const dy = relY - relStartY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > dragThreshold) {
                this.cancelMouseDownTimeout();
                // ★保存したページ座標でドラッグ開始
                this.onStartDrag(startPageX, startPageY);
            }
        }

        // 実際にドラッグ中ならスプライト移動
        if (this.state.mouseDown && this.state.isDragging) {
            if (this.props.useEditorDragStyle) {
                this.positionDragCanvas(relX, relY);
            } else {
                const [scratchX, scratchY] = this.getScratchCoords(relX, relY);
                this.props.vm.postSpriteInfo({
                    x: scratchX + this.state.dragOffset[0],
                    y: -(scratchY + this.state.dragOffset[1]),
                    force: true
                });
            }
        }

        // VM にマウスムーブ情報を送信
        this.props.vm.postIOData('mouse', {
            x: relX,
            y: relY,
            canvasWidth: canvasRect.width,
            canvasHeight: canvasRect.height
        });
    }

    onMouseUp (e) {
        const {x, y} = getEventXY(e);
        const canvasRect = this.canvas.getBoundingClientRect();
        const mousePosition = [x - canvasRect.left, y - canvasRect.top];
        this.cancelMouseDownTimeout();
        this.setState({
            mouseDown: false,
            mouseDownPosition: null
        });


        const data = {
            isDown: false,
            x: mousePosition[0],
            y: mousePosition[1],
            canvasWidth: canvasRect.width,
            canvasHeight: canvasRect.height,
            wasDragged: this.state.isDragging
        };
        if (this.state.isDragging) {
            this.onStopDrag(mousePosition[0], mousePosition[1]);
        }
        this.props.vm.postIOData('mouse', data);

        if (this.props.isColorPicking &&
            mousePosition[0] > 0 && mousePosition[0] < canvasRect.width &&
            mousePosition[1] > 0 && mousePosition[1] < canvasRect.height
        ) {
            const {r, g, b} = this.state.colorInfo.color;
            const componentToString = c => {
                const hex = c.toString(16);
                return hex.length === 1 ? `0${hex}` : hex;
            };
            const colorString = `#${componentToString(r)}${componentToString(g)}${componentToString(b)}`;
            this.props.onDeactivateColorPicker(colorString);
            this.setState({colorInfo: null});
            this.pickX = null;
            this.pickY = null;
        }
    }
    /**
     * マウス／タッチダウン時のハンドラ
     * pageX/pageY（ページ座標）を state.mouseDownPage に保存し、
     * ドラッグ開始時に正しく再計算できるようにする。
     */
    onMouseDown(e) {
        this.updateRect();
        // ページ座標を取得
        const { x: pageX, y: pageY } = getEventXY(e);
        const canvasRect = this.canvas.getBoundingClientRect();
        // キャンバス相対座標（ポインタ座標）も計算しておく
        const relX = pageX - canvasRect.left;
        const relY = pageY - canvasRect.top;

        if (this.props.isColorPicking) {
            // カラーピッカー中ならそのまま情報更新
            this.pickX = relX;
            this.pickY = relY;
            this.setState({ colorInfo: this.getColorInfo(relX, relY) });
        } else {
            // 左クリック or タッチならドラッグ準備
            if (e.button === 0 || (window.TouchEvent && e instanceof TouchEvent)) {
                this.setState({
                    mouseDown: true,
                    mouseDownPage: [pageX, pageY],  // ★生のページ座標を保存
                    mouseDownTimeoutId: setTimeout(
                        () => this.onStartDrag(pageX, pageY),
                        400
                    )
                });
            }
            // VM にマウスダウン情報を送信
            this.props.vm.postIOData('mouse', {
                isDown: true,
                x: relX,
                y: relY,
                canvasWidth: canvasRect.width,
                canvasHeight: canvasRect.height
            });
            if (e.preventDefault) {
                e.preventDefault();
                if (document.activeElement && document.activeElement.blur) {
                    document.activeElement.blur();
                }
            }
        }
    }


    onWheel (e) {
        const data = {
            deltaX: e.deltaX,
            deltaY: e.deltaY
        };
        this.props.vm.postIOData('mouseWheel', data);
    }
    cancelMouseDownTimeout () {
        if (this.state.mouseDownTimeoutId !== null) {
            clearTimeout(this.state.mouseDownTimeoutId);
        }
        this.setState({mouseDownTimeoutId: null});
    }
    /**
     * Initialize the position of the "dragged sprite" canvas
     * @param {DrawableExtraction} drawableData The data returned from renderer.extractDrawableScreenSpace
     * @param {number} x The x position of the initial drag event
     * @param {number} y The y position of the initial drag event
     */
    drawDragCanvas (drawableData, x, y) {
        const {
            imageData,
            x: boundsX,
            y: boundsY,
            width: boundsWidth,
            height: boundsHeight
        } = drawableData;

        this.dragCanvas.width = imageData.width;
        this.dragCanvas.height = imageData.height;
        // On high-DPI devices, the canvas size in layout-pixels is not equal to the size of the extracted data.
        this.dragCanvas.style.width = `${boundsWidth}px`;
        this.dragCanvas.style.height = `${boundsHeight}px`;

        this.dragCanvas.getContext('2d').putImageData(imageData, 0, 0);
        this.dragCanvas.style.left = `${boundsX}px`;
        this.dragCanvas.style.top  = `${boundsY}px`;
        this.dragCanvas.style.display = 'block';
    }
    clearDragCanvas () {
        this.dragCanvas.width = this.dragCanvas.height = 0;
        this.dragCanvas.style.display = 'none';
    }
    positionDragCanvas (mouseX, mouseY) {
        // Calculate how much the sprite has moved from its initial position
        if (this.initialDragPosition) {
            const deltaX = mouseX - this.initialDragPosition[0];
            const deltaY = mouseY - this.initialDragPosition[1];
            // Move dragCanvas by the same amount the mouse has moved
            this.dragCanvas.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        }
    }
    /**
     * ドラッグ開始処理
     * 引数はページ座標（pageX, pageY）で受け取り、
     * 最新のキャンバス位置から相対座標を再計算してから pick → startDrag へ。
     */
    onStartDrag(pageX, pageY) {
        if (this.state.dragId) return;
        // 最新のキャンバス位置・サイズを取得
        this.updateRect();
        const canvasRect = this.canvas.getBoundingClientRect();
        // ページ座標 → キャンバス相対座標
        const x = pageX - canvasRect.left;
        const y = pageY - canvasRect.top;

        // 描画対象の取得
        const drawableId = this.renderer.pick(x, y);
        if (drawableId === null) return;
        const targetId = this.props.vm.getTargetIdForDrawableId(drawableId);
        if (targetId === null) return;
        const target = this.props.vm.runtime.getTargetById(targetId);
        if (!(this.props.useEditorDragStyle || target.draggable)) return;

        target.goToFront();

        // Scratch 座標系に変換
        const [scratchMouseX, scratchMouseY] = this.getScratchCoords(x, y);
        const offsetX = target.x - scratchMouseX;
        const offsetY = -target.y - scratchMouseY;

        this.props.vm.startDrag(targetId);
        this.setState({
            isDragging: true,
            dragId: targetId,
            dragOffset: [offsetX, offsetY]
        });

        // Store initial drag position for relative movement calculation
        this.initialDragPosition = [x, y];

        if (this.props.useEditorDragStyle) {
            const drawableData = this.renderer.extractDrawableScreenSpace(drawableId);
            this.drawDragCanvas(drawableData, x, y);
            this.positionDragCanvas(x, y);
            this.props.vm.postSpriteInfo({ visible: false });
            this.props.vm.renderer.draw();
        }
    }

    onStopDrag (mouseX, mouseY) {
        const dragId = this.state.dragId;
        const commonStopDragActions = () => {
            this.props.vm.stopDrag(dragId);
            this.setState({
                isDragging: false,
                dragOffset: null,
                dragId: null
            });
            // Clear initial drag position
            this.initialDragPosition = null;
        };
        if (this.props.useEditorDragStyle) {
            // Need to sequence these actions to prevent flickering.
            const spriteInfo = {visible: true};
            // First update the sprite position if dropped in the stage.
            const canvasRect = this.canvas.getBoundingClientRect();
            if (mouseX > 0 && mouseX < canvasRect.width &&
                mouseY > 0 && mouseY < canvasRect.height) {
                const spritePosition = this.getScratchCoords(mouseX, mouseY);
                spriteInfo.x = spritePosition[0] + this.state.dragOffset[0];
                spriteInfo.y = -(spritePosition[1] + this.state.dragOffset[1]);
                spriteInfo.force = true;
            }
            this.props.vm.postSpriteInfo(spriteInfo);
            // Then clear the dragging canvas and stop drag (potentially slow if selecting sprite)
            this.clearDragCanvas();
            commonStopDragActions();
            this.props.vm.renderer.draw();
        } else {
            commonStopDragActions();
        }
    }
    setDragCanvas (canvas) {
        this.dragCanvas = canvas;
    }
    onStageDimensionsChanged (dimensions) {
        this.actualStageDimensions = dimensions;
        // Update renderer size to match actual stage dimensions
        if (this.renderer) {
            this.renderer.resize(dimensions.width, dimensions.height);
        }
    }
    render () {
        const {
            vm, // eslint-disable-line no-unused-vars
            onActivateColorPicker, // eslint-disable-line no-unused-vars
            stageSize, // eslint-disable-line no-unused-vars
            ...props
        } = this.props;
        return (
            <StageComponent
                canvas={this.canvas}
                colorInfo={this.state.colorInfo}
                dragRef={this.setDragCanvas}
                question={this.state.question}
                onDoubleClick={this.handleDoubleClick}
                onQuestionAnswered={this.handleQuestionAnswered}
                onStageDimensionsChanged={this.onStageDimensionsChanged}
                {...props}
            />
        );
    }
}

Stage.propTypes = {
    isColorPicking: PropTypes.bool,
    isFullScreen: PropTypes.bool.isRequired,
    isStarted: PropTypes.bool,
    micIndicator: PropTypes.bool,
    onActivateColorPicker: PropTypes.func,
    onDeactivateColorPicker: PropTypes.func,
    stageSize: PropTypes.oneOf(Object.keys(STAGE_DISPLAY_SIZES)).isRequired,
    useEditorDragStyle: PropTypes.bool,
    vm: PropTypes.instanceOf(VM).isRequired
};

Stage.defaultProps = {
    useEditorDragStyle: true
};

const mapStateToProps = state => ({
    isColorPicking: state.scratchGui.colorPicker.active,
    isFullScreen: state.scratchGui.mode.isFullScreen,
    isStarted: state.scratchGui.vmStatus.started,
    micIndicator: state.scratchGui.micIndicator,
    // Do not use editor drag style in fullscreen or player mode.
    useEditorDragStyle: !(state.scratchGui.mode.isFullScreen || state.scratchGui.mode.isPlayerOnly)
});

const mapDispatchToProps = dispatch => ({
    onActivateColorPicker: () => dispatch(activateColorPicker()),
    onDeactivateColorPicker: color => dispatch(deactivateColorPicker(color))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Stage);
