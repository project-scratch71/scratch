import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import VM from 'scratch-vm';

import {connect} from 'react-redux';

import {updateTargets} from '../reducers/targets';
import {updateBlockDrag} from '../reducers/block-drag';
import {updateMonitors} from '../reducers/monitors';
import {setProjectChanged, setProjectUnchanged} from '../reducers/project-changed';
import {setRunningState, setTurboState, setStartedState} from '../reducers/vm-status';
import {showExtensionAlert} from '../reducers/alerts';
import {updateMicIndicator} from '../reducers/mic-indicator';
import iframeCommunication from './iframe-communication';

/*
 * Higher Order Component to manage events emitted by the VM
 * Uses the built-in Profiler system for comprehensive event capture
 * @param {React.Component} WrappedComponent component to manage VM events for
 * @returns {React.Component} connected component with vm events bound to redux
 */
const vmListenerHOC = function (WrappedComponent) {
    class VMListener extends React.Component {
        constructor (props) {
            super(props);
            bindAll(this, [
                'handleKeyDown',
                'handleKeyUp',
                'handleProjectChanged',
                'initializeComprehensiveEventCapture',
                'handleProfilerFrame',
                'handleVMEvent',
                'sendUnifiedEvent'
            ]);
            
            // Original VM event listeners for Redux integration
            this.props.vm.on('targetsUpdate', this.props.onTargetsUpdate);
            this.props.vm.on('MONITORS_UPDATE', this.props.onMonitorsUpdate);
            this.props.vm.on('BLOCK_DRAG_UPDATE', this.props.onBlockDragUpdate);
            this.props.vm.on('TURBO_MODE_ON', this.props.onTurboModeOn);
            this.props.vm.on('TURBO_MODE_OFF', this.props.onTurboModeOff);
            this.props.vm.on('PROJECT_RUN_START', this.props.onProjectRunStart);
            this.props.vm.on('PROJECT_RUN_STOP', this.props.onProjectRunStop);
            this.props.vm.on('PROJECT_CHANGED', this.handleProjectChanged);
            this.props.vm.on('RUNTIME_STARTED', this.props.onRuntimeStarted);
            this.props.vm.on('PERIPHERAL_CONNECTION_LOST_ERROR', this.props.onShowExtensionAlert);
            this.props.vm.on('MIC_LISTENING', this.props.onMicListeningUpdate);
        }
        
        componentDidMount () {
            if (this.props.attachKeyboardEvents) {
                document.addEventListener('keydown', this.handleKeyDown);
                document.addEventListener('keyup', this.handleKeyUp);
            }
            this.props.vm.postIOData('userData', {username: this.props.username});
            
            // Initialize comprehensive event capture
            setTimeout(() => {
                this.initializeComprehensiveEventCapture();
            }, 1000);
        }
        
        componentDidUpdate (prevProps) {
            if (prevProps.username !== this.props.username) {
                this.props.vm.postIOData('userData', {username: this.props.username});
            }

            // Re-request a targets update when the shouldUpdateTargets state changes to true
            if (this.props.shouldUpdateTargets && !prevProps.shouldUpdateTargets) {
                this.props.vm.emitTargetsUpdate(false);
            }
        }
        
        componentWillUnmount () {
            this.props.vm.removeListener('PERIPHERAL_CONNECTION_LOST_ERROR', this.props.onShowExtensionAlert);
            if (this.props.attachKeyboardEvents) {
                document.removeEventListener('keydown', this.handleKeyDown);
                document.removeEventListener('keyup', this.handleKeyUp);
            }
        }
        
        handleProjectChanged () {
            if (this.props.shouldUpdateProjectChanged && !this.props.projectChanged) {
                this.props.onProjectChanged();
            }
        }
        
        handleKeyDown (e) {
            // Don't capture keys intended for Blockly inputs.
            if (e.target !== document && e.target !== document.body) return;

            const key = (!e.key || e.key === 'Dead') ? e.keyCode : e.key;
            this.props.vm.postIOData('keyboard', {
                key: key,
                isDown: true
            });

            // Log keyboard event
            this.sendUnifiedEvent('USER_INTERACTION', {
                interactionType: 'KEY_DOWN',
                key: key,
                keyCode: e.keyCode,
                target: e.target.tagName
            });

            // Prevent space/arrow key from scrolling the page.
            if (e.keyCode === 32 || (e.keyCode >= 37 && e.keyCode <= 40)) {
                e.preventDefault();
            }
        }
        
        handleKeyUp (e) {
            const key = (!e.key || e.key === 'Dead') ? e.keyCode : e.key;
            this.props.vm.postIOData('keyboard', {
                key: key,
                isDown: false
            });

            // Log keyboard event
            this.sendUnifiedEvent('USER_INTERACTION', {
                interactionType: 'KEY_UP',
                key: key,
                keyCode: e.keyCode,
                target: e.target.tagName
            });

            if (e.target !== document && e.target !== document.body) {
                e.preventDefault();
            }
        }
        
        initializeComprehensiveEventCapture () {
            const vm = this.props.vm;
            const runtime = vm.runtime;
            
            // Check if runtime is properly initialized
            if (!runtime) {
                console.log('Runtime not available, retrying in 500ms...');
                setTimeout(() => {
                    this.initializeComprehensiveEventCapture();
                }, 500);
                return;
            }
            
            // Send initialization event
            this.sendUnifiedEvent('SYSTEM', {
                eventType: 'VM_COMPREHENSIVE_MONITORING_INITIALIZED',
                runtimeInfo: {
                    threads: runtime.threads ? runtime.threads.length : 0,
                    targets: runtime.targets ? runtime.targets.length : 0,
                    isRunning: runtime.isRunning || false,
                    turboMode: runtime.turboMode || false,
                    profilerAvailable: !!runtime.enableProfiling
                }
            });
            
            // 1. Enable VM Profiler for comprehensive block execution capture
            if (runtime.enableProfiling && typeof runtime.enableProfiling === 'function') {
                try {
                    runtime.enableProfiling();
                    console.log('VM Profiler enabled for comprehensive event capture');
                    
                    // 2. Hook into profiler frames for ALL block executions
                    if (runtime.profiler && runtime.profiler !== null) {
                        const originalOnFrame = runtime.profiler.onFrame;
                        runtime.profiler.onFrame = (frame) => {
                            // Call original frame handler if it exists
                            if (originalOnFrame && typeof originalOnFrame === 'function') {
                                originalOnFrame(frame);
                            }
                            // Our comprehensive event capture
                            this.handleProfilerFrame(frame);
                        };
                        console.log('Profiler frame handler installed');
                    } else {
                        console.log('Profiler not available after enabling');
                    }
                } catch (error) {
                    console.error('Error enabling profiler:', error);
                }
            } else {
                console.log('Profiler not available on this runtime');
            }
            
            // 3. Listen to ALL VM system events
            this.setupSystemEventListeners();
            
            // Send ready event
            this.sendUnifiedEvent('SYSTEM', {
                eventType: 'COMPREHENSIVE_EVENT_CAPTURE_READY',
                profilerEnabled: runtime.profiler ? runtime.profiler.enabled : false,
                systemEventListeners: true,
                runtimeReady: true
            });
        }
        
        
        setupSystemEventListeners () {
            const vm = this.props.vm;
            
            // Complete list of all 35 official VM Runtime events
            const VM_EVENTS = [
                // Project lifecycle events
                'PROJECT_START', 'PROJECT_RUN_START', 'PROJECT_RUN_STOP', 'PROJECT_STOP_ALL',
                'PROJECT_LOADED', 'PROJECT_CHANGED', 'RUNTIME_STARTED', 'RUNTIME_DISPOSED',
                
                // Block and script execution events
                'SCRIPT_GLOW_ON', 'SCRIPT_GLOW_OFF', 'BLOCK_GLOW_ON', 'BLOCK_GLOW_OFF',
                'VISUAL_REPORT', 'BLOCK_DRAG_UPDATE', 'BLOCK_DRAG_END',
                
                // Target and monitor events
                'TARGETS_UPDATE', 'MONITORS_UPDATE', 'STOP_FOR_TARGET',
                
                // Extension and block management
                'EXTENSION_ADDED', 'EXTENSION_FIELD_ADDED', 'BLOCKS_NEED_UPDATE', 'BLOCKSINFO_UPDATE',
                'TOOLBOX_EXTENSIONS_NEED_UPDATE',
                
                // Runtime state events
                'TURBO_MODE_ON', 'TURBO_MODE_OFF', 'MIC_LISTENING', 'HAS_CLOUD_DATA_UPDATE',
                
                // Peripheral/device connection events
                'PERIPHERAL_CONNECTED', 'PERIPHERAL_LIST_UPDATE', 'USER_PICKED_PERIPHERAL',
                'PERIPHERAL_DISCONNECTED', 'PERIPHERAL_REQUEST_ERROR', 'PERIPHERAL_CONNECTION_LOST_ERROR',
                'PERIPHERAL_SCAN_TIMEOUT'
            ];
            
            // Listen to all VM events
            VM_EVENTS.forEach(eventName => {
                vm.on(eventName, (...args) => {
                    this.handleVMEvent(eventName, args);
                });
            });
        }
        
        handleProfilerFrame (frame) {
            try {
                // Only process frames with actual opcodes (block executions)
                if (!frame || !frame.arg || typeof frame.arg !== 'string') return;
                
                const opcode = frame.arg;
                const runtime = this.props.vm.runtime;
                const eventName = runtime && runtime.profiler && runtime.profiler.nameById ? 
                    runtime.profiler.nameById(frame.id) : `unknown_${frame.id}`;
                
                // Get current execution context
                const executionContext = this.getExecutionContext();
                
                // Try to get detailed execution data from runtime
                let detailedData = null;
                if (runtime && runtime._currentBlockExecutionData) {
                    detailedData = runtime._currentBlockExecutionData.get(opcode);
                }
                
                // Build the enhanced block execution event
                const blockExecutionData = {
                    opcode: opcode,
                    eventName: eventName,
                    executionTime: frame.totalTime || 0,
                    selfTime: frame.selfTime || 0,
                    count: frame.count || 0,
                    frameId: frame.id,
                    context: executionContext,
                    // Raw profiler data for advanced analysis
                    rawFrame: {
                        id: frame.id,
                        arg: frame.arg,
                        selfTime: frame.selfTime || 0,
                        totalTime: frame.totalTime || 0,
                        count: frame.count || 0
                    }
                };
                
                // Get current runtime state (post-execution)
                const currentRuntimeState = this.getCurrentRuntimeState();
                
                // Add detailed execution data if available
                if (detailedData) {
                    // Parameters and metadata from pre-execution capture
                    blockExecutionData.parameters = detailedData.parameters;
                    blockExecutionData.rawFields = detailedData.rawFields;
                    blockExecutionData.rawInputs = detailedData.rawInputs;
                    blockExecutionData.evaluatedArgs = detailedData.evaluatedArgs;
                    blockExecutionData.stackDepth = detailedData.stackDepth;
                    blockExecutionData.executionTimestamp = detailedData.timestamp;
                    
                    // Store pre-execution state for comparison
                    blockExecutionData.preExecutionState = {
                        target: detailedData.target,
                        allTargets: detailedData.allTargets,
                        variables: detailedData.variables
                    };
                    
                    // Clean up the detailed data after use to prevent memory leaks
                    runtime._currentBlockExecutionData.delete(opcode);
                }
                
                // Use current runtime state (post-execution) for target and allTargets
                if (currentRuntimeState && !currentRuntimeState.error) {
                    blockExecutionData.target = currentRuntimeState.target;
                    blockExecutionData.allTargets = currentRuntimeState.allTargets;
                    blockExecutionData.variables = currentRuntimeState.target ? currentRuntimeState.target.variables : {};
                    blockExecutionData.postExecutionTimestamp = currentRuntimeState.timestamp;
                } else {
                    // Fallback to pre-execution data if current state unavailable
                    if (detailedData) {
                        blockExecutionData.target = detailedData.target;
                        blockExecutionData.allTargets = detailedData.allTargets;
                        blockExecutionData.variables = detailedData.variables;
                    }
                    console.warn('Could not get current runtime state, using pre-execution data:', currentRuntimeState?.error);
                }
                
                this.sendUnifiedEvent('BLOCK_EXECUTION', blockExecutionData);
            } catch (error) {
                console.error('Error handling profiler frame:', error);
            }
        }
        
        handleVMEvent (eventName, args) {
            this.sendUnifiedEvent('VM_SYSTEM', {
                eventType: eventName,
                data: args,
                context: this.getSystemContext()
            });
        }
        
        
        getExecutionContext () {
            const runtime = this.props.vm.runtime;
            if (!runtime) return { error: 'Runtime not available' };
            
            try {
                return {
                    threads: runtime.threads ? runtime.threads.map(thread => ({
                        target: thread.target ? {
                            id: thread.target.id,
                            name: thread.target.sprite ? thread.target.sprite.name : 'Stage',
                            isStage: thread.target.isStage
                        } : null,
                        topBlock: thread.topBlock,
                        status: thread.status
                    })) : [],
                    currentTarget: runtime.getEditingTarget && runtime.getEditingTarget() ? {
                        id: runtime.getEditingTarget().id,
                        name: runtime.getEditingTarget().sprite ? runtime.getEditingTarget().sprite.name : 'Stage'
                    } : null,
                    isRunning: runtime.isRunning || false,
                    turboMode: runtime.turboMode || false
                };
            } catch (error) {
                console.error('Error getting execution context:', error);
                return { error: error.message };
            }
        }
        
        getSystemContext () {
            const runtime = this.props.vm.runtime;
            if (!runtime) return { error: 'Runtime not available' };
            
            try {
                return {
                    activeThreads: runtime.threads ? runtime.threads.length : 0,
                    totalTargets: runtime.targets ? runtime.targets.length : 0,
                    isRunning: runtime.isRunning || false,
                    turboMode: runtime.turboMode || false,
                    profilerEnabled: runtime.profiler ? runtime.profiler.enabled : false
                };
            } catch (error) {
                console.error('Error getting system context:', error);
                return { error: error.message };
            }
        }
        
        
        
        render () {
            const {
                /* eslint-disable no-unused-vars */
                attachKeyboardEvents,
                projectChanged,
                shouldUpdateTargets,
                shouldUpdateProjectChanged,
                onBlockDragUpdate,
                onGreenFlag,
                onKeyDown,
                onKeyUp,
                onMicListeningUpdate,
                onMonitorsUpdate,
                onTargetsUpdate,
                onProjectChanged,
                onProjectRunStart,
                onProjectRunStop,
                onProjectSaved,
                onRuntimeStarted,
                onTurboModeOff,
                onTurboModeOn,
                onShowExtensionAlert,
                /* eslint-enable no-unused-vars */
                ...props
            } = this.props;
            return <WrappedComponent {...props} />;
        }
    }
    
    VMListener.propTypes = {
        attachKeyboardEvents: PropTypes.bool,
        onBlockDragUpdate: PropTypes.func.isRequired,
        onGreenFlag: PropTypes.func,
        onKeyDown: PropTypes.func,
        onKeyUp: PropTypes.func,
        onMicListeningUpdate: PropTypes.func.isRequired,
        onMonitorsUpdate: PropTypes.func.isRequired,
        onProjectChanged: PropTypes.func.isRequired,
        onProjectRunStart: PropTypes.func.isRequired,
        onProjectRunStop: PropTypes.func.isRequired,
        onProjectSaved: PropTypes.func.isRequired,
        onRuntimeStarted: PropTypes.func.isRequired,
        onShowExtensionAlert: PropTypes.func.isRequired,
        onTargetsUpdate: PropTypes.func.isRequired,
        onTurboModeOff: PropTypes.func.isRequired,
        onTurboModeOn: PropTypes.func.isRequired,
        projectChanged: PropTypes.bool,
        shouldUpdateTargets: PropTypes.bool,
        shouldUpdateProjectChanged: PropTypes.bool,
        username: PropTypes.string,
        vm: PropTypes.instanceOf(VM).isRequired
    };
    
    VMListener.defaultProps = {
        attachKeyboardEvents: true,
        onGreenFlag: () => ({})
    };
    
    const mapStateToProps = state => ({
        projectChanged: state.scratchGui.projectChanged,
        shouldUpdateTargets: !state.scratchGui.mode.isFullScreen && !state.scratchGui.mode.isPlayerOnly &&
            !state.scratchGui.modals.soundRecorder,
        shouldUpdateProjectChanged: !state.scratchGui.mode.isFullScreen && !state.scratchGui.mode.isPlayerOnly,
        vm: state.scratchGui.vm,
        username: state.session && state.session.session && state.session.session.user ?
            state.session.session.user.username : ''
    });
    
    const mapDispatchToProps = dispatch => ({
        onTargetsUpdate: data => {
            dispatch(updateTargets(data.targetList, data.editingTarget));
        },
        onMonitorsUpdate: monitorList => {
            dispatch(updateMonitors(monitorList));
        },
        onBlockDragUpdate: areBlocksOverGui => {
            dispatch(updateBlockDrag(areBlocksOverGui));
        },
        onProjectRunStart: () => dispatch(setRunningState(true)),
        onProjectRunStop: () => dispatch(setRunningState(false)),
        onProjectChanged: () => dispatch(setProjectChanged()),
        onProjectSaved: () => dispatch(setProjectUnchanged()),
        onRuntimeStarted: () => dispatch(setStartedState(true)),
        onTurboModeOn: () => dispatch(setTurboState(true)),
        onTurboModeOff: () => dispatch(setTurboState(false)),
        onShowExtensionAlert: data => {
            dispatch(showExtensionAlert(data));
        },
        onMicListeningUpdate: listening => {
            dispatch(updateMicIndicator(listening));
        }
    });
    
    return connect(
        mapStateToProps,
        mapDispatchToProps
    )(VMListener);
};

export default vmListenerHOC;