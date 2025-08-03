import PropTypes from 'prop-types';
import React from 'react';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import {
    MdPlayArrow,
    MdStop,
    MdRedo,
    MdUndo,
    MdFastForward,
    MdFastRewind,
    MdVolumeUp,
    MdVolumeDown,
    MdAndroid,
    MdVolumeOff,
    MdDelete,
    MdContentCopy,
    MdContentPaste,
    MdLibraryAdd
} from 'react-icons/md';
import { FiTrendingUp, FiTrendingDown, FiRefreshCcw } from 'react-icons/fi';

import Waveform from '../waveform/waveform.jsx';
import Input from '../forms/input.jsx';

import BufferedInputHOC from '../forms/buffered-input-hoc.jsx';
import AudioSelector from '../../containers/audio-selector.jsx';

import styles from './sound-editor.css';

const BufferedInput = BufferedInputHOC(Input);

const messages = defineMessages({
    sound: {
        id: 'gui.soundEditor.sound',
        description: 'Label for the name of the sound',
        defaultMessage: 'Sound'
    },
    play: {
        id: 'gui.soundEditor.play',
        description: 'Title of the button to start playing the sound',
        defaultMessage: 'Play'
    },
    stop: {
        id: 'gui.soundEditor.stop',
        description: 'Title of the button to stop the sound',
        defaultMessage: 'Stop'
    },
    copy: {
        id: 'gui.soundEditor.copy',
        description: 'Title of the button to copy the current selection',
        defaultMessage: 'Copy'
    },
    paste: {
        id: 'gui.soundEditor.paste',
        description: 'Title of the button to paste the current selection',
        defaultMessage: 'Paste'
    },
    copyToNew: {
        id: 'gui.soundEditor.copyToNew',
        description: 'Title of the button to copy the current selection to a new sound',
        defaultMessage: 'Copy to new'
    },
    delete: {
        id: 'gui.soundEditor.delete',
        description: 'Title of the button to delete the current selection',
        defaultMessage: 'Delete'
    },
    undo: {
        id: 'gui.soundEditor.undo',
        description: 'Title of the button to undo',
        defaultMessage: 'Undo'
    },
    redo: {
        id: 'gui.soundEditor.redo',
        description: 'Title of the button to redo',
        defaultMessage: 'Redo'
    },
    faster: {
        id: 'gui.soundEditor.faster',
        description: 'Title of the button to apply the faster effect',
        defaultMessage: 'Faster'
    },
    slower: {
        id: 'gui.soundEditor.slower',
        description: 'Title of the button to apply the slower effect',
        defaultMessage: 'Slower'
    },
    louder: {
        id: 'gui.soundEditor.louder',
        description: 'Title of the button to apply the louder effect',
        defaultMessage: 'Louder'
    },
    softer: {
        id: 'gui.soundEditor.softer',
        description: 'Title of the button to apply the softer effect',
        defaultMessage: 'Softer'
    },
    robot: {
        id: 'gui.soundEditor.robot',
        description: 'Title of the button to apply the robot effect',
        defaultMessage: 'Robot'
    },
    reverse: {
        id: 'gui.soundEditor.reverse',
        description: 'Title of the button to apply the reverse effect',
        defaultMessage: 'Reverse'
    },
    fadeOut: {
        id: 'gui.soundEditor.fadeOut',
        description: 'Title of the button to apply the fade out effect',
        defaultMessage: 'Fade out'
    },
    fadeIn: {
        id: 'gui.soundEditor.fadeIn',
        description: 'Title of the button to apply the fade in effect',
        defaultMessage: 'Fade in'
    },
    mute: {
        id: 'gui.soundEditor.mute',
        description: 'Title of the button to apply the mute effect',
        defaultMessage: 'Mute'
    }
});

const SoundEditor = props => (
    <div
        className={styles.editorContainer}
        ref={props.setRef}
        onMouseDown={props.onContainerClick}
    >
        <div className={styles.headerSection}>
            <BufferedInput
                className={styles.nameInput}
                placeholder="Sound name"
                tabIndex="1"
                type="text"
                value={props.name}
                onSubmit={props.onChangeName}
            />
            <div className={styles.historyButtons}>
                <button
                    className={styles.iconButton}
                    disabled={!props.canUndo}
                    title={props.intl.formatMessage(messages.undo)}
                    onClick={props.onUndo}
                >
                    <MdUndo size="1rem" />
                </button>
                <button
                    className={styles.iconButton}
                    disabled={!props.canRedo}
                    title={props.intl.formatMessage(messages.redo)}
                    onClick={props.onRedo}
                >
                    <MdRedo size="1rem" />
                </button>
            </div>
        </div>

        <div className={styles.waveformSection}>
            <Waveform
                data={props.chunkLevels}
                height={120}
                width={600}
            />
            <AudioSelector
                playhead={props.playhead}
                trimEnd={props.trimEnd}
                trimStart={props.trimStart}
                onPlay={props.onPlay}
                onSetTrim={props.onSetTrim}
                onStop={props.onStop}
            />
        </div>

        {/* Play/Stop Button */}
        <div className={styles.playSection}>
            {props.playhead ? (
                <button
                    className={styles.playButton}
                    title={props.intl.formatMessage(messages.stop)}
                    onClick={props.onStop}
                >
                    <MdStop color="#C4553A" size="1.5rem" />
                </button>
            ) : (
                <button
                    className={styles.playButton}
                    title={props.intl.formatMessage(messages.play)}
                    onClick={props.onPlay}
                >
                    <MdPlayArrow color="#C4553A" size="1.5rem" />
                </button>
            )}
        </div>

        <div className={styles.buttonSection}>
            <div className={styles.buttonRow}>
                {/* Edit */}
                <button
                    className={styles.iconButton}
                    title={props.intl.formatMessage(messages.copy)}
                    onClick={props.onCopy}
                >
                    <MdContentCopy size="1rem" />
                </button>
                <button
                    className={styles.iconButton}
                    disabled={props.canPaste === false}
                    title={props.intl.formatMessage(messages.paste)}
                    onClick={props.onPaste}
                >
                    <MdContentPaste size="1rem" />
                </button>
                <button
                    className={styles.iconButton}
                    disabled={props.trimStart === null}
                    title={props.intl.formatMessage(messages.delete)}
                    onClick={props.onDelete}
                >
                    <MdDelete size="1rem" />
                </button>
                <button
                    className={styles.iconButton}
                    title={props.intl.formatMessage(messages.copyToNew)}
                    onClick={props.onCopyToNew}
                >
                    <MdLibraryAdd size="1rem" />
                </button>
            </div>

            <div className={styles.buttonRow}>
                {/* Effects */}
                <button
                    className={styles.iconButton}
                    title={props.intl.formatMessage(messages.faster)}
                    onClick={props.onFaster}
                >
                    <MdFastForward size="1rem" />
                </button>
                <button
                    className={styles.iconButton}
                    title={props.intl.formatMessage(messages.slower)}
                    onClick={props.onSlower}
                >
                    <MdFastRewind size="1rem" />
                </button>
                <button
                    className={styles.iconButton}
                    disabled={props.tooLoud}
                    title={props.intl.formatMessage(messages.louder)}
                    onClick={props.onLouder}
                >
                    <MdVolumeUp size="1rem" />
                </button>
                <button
                    className={styles.iconButton}
                    title={props.intl.formatMessage(messages.softer)}
                    onClick={props.onSofter}
                >
                    <MdVolumeDown size="1rem" />
                </button>
                <button
                    className={styles.iconButton}
                    title={props.intl.formatMessage(messages.mute)}
                    onClick={props.onMute}
                >
                    <MdVolumeOff size="1rem" />
                </button>
                <button
                    className={styles.iconButton}
                    title={props.intl.formatMessage(messages.robot)}
                    onClick={props.onRobot}
                >
                    <MdAndroid size="1rem" />
                </button>
                <button
                    className={styles.iconButton}
                    title={props.intl.formatMessage(messages.fadeIn)}
                    onClick={props.onFadeIn}
                >
                    <FiTrendingUp size="1rem" />
                </button>
                <button
                    className={styles.iconButton}
                    title={props.intl.formatMessage(messages.fadeOut)}
                    onClick={props.onFadeOut}
                >
                    <FiTrendingDown size="1rem" />
                </button>
                <button
                    className={styles.iconButton}
                    title={props.intl.formatMessage(messages.reverse)}
                    onClick={props.onReverse}
                >
                    <FiRefreshCcw size="1rem" />
                </button>
            </div>
        </div>
    </div>
);

SoundEditor.propTypes = {
    canPaste: PropTypes.bool.isRequired,
    canRedo: PropTypes.bool.isRequired,
    canUndo: PropTypes.bool.isRequired,
    chunkLevels: PropTypes.arrayOf(PropTypes.number).isRequired,
    intl: intlShape,
    name: PropTypes.string.isRequired,
    onChangeName: PropTypes.func.isRequired,
    onContainerClick: PropTypes.func.isRequired,
    onCopy: PropTypes.func.isRequired,
    onCopyToNew: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onEcho: PropTypes.func.isRequired,
    onFadeIn: PropTypes.func.isRequired,
    onFadeOut: PropTypes.func.isRequired,
    onFaster: PropTypes.func.isRequired,
    onLouder: PropTypes.func.isRequired,
    onMute: PropTypes.func.isRequired,
    onPaste: PropTypes.func.isRequired,
    onPlay: PropTypes.func.isRequired,
    onRedo: PropTypes.func.isRequired,
    onReverse: PropTypes.func.isRequired,
    onRobot: PropTypes.func.isRequired,
    onSetTrim: PropTypes.func.isRequired,
    onSlower: PropTypes.func.isRequired,
    onSofter: PropTypes.func.isRequired,
    onStop: PropTypes.func.isRequired,
    onUndo: PropTypes.func.isRequired,
    playhead: PropTypes.number,
    setRef: PropTypes.func.isRequired,
    tooLoud: PropTypes.bool.isRequired,
    trimEnd: PropTypes.number,
    trimStart: PropTypes.number
};

export default injectIntl(SoundEditor);