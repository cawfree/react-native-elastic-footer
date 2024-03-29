import React from 'react';
import {
  Animated,
  Image,
  ScrollView,
  Platform,
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';

import ElasticFooter from './ElasticFooter';

const cardHeight = Platform.OS === 'web' ? 350 : 200;
const cardWidth = 0.85 * cardHeight;

const styles = StyleSheet.create(
  {
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      backgroundColor: 'black',
      flex: 1,
    },
    scrollView: {
      flexDirection: 'column',
      width: cardWidth,
    },
    image: {
      width: cardWidth,
      height: cardHeight,
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
        { key: 'https://magic.wizards.com/sites/mtg/files/images/card/en_5eDl5u25Hzm.png' },
        { key: 'https://magic.wizards.com/sites/mtg/files/images/card/en_WUdaayMnfL.png' },
        { key: 'https://magic.wizards.com/sites/mtg/files/images/card/QRay1SEQ9e.png' },
        { key: 'https://magic.wizards.com/sites/mtg/files/images/card/Tz0PAj1LTD_0.png' },
      ],
      animRotate: new Animated.Value(0),
    };
  }
  componentWillUpdate(nextProps, nextState) {
    const {
      refreshing,
      animRotate,
    } = nextState;
    if (refreshing && !this.state.refreshing) {
      animRotate.setValue(0);
      Animated.timing(
        animRotate,
        {
          toValue: 1,
          duration: 1000,
        },
      )
        .start();
    }
  }
  __onHandleMixins(onScroll) {
    this.setState(
      {
        onScroll,
      },
    );
  }
  __onCancel(contentHeight) {
    const { scrollView } = this.refs;
    scrollView
      .scrollTo(
        {
          x: 0,
          y: contentHeight - 10,
          animated: true,
        },
      );
    this.setState(
      {
        refreshing: false,
      },
    );
  }
  __onRefresh(contentHeight) {
    // XXX: You can just leave the ElasticFooter open...
    return new Promise(resolve => this.setState({ refreshing: true }, resolve))
      // XXX: Or you can fetch data and programmatically close it once you're done.
      .then(() => new Promise(resolve => setTimeout(resolve, 1000)))
      .then(() => new Promise(resolve => this.setState({
        items: [
          { key: 'https://media.wizards.com/2018/images/magic/GRN/callout/en_Z6I4dSYzkH.png' },
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
      animRotate,
    } = this.state;
    return (
      <View
        style={styles.container}
      >
        <ScrollView
          ref="scrollView"
          onScroll={onScroll}
          style={styles.scrollView}
          scrollEventThrottle={0.0001}
        >
          {items.map(({ key }) => (
            <Image
              key={key}
              style={styles.image}
              source={{ uri: key }}
            />
          ))}
          <ElasticFooter
            maxHeight={100}
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
                    backgroundColor: '#000000',
                  },
                ]}
              >
                <Animated.Image
                  style={[
                    styles.icon,
                    {
                      opacity: animValue,
                      transform: [
                        {
                          rotate: animRotate.interpolate(
                            {
                              inputRange: [0, 1],
                              outputRange: ['0deg', '360deg'],
                            },
                          ),
                        },
                      ],
                    },
                  ]}
                  source={{ uri: 'https://flaticons.net/gd/makefg.php?i=icons/Miscellaneous/Sword-03.png&r=255&g=255&b=255' }}
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
