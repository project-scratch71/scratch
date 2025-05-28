import PropTypes from 'prop-types';
import React, {useState, useEffect, useRef} from 'react';
import {FormattedMessage} from 'react-intl';
import Box from '../box/box.jsx';
import Modal from '../modal/modal.jsx';  // 导入模态框组件
import layout from '../../lib/layout-constants';
import deepseekAPI from '../../lib/deepseek-api';
import indexedDBHelper from '../../lib/indexed-db-helper';  // 导入 IndexedDB 助手
import MessageWithCodeHighlighting from './code-highlighter.jsx';
import MessageWithMarkdown from './message-with-markdown.jsx';  // 导入新的Markdown渲染组件
import {hasCodeBlocks, hasMarkdown} from './markdown-utils';  // 导入Markdown检测工具

import styles from './chat-wrapper.css';

/**
 * 从AI回复中提取或生成后续问题建议
 * @param {string} content - AI回复的内容
 * @return {Array<string>} - 后续问题数组，最多3个
 */
const generateFollowUpQuestions = content => {
    // 检查是否有特定格式的后续问题标记
    const followUpRegex = /后续问题[：:]\s*([\s\S]*?)(?:\n\n|$)/i;
    const match = content.match(followUpRegex);
    
    if (match && match[1]) {
        // 提取后续问题列表
        const questionsText = match[1];
        const questions = questionsText
            .split(/\n/)  // 按行分割
            .map(q => q.replace(/^[0-9\-\*\.\s]+/, '').trim())  // 移除数字、破折号、星号等列表标记
            .filter(q => q && q.length > 0);  // 过滤空行
            
        // 最多返回3个问题
        return questions.slice(0, 3);
    }
    
    // 基于常见后续交互的默认问题
    const defaultQuestions = [
        "还能进一步完善这个程序吗？",
        "如何修改这些积木？",
        "能解释一下这段代码是如何工作的吗？"
    ];
    
    // 根据内容选择合适的后续问题
    if (content.includes("创建") || content.includes("添加")) {
        return [
            "如何让角色移动？",
            "怎么添加声音效果？",
            "能让角色说话吗？"
        ];
    } else if (content.includes("移动") || content.includes("旋转")) {
        return [
            "如何控制移动速度？",
            "怎样让角色碰到边缘时反弹？",
            "能让角色跟随鼠标移动吗？"
        ];
    } else if (content.includes("变量") || content.includes("计分")) {
        return [
            "如何显示分数？",
            "能制作一个计时器吗？",
            "怎样让游戏难度随着分数增加？"
        ];
    }
    
    return defaultQuestions;
};

// MCP Tool Icon component
const ToolIcon = () => (
    <svg 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="currentColor"
    >
        <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z" />
    </svg>
);

// Search Icon component
const SearchIcon = () => (
    <svg 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="currentColor"
    >
        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
    </svg>
);

// 设置图标组件
const SettingsIcon = () => (
    <svg 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="currentColor"
    >
        <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" />
    </svg>
);

const ChatIcon = () => (
    <svg 
        className={styles.chatIcon} 
        width="28" 
        height="28" 
        viewBox="0 0 32 32" 
        xmlns="http://www.w3.org/2000/svg"
    >
        {/* 卡通现代风格的聊天机器人图标 */}
        
        {/* 背景圆形 - 更鲜艳的背景 */}
        <circle cx="16" cy="16" r="15" fill="#5CD6FF" stroke="#4AAFFF" strokeWidth="1" />
        
        {/* 机器人主体 - 更现代的颜色 */}
        <rect x="7" y="9" width="18" height="16" fill="#6E64FF" rx="2" />
        
        {/* 主体顶部高光 */}
        <rect x="7" y="9" width="18" height="2" fill="#8A7DFF" rx="2" />
        
        {/* 主体左侧高光 */}
        <rect x="7" y="9" width="2" height="16" fill="#8A7DFF" rx="2" />
        
        {/* 主体底部阴影 */}
        <rect x="7" y="23" width="18" height="2" fill="#5A52CC" rx="2" />
        
        {/* 主体右侧阴影 */}
        <rect x="23" y="9" width="2" height="16" fill="#5A52CC" rx="2" />
        
        {/* 显示屏区域 - 更卡通的深色背景 */}
        <rect x="9" y="11" width="14" height="8" fill="#483D8B" rx="1" />
        
        {/* 显示屏边框 - 更现代的亮蓝色 */}
        <rect x="9" y="11" width="14" height="1" fill="#8BE9FD" rx="1" />
        <rect x="9" y="11" width="1" height="8" fill="#8BE9FD" rx="1" />
        <rect x="22" y="11" width="1" height="8" fill="#5A52CC" rx="1" />
        <rect x="9" y="18" width="14" height="1" fill="#5A52CC" rx="1" />
        
        {/* 眼睛 - 白色圆形眼睛 */}
        <circle cx="13" cy="14" r="2" fill="#FFFFFF" />
        <circle cx="19" cy="14" r="2" fill="#FFFFFF" />
        
        {/* 眼睛高光 - 更卡通的瞳孔 */}
        <circle cx="13" cy="14" r="1" fill="#FF618C" />
        <circle cx="19" cy="14" r="1" fill="#FF618C" />
        
        {/* 嘴巴 - 更现代的笑脸 */}
        <path d="M13,17 Q16,19 19,17" stroke="#FFFFFF" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        
        {/* 天线基座 */}
        <rect x="15" y="7" width="2" height="2" fill="#8A7DFF" rx="1" />
        
        {/* 天线顶部 - 更亮的颜色 */}
        <circle cx="16" cy="5" r="2" fill="#FF618C" />
        
        {/* 控制面板 - 更现代的按钮 */}
        <rect x="10" y="21" width="12" height="2" fill="#8A7DFF" rx="1" />
        
        {/* 按钮点缀 */}
        <circle cx="11" cy="22" r="0.5" fill="#FFFFFF" />
        <circle cx="16" cy="22" r="0.5" fill="#FFFFFF" />
        <circle cx="21" cy="22" r="0.5" fill="#FFFFFF" />
        
        {/* 聊天气泡装饰 - 更现代的风格 */}
        <circle cx="24" cy="8" r="3" fill="#FFFFFF" stroke="#4AAFFF" strokeWidth="1" />
        <circle cx="23" cy="8" r="0.7" fill="#5CD6FF" />
        <circle cx="25" cy="8" r="0.7" fill="#5CD6FF" />
        
        {/* 添加小三角形指示聊天 */}
        <polygon points="22,10 24,13 26,10" fill="#FFFFFF" stroke="#4AAFFF" strokeWidth="0.5" />
        
        {/* 小装饰光点 */}
        <circle cx="7" cy="7" r="1" fill="#8BE9FD" opacity="0.6" />
        <circle cx="25" cy="24" r="1" fill="#FF618C" opacity="0.6" />
        
        {/* 更现代的底部装饰 */}
        <rect x="9" y="25" width="14" height="1" fill="#5A52CC" rx="0.5" />
    </svg>
);

const ChatWrapperComponent = props => {
    const {vm, mcpServer, className} = props;
    const [collapsed, setCollapsed] = useState(false);
    const [expanded, setExpanded] = useState(false); // 添加放大状态
    const [width, setWidth] = useState(layout.standardStageWidth); // 使用标准舞台宽度作为默认宽度
    const [lastWidth, setLastWidth] = useState(layout.standardStageWidth); // 记住上一次展开时的宽度
    const [messages, setMessages] = useState(() => {
        // 使用初始化函数创建消息历史，但过滤掉系统消息（不显示给用户）
        return deepseekAPI.initializeChat().filter(msg => msg.role !== 'system');
    });
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [toolExecuting, setToolExecuting] = useState(false);  // 工具执行状态
    const [searchExecuting, setSearchExecuting] = useState(false);  // 搜索执行状态
    const [showSettingsModal, setShowSettingsModal] = useState(false); // 控制设置模态框显示
    const [abortController, setAbortController] = useState(null); // 用于中断请求的控制器
    
    // 输入历史相关状态
    const [inputHistory, setInputHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [temporaryInput, setTemporaryInput] = useState(''); // 存储用户当前编辑但未提交的内容
    
    // 设置相关状态
    const [apiKey, setApiKey] = useState('');
    const [apiUrl, setApiUrl] = useState('https://api.deepseek.com/v1/chat/completions');
    const [modelName, setModelName] = useState('deepseek-chat');
    const [temperature, setTemperature] = useState(0.7);
    
    // 测试连接相关状态
    const [isTestingConnection, setIsTestingConnection] = useState(false);
    const [testConnectionResult, setTestConnectionResult] = useState(null);
    
    // 清空历史记录相关状态
    const [clearHistoryResult, setClearHistoryResult] = useState(null);
    
    const chatRef = React.useRef(null);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);
    
    // 从存储加载设置和历史记录
    useEffect(() => {
        // 加载模型设置
        const loadSettings = async () => {
            try {
                // 优先从 IndexedDB 加载设置
                const settings = await indexedDBHelper.getModelSettings();
                
                if (settings) {
                    if (settings.apiKey) setApiKey(settings.apiKey);
                    if (settings.apiUrl) setApiUrl(settings.apiUrl);
                    if (settings.modelName) setModelName(settings.modelName);
                    if (settings.temperature !== undefined) setTemperature(settings.temperature);
                } else {
                    // 如果 IndexedDB 中没有，尝试从 localStorage 加载
                    const savedSettings = localStorage.getItem('deepseekSettings');
                    if (savedSettings) {
                        const settings = JSON.parse(savedSettings);
                        if (settings.apiKey) setApiKey(settings.apiKey);
                        if (settings.apiUrl) setApiUrl(settings.apiUrl);
                        if (settings.modelName) setModelName(settings.modelName);
                        if (settings.temperature !== undefined) setTemperature(settings.temperature);
                    }
                }
            } catch (e) {
                console.error('加载设置失败:', e);
            }
        };
        
        // 加载输入历史记录
        const loadInputHistory = async () => {
            try {
                const history = await indexedDBHelper.getInputHistory();
                if (history && history.length > 0) {
                    setInputHistory(history);
                }
            } catch (e) {
                console.error('加载输入历史失败:', e);
            }
        };
        
        loadSettings();
        loadInputHistory();
    }, []);
    
    // 保存设置
    const saveSettings = () => {
        const settings = {
            apiKey,
            apiUrl,
            modelName,
            temperature
        };
        
        // 更新 DeepSeek API 的设置
        // updateSettings 函数会自动保存到 localStorage
        deepseekAPI.updateSettings(settings);
        
        // 关闭模态框
        setShowSettingsModal(false);
        
        // 清除测试结果
        setTestConnectionResult(null);
    };
    
    // 测试 API 连接
    const testApiConnection = async () => {
        setIsTestingConnection(true);
        setTestConnectionResult(null);
        
        try {
            const testSettings = {
                apiKey,
                apiUrl,
                modelName,
                temperature
            };
            
            const result = await deepseekAPI.testConnection(testSettings);
            setTestConnectionResult(result);
        } catch (error) {
            setTestConnectionResult({
                success: false,
                message: `测试失败: ${error.message}`
            });
        } finally {
            setIsTestingConnection(false);
        }
    };
    
    // 清空输入历史记录
    const handleClearInputHistory = async () => {
        try {
            const success = await indexedDBHelper.clearInputHistory();
            
            if (success) {
                // 清空本地状态中的历史记录
                setInputHistory([]);
                setHistoryIndex(-1);
                setTemporaryInput('');
                
                // 显示成功消息
                setClearHistoryResult('历史记录已清空');
                
                // 3秒后清除消息
                setTimeout(() => {
                    setClearHistoryResult(null);
                }, 3000);
            } else {
                setClearHistoryResult('清空历史记录失败');
                setTimeout(() => {
                    setClearHistoryResult(null);
                }, 3000);
            }
        } catch (error) {
            console.error('清空输入历史记录失败:', error);
            setClearHistoryResult(`清空失败: ${error.message}`);
            setTimeout(() => {
                setClearHistoryResult(null);
            }, 3000);
        }
    };
    
    // 窗口大小改变时，根据屏幕宽度调整聊天区域宽度
    useEffect(() => {
        const handleResize = () => {
            if (collapsed) return; // 折叠状态下不调整宽度
            
            // 根据视口宽度自适应调整聊天区域宽度
            const viewportWidth = window.innerWidth;
            let baseWidth;
            
            // 根据不同的视口宽度设置不同的聊天区域宽度
            if (viewportWidth >= 1400) {
                // 较大屏幕，使用较大宽度
                baseWidth = Math.min(500, viewportWidth * 0.25);
            } else if (viewportWidth >= layout.fullSizeMinWidth) {
                // 中等屏幕，使用标准舞台宽度
                baseWidth = layout.standardStageWidth;
            } else {
                // 较小屏幕，使用更窄的宽度以适应
                baseWidth = Math.max(280, Math.min(layout.standardStageWidth, viewportWidth * 0.3));
            }
            
            // 如果是放大状态，宽度加倍
            const finalWidth = expanded ? baseWidth * 2 : baseWidth;
            setWidth(finalWidth);
        };
        
        // 初始化调整一次
        handleResize();
        
        // 监听窗口大小变化
        window.addEventListener('resize', handleResize);
        
        // 清理函数
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [collapsed, expanded]); // 添加 expanded 依赖
    
    // 每当消息列表变化时，滚动到最新消息
    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    
    // 滚动到最新消息
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    
    // 处理用户输入变化
    const handleInputChange = (e) => {
        setInputValue(e.target.value);
        
        // 自动调整高度
        e.target.style.height = 'auto';
        e.target.style.height = `${Math.min(120, e.target.scrollHeight)}px`;
    };
    
    // 处理按键事件 (按下回车键发送消息，上下键浏览历史)
    const handleKeyDown = (e) => {
        // 回车键发送消息
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
            return;
        }
        
        // 上下箭头键浏览历史记录
        if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && inputHistory.length > 0) {
            e.preventDefault();
            
            // 第一次按上箭头键，保存当前输入作为临时输入
            if (historyIndex === -1 && e.key === 'ArrowUp') {
                setTemporaryInput(inputValue);
            }
            
            // 计算新的历史索引
            let newIndex = historyIndex;
            
            if (e.key === 'ArrowUp') {
                // 向上浏览历史（更早的消息）
                newIndex = historyIndex >= inputHistory.length - 1 ? inputHistory.length - 1 : historyIndex + 1;
            } else {
                // 向下浏览历史（更新的消息）
                newIndex = historyIndex <= 0 ? -1 : historyIndex - 1;
            }
            
            // 更新历史索引
            setHistoryIndex(newIndex);
            
            // 更新输入框内容
            if (newIndex === -1) {
                // 恢复临时输入
                setInputValue(temporaryInput);
            } else {
                // 使用历史记录
                setInputValue(inputHistory[inputHistory.length - 1 - newIndex]);
                
                // 自动调整输入框高度（延迟执行以确保DOM已更新）
                setTimeout(() => {
                    if (textareaRef.current) {
                        textareaRef.current.style.height = 'auto';
                        textareaRef.current.style.height = `${Math.min(120, textareaRef.current.scrollHeight)}px`;
                    }
                }, 0);
            }
        }
    };
    
    /**
     * 处理发送消息
     * @param {string} [content] - 可选，如果传入则使用该内容而不是输入框的内容
     */
    // 取消当前请求
    const cancelCurrentRequest = () => {
        if (abortController) {
            abortController.abort();
            setAbortController(null);
            setIsLoading(false);
            setToolExecuting(false);
            setSearchExecuting(false);
            
            // 添加一个通知消息，表示请求已被中断
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '消息发送已被中断。',
                isSystemNotice: true
            }]);
        }
    };
    
    const handleSendMessage = async (content) => {
        // 如果正在加载，点击按钮表示取消当前请求
        if (isLoading) {
            cancelCurrentRequest();
            return;
        }
        
        const messageToSend = content || inputValue;
        if (messageToSend.trim() === '') return;
        
        const userMessage = {
            role: 'user',
            content: messageToSend
        };
        
        // 创建新的AbortController用于本次请求
        const controller = new AbortController();
        setAbortController(controller);
        
        // 检查是否与最近的历史记录重复
        const isDuplicate = inputHistory.length > 0 && 
            inputHistory[inputHistory.length - 1] === messageToSend;
        
        // 只在非重复的情况下保存历史记录
        if (!isDuplicate) {
            // 保存输入历史到IndexedDB (最多保存100条)
            indexedDBHelper.saveInputHistory(messageToSend, 100);
            
            // 更新本地输入历史状态
            setInputHistory(prev => {
                const newHistory = [...prev, messageToSend];
                return newHistory.slice(-100); // 只保留最近100条
            });
        }
        
        // 重置历史导航索引
        setHistoryIndex(-1);
        setTemporaryInput('');
        
        // 更新消息列表，添加用户消息
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);
        
        // 重置输入框高度
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
        
        try {
            // 获取完整的消息历史，并添加系统提示
            const systemPrompt = deepseekAPI.initializeChat()[0]; // 获取系统提示
            const visibleMessages = [...messages, userMessage]; // 当前显示的消息
            
            // 将系统提示放在消息历史的开头
            const messageHistory = [systemPrompt, ...visibleMessages];
            
            // 调用 DeepSeek API，传入 AbortController 的 signal
            const response = await deepseekAPI.sendMessage(messageHistory, {
                signal: abortController ? abortController.signal : undefined
            });
            
            // 如果请求已被取消，不继续处理
            if (abortController && abortController.signal.aborted) {
                return;
            }

            // 检查是否有工具调用
            if (response.choices && 
                response.choices[0] && 
                response.choices[0].message && 
                response.choices[0].message.tool_calls && 
                response.choices[0].message.tool_calls.length > 0) {
                
                // 显示工具调用开始消息
                const toolCallsCount = response.choices[0].message.tool_calls.length;
                
                // 检查是否有搜索工具调用
                const hasSearchCall = response.choices[0].message.tool_calls.some(
                    tc => tc.function?.name === 'bingSearch'
                );
                
                // 根据工具类型显示适当的消息
                let toolType = '操作';
                if (hasSearchCall) {
                    setSearchExecuting(true);
                    toolType = hasSearchCall && toolCallsCount === 1 ? '搜索' : '搜索和操作';
                } else {
                    setToolExecuting(true);
                }
                
                const toolNames = response.choices[0].message.tool_calls
                    .map(tc => tc.function?.name)
                    .filter(Boolean)
                    .join(', ');
                
                const toolCallMsg = {
                    role: 'assistant',
                    content: `正在执行 ${toolCallsCount} 个 Scratch ${toolType}: ${toolNames}...`,
                    isToolCall: true
                };
                
                setMessages(prev => [...prev, toolCallMsg]);
                setToolExecuting(true);
                
                // 收到带工具调用的最终响应后
                if (response.choices && response.choices.length > 0) {
                    const assistantMessage = {
                        role: 'assistant',
                        content: response.choices[0].message.content,
                        followUpQuestions: generateFollowUpQuestions(response.choices[0].message.content)
                    };
                    
                    // 检查是否有工具操作摘要
                    if (response.toolSummary && response.toolSummary.operations) {
                        // 添加工具操作摘要（仅在开发模式下）
                        if (process.env.NODE_ENV === 'development') {
                            const summaryMsg = {
                                role: 'system',
                                content: `工具操作结果:\n${response.toolSummary.operations.join('\n')}`,
                                isToolSummary: true
                            };
                            
                            // 添加工具摘要，仅在开发模式下显示
                            setMessages(prev => {
                                // 删除临时工具调用消息，添加摘要和最终回复
                                const filtered = prev.filter(msg => !msg.isToolCall);
                                return [...filtered, summaryMsg, assistantMessage];
                            });
                        } else {
                            // 生产模式下只显示最终回复
                            setMessages(prev => {
                                // 删除临时工具调用消息，添加最终回复
                                const filtered = prev.filter(msg => !msg.isToolCall);
                                return [...filtered, assistantMessage];
                            });
                        }
                    } else {
                        // 没有工具摘要，只添加最终回复
                        setMessages(prev => {
                            // 删除临时工具调用消息，添加最终回复
                            const filtered = prev.filter(msg => !msg.isToolCall);
                            return [...filtered, assistantMessage];
                        });
                    }
                    
                    // 更新工具执行状态
                    setToolExecuting(false);
                    setSearchExecuting(false);
                }
            } else {
                // 常规消息处理（无工具调用）
                if (response.choices && response.choices.length > 0) {
                    const assistantMessage = {
                        role: 'assistant',
                        content: response.choices[0].message.content,
                        followUpQuestions: generateFollowUpQuestions(response.choices[0].message.content)
                    };
                    
                    setMessages(prev => [...prev, assistantMessage]);
                }
            }
        } catch (error) {
            console.error('发送消息失败:', error);
            // 添加用户友好的错误消息
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `抱歉，我遇到了一点问题：${error.message}。请稍后再试，或者刷新页面重新开始。`
            }]);
        } finally {
            setIsLoading(false);
            setToolExecuting(false);
            setSearchExecuting(false);
        }
    };
    
    // 复制消息内容
    const handleCopyMessage = (content) => {
        navigator.clipboard.writeText(content)
            .then(() => {
                // 可以添加一个临时提示表示复制成功，但为了简洁，这里省略了
                console.log('消息已复制到剪贴板');
            })
            .catch(err => {
                console.error('复制失败:', err);
            });
    };
    
    // 清空聊天记录
    const handleClearChat = () => {
        // 重新初始化消息，但保留系统消息，仅显示初始问候
        setMessages(deepseekAPI.initializeChat().filter(msg => msg.role !== 'system'));
    };
    
    // 处理折叠/展开状态
    const toggleCollapse = () => {
        if (collapsed) {
            // 展开时恢复上一次的宽度
            setWidth(lastWidth);
        } else {
            // 折叠前保存当前宽度
            setLastWidth(width);
        }
        setCollapsed(!collapsed);
    };
    
    // 处理放大/缩小状态
    const toggleExpand = () => {
        // 切换放大状态
        const newExpandedState = !expanded;
        setExpanded(newExpandedState);
        
        // 根据视口宽度调整聊天区域宽度
        const viewportWidth = window.innerWidth;
        let baseWidth;
        
        // 根据不同的视口宽度设置不同的聊天区域宽度
        if (viewportWidth >= 1400) {
            baseWidth = Math.min(500, viewportWidth * 0.25);
        } else if (viewportWidth >= layout.fullSizeMinWidth) {
            baseWidth = layout.standardStageWidth;
        } else {
            baseWidth = Math.max(280, Math.min(layout.standardStageWidth, viewportWidth * 0.3));
        }
        
        // 更新宽度
        const newWidth = newExpandedState ? baseWidth * 2 : baseWidth;
        setWidth(newWidth);
    };
    
    return (
        <Box 
            className={`${styles.chatWrapper} ${collapsed ? styles.collapsed : ''} ${className || ''}`}
            style={!collapsed ? { width: `${width}px` } : {}}
            ref={chatRef}
        >
            <button 
                className={styles.toggleButton} 
                onClick={toggleCollapse}
                title={collapsed ? '展开聊天' : '折叠聊天'}
                aria-label={collapsed ? '展开聊天' : '折叠聊天'}
                aria-expanded={!collapsed}
            >
                <div className={styles.toggleButtonIcon}>
                    {collapsed ? (
                        /* 折叠状态：显示向右箭头，表示可以展开聊天区域 */
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                            <path d="M18.12 4.12L10.24 12l7.88 7.88L16 22L6 12l10-10z" />
                            <path d="M22.12 4.12L14.24 12l7.88 7.88L20 22l-10-10 10-10z" />
                        </svg>
                    ) : (
                        /* 展开状态：显示向左箭头，表示可以收起聊天区域 */
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                            <path d="M5.88 4.12L13.76 12l-7.88 7.88L8 22l10-10L8 2z" />
                            <path d="M1.88 4.12L9.76 12l-7.88 7.88L4 22l10-10L4 2z" />
                        </svg>
                    )}
                </div>
            </button>
            
            {/* 展开按钮移动到toggle按钮旁边 */}
            {!collapsed && (
                <button 
                    className={styles.expandButton}
                    onClick={toggleExpand}
                    title={expanded ? "缩小聊天区域" : "放大聊天区域"}
                    aria-label={expanded ? "缩小聊天区域" : "放大聊天区域"}
                >
                    {expanded ? (
                        /* 缩小图标 - 减号 */
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                            <rect x="6" y="11" width="12" height="2" rx="1" />
                        </svg>
                    ) : (
                        /* 放大图标 - 加号 */
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                            <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" stroke="white" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    )}
                </button>
            )}
            
            {!collapsed ? (
                <React.Fragment>
                    <Box className={styles.chatHeaderWrapper}>
                        <div className={styles.chatHeader}>
                            <ChatIcon />
                            <h1 className={styles.chatTitle}>
                                <FormattedMessage
                                    defaultMessage="Chat Scratch"
                                    description="Title for chat area"
                                    id="gui.chatWrapper.chatScratch"
                                />
                            </h1>
                            <div className={styles.headerButtons}>
                                <button 
                                    className={styles.clearChatButton}
                                    onClick={handleClearChat}
                                    title="清空聊天记录"
                                    aria-label="清空聊天记录"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                                    </svg>
                                </button>
                                
                                {/* 添加设置按钮 */}
                                <button 
                                    className={styles.settingsButton}
                                    onClick={() => setShowSettingsModal(true)}
                                    title="设置"
                                    aria-label="设置"
                                >
                                    <SettingsIcon />
                                </button>
                            </div>
                        </div>
                    </Box>
                    <Box className={styles.chatCanvasWrapper}>
                        <div className={styles.chatMessages}>
                            {messages.map((message, index) => {
                                // Skip system messages in regular mode (show in development only)
                                if (message.role === 'system' && !message.isToolSummary && process.env.NODE_ENV !== 'development') {
                                    return null;
                                }
                                
                                // For tool summaries, show a different style
                                if (message.isToolSummary) {
                                    return (
                                        <div 
                                            key={index} 
                                            className={styles.messageSystem}
                                        >
                                            <div className={styles.messageContent}>
                                                <pre className={styles.toolSummary}>{message.content}</pre>
                                            </div>
                                        </div>
                                    );
                                }
                                
                                return (
                                    <div 
                                        key={index} 
                                        className={`${message.role === 'assistant' ? styles.messageBot : styles.messageUser} ${
                                            message.role === 'assistant' && hasMarkdown(message.content) ? styles.hasMarkdown : ''
                                        } ${
                                            message.role === 'assistant' && hasCodeBlocks(message.content) ? styles.hasCodeBlock : ''
                                        }`}
                                    >
                                        <div className={styles.messageContent}>
                                            {message.role === 'assistant' ? (
                                                <MessageWithMarkdown content={message.content} />
                                            ) : (
                                                message.content
                                            )}
                                            {message.content.length > 10 && message.role === 'assistant' && (
                                                <button 
                                                    className={styles.copyButton}
                                                    onClick={() => handleCopyMessage(message.content)}
                                                    title="复制消息"
                                                    aria-label="复制消息"
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                                                    </svg>
                                                </button>
                                            )}
                                            
                                            {/* 后续问题按钮 */}
                                            {message.role === 'assistant' && message.followUpQuestions && message.followUpQuestions.length > 0 && (
                                                <div className={styles.followUpContainer}>
                                                    <h4 className={styles.followUpHeading}>尝试问:</h4>
                                                    {message.followUpQuestions.map((question, qIndex) => (
                                                        <button
                                                            key={`followup-${index}-${qIndex}`}
                                                            className={styles.followUpButton}
                                                            onClick={() => handleSendMessage(question)}
                                                            disabled={isLoading}
                                                        >
                                                            {question}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            {isLoading && (
                                <div className={styles.messageBot}>
                                    <div className={styles.messageContent}>
                                        {searchExecuting ? (
                                            <>
                                                <SearchIcon />
                                                <span style={{marginLeft: '8px'}}>正在搜索网络信息</span>
                                                <span className={styles.loadingDots}>
                                                    <span>.</span>
                                                    <span>.</span>
                                                    <span>.</span>
                                                </span>
                                            </>
                                        ) : toolExecuting ? (
                                            <>
                                                <ToolIcon />
                                                <span style={{marginLeft: '8px'}}>正在执行 Scratch 操作</span>
                                                <span className={styles.loadingDots}>
                                                    <span>.</span>
                                                    <span>.</span>
                                                    <span>.</span>
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                思考中<span className={styles.loadingDots}>
                                                    <span>.</span>
                                                    <span>.</span>
                                                    <span>.</span>
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </Box>
                    <Box className={styles.chatInputWrapper}>
                        <div className={styles.chatInput}>
                            {historyIndex !== -1 && (
                                <div className={styles.historyIndicator}>
                                    {`历史 ${historyIndex + 1}/${inputHistory.length}`}
                                </div>
                            )}
                            <textarea 
                                placeholder="输入消息..." 
                                className={`${styles.chatInputField} ${historyIndex !== -1 ? styles.historyNavActive : ''}`}
                                rows="1"
                                value={inputValue}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                ref={textareaRef}
                                disabled={isLoading}
                            />
                            <button 
                                className={`${styles.sendButton} ${isLoading ? styles.cancelButton : ''}`}
                                title={isLoading ? "中断发送" : "发送消息"}
                                aria-label={isLoading ? "中断发送" : "发送消息"}
                                onClick={handleSendMessage}
                                disabled={!isLoading && inputValue.trim() === ''}
                            >
                                {isLoading ? (
                                    <svg 
                                        className={styles.cancelIcon} 
                                        width="16" 
                                        height="16" 
                                        viewBox="0 0 24 24" 
                                        fill="white"
                                    >
                                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
                                    </svg>
                                ) : (
                                    <svg 
                                        className={styles.sendIcon} 
                                        width="16" 
                                        height="16" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path 
                                            d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" 
                                            fill="white"
                                        />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </Box>
                </React.Fragment>
            ) : (
                <div className={styles.collapsedContent}>
                    <ChatIcon />
                    <div className={styles.verticalText}>
                        <FormattedMessage
                            defaultMessage="Chat Scratch"
                            description="Title for chat area in collapsed state"
                            id="gui.chatWrapper.collapsedChatScratch"
                        />
                    </div>
                </div>
            )}
            
            {/* 设置模态框 */}
            {showSettingsModal && (
                <Modal 
                    contentLabel="大模型设置"
                    onRequestClose={() => setShowSettingsModal(false)}
                >
                    <Box className={styles.settingsModalContent}>
                        <h2>大模型设置</h2>
                        <p>在此处可以调整大模型的相关设置，设置将被保存在本地。</p>
                        
                        <div className={styles.settingItem}>
                            <label htmlFor="apiKey" className={styles.settingLabel}>
                                API Key
                            </label>
                            <input 
                                type="text" 
                                id="apiKey" 
                                value={apiKey}
                                onChange={e => setApiKey(e.target.value)} 
                                className={styles.settingInput}
                                placeholder="输入您的 API Key"
                            />
                        </div>

                        <div className={styles.settingItem}>
                            <label htmlFor="apiUrl" className={styles.settingLabel}>
                                API URL
                            </label>
                            <input 
                                type="text" 
                                id="apiUrl" 
                                value={apiUrl}
                                onChange={e => setApiUrl(e.target.value)}
                                className={styles.settingInput}
                                placeholder="https://api.deepseek.com/v1/chat/completions"
                            />
                        </div>
                        
                        <div className={styles.settingItem}>
                            <label htmlFor="modelName" className={styles.settingLabel}>
                                模型名称
                            </label>
                            <input 
                                type="text" 
                                id="modelName" 
                                value={modelName}
                                onChange={e => setModelName(e.target.value)}
                                className={styles.settingInput}
                                placeholder="deepseek-chat"
                            />
                        </div>
                        
                        <div className={styles.settingItem}>
                            <label htmlFor="temperature" className={styles.settingLabel}>
                                温度: {temperature}
                            </label>
                            <input 
                                type="range" 
                                id="temperature" 
                                min="0" 
                                max="1" 
                                step="0.01" 
                                value={temperature}
                                onChange={e => setTemperature(parseFloat(e.target.value))}
                                className={styles.settingSlider}
                            />
                            <div className={styles.rangeLabels}>
                                <span>精确</span>
                                <span>创造力</span>
                            </div>
                        </div>
                        
                        <div className={styles.settingItem}>
                            <label className={styles.settingLabel}>
                                输入历史记录
                            </label>
                            <button 
                                onClick={handleClearInputHistory} 
                                className={styles.clearHistoryButton}
                                title="清空所有输入历史记录"
                            >
                                清空历史记录
                            </button>
                            {clearHistoryResult && (
                                <div className={`${styles.clearHistoryResult} ${styles.testSuccess}`}>
                                    {clearHistoryResult}
                                </div>
                            )}
                        </div>
                        
                        {/* 连接测试结果显示区域 */}
                        {testConnectionResult && (
                            <div className={`${styles.testResult} ${testConnectionResult.success ? styles.testSuccess : styles.testError}`}>
                                {testConnectionResult.message}
                            </div>
                        )}
                        
                        <div className={styles.modalButtons}>
                            <button 
                                onClick={() => setShowSettingsModal(false)}
                                className={styles.cancelButton}
                            >
                                取消
                            </button>
                            <button
                                onClick={testApiConnection}
                                className={styles.testButton}
                                disabled={isTestingConnection}
                            >
                                {isTestingConnection ? '测试中...' : '测试连接'}
                            </button>
                            <button 
                                onClick={saveSettings}
                                className={styles.saveButton}
                            >
                                保存设置
                            </button>
                        </div>
                    </Box>
                </Modal>
            )}
        </Box>
    );
};

ChatWrapperComponent.propTypes = {
    vm: PropTypes.instanceOf(PropTypes.object).isRequired,
    mcpServer: PropTypes.shape({}), // MCP server is optional as it's initialized after component mount
    className: PropTypes.string
};

export default ChatWrapperComponent;
