import {defineMessages, FormattedMessage, injectIntl, intlShape} from 'react-intl';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FaTrash, FaUndo, FaArrowLeft, FaArrowRight } from 'react-icons/fa';

import Box from '../box/box.jsx';
import ReactModal from 'react-modal';

import styles from './delete-confirmation-prompt.css';

// TODO: Parametrize from outside if we want more custom messaging
const messages = defineMessages({
    shouldDeleteSpriteMessage: {
        defaultMessage: 'Are you sure you want to delete this sprite?',
        description: 'Message to indicate whether selected sprite should be deleted.',
        id: 'gui.gui.shouldDeleteSprite'
    },
    shouldDeleteCostumeMessage: {
        defaultMessage: 'Are you sure you want to delete this costume?',
        description: 'Message to indicate whether selected costume should be deleted.',
        id: 'gui.gui.shouldDeleteCostume'
    },
    shouldDeleteSoundMessage: {
        defaultMessage: 'Are you sure you want to delete this sound?',
        description: 'Message to indicate whether selected sound should be deleted.',
        id: 'gui.gui.shouldDeleteSound'
    },
    confirmOption: {
        defaultMessage: 'yes',
        description: 'Yes - should delete the sprite',
        id: 'gui.gui.confirm'
    },
    cancelOption: {
        defaultMessage: 'no',
        description: 'No - cancel deletion',
        id: 'gui.gui.cancel'
    },
    confirmDeletionHeading: {
        defaultMessage: 'Confirm Asset Deletion',
        description: 'Heading of confirmation prompt to delete asset',
        id: 'gui.gui.deleteAssetHeading'
    }
});

const modalWidth = 320;
const calculateModalPosition = () => {
    // 画面中央に表示
    return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
    };
};

const getMessage = entityType => {
    if (entityType === 'COSTUME') {
        return messages.shouldDeleteCostumeMessage;
    }

    if (entityType === 'SOUND') {
        return messages.shouldDeleteSoundMessage;
    }

    return messages.shouldDeleteSpriteMessage;
};

const DeleteConfirmationPrompt = ({
    intl,
    onCancel,
    onOk,
    modalPosition,
    entityType,
    entityName,
    relativeElemRef
}) => {
    const modalPositionValues = calculateModalPosition();

    return (<ReactModal
        isOpen
        // We have to inline the styles, since a part
        // of them are dynamically generated
        style={{
            content: {
                ...modalPositionValues,
                width: modalWidth,
                border: 'none',
                height: 'fit-content',
                backgroundColor: 'transparent',
                padding: 0,
                margin: 0,
                position: 'fixed',
                overflowX: 'hidden',
                zIndex: 1000
            },
            overlay: {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 510,
                backgroundColor: 'rgba(0, 0, 0, 0.3)'
            }
        }}
        contentLabel={intl.formatMessage(messages.confirmDeletionHeading)}
        onRequestClose={onCancel}
    >
        <Box className={styles.modalContainer}>
            <Box className={styles.body}>
                <Box className={styles.label}>
                    <FormattedMessage {...getMessage(entityType)} />
                    {entityName && (
                        <Box className={styles.entityName}>
                            "{entityName}"
                        </Box>
                    )}
                </Box>
                <Box className={styles.buttonRow}>
                    <button
                        className={styles.okButton}
                        onClick={onOk}
                        role="button"
                    >
                        <FaTrash className={styles.deleteIcon} />
                        <div className={styles.message}>
                            <FormattedMessage {...messages.confirmOption} />
                        </div>
                    </button>
                    <button
                        className={styles.cancelButton}
                        onClick={onCancel}
                        role="button"
                    >
                        <FaUndo className={styles.deleteIcon} />
                        <div className={styles.message}>
                            <FormattedMessage {...messages.cancelOption} />
                        </div>
                    </button>
                </Box>
            </Box>
        </Box>
    </ReactModal>);
};

DeleteConfirmationPrompt.propTypes = {
    onOk: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    relativeElemRef: PropTypes.object,
    entityType: PropTypes.string,
    entityName: PropTypes.string,
    modalPosition: PropTypes.string,
    intl: intlShape.isRequired
};

const DeleteConfirmationPromptIntl = injectIntl(DeleteConfirmationPrompt);

export default DeleteConfirmationPromptIntl;
