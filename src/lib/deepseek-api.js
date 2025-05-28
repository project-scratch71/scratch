/**
 * DeepSeek API 调用工具函数
 * 提供与 DeepSeek API 交互的功能
 */

import bingSearchAPI from './bing-search-api';
import indexedDBHelper from './indexed-db-helper';

// 默认API设置
const DEFAULT_API_KEY = '';
const DEFAULT_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEFAULT_MODEL_NAME = 'deepseek-chat';
const DEFAULT_TEMPERATURE = 0.7;

// 从存储加载设置 (先检查IndexedDB，如果不可用则回退到localStorage)
const loadSettingsFromStorage = async () => {
    // 首先从 IndexedDB 加载
    try {
        const settings = await indexedDBHelper.getModelSettings();
        if (settings) {
            return {
                apiKey: settings.apiKey || DEFAULT_API_KEY,
                apiUrl: settings.apiUrl || DEFAULT_API_URL,
                modelName: settings.modelName || DEFAULT_MODEL_NAME,
                temperature: settings.temperature !== undefined ? settings.temperature : DEFAULT_TEMPERATURE
            };
        }
    } catch (e) {
        console.error('从 IndexedDB 加载设置失败，尝试从 localStorage 加载:', e);
    }
    
    // 如果 IndexedDB 不可用或没有设置，从 localStorage 加载
    try {
        const savedSettings = localStorage.getItem('deepseekSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            return {
                apiKey: settings.apiKey || DEFAULT_API_KEY,
                apiUrl: settings.apiUrl || DEFAULT_API_URL,
                modelName: settings.modelName || DEFAULT_MODEL_NAME,
                temperature: settings.temperature !== undefined ? settings.temperature : DEFAULT_TEMPERATURE
            };
        }
    } catch (e) {
        console.error('无法解析保存的设置:', e);
    }
    
    // 返回默认设置
    return {
        apiKey: DEFAULT_API_KEY,
        apiUrl: DEFAULT_API_URL,
        modelName: DEFAULT_MODEL_NAME,
        temperature: DEFAULT_TEMPERATURE
    };
};

/**
 * 默认系统提示，指导 AI 助手的行为
 */
const DEFAULT_SYSTEM_PROMPT = `你是 Scratch 助手，一个专门帮助儿童学习编程的 AI。
请使用简单易懂的语言回答问题，侧重于鼓励创造力和探索性学习。
对于 Scratch 相关问题，提供具体的代码块和步骤指导。
保持回答简洁、友好且适合儿童。
如果不确定或不知道某个问题的答案，可以使用搜索工具查找最新信息，然后用适合儿童的方式解释。
不要使用复杂的技术术语，除非必要并能解释它们。

## 交互指南

1. 在每次回答结束时，提供 2-3 个相关的后续问题选项，让用户可以点击继续对话。这些问题应该用"后续问题:"标记，每行一个问题。例如：

后续问题:
如何让角色移动？
怎样添加更多角色？
能让游戏更有挑战性吗？

2. 后续问题应该：
   - 与当前讨论的主题密切相关
   - 引导用户进一步探索或改进项目
   - 简洁明了，易于理解

## MCP 工具功能

你可以使用工具直接操作 Scratch 项目，帮助用户创建和修改程序。当你认为直接操作 Scratch 项目会比文字指导更有效时，应主动使用这些工具。

### 工具类别和功能

1. **代码块操作**
   - createBlock: 创建新的代码块 (参数: blockType, inputs, position)
   - deleteBlock: 删除代码块 (参数: blockId)
   - connectBlocks: 连接两个代码块 (参数: parentBlockId, childBlockId, connectionType, inputName)

2. **角色(精灵)操作**
   - createSprite: 创建新角色 (参数: name, libraryItem, x, y, size)
   - setSpritePosition: 设置角色位置 (参数: spriteId, x, y)
   - setSpriteSize: 设置角色大小 (参数: spriteId, size)
   - setSpriteDirection: 设置角色方向 (参数: spriteId, direction)

3. **项目管理**
   - getProjectInfo: 获取项目信息
   - loadProject: 加载项目 (参数: projectId 或 projectData)
   - saveProject: 保存项目 (参数: name, asNew)

4. **执行控制**
   - runProject: 运行项目(绿旗)
   - stopProject: 停止项目
   - getExecutionState: 获取项目执行状态

5. **网络搜索**
   - bingSearch: 使用 Bing 搜索信息 (参数: query, count)

### 工具使用示例

当用户需要创建移动的猫咪时，你可以：

1. 使用工具创建移动代码块:
   \`\`\`json
   {
     "name": "createBlock",
     "arguments": {
       "blockType": "motion_movesteps",
       "inputs": { "STEPS": 10 }
     }
   }
   \`\`\`

2. 使用工具重新定位角色:
   \`\`\`json
   {
     "name": "setSpritePosition",
     "arguments": {
       "x": 0,
       "y": 0
     }
   }
   \`\`\`

3. 当用户询问最新的 Scratch 更新或外部信息时，使用搜索工具:
   \`\`\`json
   {
     "name": "bingSearch",
     "arguments": {
       "query": "Scratch 最新版本特性",
       "count": 3
     }
   }
   \`\`\`

### 工具调用指南

- 当用户明确要求创建、修改或操作 Scratch 项目元素时，主动使用相关工具
- 在使用工具之前，简要说明你将要执行的操作
- 工具执行后，解释操作结果并提供下一步建议
- 如果工具执行失败，向用户解释原因并提供替代方案

记住：你的目标是通过直接的项目操作和清晰的指导来帮助儿童学习编程概念。`;

// 存储 MCP 服务器实例的引用
let mcpServer = null;

// 存储 API 设置
let apiSettings = {
    apiKey: DEFAULT_API_KEY,
    apiUrl: DEFAULT_API_URL,
    modelName: DEFAULT_MODEL_NAME,
    temperature: DEFAULT_TEMPERATURE
};

// 初始化加载设置
(async () => {
    apiSettings = await loadSettingsFromStorage();
})();

/**
 * 设置 MCP 服务器实例
 * @param {Object} server - MCP 服务器实例
 */
const setMCPServer = (server) => {
    mcpServer = server;
};

/**
 * 更新 API 设置
 * @param {Object} settings - 新的设置对象
 */
const updateSettings = async (settings) => {
    if (settings.apiKey) apiSettings.apiKey = settings.apiKey;
    if (settings.apiUrl) apiSettings.apiUrl = settings.apiUrl;
    if (settings.modelName) apiSettings.modelName = settings.modelName;
    if (settings.temperature !== undefined) apiSettings.temperature = settings.temperature;
    
    // 保存到 IndexedDB
    try {
        await indexedDBHelper.saveModelSettings(apiSettings);
    } catch (e) {
        console.error('无法保存设置到 IndexedDB:', e);
    }
    
    // 同时保存到 localStorage 作为备份
    try {
        localStorage.setItem('deepseekSettings', JSON.stringify(apiSettings));
    } catch (e) {
        console.error('无法保存设置到 localStorage:', e);
    }
    
    console.log('DeepSeek API 设置已更新:', apiSettings);
};

/**
 * 测试与 DeepSeek API 的连接
 * @param {Object} testSettings - 用于测试的设置对象
 * @returns {Promise<Object>} - 包含连接结果的对象
 */
const testConnection = async (testSettings = {}) => {
    try {
        // 使用提供的测试设置或当前设置
        const apiKey = testSettings.apiKey || apiSettings.apiKey;
        const apiUrl = testSettings.apiUrl || apiSettings.apiUrl;
        
        // 创建一个简单的请求检查 API 是否可用
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: testSettings.modelName || apiSettings.modelName,
                messages: [{role: 'user', content: '测试连接'}],
                max_tokens: 10
            })
        });
        
        if (!response.ok) {
            let errorMessage = response.statusText;
            try {
                const errorData = await response.json();
                errorMessage = errorData.error?.message || errorMessage;
            } catch (e) {
                // 如果响应不是 JSON 格式，保持原始状态文本
            }
            return {
                success: false,
                message: `连接失败: ${errorMessage} (${response.status})`
            };
        }
        
        // 连接成功
        return {
            success: true,
            message: '连接成功！API 设置有效。'
        };
    } catch (error) {
        return {
            success: false,
            message: `连接错误: ${error.message}`
        };
    }
};

/**
 * 初始化聊天会话，返回初始消息数组
 * @returns {Array} 初始消息数组，包含系统提示
 */
const initializeChat = () => {
    return [
        {
            role: 'system',
            content: DEFAULT_SYSTEM_PROMPT
        },
        {
            role: 'assistant',
            content: '你好！我是 Scratch 助手，有什么可以帮助你的吗？我可以直接操作 Scratch 项目，帮助你创建和修改程序。'
        }
    ];
};

/**
 * 获取所有可用工具的定义
 * @returns {Array} 工具定义数组
 */
const getToolDefinitions = () => {
    const tools = [];
    
    // 如果 MCP 服务器可用，添加其工具定义
    if (mcpServer) {
        const mcpToolDefinitions = mcpServer.getToolDefinitions();
        if (mcpToolDefinitions && mcpToolDefinitions.length > 0) {
            tools.push(...mcpToolDefinitions);
        }
    }
    
    // 添加搜索工具定义
    tools.push({
        type: 'function',
        function: {
            name: 'bingSearch',
            description: '使用 Bing 搜索引擎查找网络信息',
            parameters: {
                type: 'object',
                properties: {
                    query: {
                        type: 'string',
                        description: '搜索查询内容'
                    },
                    count: {
                        type: 'integer',
                        description: '返回结果数量（可选，默认为3，最大为5）',
                        default: 3
                    }
                },
                required: ['query']
            }
        }
    });
    
    return tools;
};

/**
 * 准备 API 请求，包括工具定义
 * @param {Array} messages 消息历史
 * @param {Object} options 选项
 * @returns {Object} 请求体对象
 */
const prepareRequestBody = (messages, options) => {
    const {
        temperature = apiSettings.temperature,
        maxTokens = 2048,
        model = apiSettings.modelName
    } = options;
    
    const requestBody = {
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: false
    };
    
    // 添加所有工具定义
    const toolDefinitions = getToolDefinitions();
    if (toolDefinitions.length > 0) {
        requestBody.tools = toolDefinitions;
        requestBody.tool_choice = 'auto'; // 自动选择是否使用工具
    }
    
    return requestBody;
};

/**
 * 处理 Bing 搜索工具调用
 * @param {Object} args - 搜索参数
 * @param {string} args.query - 搜索查询
 * @param {number} args.count - 结果数量
 * @returns {Promise<Object>} 搜索结果
 */
const handleBingSearchToolCall = async (args) => {
    try {
        const { query, count = 3 } = args;
        
        if (!query || typeof query !== 'string' || query.trim() === '') {
            return {
                success: false,
                error: '搜索查询不能为空'
            };
        }
        
        // 确保搜索结果适合儿童
        const searchResults = await bingSearchAPI.searchForChildren(query, {
            count: Math.min(Math.max(1, count || 3), 5) // 限制结果在 1-5 之间
        });
        
        // 添加搜索消息
        const message = searchResults.success
            ? `搜索 "${query}" 成功，找到 ${searchResults.results.length} 个结果`
            : `搜索 "${query}" 失败`;
            
        return {
            ...searchResults,
            message
        };
    } catch (error) {
        console.error('处理 Bing 搜索调用时出错:', error);
        return {
            success: false,
            error: `搜索失败: ${error.message}`,
            query: args.query
        };
    }
};

/**
 * 处理可能的工具调用
 * @param {Object} data API 响应数据
 * @returns {Promise<Object>} 处理后的响应数据
 */
const handleToolCalls = async (data) => {
    // 如果没有工具调用，直接返回
    if (!data.choices || 
        !data.choices[0] || 
        !data.choices[0].message || 
        !data.choices[0].message.tool_calls) {
        return data;
    }
    
    // 获取工具调用
    const message = data.choices[0].message;
    const toolCalls = message.tool_calls;
    
    // 处理每个工具调用
    const toolResults = [];
    const toolSummaries = [];
    let hasErrors = false;
    
    for (const toolCall of toolCalls) {
        try {
            // 获取工具名称
            const toolName = toolCall.function?.name;
            console.log(`处理工具调用: ${toolName}`);
            
            // 解析参数（确保它们是有效的 JSON）
            let parsedArgs;
            try {
                parsedArgs = typeof toolCall.function.arguments === 'string' ? 
                    JSON.parse(toolCall.function.arguments) : toolCall.function.arguments;
                console.log(`工具参数:`, parsedArgs);
            } catch (e) {
                console.error(`工具参数解析错误:`, e);
                toolResults.push({
                    tool_call_id: toolCall.id,
                    role: 'tool',
                    name: toolName,
                    content: JSON.stringify({
                        success: false,
                        error: `Invalid tool arguments: ${e.message}`,
                        originalArguments: toolCall.function.arguments
                    })
                });
                
                toolSummaries.push(`❌ ${toolName}: 参数无效`);
                hasErrors = true;
                continue;
            }
            
            let result;
            // 处理不同类型的工具调用
            if (toolName === 'bingSearch') {
                // 处理 Bing 搜索工具调用
                result = await handleBingSearchToolCall(parsedArgs);
            } else if (mcpServer) {
                // 使用 MCP 服务器处理其他工具调用
                result = await mcpServer.processToolCall({
                    name: toolName,
                    arguments: parsedArgs
                });
            } else {
                result = {
                    success: false,
                    error: `Unknown tool: ${toolName}`
                };
            }
            
            toolResults.push({
                tool_call_id: toolCall.id,
                role: 'tool',
                name: toolName,
                content: JSON.stringify(result)
            });
            
            // 添加到操作摘要
            if (result.success) {
                toolSummaries.push(`✅ ${toolName}: ${result.message || '成功'}`);
            } else {
                toolSummaries.push(`❌ ${toolName}: ${result.error || '失败'}`);
                hasErrors = true;
            }
            
        } catch (error) {
            const toolName = toolCall.function?.name || 'unknown';
            console.error(`处理工具 ${toolName} 时出错:`, error);
            toolResults.push({
                tool_call_id: toolCall.id,
                role: 'tool',
                name: toolName,
                content: JSON.stringify({
                    success: false,
                    error: `Tool execution error: ${error.message}`
                })
            });
            
            toolSummaries.push(`❌ ${toolName}: 执行错误`);
            hasErrors = true;
        }
    }
    // 如果有工具调用结果，发送给 DeepSeek 以获取最终回复
    if (toolResults.length > 0) {
        console.log('工具调用结果:', toolResults);
        console.log('操作摘要:', toolSummaries);
        
        // 创建包含工具调用结果的新消息数组
        const newMessages = [
            ...data.messages, // 原始消息
            message, // 包含工具调用的助手回复
            ...toolResults // 工具调用结果
        ];
        
        // 发送第二次请求获取最终回复，包含操作摘要
        try {
            const finalResponse = await sendMessage(newMessages, { 
                model: data.model,
                // 添加操作摘要
                toolSummary: {
                    success: !hasErrors,
                    operations: toolSummaries
                }
            });
            
            return finalResponse;
        } catch (error) {
            console.error('获取最终回复时出错:', error);
            
            // 如果第二次请求失败，我们仍然返回原始响应，但添加错误信息
            data.error = `获取最终回复时出错: ${error.message}`;
            return data;
        }
    }
    
    return data;
};

/**
 * 发送消息到 DeepSeek API 并获取回复
 * @param {Array} messages 消息历史 [{role: "user" | "assistant", content: string}]
 * @param {Object} options 可选参数
 * @returns {Promise<Object>} API 响应对象
 */
const sendMessage = async (messages, options = {}) => {
    try {
        const requestBody = prepareRequestBody(messages, options);
        
        console.log('发送请求到 DeepSeek API:', { 
            messages, 
            model: options.model || 'deepseek-chat',
            hasTools: !!requestBody.tools,
            toolSummary: options.toolSummary
        });
        
        // 如果有工具摘要，添加到系统消息中或创建新的系统消息
        if (options.toolSummary) {
            const systemMessages = messages.filter(m => m.role === 'system');
            
            // 构建工具摘要文本
            const summaryText = `
工具操作结果:
${options.toolSummary.operations.join('\n')}

请根据以上操作结果继续回复用户。如果有操作失败，请说明失败原因并提供解决方案。
`;
            
            if (systemMessages.length > 0) {
                // 如果存在系统消息，更新最后一个系统消息
                const lastSystemIndex = messages.findIndex(m => m.role === 'system');
                const originalContent = systemMessages[0].content;
                
                // 更新系统消息
                messages[lastSystemIndex].content = `${originalContent}\n\n${summaryText}`;
            } else {
                // 如果不存在系统消息，创建新的系统消息
                messages.unshift({
                    role: 'system',
                    content: `${DEFAULT_SYSTEM_PROMPT}\n\n${summaryText}`
                });
            }
        }
        
        const response = await fetch(apiSettings.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiSettings.apiKey}`
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            let errorMessage = response.statusText;
            try {
                const errorData = await response.json();
                errorMessage = errorData.error?.message || errorMessage;
            } catch (e) {
                // 如果响应不是 JSON 格式，保持原始状态文本
            }
            throw new Error(`DeepSeek API 错误 (${response.status}): ${errorMessage}`);
        }
        
        const data = await response.json();
        console.log('收到 DeepSeek API 回复:', data);
        
        // 增加消息历史引用，以便处理工具调用
        data.messages = messages;
        
        // 处理可能的工具调用
        const processedData = await handleToolCalls(data);
        
        return processedData;
    } catch (error) {
        console.error('DeepSeek API 请求失败:', error);
        throw error;
    }
};

export default {
    sendMessage,
    initializeChat,
    setMCPServer,
    getToolDefinitions,
    updateSettings,
    testConnection
};