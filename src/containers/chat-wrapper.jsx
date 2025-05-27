import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';
import VM from 'scratch-vm';
import ChatWrapperComponent from '../components/chat-wrapper/chat-wrapper.jsx';
import MCPServer from '../lib/mcp-server';
import MCPVMBridge from '../lib/mcp-vm-bridge';
import deepseekAPI from '../lib/deepseek-api';

const ChatWrapper = props => {
    const {vm, blocks} = props;
    const [mcpServer, setMCPServer] = useState(null);
    
    // Initialize MCP Server on component mount
    useEffect(() => {
        if (vm && blocks) {
            const vmBridge = new MCPVMBridge(vm);
            const server = new MCPServer(vm, blocks, { vmBridge });
            
            // Register the MCP server with the DeepSeek API
            deepseekAPI.setMCPServer(server);
            
            setMCPServer(server);
            
            console.log('MCP Server initialized and registered with DeepSeek API');
        }
    }, [vm, blocks]);
    
    return <ChatWrapperComponent 
        {...props} 
        mcpServer={mcpServer}
    />;
};

ChatWrapper.propTypes = {
    vm: PropTypes.instanceOf(VM).isRequired,
    blocks: PropTypes.shape({}).isRequired,
    className: PropTypes.string
};

export default ChatWrapper;
