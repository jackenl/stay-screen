<template>
  <div class="index-container">
    <ul class="list-group">
      <li class="list-item" v-for="index in len" :key="index">
        <span>{{ index }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
import stayScreenMixin from '@/mixin/stay-screen';

export default {
  mixins: [
    stayScreenMixin,
  ],
  data() {
    return {
      len: 100
    }
  },
  created() {
    this.stayScreenCallback = this.stayScreenhandler;
    this.stayInit();
  },
  methods: {
    stayScreenhandler() {
      console.log('stayScreen');
    }
  },
}
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
