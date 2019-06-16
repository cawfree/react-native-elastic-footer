# react-native-elastic-footer
A React Native ScrollView footer with a little give.

Compatible with [React Native Web](https://github.com/necolas/react-native-web).

## 🚀 Getting Started
Using [npm](https://www.npmjs.com/package/@cawfree/react-native-elastic-footer):

```bash
npm install --save @cawfree/react-native-elastic-footer
```

Using [yarn](https://www.npmjs.com/package/@cawfree/react-native-elastic-footer):

```bash
yarn add @cawfree/react-native-elastic-footer
```

## ✍️ Example
In the example below, we show how to use the `<ElasticFooter/>` to drive a dynamic update on the enclosing `<ScrollView/>`.

```javascript
import React from 'react';
import {
  Animated,
  Image,
  ScrollView,
  Platform,
  View,
  StyleSheet,
} from 'react-native';

import ElasticFooter from './ElasticFooter';

const styles = StyleSheet.create(
  {
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
    },
    scrollView: {
      flexDirection: 'row',
    },
    image: {
      width: 500,
      height: 500,
    },
    footer: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
    },
    icon: {
      width: 70,
      height: 70,
    },
  },
);

class App extends React.Component {
  constructor(nextProps) {
    super(nextProps);
    this.__onHandleMixins = this.__onHandleMixins.bind(this);
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
  __onHandleMixins(onScroll) {
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
    // XXX: You can just leave the ElasticFooter open...
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
        style={styles.container}
      >
        <ScrollView
          ref="scrollView"
          onScroll={onScroll}
          style={styles.scrollView}
          scrollEventThrottle={0.1}
        >
          {items.map(({ key }) => (
            <Image
              key={key}
              style={styles.image}
              source={{ uri: key }}
            />
          ))}
          <ElasticFooter
            maxHeight={150}
            onHandleMixins={this.__onHandleMixins}
            onRefresh={this.__onRefresh}
            onCancel={this.__onCancel}
            refreshing={refreshing}
          >
            {({ animValue, refreshing }) => (
              <Animated.View
                style={[
                  styles.footer,
                  {
                    backgroundColor: animValue
                      .interpolate(
                        {
                          inputRange: [0, 1],
                          outputRange: ['#005542', '#a1dd70'],
                        },
                      ),
                  },
                ]}
              >
                <Animated.Image
                  style={[
                    styles.icon,
                    {
                      opacity: Animated.add(0.5, animValue),
                      transform: [
                        { scale: Animated.add(1, animValue) },
                      ],
                    },
                  ]}
                  source={{ uri: 'https://applehospitalityreit.com/wp-content/uploads/2018/10/apple-white.png' }}
                />
              </Animated.View>
            )}
          </ElasticFooter>
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
```

## 📜 Prop Types
| Name           | Type     | Required | Default Value                      | Description                                                                                                                                            |
|----------------|----------|----------|------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------|
| onHandleMixins | func     | false    | onScroll => null                   | Supplies a callback method which needs to be dispatched to the enclosing <ScrollView/>'s onScroll prop.                                                |
| maxHeight      | number   | false    | 100                                | Defines the size of the ElasticFooter when fully opened.                                                                                               |
| refreshing     | bool     | false    | false                              | Defines whether the ElasticFooter is expanded.                                                                                                         |
| onRefresh      | func     | false    | () => null                         | Called when the user has dragged the ElasticFooter to the maxHeight, signifying that they wish to refresh.                                             |
| onCancel       | func     | false    | () => null                         | Called when the user has began to expand the ElasticFooter but bailed out before reaching the maxHeight.                                               |
| duration       | number   | false    | 300                                | The duration for open/close animations.                                                                                                                |
| debounce       | number   | false    | 120                                | The amount of time to wait before processing scroll events. Warning: You must choose a debounce value which is sufficient for your animation duration. |
| children       | function | false    | ({ animValue, refreshing }) => ... | A function which accepts the animated value animValue, which varies from 0 -> 1, and is an indicator of the percentage of expansion.                   |

## ✌️ License
[MIT](https://opensource.org/licenses/MIT)
