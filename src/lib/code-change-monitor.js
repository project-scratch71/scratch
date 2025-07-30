/**
 * Code Change Monitor
 * Monitors workspace changes and sends serialized code to parent window
 */

import CodeSerializer from './code-serializer';
import iframeCommunication from './iframe-communication';

class CodeChangeMonitor {
    constructor() {
        this.codeSerializer = new CodeSerializer();
        this.vm = null;
        this.workspace = null;
        this.lastCodeHash = null;
        this.changeTimeout = null;
        this.isInitialized = false;
        
        // Debounce delay to prevent excessive updates
        this.DEBOUNCE_DELAY = 500; // ms
        
        // Track which events should trigger code serialization
        this.codeChangeEvents = new Set([
            'create', 'delete', 'change', 'move', 'dragOutside', 'endDrag',
            'var_create', 'var_delete', 'var_rename',
            'comment_create', 'comment_delete', 'comment_change', 'comment_move'
        ]);
    }

    /**
     * Initialize the code change monitor
     * @param {Object} vm - Scratch VM instance
     * @param {Object} workspace - Blockly workspace instance
     */
    initialize(vm, workspace) {
        this.vm = vm;
        this.workspace = workspace;
        
        if (!vm || !workspace) {
            console.error('CodeChangeMonitor: VM or workspace not provided');
            return;
        }

        try {
            // Listen to Blockly workspace changes (granular)
            this.setupWorkspaceListener();
            
            // Listen to VM system events (high-level)
            this.setupVMEventListeners();
            
            // Send initial code state
            this.sendCurrentCode();
            
            this.isInitialized = true;
            console.log('CodeChangeMonitor: Initialized successfully');
            
        } catch (error) {
            console.error('CodeChangeMonitor: Failed to initialize:', error);
        }
    }

    /**
     * Setup Blockly workspace change listener for granular changes
     */
    setupWorkspaceListener() {
        if (!this.workspace) return;

        // Add our change listener to capture all workspace modifications
        this.workspace.addChangeListener((event) => {
            this.handleWorkspaceChange(event);
        });
        
        console.log('CodeChangeMonitor: Workspace listener setup complete');
    }

    /**
     * Setup VM event listeners for high-level changes
     */
    setupVMEventListeners() {
        if (!this.vm) return;

        // Listen to project-level changes
        this.vm.on('PROJECT_CHANGED', () => {
            this.handleProjectChange('PROJECT_CHANGED');
        });

        // Listen to target updates (sprite changes)
        this.vm.on('TARGETS_UPDATE', (data) => {
            this.handleProjectChange('TARGETS_UPDATE', data);
        });

        // Listen to workspace updates
        this.vm.on('workspaceUpdate', (data) => {
            this.handleProjectChange('workspaceUpdate', data);
        });

        console.log('CodeChangeMonitor: VM event listeners setup complete');
    }

    /**
     * Handle Blockly workspace changes
     * @param {Object} event - Blockly change event
     */
    handleWorkspaceChange(event) {
        try {
            // Skip non-code-changing events
            if (!this.codeChangeEvents.has(event.type)) {
                return;
            }

            // Skip events during undo/redo operations
            if (event.recordUndo === false) {
                return;
            }

            // Debounce rapid changes
            this.debouncedCodeUpdate();
            
        } catch (error) {
            console.error('CodeChangeMonitor: Error handling workspace change:', error);
        }
    }

    /**
     * Handle VM-level project changes
     * @param {string} eventType - Type of VM event
     * @param {Object} data - Event data
     */
    handleProjectChange(eventType, data = null) {
        try {
            // Some VM events might not require immediate code update
            if (eventType === 'TARGETS_UPDATE' && data) {
                // Only update if editing target changed or significant changes occurred
                if (data.editingTarget || this.isSignificantTargetChange(data)) {
                    this.debouncedCodeUpdate();
                }
            } else {
                // For other project changes, always update
                this.debouncedCodeUpdate();
            }
            
        } catch (error) {
            console.error('CodeChangeMonitor: Error handling project change:', error);
        }
    }

    /**
     * Check if target update represents significant changes
     * @param {Object} data - Target update data
     * @returns {boolean} Whether change is significant
     */
    isSignificantTargetChange(data) {
        // This is a heuristic - could be refined based on specific needs
        return data.targetList && data.targetList.length > 0;
    }

    /**
     * Debounced code update to prevent excessive processing
     */
    debouncedCodeUpdate() {
        // Clear existing timeout
        if (this.changeTimeout) {
            clearTimeout(this.changeTimeout);
        }

        // Set new timeout
        this.changeTimeout = setTimeout(() => {
            this.sendCurrentCode();
        }, this.DEBOUNCE_DELAY);
    }

    /**
     * Get raw code data and send to parent window
     */
    sendCurrentCode() {
        try {
            if (!this.vm || !this.isInitialized) {
                return;
            }

            // Get raw targets data directly from VM
            const rawCodeData = this.getRawCodeData();
            
            // Generate hash to detect actual changes
            const codeHash = JSON.stringify(rawCodeData);
            
            // Only send if code actually changed
            if (codeHash !== this.lastCodeHash) {
                this.lastCodeHash = codeHash;
            
                // Send raw code data via iframe communication
                iframeCommunication.sendMessage('CODE_UPDATE', rawCodeData);
            }
            
        } catch (error) {
            console.error('CodeChangeMonitor: Error sending current code:', error);
        }
    }

    /**
     * Get raw code data directly from VM targets
     * @returns {Object} Raw targets data
     */
    getRawCodeData() {
        try {
            const targets = this.vm.runtime.targets;
            const rawData = {};

            targets.forEach(target => {
                if (target && target.id) {
                    rawData[target.id] = {
                        id: target.id,
                        name: target.sprite ? target.sprite.name : 'Stage',
                        isStage: target.isStage || false,
                        blocks: target.blocks ? target.blocks._blocks : {},
                        variables: target.variables || {},
                        lists: target.lists || {},
                        x: target.x || 0,
                        y: target.y || 0,
                        direction: target.direction || 90,
                        visible: target.visible !== undefined ? target.visible : true,
                        size: target.size || 100,
                        currentCostume: target.currentCostume || 0,
                        effects: target.effects || {}
                    };
                }
            });

            return rawData;
        } catch (error) {
            console.error('CodeChangeMonitor: Error getting raw code data:', error);
            return {};
        }
    }

    /**
     * Manually trigger code update (useful for external calls)
     */
    triggerCodeUpdate() {
        this.sendCurrentCode();
    }

    /**
     * Get current raw code without sending
     * @returns {Object} Current raw code data
     */
    getCurrentCode() {
        if (!this.vm || !this.isInitialized) {
            return {};
        }
        
        return this.getRawCodeData();
    }

    /**
     * Cleanup method
     */
    cleanup() {
        if (this.changeTimeout) {
            clearTimeout(this.changeTimeout);
            this.changeTimeout = null;
        }
        
        this.vm = null;
        this.workspace = null;
        this.isInitialized = false;
        
        console.log('CodeChangeMonitor: Cleaned up');
    }
}

// Create singleton instance
const codeChangeMonitor = new CodeChangeMonitor();

export default codeChangeMonitor;