import React, { Component } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
  Platform,
  ScrollView,
  Animated,
  Image,
} from 'react-native';
import ElasticFooter from './ElasticFooter';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flexDirection: 'row',
  },
  image: {
    flex: 0,
    height: 200,
  },
});

class App extends Component {
  constructor(nextProps) {
    super(nextProps);
    this.__handleOnScroll = this.__handleOnScroll.bind(this);
    this.__onRefresh = this.__onRefresh.bind(this);
    this.__onRefreshComplete = this.__onRefreshComplete.bind(this);
    this.state = {
      onScroll: null,
      refreshing: false,
      items: [
        { key: 'Bruised Banana', uri: 'https://images.pexels.com/photos/1166648/pexels-photo-1166648.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
        { key: 'Lonely Apple', uri: 'https://images.pexels.com/photos/533343/pexels-photo-533343.jpeg?auto=compress&cs=tinysrgb&h=750&w=1260' },
        { key: 'Depressed Grapefruit', uri: 'https://images.pexels.com/photos/2247211/pexels-photo-2247211.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
        { key: 'Sweating Orange', uri: 'https://images.pexels.com/photos/67867/orange-falling-water-splash-67867.jpeg?auto=compress&cs=tinysrgb&h=750&w=1260' },
        { key: 'Abused Peach', uri: 'https://images.pexels.com/photos/784145/pexels-photo-784145.jpeg?auto=compress&cs=tinysrgb&h=750&w=1260' },
        { key: 'Ambiguous Melon', uri: 'https://images.pexels.com/photos/59970/background-food-fresh-fruit-59970.jpeg?auto=compress&cs=tinysrgb&h=750&w=1260' },
      ],
    };
  }
  __handleOnScroll(onScroll) {
    this.setState(
      {
        onScroll,
      },
    );
  }
  __onRefresh() {
    return new Promise(resolve => this.setState({ refreshing: true }, resolve))
      .then(() => new Promise(resolve => setTimeout(resolve, 1000)))
      .then(() => new Promise(resolve => this.setState({
        items: [
          { key: Math.random(), uri: 'https://images.pexels.com/photos/461337/pexels-photo-461337.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
          ...this.state.items,
        ],
        refreshing: false,
      }, resolve)))
      .then(() => new Promise(resolve => this.setState({ refreshing: false }, resolve)))
      .then(this.__onRefreshComplete);
  }
  __onRefreshComplete() {
    const { scrollView } = this.refs;
    scrollView
      .scrollTo(
        {
          x: 0,
          y: 0,
          animated: true,
        },
      );
  }
  render() {
    const {
      onScroll,
      refreshing,
      items,
    } = this.state;
    return (
      <View
        style={styles.container}
      >
        <ScrollView
          ref="scrollView"
          pointerEvents={refreshing ? 'none' : 'auto'}
          onScroll={onScroll}
          overScrollMode="always"
          alwaysBounceVertical
          scrollEventThrottle={0.1}
          style={styles.scrollView}
        >
          {items.map(({ key, uri }) => (
            <Image
              key={key}
              style={styles.image}
              source={{ uri }}
            />
          ))}
          <View
            style={{
              width: 400,
              flexDirection: 'row',
            }}
          >
            <ElasticFooter
              maxHeight={300}
              handleOnScroll={this.__handleOnScroll}
              refreshing={refreshing}
              onRefresh={this.__onRefresh}
            >
              {({ animValue, refreshing }) => (
                <Animated.View
                  style={{
                    overflow: 'hidden',
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: animValue
                      .interpolate(
                        {
                          inputRange: [0, 1],
                          outputRange: ['#f2f4d1', '#58b368'],
                        },
                      ),
                  }}
                >
                  <Animated.View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <Animated.View
                      style={{
                        width: 75,
                        height: 75,
                        marginRight: 15,
                        paddingTop: Animated.multiply(
                          Animated.add(-1, animValue),
                          20,
                        ),
                      }}
                    >
                      <Animated.Image
                        style={{
                          width: 75,
                          height: 75,
                          marginRight: 15,
                        }}
                        source={{ uri: 'https://flaticons.net/gd/makefg.php?i=icons/Food/Fruit-Apple.png&r=255&g=255&b=255' }}
                      />
                      <Animated.View
                        style={{
                          position: 'absolute',
                          opacity: refreshing ? animValue : 0.0,
                          top: 0,
                          left: 0,
                          bottom: 0,
                          right: 0,
                          alignItems: 'center',
                          paddingTop: 38,
                        }}
                      >
                        <ActivityIndicator
                        />
                      </Animated.View>
                    </Animated.View>
                  </Animated.View>
                </Animated.View>
              )}
            </ElasticFooter>
          </View>
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
