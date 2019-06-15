import React from 'react';
import {
  Animated,
  View,
  StyleSheet,
  // TODO: remove this
  Dimensions,
} from 'react-native';
import PropTypes from 'prop-types';

const styles = StyleSheet.create(
  {
    container: {
      flex: 1,
      backgroundColor: 'green',
    },
  },
);

// TODO: Support direction.
class ElasticFooter extends React.Component {
  constructor(nextProps) {
    super(nextProps);
    this.state = {
      animValue: new Animated.Value(0),
    };
  }
  componentDidMount() {
    const {
      handleOnScroll,
      maxHeight,
      ...extraProps
    } = this.props;
    const {
      animValue,
      ...extraState
    } = this.state;
    if (handleOnScroll) {
      handleOnScroll(
        (e) => {
          const {
            contentOffset: {
              x,
              y,
            },
            contentSize: {
              width,
              height,
            },
            layoutMeasurement: {
              width: layoutWidth,
              height: layoutHeight,
            },
          } = e.nativeEvent;
          const barHeight = animValue.__getValue() * maxHeight;

          const contentHeight = height - barHeight;
          const extendedHeight = contentHeight + maxHeight;
          const maxScrollY = extendedHeight - layoutHeight;

          const pct = y / maxScrollY;          
          const thr = (1 - maxScrollY / extendedHeight);

          if (pct >= thr) {
            this.__handleScrollWithinThreshold(
              pct - thr,
              1 - thr,
            );
          }
        },
     );
    }
  }
  __handleScrollWithinThreshold(currentDelta, totalDelta) {
    const {
      animValue,
    } = this.state;
    animValue.setValue(
      (currentDelta / totalDelta),
    );
  }
  render() {
    const {
      maxHeight,
      ...nextProps
    } = this.props;
    const {
      animValue,
      ...nextState
    } = this.state;
    return (
      <Animated.View
        style={{
          flex: 1,
          height: Animated.multiply(
            animValue,
            maxHeight,
          ),
          backgroundColor: 'blue',
        }}
      >
      </Animated.View>
    );
  }
}

ElasticFooter.propTypes = {
  maxHeight: PropTypes.number,
  handleOnScroll: PropTypes.func,
};

ElasticFooter.defaultProps = {
  maxHeight: 200,
  handleOnScroll: () => null,
};

export default ElasticFooter;
