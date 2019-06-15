import React from 'react';
import {
  Animated,
} from 'react-native';
import PropTypes from 'prop-types';

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
    } = this.props;
    const {
      animValue,
    } = this.state;
    if (handleOnScroll) {
      handleOnScroll(
        (e) => {
          const {
            contentOffset: {
              y,
            },
            contentSize: {
              height,
            },
            layoutMeasurement: {
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
      children,
    } = this.props;
    const {
      animValue,
      refreshing,
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
        {children.map(Component => (
          <Component
            animValue={animValue}
            refreshing={refreshing}
          />
        ))}
      </Animated.View>
    );
  }
}

ElasticFooter.propTypes = {
  maxHeight: PropTypes.number,
  handleOnScroll: PropTypes.func,
  refreshing: PropTypes.bool,
  onRefresh: PropTypes.func,
  children: PropTypes.arrayOf(
    PropTypes.func,
  ),
};

ElasticFooter.defaultProps = {
  maxHeight: 200,
  handleOnScroll: () => null,
  refreshing: false,
  onRefresh: () => null,
  children: [
    ({ animValue, refreshing }) => (
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: animValue
            .interpolate(
              {
                inputRange: [0, 1],
                outputRange: ['green', 'red'],
              },
            ),
        }}
      />
    ),
  ],
};

export default ElasticFooter;
