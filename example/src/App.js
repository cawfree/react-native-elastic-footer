import React from 'react';
import {
  Animated,
  Image,
  ScrollView,
  Platform,
  View,
} from 'react-native';

import TensionSheet from './TensionSheet';

class App extends React.Component {
  constructor(nextProps) {
    super(nextProps);
    this.__onOnScroll = this.__onOnScroll.bind(this);
    this.__onRefresh = this.__onRefresh.bind(this);
    this.__onCancel = this.__onCancel.bind(this);
    this.state = {
      onScroll: null,
      refreshing: false,
      items: [
        { key: 'https://images.pexels.com/photos/206959/pexels-photo-206959.jpeg?auto=compress&cs=tinysrgb&h=750&w=1260'},
        { key: 'https://images.pexels.com/photos/1002543/pexels-photo-1002543.jpeg?auto=compress&cs=tinysrgb&h=750&w=1260' },
        { key: 'https://images.pexels.com/photos/1824354/pexels-photo-1824354.jpeg?auto=compress&cs=tinysrgb&h=750&w=1260' },
        { key: 'https://images.pexels.com/photos/1260296/pexels-photo-1260296.jpeg?auto=compress&cs=tinysrgb&h=750&w=1260' },
      ],
    };
  }
  __onOnScroll(onScroll) {
    this.setState(
      {
        onScroll,
      },
    );
  }
  __onCancel() {
    this.setState(
      {
        refreshing: false,
      },
    );
  }
  __onRefresh() {
    // XXX: You can just leave the TensionSheet open...
    return new Promise(resolve => this.setState({ refreshing: true }, resolve))
      // XXX: Or you can fetch data and programmatically close it once you're done.
      .then(() => new Promise(resolve => setTimeout(resolve, 1000)))
      .then(() => new Promise(resolve => this.setState({
        items: [
          { key: 'https://images.pexels.com/photos/37547/suit-business-man-business-man-37547.jpeg?auto=format%2Ccompress&cs=tinysrgb&h=750&w=1260' },
          ...this.state.items,
        ],
        refreshing: false,
      }, resolve)))
      .then(() => {
        const { scrollView } = this.refs;
        scrollView.scrollTo(
          {
            x: 0,
            y: 0,
            animated: true,
          },
        );
      });
  }
  render() {
    const {
      onScroll,
      refreshing,
      items,
    } = this.state;
    return (
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
        }}
      >
        <ScrollView
          ref="scrollView"
          onScroll={onScroll}
          style={{
            flexDirection: 'row',
          }}
          scrollEventThrottle={0.1}
        >
          {items.map(({ key }) => (
            <Image
              key={key}
              style={{
                width: 500,
                height: 500,
              }}
              source={{ uri: key }}
            />
          ))}
          <TensionSheet
            maxHeight={150}
            onOnScroll={this.__onOnScroll}
            onRefresh={this.__onRefresh}
            onCancel={this.__onCancel}
            refreshing={refreshing}
          >
            {({ animValue, refreshing }) => (
              <Animated.View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  overflow: 'hidden',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: animValue
                    .interpolate(
                      {
                        inputRange: [0, 1],
                        outputRange: ['#005542', '#a1dd70'],
                      },
                    ),
                }}
              >
                <Animated.Image
                  style={{
                    opacity: Animated.add(0.5, animValue),
                    width: 70,
                    height: 70,
                    transform: [
                      { scale: Animated.add(1, animValue) },
                    ],
                  }}
                  source={{ uri: 'https://applehospitalityreit.com/wp-content/uploads/2018/10/apple-white.png' }}
                />
              </Animated.View>
            )}
          </TensionSheet>
        </ScrollView>
      </View>
    );
  }
}

let hotWrapper = () => () => App;
if (Platform.OS === 'web') {
  const { hot } = require('react-hot-loader');
  hotWrapper = hot;
}
export default hotWrapper(module)(App);
