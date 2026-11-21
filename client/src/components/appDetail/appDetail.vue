<template>
  <div>
    <!--头部-->
    <appDetailHeader
      :appInfo="this.appInfo"
      v-show="this.appInfo._id"
    >
    </appDetailHeader>

    <!--移动端 应用概述 / 应用设置 切换入口-->
    <div class="mobile-app-tabs" v-show="appInfo._id">
      <button
        type="button"
        class="mobile-app-tab"
        :class="{ active: !showAppSetting }"
        @click="switchTab(false)"
      >
        <i class="icon-ic_appdes"></i>
        <span>应用概述</span>
      </button>
      <button
        type="button"
        class="mobile-app-tab"
        :class="{ active: showAppSetting }"
        @click="switchTab(true)"
      >
        <i class="icon-ic_appsetting-copy"></i>
        <span>应用设置</span>
      </button>
    </div>

    <appVersions
      v-show="!showAppSetting"
      v-if="appInfo._id"
      :appInfo="appInfo"
      :subTitleArr="subTitleArr"
      @updateAppInfoSuccess="updateAppInfoSuccess"
    >
    </appVersions>

    <appSetting
      v-if="showAppSetting"
      :appInfo="appInfo">
    </appSetting>
  </div>
</template>

<script type="text/ecmascript-6">
  import * as AppResourceApi from '../../api/moudle/appResourceApi'
  import { getUserTeam } from '../../mgr/userMgr'
  import AppDetailHeader from './appDetailHeader.vue'
  import AppVersions from './appVersions.vue'
  import AppSetting from './appSetting.vue'

  export default {
    data() {
      return {
        subTitleArr: ['', '', ''],
        userteam: {},
        appInfo: {},
        showAppSetting: false
      }
    },
    components: {
      AppDetailHeader, AppVersions, AppSetting
    },
    computed: {},
    destroyed() {
      this.bus.off('appSummary', this.handleAppSummary)
      this.bus.off('appSetting', this.handleAppSetting)
    },
    created() {
      this.$nextTick(() => {
        this.userteam = getUserTeam()
        this.getAppDetailData()
      })
      this.bus.on('appSummary', this.handleAppSummary)
      this.bus.on('appSetting', this.handleAppSetting)
    },
    methods: {
      handleAppSummary() {
        this.showAppSetting = false
      },
      handleAppSetting() {
        this.showAppSetting = true
      },
      switchTab(isSetting) {
        if (this.showAppSetting === isSetting) return
        this.showAppSetting = isSetting
        this.bus.emit(isSetting ? 'appSetting' : 'appSummary')
      },
      getAppDetailData() {
        AppResourceApi.getAppDetail(this.userteam._id, this.$route.params.appId).then((res) => {
          this.appInfo = res.data;
          this.subTitleArr = [];
          this.subTitleArr.push(this.appInfo.bundleId);
          this.subTitleArr.push(this.axios.defaults.baseURL + this.appInfo.shortUrl);
          this.subTitleArr.push(this.appInfo._id);
          this.bus.emit('appdetail', res.data.appName);
        }, reject => {
          this.$message.error(reject);
        })
      },
      updateAppInfoSuccess() {
        this.getAppDetailData()
      }
    }
  }
</script>

<style lang="scss">
  @use "../../common/scss/base" as *;

  .mobile-app-tabs {
    display: none;
  }

  @media screen and (max-width: 768px) {
    .mobile-app-tabs {
      display: flex;
      width: 100%;
      background-color: white;
      border-top: 1px solid #f0f2f7;
      border-radius: 0 0 8px 8px;
      margin-bottom: 10px;
      overflow: hidden;
    }

    .mobile-app-tab {
      flex: 1;
      height: 42px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      border: none;
      background-color: transparent;
      color: $subTitleColor;
      font-size: 14px;
      cursor: pointer;
      position: relative;
      padding: 0;
      font-family: inherit;
    }

    .mobile-app-tab i {
      font-size: 15px;
    }

    .mobile-app-tab.active {
      color: $mainColor;
      font-weight: 600;
    }

    .mobile-app-tab.active i:before {
      color: $mainColor;
    }

    .mobile-app-tab.active:after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 22%;
      right: 22%;
      height: 2px;
      border-radius: 2px;
      background-color: $mainColor;
    }
  }
</style>
