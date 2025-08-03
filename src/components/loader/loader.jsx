import React from 'react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import styles from './loader.css';
import topBlock from './top-block.svg';
import middleBlock from './middle-block.svg';
import bottomBlock from './bottom-block.svg';
const messages = [
    {
        message: <FormattedMessage defaultMessage="Creating blocks …" id="gui.loader.message1" />,
        weight: 50
    },
    {
        message: <FormattedMessage defaultMessage="Loading sprites …" id="gui.loader.message2" />,
        weight: 50
    },
    {
        message: <FormattedMessage defaultMessage="Loading sounds …" id="gui.loader.message3" />,
        weight: 50
    },
    {
        message: <FormattedMessage defaultMessage="Loading extensions …" id="gui.loader.message4" />,
        weight: 50
    },
    {
        message: <FormattedMessage defaultMessage="Creating blocks …" id="gui.loader.message1" />,
        weight: 20
    },
    {
        message: <FormattedMessage defaultMessage="Herding cats …" id="gui.loader.message5" />,
        weight: 1
    },
    {
        message: <FormattedMessage defaultMessage="Transmitting nanos …" id="gui.loader.message6" />,
        weight: 1
    },
    {
        message: <FormattedMessage defaultMessage="Inflating gobos …" id="gui.loader.message7" />,
        weight: 1
    },
    {
        message: <FormattedMessage defaultMessage="Preparing emojis …" id="gui.loader.message8" />,
        weight: 1
    }
];
const mainMessages = {
    'gui.loader.headline': <FormattedMessage defaultMessage="Loading Project" id="gui.loader.headline" />,
    'gui.loader.creating': <FormattedMessage defaultMessage="Creating Project" id="gui.loader.creating" />
};

class LoaderComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            messageNumber: this.chooseRandomMessage()
        };
    }
    
    componentDidMount() {
        this.intervalId = setInterval(() => {
            this.setState({ messageNumber: this.chooseRandomMessage() });
        }, 5000);
    }
    
    componentWillUnmount() {
        clearInterval(this.intervalId);
    }
    
    chooseRandomMessage() {
        const sum = messages.reduce((acc, m) => acc + m.weight, 0);
        let rand = sum * Math.random();
        
        for (let i = 0; i < messages.length; i++) {
            rand -= messages[i].weight;
            if (rand <= 0) {
                return i;
            }
        }
        
        return 0;
    }
    render() {
        const { isFullScreen, messageId } = this.props;
        const { messageNumber } = this.state;
        
        return (
            <div className={classNames(styles.background, { [styles.fullscreen]: isFullScreen })}>
                <div className={styles.container}>
                    <div className={styles.blockAnimation}>
                        <img className={styles.topBlock} src={topBlock} alt="Top block" />
                        <img className={styles.middleBlock} src={middleBlock} alt="Middle block" />
                        <img className={styles.bottomBlock} src={bottomBlock} alt="Bottom block" />
                    </div>
                    <div className={styles.title}>
                        {mainMessages[messageId]}
                    </div>
                    <div className={styles.messageContainerOuter}>
                        <div
                            className={styles.messageContainerInner}
                            style={{ transform: `translate(0, -${messageNumber * 25}px)` }}
                        >
                            {messages.map((m, i) => (
                                <div className={styles.message} key={i}>
                                    {m.message}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

LoaderComponent.propTypes = {
    isFullScreen: PropTypes.bool,
    messageId: PropTypes.string
};
LoaderComponent.defaultProps = {
    isFullScreen: false,
    messageId: 'gui.loader.headline'
};

export default LoaderComponent;
