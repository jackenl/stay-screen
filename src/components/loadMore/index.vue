<template>
  <div class="no-more" :style="{ color: color }" @click="onClick">
    <i class="no-more_line" v-if='isShow'></i>
    <div class="no-more_text">
      <loading v-if="status === 'loading'" class="no-more_loading"></loading>
      <span>{{ text }}</span>
    </div>
    <i class="no-more_line" v-if="isShow"></i>
  </div>
</template>

<script>
import Loading from '../loading';

export default {
  name: 'loadMore',
  components: {
    Loading,
  },
  props: {
    // 状态，status=[more|loading|noMore]
    status: {
      type: String,
      default: 'more',
    },
    // 文本颜色
    color: {
      type: String,
      default: '#ccc',
    },
    // 显示文本,
    contentText: {
      type: Object,
      default: () => {
        return {
          contentDown: '上拉显示更多',
          contentRefresh: '正在加载',
          contentMoMore: '没有更多了',
        }
      }
    },
    // 是否显示
    isShow: {
      type: Boolean,
      default: true,
    }
  },
  computed: {
    text() {
      switch (this.status) {
        case 'more':
          return this.contentText.contentDown;
        case 'loading':
          return this.contentText.contentRefresh;
        case 'noMore':
          return this.contentText.contentMoMore;
        default:
          return '';
      }
    }
  },
  methods: {
    onClick() {
      // emit loadMore
      this.$emit('loadMore', {
        detail: {
          status: this.status,
        },
      });
    }
  }
}
</script>

<style lang="less" scoped>
.no-more {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 42px;
  margin: 0 16px;
  font-size: 10px;
  line-height: 10px;

  &_line {
    position: relative;
    display: flex;
    flex: 1;
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      width: 100%;
      height: 1px;
      background-color: #EDEDED;
      transform: translateY(-50%) scaleY(.5);
    }

    /*@media (-webkit-min-device-pixel-ratio: 1.5) and (-webkit-max-device-pixel-ratio: 2.49) {*/
      /*&::before {*/
        /*transform: translateY(-50%) scaleY(0.5);*/
      /*}*/
    /*}*/

    /*@media (-webkit-min-device-pixel-ratio: 2.5) {*/
      /*&::before {*/
        /*transform: translateY(-50%) scaleY(0.33333);*/
      /*}*/
    /*}*/
  }

  &_text {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 12px;
  }

  &_loading {
    margin-right: 4px;
  }
}
</style>
