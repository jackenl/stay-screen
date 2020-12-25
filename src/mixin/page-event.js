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
