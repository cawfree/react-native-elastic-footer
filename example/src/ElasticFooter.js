import React from 'react';
import {
  Animated,
} from 'react-native';
import PropTypes from 'prop-types';
import { debounce } from 'lodash';

class ElasticFooter extends React.Component {
  constructor(nextProps) {
    super(nextProps);
    const {
      refreshing,
      debounce: rate,
    } = nextProps;
    this.__onLayout = this.__onLayout.bind(this);
    this.state = {
      animValue: new Animated.Value(refreshing ? 1 : 0),
      cancelling: false,
      refreshing: false,
    };
    this.__onCancel = debounce(
      this.__onCancel.bind(this),
      rate,
      { trailing: true },
    );
    this.__onRefresh = debounce(
      this.__onRefresh.bind(this),
      rate,
      { trailing: true },
    );
  }
  __onLayout(e) { /* android hack */ }
  __onCancel(contentHeight) {
    const { onCancel } = this.props;
    this.setState(
      {
        refreshing: false,
        cancelling: true,
      },
      () => onCancel(contentHeight),
    );
  }
  __onRefresh(contentHeight) {
    const { onRefresh } = this.props;
    onRefresh(contentHeight);
  }
  __depress() {
    const {
      duration,
      debounce: rate,
    } = this.props;
    const {
      animValue,
    } = this.state;
    Animated.timing(
      animValue,
      {
        toValue: 0,
        // TODO: fn of distance
        duration,
      },
    )
      .start(
        () => {
          this.setTimeout(
            () => this.setState(
              {
                cancelling: false,
                refreshing: false,
              },
            ),
            rate,
          );
        },
      );
  }
  componentWillUpdate(nextProps, nextState) {
    const {
      duration,
      debounce: rate,
      refreshing,
    } = nextProps;
    const {
      animValue,
      cancelling: isCancelling,
      refreshing: isRefreshing,
    } = nextState;
    if (isCancelling && !this.state.cancelling) {
      this.__depress();
    } else if ((refreshing && !this.props.refreshing) && !isRefreshing) {
      this.setState(
        {
          refreshing: true,
        },
      );
    } else if ((!refreshing && this.props.refreshing) && isRefreshing) {
      this.__depress();
    }
  }
  componentDidMount() {
    const {
      onHandleMixins,
      maxHeight,
      onRefresh,
      tension,
    } = this.props;
    // XXX: This is hacky. Come up with a smoother implementation function.
    const incr = (1 / maxHeight) * 1;
    const { footer } = this.refs;
    onHandleMixins((e) => {
      const {
        cancelling: isCancelling,
        refreshing: isRefreshing,
      } = this.state;
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
          const v = Math.min(
            1,
            Math.max(tension(((y - scrollLimit) + 1) * incr), tension(incr * 1.1)),
          );
          if (!isCancelling && !isRefreshing) {
            if (y >= scrollLimit - 1) {
              animValue.setValue(v);
              if (v === 1) {
                this.__onCancel.cancel();
                this.__onRefresh(scrollLimit);
              } else {
                this.__onRefresh.cancel();
                this.__onCancel(scrollLimit);
              }
            } else {
              this.__onRefresh.cancel();
              this.__onCancel.cancel();
              animValue.setValue(0);
            }
          } else if (isRefreshing && v === 0) {
            this.__onCancel(scrollLimit)
            this.__onCancel.flush();
          }
        },
      );
    });
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
        ref="footer"
        removeClippedSubviews={false}
        collapsable={false}
        renderToHardwareTextureAndroid
        onLayout={this.__onLayout}
        style={{
          height: Animated.multiply(
            animValue,
            maxHeight,
          ),
          backgroundColor: 'orange',
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
  onHandleMixins: PropTypes.func,
  maxHeight: PropTypes.number,
  refreshing: PropTypes.bool,
  onRefresh: PropTypes.func,
  onCancel: PropTypes.func,
  duration: PropTypes.number,
  debounce: PropTypes.number,
  children: PropTypes.func,
  tension: PropTypes.func,
};

ElasticFooter.defaultProps = {
  onHandleMixins: onScroll => null,
  maxHeight: 100,
  refreshing: false,
  onRefresh: contentHeight => null,
  onCancel: contentHeight => null,
  duration: 300,
  debounce: 120,
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
  tension: (t) => {
    return t;
  },
};

Object.assign(
  ElasticFooter.prototype,
  require('react-timer-mixin'),
);

export default ElasticFooter;
