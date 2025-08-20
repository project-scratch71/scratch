import bindAll from 'lodash.bindall';
import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {intlShape} from 'react-intl';
import VM from 'scratch-vm';
import {setProjectId} from '../reducers/project-state';
import storage from './storage';

/**
 * Higher Order Component to handle external project loading via postMessage
 * @param {React.Component} WrappedComponent: component to render
 * @returns {React.Component} component with external project loading behavior
 */
const ProjectLoaderHOC = function (WrappedComponent) {
    class ProjectLoaderComponent extends React.Component {
        constructor (props) {
            super(props);
            bindAll(this, [
                'handleMessage'
            ]);
            this.state = {
                waitingForExternalProject: false
            };
            
            // Configure storage settings
            storage.setProjectHost(props.projectHost);
            storage.setProjectToken(props.projectToken);
            storage.setAssetHost(props.assetHost);
            if (props.intl && props.intl.formatMessage) {
                storage.setTranslatorFunction(props.intl.formatMessage);
            }
        }

        componentDidMount () {
            window.addEventListener('message', this.handleMessage);
            
            // Register this component instance globally for cross-component communication
            window.projectLoaderComponent = this;
        }

        componentDidUpdate (prevProps) {
            // Update storage settings when props change
            if (prevProps.projectHost !== this.props.projectHost) {
                storage.setProjectHost(this.props.projectHost);
            }
            if (prevProps.projectToken !== this.props.projectToken) {
                storage.setProjectToken(this.props.projectToken);
            }
            if (prevProps.assetHost !== this.props.assetHost) {
                storage.setAssetHost(this.props.assetHost);
            }
        }

        componentWillUnmount () {
            window.removeEventListener('message', this.handleMessage);
            
            // Clean up global reference
            if (window.projectLoaderComponent === this) {
                window.projectLoaderComponent = null;
            }
        }

        handleMessage (event) {
            // セキュリティ: 必要に応じてorigin制限を追加
            // if (event.origin !== 'https://trusted-domain.com') return;

            const { data } = event;
            
            if (data && data.type === 'LOAD_PROJECT') {
                this.loadExternalProject(data.projectData);
            }
        }

        loadExternalProject (projectData) {
            if (!this.props.vm || !projectData) {
                console.error('VM not available or invalid project data');
                return;
            }
            
            console.log('🔄 Clearing VM state before loading external project...');
            
            // Clear paint editor state if in costume tab to prevent bounds errors
            const currentTabIndex = window.__store ? 
                window.__store.getState().scratchGui.editorTab.activeTabIndex : 0;
            
            if (currentTabIndex === 1) { // COSTUMES_TAB_INDEX
                console.log('🎨 Clearing paint editor state for safe project switch...');
                // Clear paper.js state to prevent bounds errors
                try {
                    if (typeof paper !== 'undefined' && paper.project) {
                        paper.project.clear();
                    }
                    // Alternative: Force paint editor to reset via Redux
                    if (window.__store) {
                        // Dispatch a custom action to reset paint editor state
                        window.__store.dispatch({ type: 'scratch-paint/CLEAR_STATE' });
                    }
                } catch (error) {
                    console.log('Could not clear paper.js state:', error.message);
                }
            }
            
            // Clear the VM state first to prevent data accumulation
            this.props.vm.clear();
            
            console.log('📦 Loading external project data into VM...');
            this.props.vm.loadProject(projectData)
                .then(() => {
                    // プロジェクト状態をリセット
                    if (this.props.setProjectId) {
                        this.props.setProjectId('external');
                    }
                    
                    console.log('🎉 Project loaded successfully, no tab switching needed');
                    
                    // 親ページに読み込み完了を通知
                    if (window.parent !== window) {
                        window.parent.postMessage({
                            type: 'SCRATCH_PROJECT_LOADED'
                        }, '*');
                    }
                })
                .catch(error => {
                    console.error('Failed to load external project:', error);
                    this.setState({ waitingForExternalProject: false });
                    
                    // エラーを親ページに通知
                    if (window.parent !== window) {
                        window.parent.postMessage({
                            type: 'SCRATCH_PROJECT_ERROR',
                            error: error.message
                        }, '*');
                    }
                });
        }

        render () {
            const {
                vm,
                ...props
            } = this.props;

            return (
                <WrappedComponent
                    vm={vm}
                    {...props}
                />
            );
        }
    }

    ProjectLoaderComponent.propTypes = {
        vm: PropTypes.instanceOf(VM).isRequired,
        setProjectId: PropTypes.func,
        // Asset and project configuration
        assetHost: PropTypes.string,
        projectHost: PropTypes.string,
        projectToken: PropTypes.string,
        intl: intlShape
    };
    ProjectLoaderComponent.defaultProps = {
        assetHost: process.env.ASSET_HOST,
        projectHost: 'https://projects.scratch.mit.edu'
    };

    const mapStateToProps = state => ({
        vm: state.scratchGui.vm
    });

    const mapDispatchToProps = dispatch => ({
        setProjectId: (projectId) => dispatch(setProjectId(projectId))
    });

    return connect(mapStateToProps, mapDispatchToProps)(ProjectLoaderComponent);
};

export default ProjectLoaderHOC;