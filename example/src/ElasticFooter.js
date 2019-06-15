import React from 'react';
import {
  Animated,
} from 'react-native';
import PropTypes from 'prop-types';
import { debounce } from 'lodash';

// TODO: Support direction.
class ElasticFooter extends React.Component {
  constructor(nextProps) {
    super(nextProps);
    const {
      debounce: rate,
    } = nextProps;
    this.state = {
      animValue: new Animated.Value(0),
      refreshing: false,
      cancelling: false,
    };
    this.__onRefreshComplete = debounce(
      this.__onRefreshComplete.bind(this),
      rate,
      { trailing: true },
    );
    this.__onRequestRefresh = debounce(
      this.__onRequestRefresh.bind(this),
      rate,
      { trailing: true },
    );
    this.__onRequestCancel = debounce(
      this.__onRequestCancel.bind(this),
      rate,
      { trailing: true },
    );
  }
  __onRequestRefresh() {
    const { onRefresh } = this.props;
    onRefresh();
  }
  __onRefreshComplete() {
    this.setState(
      {
        refreshing: false,
      },
    );
  }
  __onRequestCancel() {
    this.setState(
      {
        cancelling: true,
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
            cancelling: isCancelling,
          } = this.state;
          if (!isAlreadyRefreshing && !isCancelling) {
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
            const maxScrollY = contentHeight - layoutHeight;

            const pct = Math.min(extendedHeight / contentHeight, y / maxScrollY);
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
      threshold,
    } = this.props;
    const {
      animValue,
    } = this.state;
    const v = +(currentDelta / totalDelta).toFixed(2);
    animValue
      .setValue(
        v,
      );
    if (v >= threshold) {
      this.__onRequestRefresh.cancel();
      this.__onRequestCancel.cancel();
      this.__onRequestRefresh();
    } else {
      this.__onRequestCancel();
      this.__onRequestRefresh.cancel();
    }
  }
  componentWillUpdate(nextProps, nextState) {
    const {
      refreshing,
      duration,
      debounce: rate,
    } = nextProps;
    const {
      refreshing: isAlreadyRefreshing,
      animValue,
      cancelling,
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
          duration,
        },
      )
        .start();
    } else if (cancelling && !this.state.cancelling) {
      Animated.timing(
        animValue,
        {
          toValue: 0,
          duration,
        },
      )
        .start(() => {
          this.setTimeout(
            () => {
              this.setState(
                {
                  cancelling: false,
                },
              );
            },
            rate,
          );
        });
    }
  }
  render() {
    const {
      maxHeight,
      children: Child,
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
        }}
      >
        <Child
          animValue={animValue}
          refreshing={refreshing}
        />
      </Animated.View>
    );
  }
}

ElasticFooter.propTypes = {
  maxHeight: PropTypes.number,
  handleOnScroll: PropTypes.func,
  refreshing: PropTypes.bool,
  onRefresh: PropTypes.func,
  children: PropTypes.func,
  duration: PropTypes.number,
  threshold: PropTypes.number,
};

ElasticFooter.defaultProps = {
  maxHeight: 100,
  handleOnScroll: () => null,
  refreshing: false,
  onRefresh: () => null,
  children: ({ animValue, refreshing }) => (
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
  duration: 150,
  debounce: 130,
  threshold: 0.94,
};

Object.assign(
  ElasticFooter.prototype,
  require('react-timer-mixin'),
);

export default ElasticFooter;
