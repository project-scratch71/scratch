import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';

import CustomSpriteInfoComponent from '../components/custom-sprite-info/custom-sprite-info.jsx';

class SpriteInfo extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleClickVisible',
            'handleClickNotVisible'
        ]);
    }
    handleClickVisible (e) {
        e.preventDefault();
        this.props.onChangeVisibility(true);
    }
    handleClickNotVisible (e) {
        e.preventDefault();
        this.props.onChangeVisibility(false);
    }
    render () {
        return (
            <CustomSpriteInfoComponent
                {...this.props}
                onClickNotVisible={this.handleClickNotVisible}
                onClickVisible={this.handleClickVisible}
            />
        );
    }
}

SpriteInfo.propTypes = {
    ...CustomSpriteInfoComponent.propTypes,
    onChangeDirection: PropTypes.func,
    onChangeName: PropTypes.func,
    onChangeSize: PropTypes.func,
    onChangeVisibility: PropTypes.func,
    onChangeX: PropTypes.func,
    onChangeY: PropTypes.func,
    x: PropTypes.number,
    y: PropTypes.number
};

export default SpriteInfo;
