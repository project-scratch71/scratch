/**
 * iframe communication service for sending events to parent window
 */
class IframeCommunication {
    constructor() {
        this.isInitialized = false;
        this.parentOrigin = null;
        this.messageQueue = [];
        this.vm = null; // Store VM reference here
        this.readySignalSent = false; // Prevent duplicate ready signals
        
        // Communication service for sending basic events to parent window
        
        this.init();
    }

    init() {
        // Listen for messages from parent window
        window.addEventListener('message', this.handleMessage.bind(this));
        
        // Try to detect parent origin
        this.detectParentOrigin();
        
        // Set initialized flag first
        this.isInitialized = true;
        
        // Send ready signal to parent
        this.sendToParent({
            type: 'SCRATCH_READY',
            timestamp: Date.now()
        });
        
        // Setup basic VM availability check
        this.setupBasicVM();
        
        console.log('IframeCommunication initialized');
    }
    
    detectParentOrigin() {
        // Try to get parent origin from document.referrer
        if (document.referrer) {
            try {
                const referrerUrl = new URL(document.referrer);
                this.parentOrigin = referrerUrl.origin;
                console.log('Parent origin detected from referrer:', this.parentOrigin);
            } catch (e) {
                console.log('Could not parse referrer URL');
            }
        }
        
        // Fallback: try to get from parent window location
        if (!this.parentOrigin) {
            try {
                if (window.parent && window.parent !== window) {
                    this.parentOrigin = window.parent.location.origin;
                    console.log('Parent origin detected from parent.location:', this.parentOrigin);
                }
            } catch (e) {
                // This will fail due to cross-origin restrictions, which is expected
                console.log('Could not access parent location (expected for cross-origin)');
            }
        }
    }

    handleMessage(event) {
        // Skip messages from this same window (self-sent messages)
        if (event.source === window) {
            return;
        }

        // Store parent origin for secure communication
        if (!this.parentOrigin) {
            this.parentOrigin = event.origin;
        }

        // Check if event.data exists and has the expected structure
        if (!event.data || typeof event.data !== 'object') {
            return;
        }

        const { type, data } = event.data;
        
        // Skip if type is undefined or not a string
        if (!type || typeof type !== 'string') {
            return;
        }

        // Skip webpack hot reload messages
        if (type === 'webpackOk' || type.startsWith('webpack')) {
            return;
        }

        // Skip outgoing message types (messages we send TO parent, not FROM parent)
        if (type === 'CODE_UPDATE' || type === 'SCRATCH_READY') {
            return;
        }
        
        switch (type) {
            case 'PARENT_READY':
                this.onParentReady();
                break;
            case 'LANGUAGE_CHANGE':
                this.onLanguageChange(data);
                break;
            case 'PROJECT_LOAD':
                this.onProjectLoad(data);
                break;
            case 'GET_PROJECT_DATA':
                this.onGetProjectData();
                break;
            default:
                console.log('Unknown message type:', type);
        }
    }

    onParentReady() {
        console.log('Parent window is ready');
        // Send any queued messages
        this.messageQueue.forEach(message => {
            this.sendToParent(message);
        });
        this.messageQueue = [];
    }

    onLanguageChange(languageCode) {
        console.log('Language change requested:', languageCode);
        // TODO: Implement language change logic
        // This would typically involve calling the locale change functions
    }

    onProjectLoad(projectData) {
        console.log('Project load requested:', projectData);
        // TODO: Implement project loading logic
    }


    onGetProjectData() {
        console.log('🔵 GET_PROJECT_DATA request received');
        const vm = this.getVM();
        console.log('🔍 VM status:', {
            vmExists: !!vm,
            vmIsReady: vm ? 'ready' : 'not ready'
        });
        
        if (vm) {
            try {
                console.log('📦 Getting project data from VM...');
                let projectData = vm.toJSON();
                
                // If vm.toJSON() returns a string, parse it to object
                if (typeof projectData === 'string') {
                    console.log('🔄 Project data is string, parsing to object...');
                    projectData = JSON.parse(projectData);
                }
                
                console.log('✅ Project data retrieved successfully:', {
                    hasProjectData: !!projectData,
                    projectDataType: typeof projectData,
                    targets: projectData?.targets?.length || 0,
                    dataSize: projectData ? JSON.stringify(projectData).length : 0,
                    projectDataPreview: {
                        targets: projectData?.targets?.map((target, index) => ({
                            index,
                            name: target.name,
                            isStage: target.isStage,
                            costumesCount: target.costumes?.length || 0,
                            blocksCount: Object.keys(target.blocks || {}).length
                        })) || []
                    }
                });
                
                this.sendToParent({
                    type: 'PROJECT_DATA_RESPONSE',
                    projectData: projectData
                });
                
                console.log('📤 PROJECT_DATA_RESPONSE sent to parent');
            } catch (error) {
                console.error('❌ Error getting project data:', error);
                this.sendToParent({
                    type: 'PROJECT_DATA_RESPONSE',
                    projectData: null,
                    error: error.message
                });
                console.log('📤 PROJECT_DATA_RESPONSE (error) sent to parent');
            }
        } else {
            console.warn('⚠️ Cannot get project data: VM not ready');
            this.sendToParent({
                type: 'PROJECT_DATA_RESPONSE',
                projectData: null,
                error: 'VM not ready'
            });
            console.log('📤 PROJECT_DATA_RESPONSE (VM not ready) sent to parent');
        }
    }

    setupBasicVM() {
        // VMが利用可能になるまで待機（プロジェクト読み込み用）
        const checkVM = () => {
            if (this.vm || window.vm) {
                console.log('VM found, ready for project operations');
                // Note: SCRATCH_EDITOR_READY will be sent from setVM() method
            } else {
                // VMがまだ利用できない場合は少し待ってから再試行
                setTimeout(checkVM, 100);
            }
        };
        
        checkVM();
    }

    // Method to set VM reference from components
    setVM(vm) {
        if (this.vm === vm) return; // Avoid duplicate processing
        
        this.vm = vm;
        console.log('VM reference set in iframe communication');
        
        // Send ready signal only once when VM is first set
        if (vm && this.isInitialized && !this.readySignalSent) {
            this.readySignalSent = true;
            this.sendToParent({
                type: 'SCRATCH_EDITOR_READY'
            });
        }
    }

    // Get VM from either our reference or global window
    getVM() {
        return this.vm || window.vm;
    }

    sendToParent(message) {
        if (!this.isInitialized) {
            this.messageQueue.push(message);
            return;
        }

        try {
            // Use '*' for development to avoid origin mismatch issues
            const targetOrigin = '*';
            
            window.parent.postMessage(message, targetOrigin);
        } catch (error) {
            console.error('Error sending message to parent:', error);
        }
    }











    

    // Send code updates to parent window
    sendMessage(type, data) {
        this.sendToParent({
            type,
            data,
            timestamp: Date.now()
        });
    }
}

// Create singleton instance
const iframeCommunication = new IframeCommunication();

export default iframeCommunication;