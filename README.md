# 列表浏览埋点上报解决方案实现

## 埋点简介

### 什么是数据埋点

所谓“埋点”就是一种数据采集的方式，是数据采集领域的术语，指的是针对特定用户行为或时间进行捕获、处理和发送相关技术及其实施过程。目前常见的前端埋点方法主要分为三种：代码埋点、可视化埋点和无痕埋点，而本次想要分分享的列表浏览埋点上报解决方案则为代码埋点的一个应用场景。

### 应用场景

最近在项目开发过程中，遇到这么一个埋点需求：给商品瀑布流添加浏览数据埋点，当用户浏览滚动浏览商品瀑布流并停留时，上报所有完整出现在用设备窗口上的商品列表数据埋点，当再次浏览到当前商品时，过滤掉已上报过的商品后继续上报数据埋点。

## 实现方案

对于这个产品需求，我们不应该考虑它的实现意义何在，而是首先研讨可行的实现方案，当然这仅仅本人个人的小小的发牢骚，请大家不要介意，下面进入正题，对此需求，最终的确定下来实现方案如下：

1. 监听页面滚动停留
2. 计算出停留窗口内的商品列表
3. 上报过滤后的商品列表数据

### 1. 监听屏幕停留

我们都知道，浏览器并没有提供监听屏幕滚动停留的事件，那么如何才能实现监听屏幕滚动停留呢？方法其实很简单，就是通过监听屏幕滚动事件执行回调函数，通过这个回调函数通过节流的方式触发真正的屏幕停留回调函数。

但是，通过监听屏幕滚动节流的方式会存在一种缺陷，就是当用户滚动停留时并且在节流时间尚未到就切换页面窗口时，依然会上报埋点。所以，需要同时监听页面隐藏事件触发清除屏幕停留回调的计时器，监听页面显示事件触发重新创建屏幕回调的计时器，这样，才能保证数据上报的准确性。

由于该项目是基于Vue实现的，因此为了埋点方案代码的可复用性，我们采用mixin的逻辑复用方式，显现代码如下：

```js
// page-event.js
import Vue from 'vue';

export default Vue.extend({
  methods: {
    /**
     * 页面显示hook
     * 从其他窗口切换到当前页面触发执行
     * @param {function} callback 
     */
    onShow(callback) {
      const handler = () => {
        if (document.visibilityState === 'visible') {
          callback && callback();
        }
      };
      document.addEventListener('visibilitychange', handler);
      this.$once('hook:beforeDestroy', () => {
        document.removeEventListener('visibilitychange', handler);
      });
    },
    /**
     * 页面隐藏hook
     * 从当前页面切换到其他页面触发执行
     * @param {function} callback 
     */
    onHide(callback) {
      const handler = () => {
        if (document.visibilityState === 'hidden') {
          callback && callback();
        }
      };
      document.addEventListener('visibilitychange', handler);
      this.$once('hook:beforeDestroy', () => {
        document.removeEventListener('visibilitychange', handler);
      });
    },
    /**
     * 页面滚动hook
     * 当发页面滚动时触发执行
     * @param {function} callback 
     */
    onPageScroll(callback) {
      const handler = () => {
        callback && callback();
      }
      document.addEventListener('scroll', handler);
      this.$once('hook:beforeDestroy', () => {
        document.removeEventListener('scroll', handler);
      });
    },
  },
});


// stay-screen.js
import Vue from 'vue';
import pageEvent from './page-event';

export default Vue.extend({
  mixins: [
    pageEvent
  ],
  data() {
    return {
      stayStarted: false,
      stayShow: false,
      stayPaused: false,
      stayTimeoutId: null,
      stayTime: 1000,
      stayScreenCallback: null, // 屏停留执行回调
    }
  },
  created() {
    this.onShow(this.stayOnShow);
    this.onHide(this.stayOnHide);
    this.onPageScroll(this.stayOnScroll);
  },
  methods: {
    /**
     * 开始页面滚动后计算页面停留
     * stayTime时间过后，触发停留执行回调
     * 默认开始不触发屏幕停留计算
     */
    startStay() {
      if (!this.stayStarted) {
        return;
      }
      this.stayTimeoutId = setTimeout(() => {
        this.stayTimeoutId = null;
        if (this.stayScreenCallback) {
          this.stayScreenCallback();
        }
      }, this.stayTime);
    },
    /** 暂停计算页面停留 */
    pauseStay() {
      if (!this.stayStarted) {
        return;
      }
      this.stayPaused = true;
      this.clearStay();
    },
    /** 继续计算页面停留 */
    continueStay() {
      if (!this.stayStarted || !this.stayShow) {
        return;
      }
      if (this.stayPaused) {
        this.stayPaused = false;
        this.startStay();
      }
    },
    /** 重新计算页面停留 */
    restartStay() {
      if (!this.stayStarted || !this.stayShow) {
        return;
      }
      this.clearStay();
      this.startStay();
    },
    /** 清除计算页面停留 */
    clearStay() {
      if (this.stayTimeoutId) {
        clearTimeout(this.stayTimeoutId);
        this.stayTimeoutId = null;
      }
    },
    /**
     * 初始化计算停留
     * 执行触发开始计算页面停留
     */
    stayInit() {
      if (!this.stayStarted) {
        this.stayStarted = true;
        this.stayShow = true;
        this.startStay();
      }
    },
    /** 滚动刷新计算页面停留 */
    stayOnScroll() {
      this.restartStay();
    },
    /** 页面显示时继续计算页面停留 */
    stayOnShow() {
      this.stayShow = true;
      this.continueStay();
    },
    /** 页面隐藏时暂停计算页面停留 */
    stayOnHide() {
      this.stayShow = false;
      this.pauseStay();
    }
  }
});
```



### 2. 计算停留窗口商品列表

计算停留窗口内的商品信息，我们需要用到一个API方法`Element.getBoundingClientRect`，该方法返回元素的大小及其相对视口的位置。这样我们就能通过所有列表元素并计算其是否存在于视图窗口上，可是屏幕滚动事件太过于频繁，每次在屏幕停留后循环计算符合元素信息的计算方案似乎并不理想，有太多的没必要的重复计算。

优化方案：通过二分法计算视口上的首个列表元素和最后一个列表元素索引，通过索引截取所需列表元素然后上报，代码实现如下：

```js
// 部分代码
{
  /**
   * 获取视口内列表元素
   * @params
   * 		topHeight 视口顶部截取高度
   *		bottomHeight 视口底部截取高度
   *		gap 列表元素间隙
   */
  getScreenItems({ topHeight, bottomHeight, gap }) {
    const firstIndex = this.searchScreenFirstItem(topHeight, gap);
    const lastIndex = this.searchScreenLastItem(bottomHeight, gap);
    console.log(firstIndex, lastIndex);
    const screenItems = this.list.slice(firstIndex, lastIndex + 1);
    return screenItems;
  },
  /**
   * 获取首个在视口的列表元素
   */
  searchScreenFirstItem(topHeight, gap) {
    topHeight = topHeight || 0;
    gap = gap || 0;
    const clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
    const screeenTop = topHeight;
    // 列表元素ref
    const listItems = this.$refs.listItem;
    if (Array.isArray(listItems)) {
      let low = 0;
      let high = listItems.length - 1;
      let mid;
      while (low <= high) {
        mid = Math.floor((low + high) / 2);
        const itemRect = listItems[mid].getBoundingClientRect();
        if (itemRect.top + itemRect.height + gap < screeenTop) {
          low = mid + 1;
        } else if (itemRect.top > screeenTop) {
          high = mid - 1;
        } else {
          // 返回screenTop处于item元素高度之间的下一个元素索引
          // 当屏幕窗口大小小于元素高度时，返回当前元素索引
          return itemRect.height < clientHeight ? mid + 1 : mid;
        }
      }
    }
    return 0;
  },
  /**
   * 获取最后一个在视口的列表元素
   */
  searchScreenLastItem(bottomHeight, gap) {
    bottomHeight = bottomHeight || 0;
    gap = gap || 0;
    const clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
    const screenBottom = clientHeight - bottomHeight;
    const listItems = this.$refs.listItem;
    let len = 0;
    if (Array.isArray(listItems)) {
      len = listItems.length;
      let low = 0;
      let high = len - 1;
      let mid;
      while (low <= high) {
        mid = Math.floor((low + high) / 2);
        const itemRect = listItems[mid].getBoundingClientRect();
        if (itemRect.top + itemRect.height < screenBottom) {
          low = mid + 1;
        } else if (itemRect.top - gap > screenBottom) {
          high = mid - 1;
        } else {
          // 返回screenBottom处于item元素高度之间的上一个元素索引
          // 当屏幕窗口大小小于元素高度时，返回当前元素索引
          return itemRect.height < clientHeight ? mid - 1 : mid;
        }
      }
    }
    return len - 1;
  }
}
```



### 3. 埋点数据上报

有了前面的步骤，数据埋点上报就没什么值得说的了，无非就是监听屏幕停留，然后过滤出所需所需列表元素，然后把列表数据埋点给上报。

最终的整体代码实现可以到我的[github仓库](https://github.com/jackenl/stay-screen)查看，如果你觉得以上方案能够帮助到你，麻烦请给我点个star，在此万分感谢🙏！！！