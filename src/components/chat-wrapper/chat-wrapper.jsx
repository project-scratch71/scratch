import PropTypes from 'prop-types';
import React, {useState, useEffect, useRef} from 'react';
import {FormattedMessage} from 'react-intl';
import Box from '../box/box.jsx';
import layout from '../../lib/layout-constants';
import deepseekAPI from '../../lib/deepseek-api';
import MessageWithCodeHighlighting from './code-highlighter.jsx';

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

const ChatIcon = () => (
    <svg 
        className={styles.chatIcon} 
        width="32" 
        height="32" 
        viewBox="0 0 32 32" 
        xmlns="http://www.w3.org/2000/svg"
    >
        {/* 超简洁儿童友好的圆形机器人图标 */}
        <defs>
            <linearGradient id="robotGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4C97FF" /> {/* $motion-primary */}
                <stop offset="100%" stopColor="#855CD6" /> {/* $looks-secondary */}
            </linearGradient>
        </defs>
        {/* 圆形背景 */}
        <circle cx="16" cy="16" r="15" fill="white" stroke="#E5F0FF" strokeWidth="0.5" />
        
        {/* 圆形机器人头部 */}
        <circle cx="16" cy="16" r="10" fill="url(#robotGradient)" />
        
        {/* 机器人眼睛 - 更大更明显 */}
        <circle cx="12" cy="13" r="2.5" fill="white" />
        <circle cx="20" cy="13" r="2.5" fill="white" />
        
        {/* 机器人嘴巴 - 简单的笑脸 */}
        <path d="M12,19 Q16,23 20,19" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
        
        {/* 机器人天线 */}
        <circle cx="16" cy="3" r="1.5" fill="#4C97FF" />
        <line x1="16" y1="3" x2="16" y2="6" stroke="#4C97FF" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const ChatWrapperComponent = props => {
    const {vm, mcpServer, className} = props;
    const [collapsed, setCollapsed] = useState(false);
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
    const chatRef = React.useRef(null);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);
    
    // 窗口大小改变时，根据屏幕宽度调整聊天区域宽度
    useEffect(() => {
        const handleResize = () => {
            if (collapsed) return; // 折叠状态下不调整宽度
            
            // 根据视口宽度自适应调整聊天区域宽度
            const viewportWidth = window.innerWidth;
            
            // 根据不同的视口宽度设置不同的聊天区域宽度
            if (viewportWidth >= 1400) {
                // 较大屏幕，使用较大宽度
                const newWidth = Math.min(500, viewportWidth * 0.25);
                setWidth(newWidth);
                setLastWidth(newWidth);
            } else if (viewportWidth >= layout.fullSizeMinWidth) {
                // 中等屏幕，使用标准舞台宽度
                setWidth(layout.standardStageWidth);
                setLastWidth(layout.standardStageWidth);
            } else {
                // 较小屏幕，使用更窄的宽度以适应
                const newWidth = Math.max(280, Math.min(layout.standardStageWidth, viewportWidth * 0.3));
                setWidth(newWidth);
                setLastWidth(newWidth);
            }
        };
        
        // 初始化调整一次
        handleResize();
        
        // 监听窗口大小变化
        window.addEventListener('resize', handleResize);
        
        // 清理函数
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [collapsed]);
    
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
    
    // 处理按键事件 (按下回车键发送消息)
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };
    
    /**
     * 处理发送消息
     * @param {string} [content] - 可选，如果传入则使用该内容而不是输入框的内容
     */
    const handleSendMessage = async (content) => {
        const messageToSend = content || inputValue;
        if (messageToSend.trim() === '' || isLoading) return;
        
        const userMessage = {
            role: 'user',
            content: messageToSend
        };
        
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
            
            // 调用 DeepSeek API
            const response = await deepseekAPI.sendMessage(messageHistory);
            
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
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                        </svg>
                    ) : (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                        </svg>
                    )}
                </div>
            </button>
            
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
                                        className={message.role === 'assistant' ? styles.messageBot : styles.messageUser}
                                    >
                                        <div className={styles.messageContent}>
                                            {message.role === 'assistant' ? (
                                                <MessageWithCodeHighlighting content={message.content} />
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
                            <textarea 
                                placeholder="输入消息..." 
                                className={styles.chatInputField}
                                rows="1"
                                value={inputValue}
                                onChange={handleInputChange}
                                onKeyPress={handleKeyPress}
                                ref={textareaRef}
                                disabled={isLoading}
                            />
                            <button 
                                className={styles.sendButton} 
                                title="发送消息"
                                aria-label="发送消息"
                                onClick={handleSendMessage}
                                disabled={inputValue.trim() === '' || isLoading}
                            >
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
        </Box>
    );
};

ChatWrapperComponent.propTypes = {
    vm: PropTypes.instanceOf(PropTypes.object).isRequired,
    mcpServer: PropTypes.shape({}), // MCP server is optional as it's initialized after component mount
    className: PropTypes.string
};

export default ChatWrapperComponent;
