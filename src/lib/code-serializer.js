/**
 * Scratch Block Code Serializer
 * Converts Scratch blocks to human-readable text format
 */

class CodeSerializer {
    constructor() {
        // Block type to text mapping
        this.blockTextMap = {
            // Motion blocks
            'motion_movesteps': (params) => `${params.STEPS}歩動かす`,
            'motion_turnright': (params) => `右に${params.DEGREES}度回す`,
            'motion_turnleft': (params) => `左に${params.DEGREES}度回す`,
            'motion_goto': (params) => `${params.TO}へ行く`,
            'motion_gotoxy': (params) => `x座標を${params.X}、y座標を${params.Y}にする`,
            'motion_glideto': (params) => `${params.SECS}秒で${params.TO}へ滑らせる`,
            'motion_glidesecstoxy': (params) => `${params.SECS}秒でx座標を${params.X}、y座標を${params.Y}へ滑らせる`,
            'motion_pointindirection': (params) => `${params.DIRECTION}度に向ける`,
            'motion_pointtowards': (params) => `${params.TOWARDS}に向ける`,
            'motion_changexby': (params) => `x座標を${params.DX}ずつ変える`,
            'motion_setx': (params) => `x座標を${params.X}にする`,
            'motion_changeyby': (params) => `y座標を${params.DY}ずつ変える`,
            'motion_sety': (params) => `y座標を${params.Y}にする`,
            'motion_ifonedgebounce': () => `もし端に着いたら、跳ね返る`,

            // Looks blocks
            'looks_sayforsecs': (params) => `${params.SECS}秒「${params.MESSAGE}」と言う`,
            'looks_say': (params) => `「${params.MESSAGE}」と言う`,
            'looks_thinkforsecs': (params) => `${params.SECS}秒「${params.MESSAGE}」と考える`,
            'looks_think': (params) => `「${params.MESSAGE}」と考える`,
            'looks_switchcostumeto': (params) => `コスチュームを${params.COSTUME}にする`,
            'looks_nextcostume': () => `次のコスチュームにする`,
            'looks_switchbackdropto': (params) => `背景を${params.BACKDROP}にする`,
            'looks_nextbackdrop': () => `次の背景にする`,
            'looks_changesizeby': (params) => `大きさを${params.CHANGE}ずつ変える`,
            'looks_setsizeto': (params) => `大きさを${params.SIZE}%にする`,
            'looks_changeeffectby': (params) => `${params.EFFECT}の効果を${params.CHANGE}ずつ変える`,
            'looks_seteffectto': (params) => `${params.EFFECT}の効果を${params.VALUE}にする`,
            'looks_cleargraphiceffects': () => `全ての効果をなくす`,
            'looks_show': () => `表示する`,
            'looks_hide': () => `隠す`,
            'looks_gotofrontback': (params) => `最前面に移動する`, // 簡略化
            'looks_goforwardbackwardlayers': (params) => `${params.NUM}層${params.FORWARD}に移動する`,

            // Sound blocks
            'sound_playuntildone': (params) => `終わるまで${params.SOUND_MENU}の音を鳴らす`,
            'sound_play': (params) => `${params.SOUND_MENU}の音を鳴らす`,
            'sound_stopallsounds': () => `すべての音を止める`,
            'sound_changeeffectby': (params) => `${params.EFFECT}の効果を${params.VALUE}ずつ変える`,
            'sound_seteffectto': (params) => `${params.EFFECT}の効果を${params.VALUE}にする`,
            'sound_cleareffects': () => `音の全ての効果をなくす`,
            'sound_changevolumeby': (params) => `音量を${params.VOLUME}ずつ変える`,
            'sound_setvolumeto': (params) => `音量を${params.VOLUME}%にする`,

            // Events blocks
            'event_whenflagclicked': () => `緑の旗が押されたとき`,
            'event_whenkeypressed': (params) => `${params.KEY_OPTION}キーが押されたとき`,
            'event_whenthisspriteclicked': () => `このスプライトが押されたとき`,
            'event_whenstageclicked': () => `ステージが押されたとき`,
            'event_whenbackdropswitchesto': (params) => `背景が${params.BACKDROP}に変わったとき`,
            'event_whengreaterthan': (params) => `${params.WHENGREATERTHANMENU}が${params.VALUE}より大きいとき`,
            'event_whenbroadcastreceived': (params) => `${params.BROADCAST_OPTION}を受け取ったとき`,
            'event_broadcast': (params) => `${params.BROADCAST_INPUT}を送る`,
            'event_broadcastandwait': (params) => `${params.BROADCAST_INPUT}を送って待つ`,

            // Control blocks
            'control_wait': (params) => `${params.DURATION}秒待つ`,
            'control_repeat': (params) => `${params.TIMES}回繰り返す`,
            'control_forever': () => `ずっと`,
            'control_if': (params) => `もし${params.CONDITION}なら`,
            'control_if_else': (params) => `もし${params.CONDITION}なら`,
            'control_wait_until': (params) => `${params.CONDITION}まで待つ`,
            'control_repeat_until': (params) => `${params.CONDITION}まで繰り返す`,
            'control_stop': (params) => `${params.STOP_OPTION}`,
            'control_start_as_clone': () => `クローンされたとき`,
            'control_create_clone_of': (params) => `${params.CLONE_OPTION}のクローンを作る`,
            'control_delete_this_clone': () => `このクローンを削除する`,

            // Sensing blocks
            'sensing_touchingobject': (params) => `${params.TOUCHINGOBJECTMENU}に触れた`,
            'sensing_touchingcolor': (params) => `色（カラーコード）に触れた`,
            'sensing_coloristouchingcolor': (params) => `色（カラーコード1）が色（カラーコード2）に触れた`,
            'sensing_distanceto': (params) => `${params.DISTANCETOMENU}までの距離`,
            'sensing_askandwait': (params) => `「${params.QUESTION}」と聞いて待つ`,
            'sensing_answer': () => `答え`,
            'sensing_keypressed': (params) => `${params.KEY_OPTION}キーが押された`,
            'sensing_mousedown': () => `マウスが押された`,
            'sensing_mousex': () => `マウスのx座標`,
            'sensing_mousey': () => `マウスのy座標`,
            'sensing_setdragmode': (params) => `ドラッグ可能にするかどうかを${params.DRAG_MODE}にする`,
            'sensing_loudness': () => `音の大きさ`,
            'sensing_timer': () => `タイマー`,
            'sensing_resettimer': () => `タイマーをリセット`,
            'sensing_of': (params) => `${params.OBJECT}の${params.PROPERTY}`,
            'sensing_current': (params) => `現在の${params.CURRENTMENU}`,
            'sensing_dayssince2000': () => `2000年からの日数`,
            'sensing_username': () => `ユーザー名`,

            // Operators blocks
            'operator_add': (params) => `${params.NUM1} + ${params.NUM2}`,
            'operator_subtract': (params) => `${params.NUM1} - ${params.NUM2}`,
            'operator_multiply': (params) => `${params.NUM1} × ${params.NUM2}`,
            'operator_divide': (params) => `${params.NUM1} ÷ ${params.NUM2}`,
            'operator_random': (params) => `${params.FROM}から${params.TO}までの乱数`,
            'operator_gt': (params) => `${params.OPERAND1} > ${params.OPERAND2}`,
            'operator_lt': (params) => `${params.OPERAND1} < ${params.OPERAND2}`,
            'operator_equals': (params) => `${params.OPERAND1} = ${params.OPERAND2}`,
            'operator_and': (params) => `${params.OPERAND1}かつ${params.OPERAND2}`,
            'operator_or': (params) => `${params.OPERAND1}または${params.OPERAND2}`,
            'operator_not': (params) => `${params.OPERAND}ではない`,
            'operator_join': (params) => `${params.STRING1}と${params.STRING2}`,
            'operator_letter_of': (params) => `${params.STRING}の${params.LETTER}文字目`,
            'operator_length': (params) => `${params.STRING}の長さ`,
            'operator_contains': (params) => `${params.STRING1}に${params.STRING2}が含まれる`,
            'operator_mod': (params) => `${params.NUM1}を${params.NUM2}で割った余り`,
            'operator_round': (params) => `${params.NUM}を四捨五入`,
            'operator_mathop': (params) => `${params.NUM}の${params.OPERATOR}`,

            // Variables blocks
            'data_variable': (params) => `変数「${params.VARIABLE}」`,
            'data_setvariableto': (params) => `変数「${params.VARIABLE}」を${params.VALUE}にする`,
            'data_changevariableby': (params) => `変数「${params.VARIABLE}」を${params.VALUE}ずつ変える`,
            'data_showvariable': (params) => `変数「${params.VARIABLE}」を表示`,
            'data_hidevariable': (params) => `変数「${params.VARIABLE}」を隠す`,

            // List blocks
            'data_listcontents': (params) => `リスト「${params.LIST}」`,
            'data_addtolist': (params) => `リスト「${params.LIST}」に${params.ITEM}を追加`,
            'data_deleteoflist': (params) => `リスト「${params.LIST}」の${params.INDEX}番目を削除`,
            'data_deletealloflist': (params) => `リスト「${params.LIST}」をすべて削除`,
            'data_insertatlist': (params) => `リスト「${params.LIST}」の${params.INDEX}番目に${params.ITEM}を挿入`,
            'data_replaceitemoflist': (params) => `リスト「${params.LIST}」の${params.INDEX}番目を${params.ITEM}に変える`,
            'data_itemoflist': (params) => `リスト「${params.LIST}」の${params.INDEX}番目`,
            'data_itemnumoflist': (params) => `リスト「${params.LIST}」から${params.ITEM}を探す`,
            'data_lengthoflist': (params) => `リスト「${params.LIST}」の長さ`,
            'data_listcontainsitem': (params) => `リスト「${params.LIST}」に${params.ITEM}が含まれる`,
            'data_showlist': (params) => `リスト「${params.LIST}」を表示`,
            'data_hidelist': (params) => `リスト「${params.LIST}」を隠す`,

            // My Blocks (Custom blocks)
            'procedures_definition': (params) => `「${params.custom_block}」を定義`,
            'procedures_call': (params) => `「${params.custom_block}」`,
        };
    }

    /**
     * Serialize VM targets to readable code text
     * @param {Object} vm - Scratch VM instance
     * @returns {Object} Serialized code structure
     */
    serializeProject(vm) {
        try {
            const targets = vm.runtime.targets;
            const serializedTargets = {};

            targets.forEach(target => {
                if (target && target.id) {
                    serializedTargets[target.id] = this.serializeTarget(target);
                }
            });

            return {
                timestamp: Date.now(),
                targets: serializedTargets,
                currentTarget: vm.runtime.getEditingTarget()?.id || null
            };
        } catch (error) {
            console.error('Error serializing project:', error);
            return { error: error.message, timestamp: Date.now() };
        }
    }

    /**
     * Serialize a single target (sprite or stage) to readable code
     * @param {Object} target - VM target object
     * @returns {Object} Serialized target structure
     */
    serializeTarget(target) {
        try {
            const result = {
                id: target.id,
                name: target.sprite ? target.sprite.name : 'Stage',
                isStage: target.isStage || false,
                scripts: []
            };

            // Add position info for sprites
            if (!target.isStage) {
                result.position = {
                    x: target.x || 0,
                    y: target.y || 0,
                    direction: target.direction || 90,
                    visible: target.visible !== undefined ? target.visible : true,
                    size: target.size || 100
                };
            }

            // Add variables
            result.variables = {};
            if (target.variables) {
                Object.values(target.variables).forEach(variable => {
                    if (variable && variable.name) {
                        result.variables[variable.name] = variable.value;
                    }
                });
            }

            // Add lists
            result.lists = {};
            if (target.lists) {
                Object.values(target.lists).forEach(list => {
                    if (list && list.name) {
                        result.lists[list.name] = list.value || [];
                    }
                });
            }

            // Serialize blocks to scripts
            if (target.blocks) {
                result.scripts = this.serializeBlocks(target.blocks);
            }

            return result;
        } catch (error) {
            console.error('Error serializing target:', error);
            return { error: error.message, id: target.id };
        }
    }

    /**
     * Serialize blocks to human-readable script text
     * @param {Object} blocks - Target blocks object
     * @returns {Array} Array of script objects
     */
    serializeBlocks(blocks) {
        try {
            const scripts = [];
            const processedBlocks = new Set();
            const blockList = blocks._blocks || {};

            // Find top-level blocks (hat blocks or orphaned blocks)
            Object.values(blockList).forEach(block => {
                if (block && !block.parent && !processedBlocks.has(block.id)) {
                    const script = this.serializeScript(block, blockList, processedBlocks);
                    if (script.blocks.length > 0) {
                        scripts.push(script);
                    }
                }
            });

            return scripts;
        } catch (error) {
            console.error('Error serializing blocks:', error);
            return [];
        }
    }

    /**
     * Serialize a script starting from a top-level block
     * @param {Object} startBlock - Starting block
     * @param {Object} blockList - All blocks in target
     * @param {Set} processedBlocks - Blocks already processed
     * @returns {Object} Script object with readable text
     */
    serializeScript(startBlock, blockList, processedBlocks) {
        const script = {
            id: startBlock.id,
            type: this.getScriptType(startBlock.opcode),
            blocks: [],
            text: []
        };

        let currentBlock = startBlock;
        let indentLevel = 0;

        while (currentBlock && !processedBlocks.has(currentBlock.id)) {
            processedBlocks.add(currentBlock.id);
            
            const blockText = this.serializeBlock(currentBlock, blockList);
            const blockInfo = {
                id: currentBlock.id,
                opcode: currentBlock.opcode,
                text: blockText,
                indent: indentLevel
            };

            script.blocks.push(blockInfo);
            script.text.push('  '.repeat(indentLevel) + blockText);

            // Handle control blocks with inputs (if, repeat, etc.)
            if (this.isControlBlock(currentBlock.opcode)) {
                const subBlocks = this.getControlBlockSubBlocks(currentBlock, blockList);
                if (subBlocks.length > 0) {
                    subBlocks.forEach(subBlock => {
                        const subScript = this.serializeScript(subBlock, blockList, processedBlocks);
                        subScript.blocks.forEach(subBlockInfo => {
                            subBlockInfo.indent += indentLevel + 1;
                            script.blocks.push(subBlockInfo);
                            script.text.push('  '.repeat(subBlockInfo.indent) + subBlockInfo.text);
                        });
                    });
                }
            }

            // Move to next block
            currentBlock = currentBlock.next ? blockList[currentBlock.next] : null;
        }

        return script;
    }

    /**
     * Serialize a single block to readable text
     * @param {Object} block - Block object
     * @param {Object} blockList - All blocks for reference
     * @returns {string} Human-readable block text
     */
    serializeBlock(block, blockList) {
        try {
            const opcode = block.opcode;
            const params = this.extractBlockParams(block, blockList);

            // Use mapping if available
            if (this.blockTextMap[opcode]) {
                return this.blockTextMap[opcode](params);
            }

            // Fallback for unmapped blocks
            const paramText = Object.entries(params)
                .map(([key, value]) => `${key}:${value}`)
                .join(', ');
            
            return paramText ? `${opcode}(${paramText})` : opcode;
        } catch (error) {
            console.error('Error serializing block:', error);
            return `[エラー: ${block.opcode}]`;
        }
    }

    /**
     * Extract parameters from a block
     * @param {Object} block - Block object
     * @param {Object} blockList - All blocks for reference
     * @returns {Object} Extracted parameters
     */
    extractBlockParams(block, blockList) {
        const params = {};

        // Extract from fields
        if (block.fields) {
            Object.entries(block.fields).forEach(([key, field]) => {
                if (field && field.value !== undefined) {
                    params[key] = field.value;
                }
            });
        }

        // Extract from inputs (including connected blocks)
        if (block.inputs) {
            Object.entries(block.inputs).forEach(([key, input]) => {
                if (input && input.block) {
                    const inputBlock = blockList[input.block];
                    if (inputBlock) {
                        // If it's a simple value block, get its value
                        if (this.isValueBlock(inputBlock.opcode)) {
                            params[key] = this.getValueFromBlock(inputBlock);
                        } else {
                            // For complex inputs, serialize recursively
                            params[key] = this.serializeBlock(inputBlock, blockList);
                        }
                    }
                } else if (input && input.shadow) {
                    // Handle shadow blocks (default values)
                    const shadowBlock = blockList[input.shadow];
                    if (shadowBlock) {
                        params[key] = this.getValueFromBlock(shadowBlock);
                    }
                }
            });
        }

        return params;
    }

    /**
     * Get script type based on hat block opcode
     * @param {string} opcode - Block opcode
     * @returns {string} Script type
     */
    getScriptType(opcode) {
        const hatBlocks = {
            'event_whenflagclicked': 'flagClick',
            'event_whenkeypressed': 'keyPress',
            'event_whenthisspriteclicked': 'spriteClick',
            'event_whenstageclicked': 'stageClick',
            'event_whenbackdropswitchesto': 'backdropChange',
            'event_whengreaterthan': 'sensor',
            'event_whenbroadcastreceived': 'broadcast',
            'control_start_as_clone': 'clone'
        };
        return hatBlocks[opcode] || 'script';
    }

    /**
     * Check if block is a control block with sub-blocks
     * @param {string} opcode - Block opcode
     * @returns {boolean}
     */
    isControlBlock(opcode) {
        return [
            'control_repeat', 'control_forever', 'control_if', 'control_if_else',
            'control_repeat_until', 'control_wait_until'
        ].includes(opcode);
    }

    /**
     * Get sub-blocks for control blocks
     * @param {Object} block - Control block
     * @param {Object} blockList - All blocks
     * @returns {Array} Sub-blocks
     */
    getControlBlockSubBlocks(block, blockList) {
        const subBlocks = [];
        
        // Check common input names for control blocks
        const inputNames = ['SUBSTACK', 'SUBSTACK2'];
        
        inputNames.forEach(inputName => {
            if (block.inputs && block.inputs[inputName] && block.inputs[inputName].block) {
                const subBlock = blockList[block.inputs[inputName].block];
                if (subBlock) {
                    subBlocks.push(subBlock);
                }
            }
        });

        return subBlocks;
    }

    /**
     * Check if block is a simple value block
     * @param {string} opcode - Block opcode
     * @returns {boolean}
     */
    isValueBlock(opcode) {
        return [
            'math_number', 'text', 'colour_picker',
            'data_variable', 'argument_reporter_string_number',
            'argument_reporter_boolean'
        ].includes(opcode);
    }

    /**
     * Get value from a value block
     * @param {Object} block - Value block
     * @returns {string} Block value
     */
    getValueFromBlock(block) {
        if (block.fields) {
            // Try common value field names
            const valueFields = ['NUM', 'TEXT', 'VALUE', 'VARIABLE', 'COLOUR'];
            for (const fieldName of valueFields) {
                if (block.fields[fieldName] && block.fields[fieldName].value !== undefined) {
                    return block.fields[fieldName].value;
                }
            }
        }
        return `[${block.opcode}]`;
    }
}

export default CodeSerializer;