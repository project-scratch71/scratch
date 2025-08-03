import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import omit from 'lodash.omit';
import { defineMessages, FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import MediaQuery from 'react-responsive';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import tabStyles from 'react-tabs/style/react-tabs.css';
import VM from 'scratch-vm';
import Renderer from 'scratch-render';
import { FaPuzzlePiece } from 'react-icons/fa';

import Blocks from '../../containers/blocks.jsx';
import CostumeTab from '../../containers/costume-tab.jsx';
import TargetPane from '../../containers/target-pane.jsx';
import SoundTab from '../../containers/sound-tab.jsx';
import StageWrapper from '../../containers/stage-wrapper.jsx';
import CustomInstructionViewerComponent from '../custom-instruction-viewer/custom-instruction-viewer.jsx';
import ResizeHandle from '../resize-handle/resize-handle.jsx';
import VerticalResizeHandle from '../vertical-resize-handle/vertical-resize-handle.jsx';
import Loader from '../loader/loader.jsx';
import Box from '../box/box.jsx';
import MenuBar from '../menu-bar/menu-bar.jsx';
import CostumeLibrary from '../../containers/costume-library.jsx';
import BackdropLibrary from '../../containers/backdrop-library.jsx';
import Watermark from '../../containers/watermark.jsx';
import SpriteInfo from '../../containers/sprite-info.jsx';

import Backpack from '../../containers/backpack.jsx';
import WebGlModal from '../../containers/webgl-modal.jsx';
import TipsLibrary from '../../containers/tips-library.jsx';
import Cards from '../../containers/cards.jsx';
import Alerts from '../../containers/alerts.jsx';
import DragLayer from '../../containers/drag-layer.jsx';
import ConnectionModal from '../../containers/connection-modal.jsx';
import TelemetryModal from '../telemetry-modal/telemetry-modal.jsx';

import layout, {STAGE_SIZE_MODES} from '../../lib/layout-constants';
import { resolveStageSize } from '../../lib/screen-utils';
import {themeMap} from '../../lib/themes';

import styles from './gui.css';
import DebugModal from '../debug-modal/debug-modal.jsx';

const messages = defineMessages({
    addExtension: {
        id: 'gui.gui.addExtension',
        defaultMessage: 'Add Extension'
    }
});

let isRendererSupported = null;

const GUIComponent = (props) => {
    const [bodyWidth, setBodyWidth] = useState(600);
    const [viewerHeight, setViewerHeight] = useState(400);
    const [isDragging, setIsDragging] = useState(false);
    const bodyWrapperRef = useRef(null);
    const stageAndTargetWrapperRef = useRef(null);

    const handleHorizontalResize = (newWidth) => {
        setBodyWidth(newWidth);
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 0);
    };

    const handleVerticalResize = (newInstructionHeight) => {
        setViewerHeight(newInstructionHeight);
    };


    useEffect(() => {
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setBodyWidth(entry.contentRect.width);
            }
        });

        if (bodyWrapperRef.current) {
            resizeObserver.observe(bodyWrapperRef.current);
        }

        return () => resizeObserver.disconnect();
    }, []);

    const {
        editingTarget,
        selectedId,
        sprites,
        stage,
        vm,
        accountNavOpen,
        activeTabIndex,
        alertsVisible,
        authorId,
        authorThumbnailUrl,
        authorUsername,
        basePath,
        backdropLibraryVisible,
        backpackHost,
        backpackVisible,
        blocksId,
        blocksTabVisible,
        cardsVisible,
        canChangeLanguage,
        canChangeTheme,
        canCreateNew,
        canEditTitle,
        canManageFiles,
        canRemix,
        canSave,
        canCreateCopy,
        canShare,
        canUseCloud,
        children,
        connectionModalVisible,
        costumeLibraryVisible,
        costumesTabVisible,
        debugModalVisible,
        enableCommunity,
        intl,
        isCreating,
        isFullScreen,
        isPlayerOnly,
        isShared,
        isTelemetryEnabled,
        isTotallyNormal,
        loading,
        logo,
        renderLogin,
        onClickAbout,
        onClickAccountNav,
        onCloseAccountNav,
        onLogOut,
        onOpenRegistration,
        onToggleLoginOpen,
        onActivateCostumesTab,
        onActivateSoundsTab,
        onActivateTab,
        onClickLogo,
        onExtensionButtonClick,
        onProjectTelemetryEvent,
        onRequestCloseBackdropLibrary,
        onRequestCloseCostumeLibrary,
        onRequestCloseDebugModal,
        onRequestCloseTelemetryModal,
        onSeeCommunity,
        onShare,
        onShowPrivacyPolicy,
        onStartSelectingFileUpload,
        onTelemetryModalCancel,
        onTelemetryModalOptIn,
        onTelemetryModalOptOut,
        showComingSoon,
        soundsTabVisible,
        stageSizeMode,
        targetIsStage,
        telemetryModalVisible,
        theme,
        tipsLibraryVisible,
        ...componentProps
    } = omit(props, 'dispatch');
    if (children) {
        return <Box {...componentProps}>{children}</Box>;
    }

    const handleChangeSpriteDirection = (direction) => {
        vm.postSpriteInfo({ direction });
    };

    const handleChangeSpriteName = (name) => {
        vm.renameSprite(editingTarget, name);
    };

    const handleChangeSpriteRotationStyle = (rotationStyle) => {
        vm.postSpriteInfo({ rotationStyle });
    };

    const handleChangeSpriteSize = (size) => {
        vm.postSpriteInfo({ size });
    };

    const handleChangeSpriteVisibility = (visible) => {
        vm.postSpriteInfo({ visible });
    };

    const handleChangeSpriteX = (x) => {
        vm.postSpriteInfo({ x });
    };

    const handleChangeSpriteY = (y) => {
        vm.postSpriteInfo({ y });
    };

    const isStageSelected = stage && stage.id === editingTarget;
    
    let selectedSprite = sprites && selectedId ? sprites[selectedId] : null;
    
    if (!selectedSprite || isStageSelected) {
        selectedSprite = {};
    }

    const tabClassNames = {
        tabs: styles.tabs,
        tab: classNames(tabStyles.reactTabsTab, styles.tab),
        tabList: classNames(tabStyles.reactTabsTabList, styles.tabList),
        tabPanel: classNames(tabStyles.reactTabsTabPanel, styles.tabPanel),
        tabPanelSelected: classNames(tabStyles.reactTabsTabPanelSelected, styles.isSelected),
        tabSelected: classNames(tabStyles.reactTabsTabSelected, styles.isSelected)
    };

    if (isRendererSupported === null) {
        isRendererSupported = Renderer.isSupported();
    }

    return (
        <MediaQuery minWidth={layout.fullSizeMinWidth}>
            {(isFullSize) => {
                const stageSize = resolveStageSize(stageSizeMode, isFullSize);

                return (
                    <Box className={styles.pageWrapper} {...componentProps}>
                        {loading && <Loader />}
                        {isCreating && <Loader messageId="gui.loader.creating" />}
                        {!isRendererSupported && <WebGlModal />}
                        {alertsVisible && <Alerts className={styles.alertsContainer} />}
                        {connectionModalVisible && <ConnectionModal vm={vm} />}
                        {costumeLibraryVisible && (
                            <CostumeLibrary
                                vm={vm}
                                onRequestClose={onRequestCloseCostumeLibrary}
                            />
                        )}
                        {backdropLibraryVisible && (
                            <BackdropLibrary
                                vm={vm}
                                onRequestClose={onRequestCloseBackdropLibrary}
                            />
                        )}
                <Box className={styles.chunkWrapper}>
                    <Box 
                        className={styles.bodyWrapper} 
                        ref={bodyWrapperRef}
                        style={{ width: `${bodyWidth}px` }}
                    >
                        <Box className={styles.targetWrapper}>
                            <TargetPane
                                stageSize={stageSize}
                                vm={vm}
                            />
                        </Box>
                        <Box className={styles.editorWrapper}>
                            <Tabs
                                forceRenderTabPanel
                                className={tabClassNames.tabs}
                                selectedIndex={activeTabIndex}
                                selectedTabClassName={tabClassNames.tabSelected}
                                selectedTabPanelClassName={tabClassNames.tabPanelSelected}
                                onSelect={onActivateTab}
                            >
                                <TabPanel className={tabClassNames.tabPanel}>
                                    <Blocks
                                        style={{width: '100%'}}
                                        key={`${blocksId}/${theme}`}
                                        canUseCloud={canUseCloud}
                                        grow={1}
                                        isVisible={blocksTabVisible}
                                        options={{
                                            media: `${basePath}static/${themeMap[theme].blocksMediaFolder}/`
                                        }}
                                        stageSize={stageSize}
                                        theme={theme}
                                        vm={vm}
                                    />
                                    <Box className={styles.extensionButtonContainer}>
                                        <button
                                            className={styles.extensionButton}
                                            title={intl.formatMessage(messages.addExtension)}
                                            onClick={onExtensionButtonClick}
                                        >
                                            <FaPuzzlePiece
                                                className={styles.extensionButtonIcon}
                                                size={28}
                                            />
                                        </button>
                                    </Box>
                                    <Box className={styles.watermark}>
                                        <Watermark />
                                    </Box>
                                </TabPanel>
                                <TabPanel className={tabClassNames.tabPanel}>
                                    {costumesTabVisible ? <CostumeTab vm={vm} style={{width: '100%'}} /> : null}
                                </TabPanel>
                                <TabPanel className={tabClassNames.tabPanel}>
                                    {soundsTabVisible ? <SoundTab vm={vm} style={{width: '100%'}} /> : null}
                                </TabPanel>
                                <TabList className={tabClassNames.tabList}>
                                    <Tab className={tabClassNames.tab}>
                                        <FormattedMessage
                                            defaultMessage="Code"
                                            description="Button to get to the code panel"
                                            id="gui.gui.codeTab"
                                        />
                                    </Tab>
                                    <Tab
                                        className={tabClassNames.tab}
                                        onClick={onActivateCostumesTab}
                                    >
                                        {targetIsStage ? (
                                            <FormattedMessage
                                                defaultMessage="Backdrops"
                                                description="Button to get to the backdrops panel"
                                                id="gui.gui.backdropsTab"
                                            />
                                        ) : (
                                            <FormattedMessage
                                                defaultMessage="Costumes"
                                                description="Button to get to the costumes panel"
                                                id="gui.gui.costumesTab"
                                            />
                                        )}
                                    </Tab>
                                    <Tab
                                        className={tabClassNames.tab}
                                        onClick={onActivateSoundsTab}
                                    >
                                        <FormattedMessage
                                            defaultMessage="Sounds"
                                            description="Button to get to the sounds panel"
                                            id="gui.gui.soundsTab"
                                        />
                                    </Tab>
                                </TabList>
                            </Tabs>
                            {/* Backpack commented out for iframe embedding - not needed
                            {backpackVisible ? (
                                <Backpack host={backpackHost} />
                            ) : null}
                            */}
                        </Box>
                    </Box>
                    <ResizeHandle 
                        onResize={handleHorizontalResize} 
                        currentWidth={bodyWidth}
                        onDragStart={() => setIsDragging(true)}
                        onDragEnd={() => setIsDragging(false)}
                    />
                    <Box 
                        className={styles.stageAndTargetWrapper}
                        ref={stageAndTargetWrapperRef}
                        style={{ width: `calc(100vw - ${bodyWidth}px - 1rem)` }}
                    >
                        <Box className={styles.stageSection}>
                            <StageWrapper
                                isFullScreen={isFullScreen}
                                isRendererSupported={isRendererSupported}
                                stageSize={stageSize}
                                vm={vm}
                            />
                        </Box>
                        <Box 
                            className={styles.customInstructionSection}
                            style={{ height: `${viewerHeight}px` }}
                        >
                            <VerticalResizeHandle 
                                onResize={handleVerticalResize} 
                                currentHeight={viewerHeight}
                                onDragStart={() => setIsDragging(true)}
                                onDragEnd={() => setIsDragging(false)}
                            />

                            <CustomInstructionViewerComponent isDragging={isDragging} />
                        </Box>
                    </Box>
                </Box>
                <DragLayer />
            </Box>
        );
    }}</MediaQuery>);
};

GUIComponent.propTypes = {
    accountNavOpen: PropTypes.bool,
    activeTabIndex: PropTypes.number,
    authorId: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]), // can be false
    authorThumbnailUrl: PropTypes.string,
    authorUsername: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]), // can be false
    backdropLibraryVisible: PropTypes.bool,
    backpackHost: PropTypes.string,
    backpackVisible: PropTypes.bool,
    basePath: PropTypes.string,
    blocksTabVisible: PropTypes.bool,
    blocksId: PropTypes.string,
    canChangeLanguage: PropTypes.bool,
    canChangeTheme: PropTypes.bool,
    canCreateCopy: PropTypes.bool,
    canCreateNew: PropTypes.bool,
    canEditTitle: PropTypes.bool,
    canManageFiles: PropTypes.bool,
    canRemix: PropTypes.bool,
    canSave: PropTypes.bool,
    canShare: PropTypes.bool,
    canUseCloud: PropTypes.bool,
    cardsVisible: PropTypes.bool,
    children: PropTypes.node,
    costumeLibraryVisible: PropTypes.bool,
    costumesTabVisible: PropTypes.bool,
    debugModalVisible: PropTypes.bool,
    editingTarget: PropTypes.object,
    enableCommunity: PropTypes.bool,
    intl: intlShape.isRequired,
    isCreating: PropTypes.bool,
    isFullScreen: PropTypes.bool,
    isPlayerOnly: PropTypes.bool,
    isShared: PropTypes.bool,
    isTotallyNormal: PropTypes.bool,
    loading: PropTypes.bool,
    logo: PropTypes.string,
    onActivateCostumesTab: PropTypes.func,
    onActivateSoundsTab: PropTypes.func,
    onActivateTab: PropTypes.func,
    onClickAccountNav: PropTypes.func,
    onClickLogo: PropTypes.func,
    onCloseAccountNav: PropTypes.func,
    onExtensionButtonClick: PropTypes.func,
    onLogOut: PropTypes.func,
    onOpenRegistration: PropTypes.func,
    onRequestCloseBackdropLibrary: PropTypes.func,
    onRequestCloseCostumeLibrary: PropTypes.func,
    onRequestCloseDebugModal: PropTypes.func,
    onRequestCloseTelemetryModal: PropTypes.func,
    onSeeCommunity: PropTypes.func,
    onShare: PropTypes.func,
    onShowPrivacyPolicy: PropTypes.func,
    onStartSelectingFileUpload: PropTypes.func,
    onTabSelect: PropTypes.func,
    onTelemetryModalCancel: PropTypes.func,
    onTelemetryModalOptIn: PropTypes.func,
    onTelemetryModalOptOut: PropTypes.func,
    onToggleLoginOpen: PropTypes.func,
    renderLogin: PropTypes.func,
    selectedId: PropTypes.string,
    showComingSoon: PropTypes.bool,
    soundsTabVisible: PropTypes.bool,
    sprites: PropTypes.object,
    stage: PropTypes.object,
    stageSizeMode: PropTypes.oneOf(Object.keys(STAGE_SIZE_MODES)),
    targetIsStage: PropTypes.bool,
    telemetryModalVisible: PropTypes.bool,
    theme: PropTypes.string,
    tipsLibraryVisible: PropTypes.bool,
    vm: PropTypes.instanceOf(VM).isRequired
};
GUIComponent.defaultProps = {
    backpackHost: null,
    backpackVisible: false,
    basePath: './',
    blocksId: 'original',
    canChangeLanguage: true,
    canChangeTheme: true,
    canCreateNew: false,
    canEditTitle: false,
    canManageFiles: true,
    canRemix: false,
    canSave: false,
    canCreateCopy: false,
    canShare: false,
    canUseCloud: false,
    enableCommunity: false,
    isCreating: false,
    isShared: false,
    isTotallyNormal: false,
    loading: false,
    showComingSoon: false,
    stageSizeMode: STAGE_SIZE_MODES.large
};

const mapStateToProps = state => ({
    // This is the button's mode, as opposed to the actual current state
    blocksId: state.scratchGui.timeTravel.year.toString(),
    editingTarget: state.scratchGui.targets.editingTarget,
    selectedId: state.scratchGui.targets.editingTarget,
    sprites: state.scratchGui.targets.sprites,
    stage: state.scratchGui.targets.stage,
    stageSizeMode: state.scratchGui.stageSize.stageSize,
    theme: state.scratchGui.theme.theme
});

export default injectIntl(connect(
    mapStateToProps
)(GUIComponent));
