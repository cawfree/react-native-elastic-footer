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
      animValue: new Animated.Value(0),
    };
  }
  __onLayout(e) { /* android hack */ }
  componentDidMount() {
    const {
      onOnScroll,
      maxHeight,
      tension,
    } = this.props;
    const incr = (1 / maxHeight);
    const { footer } = this.refs;
    onOnScroll((e) => {
      const {
        contentOffset: {
          y,
        },
        contentSize: {
          height: totalContentHeight,
        },
        layoutMeasurement: {
          height: layoutHeight,
        },
      } = e.nativeEvent;
      footer._component.measure(
        (ox, oy, width, height, px, py) => {
          const { animValue } = this.state;
          const barHeight = animValue.__getValue() * maxHeight;
          const contentHeight = totalContentHeight - barHeight;
          const scrollLimit = contentHeight - layoutHeight;
          // XXX: for the maximum scroll before viewing the tensionsheet
          if (y >= scrollLimit) {
            animValue.setValue(
              Math.min(
                1,
                tension(((y - scrollLimit) + 1) * incr),
              ),
            );
          } else {
            animValue.setValue(0);
          }
        },
      );
    });
  }
  render() {
    const {
      maxHeight,
    } = this.props;
    const {
      animValue,
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
          height: Animated.multiply(
            animValue,
            maxHeight,
          ),
          backgroundColor: 'orange',
        }}
      >
      </Animated.View>
    );
  }
}

TensionSheet.propTypes = {
  onOnScroll: PropTypes.func,
  maxHeight: PropTypes.number,
  tension: PropTypes.func,
};

TensionSheet.defaultProps = {
  onOnScroll: onScroll => null,
  maxHeight: 100,
  tension: (t) => {
    return 1+(--t)*t*t*t*t ;
  },
};

export default TensionSheet;
