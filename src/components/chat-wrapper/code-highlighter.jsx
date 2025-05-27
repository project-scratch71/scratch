import React, {useState} from 'react';
import PropTypes from 'prop-types';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';
import 'highlight.js/styles/github-dark.css';

import styles from './markdown-styles.css';

// Register the languages we want to support
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('js', javascript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('py', python);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('css', css);
hljs.registerLanguage('json', json);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('shell', bash);

// Define supported language names to display in code blocks
const languageNames = {
    js: 'JavaScript',
    javascript: 'JavaScript',
    py: 'Python',
    python: 'Python',
    html: 'HTML',
    xml: 'XML',
    css: 'CSS',
    json: 'JSON',
    bash: 'Bash',
    shell: 'Shell',
    scratch: 'Scratch',
    text: 'Text'
};

// Define which languages are supported by highlight.js
const supportedLanguages = new Set([
    'javascript', 'js', 'python', 'py', 'html', 'xml', 'css', 'json', 'bash', 'shell'
]);

/**
 * Simple function to convert a message with code blocks to highlighted HTML
 * @param {string} text - The text content to process
 * @returns {Object[]} Array of processed segments (text or code)
 */
const processMessageWithCodeBlocks = text => {
    if (!text) return [{type: 'text', content: ''}];

    // Regular expression to match code blocks with language specification
    const codeBlockRegex = /```(\w+)?\s*([\s\S]*?)```/g;
    
    const segments = [];
    let lastIndex = 0;
    let match;
    
    // Find all code blocks
    while ((match = codeBlockRegex.exec(text)) !== null) {
        // Add text before code block
        if (match.index > lastIndex) {
            segments.push({
                type: 'text',
                content: text.substring(lastIndex, match.index)
            });
        }
        
        // Add code block
        const language = match[1] || 'text';
        const code = match[2].trim();
        const normalizedLanguage = language.toLowerCase();
        
        segments.push({
            type: 'code',
            language,
            content: code,
            // 如果语言不支持，不进行高亮，直接使用原始代码
            highlighted: supportedLanguages.has(normalizedLanguage) ? 
                hljs.highlight(code, {language: normalizedLanguage, ignoreIllegals: true}).value :
                hljs.highlightAuto(code).value // 使用自动检测作为默认
        });
        
        lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text after last code block
    if (lastIndex < text.length) {
        segments.push({
            type: 'text',
            content: text.substring(lastIndex)
        });
    }
    
    return segments.length ? segments : [{type: 'text', content: text}];
};

/**
 * Process inline code blocks within text segments
 * @param {string} text - Text content to process
 * @returns {Object[]} Array of processed segments
 */
const processInlineCode = text => {
    if (!text) return [text];
    
    const segments = [];
    const inlineCodeRegex = /`([^`]+)`/g;
    let lastIndex = 0;
    let match;
    
    while ((match = inlineCodeRegex.exec(text)) !== null) {
        // Add text before inline code
        if (match.index > lastIndex) {
            segments.push({
                type: 'text',
                content: text.substring(lastIndex, match.index)
            });
        }
        
        // Add inline code
        segments.push({
            type: 'inlineCode',
            content: match[1]
        });
        
        lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
        segments.push({
            type: 'text',
            content: text.substring(lastIndex)
        });
    }
    
    return segments.length ? segments : [{type: 'text', content: text}];
};

const CodeBlock = ({language, content}) => {
    const [copied, setCopied] = useState(false);
    const displayName = languageNames[language] || language;
    const normalizedLanguage = language.toLowerCase();
    
    // Handle copy to clipboard
    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        
        // Reset the copied state after 2 seconds
        setTimeout(() => setCopied(false), 2000);
    };
    
    return (
        <div className={styles.codeBlockWrapper}>
            <div className={styles.codeHeader}>
                {displayName}
                <button
                    className={styles.copyCodeButton}
                    onClick={handleCopy}
                    aria-label="Copy code"
                    title="Copy code"
                >
                    {copied ? 'Copied!' : (
                        <>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                            </svg>
                            Copy
                        </>
                    )}
                </button>
            </div>
            <pre>
                <code 
                    className={`language-${language}`}
                    dangerouslySetInnerHTML={{__html: supportedLanguages.has(normalizedLanguage) ? 
                        hljs.highlight(content, {language: normalizedLanguage, ignoreIllegals: true}).value : 
                        hljs.highlightAuto(content).value}} // 使用自动检测作为默认
                />
            </pre>
        </div>
    );
};

CodeBlock.propTypes = {
    language: PropTypes.string,
    content: PropTypes.string.isRequired
};

const MessageWithCodeHighlighting = ({content}) => {
    const processedSegments = processMessageWithCodeBlocks(content);
    
    return (
        <div className={styles.markdown}>
            {processedSegments.map((segment, index) => {
                if (segment.type === 'code') {
                    return (
                        <CodeBlock 
                            key={`code-${index}`} 
                            language={segment.language} 
                            content={segment.content} 
                        />
                    );
                }
                
                // Process inline code in text segments
                const inlineProcessedSegments = processInlineCode(segment.content);
                
                return (
                    <span key={`text-${index}`}>
                        {inlineProcessedSegments.map((inlineSegment, inlineIndex) => {
                            if (inlineSegment.type === 'inlineCode') {
                                return (
                                    <code key={`inline-${index}-${inlineIndex}`} className={styles.inlineCode}>
                                        {inlineSegment.content}
                                    </code>
                                );
                            }
                            
                            // Simple text processing for new lines, URLs, etc.
                            const textWithLineBreaks = inlineSegment.content
                                .split('\n')
                                .map((line, lineIndex, array) => (
                                    <React.Fragment key={`line-${index}-${inlineIndex}-${lineIndex}`}>
                                        {line}
                                        {lineIndex < array.length - 1 && <br />}
                                    </React.Fragment>
                                ));
                                
                            return <span key={`inline-text-${index}-${inlineIndex}`}>{textWithLineBreaks}</span>;
                        })}
                    </span>
                );
            })}
        </div>
    );
};

MessageWithCodeHighlighting.propTypes = {
    content: PropTypes.string.isRequired
};

export default MessageWithCodeHighlighting;