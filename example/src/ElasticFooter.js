import React from 'react';
import {
  Animated,
  ActivityIndicator,
} from 'react-native';
import PropTypes from 'prop-types';
import { debounce } from 'lodash';

// TODO: Support direction.
class ElasticFooter extends React.Component {
  constructor(nextProps) {
    super(nextProps);
    this.state = {
      animValue: new Animated.Value(0),
      refreshing: false,
      cancelling: false,
    };
    this.__onRefreshComplete = debounce(
      this.__onRefreshComplete.bind(this),
      250,
      { trailing: true },
    );
  }
  __onRefreshComplete() {
    this.setState(
      {
        refreshing: false,
      },
    );
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
            refreshing,
          } = this.props;
          const {
            refreshing: isAlreadyRefreshing,
          } = this.state;
          if (!isAlreadyRefreshing) {
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
          } else if (!refreshing) {
            this.__onRefreshComplete();
          }
        },
     );
    }
  }
  __handleScrollWithinThreshold(currentDelta, totalDelta) {
    const {
      onRefresh,
    } = this.props;
    const {
      animValue,
    } = this.state;
    const v = +(currentDelta / totalDelta).toFixed(2);
    animValue
      .setValue(
        v,
      );
    if (v >= 0.95) {
      onRefresh();
    }
  }
  componentWillUpdate(nextProps, nextState) {
    const {
      refreshing,
    } = nextProps;
    const {
      refreshing: isAlreadyRefreshing,
      animValue,
    } = nextState;
    if ((refreshing && !this.props.refreshing) && !isAlreadyRefreshing) {
      this.setState(
        {
          refreshing,
        },
      );
    }
    if ((!refreshing && this.props.refreshing) && isAlreadyRefreshing) {
      Animated.timing(
        animValue,
        {
          toValue: 0,
          // TODO: as props
          duration: 300,
        },
      )
        .start();
    }
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
        {children.map((Component, i) => (
          <Component
            key={i}
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
  maxHeight: 100,
  handleOnScroll: () => null,
  refreshing: false,
  onRefresh: () => null,
  children: [
    ({ animValue, refreshing }) => (
      <Animated.View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: animValue
            .interpolate(
              {
                inputRange: [0, 1],
                outputRange: ['green', 'red'],
              },
            ),
        }}
      >
      </Animated.View>
    ),
  ],
};

export default ElasticFooter;
