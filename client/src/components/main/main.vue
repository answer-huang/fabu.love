<template>
  <div class="main">
    <div
      v-if="mobileMenuOpen"
      class="mobile-menu-mask"
      @click="mobileMenuOpen = false"
    ></div>
    <el-container class="main-container">
      <el-aside
        class="side-menu"
        :class="{ 'mobile-open': mobileMenuOpen }"
        width="192px"
      >
        <mainNav></mainNav>
      </el-aside>
      <el-container class="main-right-container">
        <el-header class="main-header">
          <headerNav></headerNav>
        </el-header>
        <el-main class="main-contentWrapper">
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>

    <!--用户信息-->
    <userInfo v-if="this.showUserInfo"></userInfo>
    <!--消息列表-->
    <userMessage v-if="this.showUserMessage"></userMessage>
  </div>
</template>

<script type="text/ecmascript-6">
  import MainNav from './mainNav.vue'
  import HeaderNav from './headerNav.vue'
  import FooterWrapper from './footerWrapper.vue'
  import UserInfo from '../user/userInfo.vue'
  import UserMessage from '../user/userMessage.vue'

  export default {
    data() {
      return {
        showUserInfo: false,
        showUserMessage: false,
        mobileMenuOpen: false
      }
    },
    components: {
      MainNav, HeaderNav, FooterWrapper, UserInfo, UserMessage
    },
    created() {
      this.bus.on('showUserInfo', () => {
        this.showUserInfo = true
      })
      this.bus.on('hiddenUserInfo', () => {
        this.showUserInfo = false
      })
      this.bus.on('showUserMessage', () => {
        this.showUserMessage = true
      })
      this.bus.on('hiddenUserMessage', () => {
        this.showUserMessage = false
      })
      this.bus.on('toggleMobileMenu', () => {
        this.mobileMenuOpen = !this.mobileMenuOpen
      })
      this.bus.on('closeMobileMenu', () => {
        this.mobileMenuOpen = false
      })
    },
    destroyed() {
      this.bus.off('showUserInfo')
      this.bus.off('hiddenUserInfo')
      this.bus.off('showUserMessage')
      this.bus.off('hiddenUserMessage')
      this.bus.off('toggleMobileMenu')
      this.bus.off('closeMobileMenu')
    },
    methods: {}
  }
</script>

<style lang="scss">
  @use "../../common/scss/base" as *;

  .main .mobile-menu-mask {
    display: none;
  }

  .main .main-container {
    position: absolute;
    width: 100%;
    height: 100%;
  }

  .main .main-container .side-menu {
    background-color: white;
  }

  .main .main-header {
    background-color: white;
    height: 72px !important;
    border-bottom: solid 1px #D5DFED;
    min-width: 722px;
  }

  .main .main-contentWrapper {
    padding: 0 24px;
    min-width: 722px;
    padding-bottom: 60px;
  }

  .main .main-contentWrapper:after {
    display: inline-block;
    font-size: 14px;
    color: $subTitleColor;
    width: 100%;
    height: 100px;
    text-align: center;
    line-height: 100px;
  }

  @media screen and (max-width: 768px) {
    .main .mobile-menu-mask {
      display: block;
      position: fixed;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.35);
      z-index: 1000;
    }

    .main .main-container .side-menu {
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      z-index: 1001;
      transform: translateX(-100%);
      transition: transform 0.25s ease;
    }

    .main .main-container .side-menu.mobile-open {
      transform: translateX(0);
      box-shadow: 4px 0 16px rgba(0, 0, 0, 0.12);
    }

    .main .main-right-container {
      width: 100%;
      min-width: 0;
    }

    .main .main-header {
      min-width: 0;
      width: 100%;
      height: 54px !important;
      padding: 0 12px;
      box-sizing: border-box;
    }

    .main .main-contentWrapper {
      min-width: 0;
      width: 100%;
      padding: 0 12px 56px 12px;
      box-sizing: border-box;
    }

    .main .main-contentWrapper:after {
      height: 40px;
      line-height: 40px;
    }
  }
</style>
