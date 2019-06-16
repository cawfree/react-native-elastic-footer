import React from 'react';
import {
  Animated,
} from 'react-native';
import PropTypes from 'prop-types';
import { debounce } from 'lodash';

class TensionSheet extends React.Component {
  constructor(nextProps) {
    super(nextProps);
    const {
      debounce: rate,
    } = nextProps;
    this.__onLayout = this.__onLayout.bind(this);
    this.state = {
      animValue: new Animated.Value(0),
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
  __onCancel() {
    this.setState(
      {
        cancelling: true,
      },
    );
  }
  __onRefresh() {
    const { onRefresh } = this.props;
    onRefresh();
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
      onOnScroll,
      maxHeight,
      onRefresh,
    } = this.props;
    // XXX: This is hacky. Come up with a smoother implementation function.
    const incr = (1 / maxHeight) * 1;
    const { footer } = this.refs;
    onOnScroll((e) => {
      const {
        cancelling: isCancelling,
        refreshing: isRefreshing,
      } = this.state;
      if (!isCancelling && !isRefreshing) {
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
            if (y >= scrollLimit - 1) {
              const v = Math.min(
                1,
                // TODO: need to scale coefficient properly
                (((y - scrollLimit) + 1) * incr) * 1.2,
              );
              animValue.setValue(v);
              if (v === 1) {
                this.__onCancel.cancel();
                this.__onRefresh();
              } else {
                this.__onRefresh.cancel();
                this.__onCancel();
              }
            } else {
              this.__onRefresh.cancel();
              this.__onCancel.cancel();
              animValue.setValue(0);
            }
          },
        );
      }
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
          flexDirection: 'row',
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

TensionSheet.propTypes = {
  onOnScroll: PropTypes.func,
  maxHeight: PropTypes.number,
  refreshing: PropTypes.bool,
  onRefresh: PropTypes.func,
  duration: PropTypes.number,
  debounce: PropTypes.number,
  children: PropTypes.func,
};

TensionSheet.defaultProps = {
  onOnScroll: onScroll => null,
  maxHeight: 100,
  refreshing: false,
  onRefresh: () => null,
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
};

Object.assign(
  TensionSheet.prototype,
  require('react-timer-mixin'),
);

export default TensionSheet;
