import React from 'react';
import {
  Animated,
} from 'react-native';
import PropTypes from 'prop-types';

class TensionSheet extends React.Component {
  constructor(nextProps) {
    super(nextProps);
    this.__onLayout = this.__onLayout.bind(this);
    this.state = {

    };
  }
  __onLayout(e) { /* android hack */ }
  componentDidMount() {
    const { onOnScroll } = this.props;
    const { footer } = this.refs;
    onOnScroll((e) => {
      footer._component.measure(console.log);
    });
  }
  render() {
    const {

    } = this.props;
    const {

    } = this.state;
    return (
      <Animated.View
        ref="footer"
        removeClippedSubviews={false}
        collapsable={false}
        renderToHardwareTextureAndroid
        onLayout={this.__onLayout}
        style={{
          width: 100,
          height: 100,
          backgroundColor: 'orange',
        }}
      >
      </Animated.View>
    );
  }
}

TensionSheet.propTypes = {
  onOnScroll: PropTypes.func,
};

TensionSheet.defaultProps = {
  onOnScroll: onScroll => null,
};

export default TensionSheet;
