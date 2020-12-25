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
      stayScreenCallback: null,
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
})