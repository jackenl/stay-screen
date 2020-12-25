<template>
  <!-- 浏览埋点上报应用 -->
  <div class="point-collect-container">
    <ul class="list-group">
      <li class="list-item" ref="listItem" v-for="index in list" :key="index">
        <span>{{ index }}</span>
      </li>
      <load-more :status="loadingStatus" @loadMore="loadMore"></load-more>
    </ul>
  </div>
</template>

<script>
import stayScreenMixin from '@/mixin/stay-screen';
import LoadMore from '@/components/loadMore';

export default {
  mixins: [stayScreenMixin],
  components: {
    LoadMore
  },
  data() {
    return {
      list: [],
      loadingStatus: 'more',
      collectedList: [],
      offset: 10,
    };
  },
  created() {
    this.stayScreenCallback = this.stayScreenHandler;
    this.stayInit();
    // 下拉加载更多
    this.onPageScroll(this.onPullDownFresh);
  },
  mounted() {
    this.loadMore();
  },
  methods: {
    /** 下拉刷新 */
    onPullDownFresh() {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
      const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
      if (scrollHeight - (scrollTop + clientHeight) <= this.offset) {
        this.loadMore();
      }
    },
    loadMore() {
      this.loadingStatus = 'loading';
      setTimeout(() => {
        const len = this.list.length;
        for (let i = 0; i < 10; i++) {
          this.list.push(len + i);
        }
        this.loadingStatus = 'more';
      }, 1000);
    },
    stayScreenHandler() {
      const screenItems = this.getScreenItems();
      screenItems.forEach((item) => {
        // 检测是否已经上报过
        const index = this.collectedList.indexOf(item);
        if (index === -1) {
          console.log('埋点上报：', item);
          this.collectedList.push(item);
        }
      })
    },
    getScreenItems() {
      const firstIndex = this.searchScreenFirstItem(0, 20);
      const lastIndex = this.searchScreenLastItem(0, 20);
      const screenItems = this.list.slice(firstIndex, lastIndex + 1);
      return screenItems;
    },
    /**
     * 获取首个在视图窗口item元素索引
     * @param {number} topHeight 头部遮挡高度
     * @param {number} gap item元素之间的间隙
     */
    searchScreenFirstItem(topHeight, gap) {
      topHeight = topHeight || 0;
      gap = gap || 0;
      const half = gap / 2;
      const listItems = this.$refs.listItem;
      if (Array.isArray(listItems)) {
        let low = 0;
        let high = listItems.length - 1;
        let mid;
        while (low <= high) {
          mid = Math.floor((low + high) / 2);
          const itemRect = listItems[mid].getBoundingClientRect();
          if (itemRect.top + itemRect.height + half < topHeight) {
            low = mid + 1;
          } else if (itemRect.top - half > topHeight) {
            high = mid - 1;
          } else {
            return mid;
          }
        }
        return 0;
      }
      return listItems ? 0 : -1;
    },
    /**
     * 获取最后一个在视图窗口item元素索引
     * @param {number} topHeight 尾部遮挡高度
     * @param {number} gap item元素之间的间隙
     */
    searchScreenLastItem(bottomHeight, gap) {
      bottomHeight = bottomHeight || 0;
      gap = gap || 0;
      const half = gap / 2;
      const scrollTop = document.documentElement.clientHeight || document.body.clientHeight;
      const scrollBottom = scrollTop - bottomHeight;
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
          if (itemRect.top + itemRect.height + half < scrollBottom) {
            low = mid + 1;
          } else if (itemRect.top - half > scrollBottom) {
            high = mid - 1;
          } else {
            return mid;
          }
        }
        return len - 1;
      }
      return listItems ? len - 1 : -1;
    },
  },
};
</script>

<style lang="less" scoped>
.list-group {
  padding: 20px;
}

.list-item {
  display: flex;
  align-items: center;
  height: 100px;
  padding: 20px;
  margin-bottom: 20px;
  box-sizing: border-box;
  border-radius: 10px;
  border: 1px solid #ccc;
}
</style>
