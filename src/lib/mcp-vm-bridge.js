/**
 * MCP VM Bridge
 * A bridge between MCP Server and Scratch VM for executing operations
 */

import log from './log.js';

class MCPVMBridge {
    /**
     * Creates a bridge between MCP Server and Scratch VM
     * @param {Object} vm - The Scratch VM instance
     */
    constructor (vm) {
        this.vm = vm;
        log.info('MCP VM Bridge initialized');
    }

    /**
     * Get current editingTarget (current sprite)
     * @returns {Object|null} The current sprite target
     */
    getCurrentTarget() {
        return this.vm.editingTarget;
    }

    /**
     * Get sprite by ID or name
     * @param {string} spriteIdOrName - The ID or name of the sprite
     * @returns {Object|null} The sprite target
     */
    getSprite(spriteIdOrName) {
        if (!spriteIdOrName) return this.vm.editingTarget;

        // Try to find by ID first
        let target = this.vm.runtime.getTargetById(spriteIdOrName);
        
        // If not found, try by name
        if (!target) {
            target = this.vm.runtime.targets.find(t => 
                t.sprite && t.sprite.name === spriteIdOrName
            );
        }
        
        return target;
    }

    /**
     * Create a new block in the specified sprite
     * @param {string} spriteId - ID of the sprite (optional, uses current sprite if not provided)
     * @param {string} opcode - Block opcode
     * @param {Object} inputs - Block inputs
     * @param {Object} position - X,Y position for the block
     * @returns {string} ID of the created block
     */
    createBlock(spriteId, opcode, inputs = {}, position = { x: 0, y: 0 }) {
        const target = spriteId ? this.getSprite(spriteId) : this.getCurrentTarget();
        
        if (!target) {
            throw new Error('Target sprite not found');
        }

        // Format inputs for the VM
        const formattedInputs = {};
        Object.entries(inputs).forEach(([key, value]) => {
            formattedInputs[key] = {
                type: typeof value === 'object' ? 'block' : 'literal',
                value: value
            };
        });

        // Create the block
        return this.vm.runtime.makeBlock({
            opcode,
            fields: {},
            inputs: formattedInputs,
            topLevel: true,
            parent: null,
            shadow: false,
            x: position.x,
            y: position.y
        }, target);
    }

    /**
     * Delete a block by ID
     * @param {string} blockId - ID of the block to delete
     * @returns {boolean} Success status
     */
    deleteBlock(blockId) {
        try {
            this.vm.runtime.deleteBlock(blockId);
            return true;
        } catch (error) {
            log.error('Error deleting block:', error);
            return false;
        }
    }

    /**
     * Update block inputs or fields
     * @param {string} blockId - ID of the block to update
     * @param {Object} inputs - New input values
     * @param {Object} fields - New field values
     * @returns {boolean} Success status
     */
    updateBlock(blockId, inputs = {}, fields = {}) {
        try {
            this.vm.runtime.updateBlock(blockId, inputs, fields);
            return true;
        } catch (error) {
            log.error('Error updating block:', error);
            return false;
        }
    }

    /**
     * Connect two blocks together
     * @param {string} parentId - ID of the parent block
     * @param {string} childId - ID of the child block
     * @param {string} inputName - Name of the input to connect to (for C-shaped blocks) or "next"
     * @returns {boolean} Success status
     */
    connectBlocks(parentId, childId, inputName = 'next') {
        try {
            if (!this.vm.editingTarget || !this.vm.editingTarget.blocks) {
                log.error('Cannot connect blocks: No active editing target');
                return false;
            }
            
            const blocks = this.vm.editingTarget.blocks;
            
            // Check if both blocks exist
            if (!blocks.getBlock(parentId)) {
                log.error(`Parent block ${parentId} not found`);
                return false;
            }
            
            if (!blocks.getBlock(childId)) {
                log.error(`Child block ${childId} not found`);
                return false;
            }
            
            // Connect the blocks
            blocks.connect(parentId, childId, inputName);
            log.info(`Connected block ${childId} to ${parentId} at ${inputName}`);
            return true;
        } catch (error) {
            log.error('Error connecting blocks:', error);
            return false;
        }
    }

    /**
     * Create a stack of blocks
     * @param {Array} blockSpecs - Array of block specifications
     * @param {Object} options - Options like position
     * @returns {Object} Result with IDs of created blocks
     */
    createBlockStack(blockSpecs, options = {}) {
        if (!Array.isArray(blockSpecs) || blockSpecs.length === 0) {
            log.error('Invalid block specs provided');
            return { success: false, error: 'Invalid block specifications' };
        }
        
        try {
            const target = this.getCurrentTarget();
            if (!target) {
                return { success: false, error: 'No active sprite selected' };
            }
            
            const position = options.position || { x: 0, y: 0 };
            const blockIds = [];
            let previousBlockId = null;
            
            // Create each block in the stack
            for (let i = 0; i < blockSpecs.length; i++) {
                const spec = blockSpecs[i];
                
                // Create the current block
                const currentBlockId = this.createBlock(
                    null, // Use current target
                    spec.blockType,
                    spec.inputs || {},
                    i === 0 ? position : { x: 0, y: 0 } // Only position the first block
                );
                
                blockIds.push(currentBlockId);
                
                // Connect to previous block if not the first one
                if (previousBlockId) {
                    this.connectBlocks(previousBlockId, currentBlockId);
                }
                
                previousBlockId = currentBlockId;
            }
            
            return {
                success: true,
                blockIds,
                topBlockId: blockIds[0],
                message: `Created stack with ${blockIds.length} blocks`
            };
        } catch (error) {
            log.error('Error creating block stack:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get a block by ID
     * @param {string} blockId - ID of the block
     * @returns {Object|null} The block or null if not found
     */
    getBlock(blockId) {
        if (!this.vm.editingTarget || !this.vm.editingTarget.blocks) {
            return null;
        }
        
        return this.vm.editingTarget.blocks.getBlock(blockId) || null;
    }

    /**
     * Get all blocks for the current sprite
     * @returns {Object|null} All blocks or null if no active sprite
     */
    getAllBlocks() {
        if (!this.vm.editingTarget || !this.vm.editingTarget.blocks) {
            return null;
        }
        
        return this.vm.editingTarget.blocks._blocks;
    }

    /**
     * Add a costume to a sprite
     * @param {string} spriteId - ID of the sprite
     * @param {Object} costumeData - Costume data (name, asset, etc)
     * @returns {Promise<Object>} Result of the operation
     */
    async addCostume(spriteId, costumeData) {
        try {
            const target = this.getSprite(spriteId);
            if (!target) {
                throw new Error('Target sprite not found');
            }
            
            // Add costume depends on the format of costumeData
            // This is a simplified version that assumes costumeData has what the VM needs
            const result = await this.vm.addCostume(
                costumeData.name,
                costumeData.asset,
                target.id
            );
            
            return { success: true, costumeId: result.assetId };
        } catch (error) {
            log.error('Error adding costume:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Create a new sprite
     * @param {Object} options - Sprite creation options
     * @returns {Object} The created sprite
     */
    async createSprite(options = {}) {
        try {
            const sprite = await this.vm.addSprite();
            
            if (options.name) {
                this.vm.renameSprite(sprite.id, options.name);
            }
            
            return this.getSprite(sprite.id);
        } catch (error) {
            log.error('Error creating sprite:', error);
            throw error;
        }
    }

    /**
     * Set sprite position
     * @param {string} spriteId - ID of the sprite (optional, uses current sprite if not provided)
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    setSpritePosition(spriteId, x, y) {
        const target = spriteId ? this.getSprite(spriteId) : this.getCurrentTarget();
        
        if (!target) {
            throw new Error('Target sprite not found');
        }
        
        this.vm.setXYPosition(target.id, x, y);
    }

    /**
     * Get project info including sprites, stage size, etc.
     * @returns {Object} Project information
     */
    getProjectInfo() {
        const sprites = this.vm.runtime.targets
            .filter(target => !target.isStage && target.isOriginal)
            .map(target => ({
                id: target.id,
                name: target.sprite.name,
                visible: target.visible,
                x: target.x,
                y: target.y,
                size: target.size,
                direction: target.direction
            }));
        
        const stage = this.vm.runtime.targets.find(target => target.isStage);
        
        return {
            sprites,
            stage: {
                width: stage ? stage.runtime.stageWidth : 480,
                height: stage ? stage.runtime.stageHeight : 360,
                tempo: stage ? stage.tempo : 60
            },
            editingTarget: this.vm.editingTarget ? this.vm.editingTarget.id : null
        };
    }

    /**
     * Start the project (green flag)
     */
    runProject() {
        this.vm.greenFlag();
    }

    /**
     * Stop all scripts
     */
    stopProject() {
        this.vm.stopAll();
    }

    /**
     * Get the execution state of the project
     * @returns {Object} Execution state information
     */
    getExecutionState() {
        return {
            isRunning: this.vm.runtime.isRunning,
            activeThreads: this.vm.runtime.threads.filter(thread => thread.isRunning()).length
        };
    }
}

export default MCPVMBridge;