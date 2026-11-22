<template>
  <div class="collectionView-wrapper">
    <ul class="collectionView-wrapper-ul">
      <li v-for="(item, index) in this.dataArr" :key="index" class="itemWrapper">
        <span :class="getPlatformTagClass(item.platform)"
              class="appItem-platform"></span>
        <img class="appItem-icon" v-if="item.icon" :src="getIcon(item)" @click="gotoAppDetail(item)">

        <div class="appItem-info">
          <div class="appItem-info-namewrapper">
            <p class="nowrap" @click="gotoAppDetail(item)">{{ item.appName }}</p>
          </div>
          <table class="appItem-info-table">
            <tbody>
            <tr>
              <td class="appItem-info-title">短链接:</td>
              <td>
                <div class="appItem-info-appInfo nowrap" v-html="getShortUrl(item)"></div>
              </td>
            </tr>
            <tr>
              <td class="appItem-info-title">PackageName:</td>
              <td>
                <div class="appItem-info-appInfo nowrap">{{ item.bundleId }}</div>
              </td>
            </tr>
            <tr>
              <td class="appItem-info-title">当前版本:</td>
              <td>
                <div class="appItem-info-appInfo nowrap" v-html="getCurrentVersion(item)"></div>
              </td>
            </tr>
            </tbody>
          </table>
        </div>

        <button class="preview button-style-border" @click="clickPreviewBtn(item)">
          <i class="icon-ic_overview"></i>
          <span>预览</span>
        </button>
        <button class="editor button-style-border" @click="clickEditorBtn(item)">
          <i class="icon-ic_edit"></i>
          <span>编辑</span>
        </button>
      </li>
    </ul>
  </div>
</template>

<script type="text/ecmascript-6">
import { useRouter } from "vue-router";

export default {
  props: {
    // 每排的间距
    minimumLineSpacing: {
      type: Number
    },
    // 每列的间距
    minimumInteritemSpacing: {
      type: Number
    },
    dataArr: {
      type: Array
    }
  },
  data() {
    return {}
  },
  computed: {},
  created() {
    this.router = useRouter()
  },
  methods: {
    gotoAppDetail(item) {
      this.$emit('gotoAppDetail', item)
    },
    getPlatformTagClass(platform) {
      if (platform === 'ios') {
        return 'appItem-platform-ios'
      } else if (platform === 'harmony') {
        return 'appItem-platform-harmony'
      } else {
        return 'appItem-platform-android'
      }
    },
    getIcon(item) {
      return `${ this.axios.defaults.baseURL }${ item.icon }`
    },
    getShortUrl(item) {
      return `${ this.axios.defaults.baseURL }${ item.shortUrl }`
    },
    getCurrentVersion(item) {
      // 优先使用 currentVersion，如果不存在则使用 releaseVersionCode 作为后备
      if (item.currentVersion) {
        return item.currentVersion
      }
      // 如果 releaseVersionCode 存在，显示它
      if (item.releaseVersionCode) {
        return item.releaseVersionCode
      }
      // 如果都不存在，显示空或提示
      return '-'
    },
    clickEditorBtn(item) {
      this.$emit('gotoAppDetail', item)
    },
    clickPreviewBtn(item) {
      const { href } = this.router.resolve({
        name: 'AppPreView',
        path: '/',
        params: { 'id': item.shortUrl }
      })
      window.open(href, '_blank')
    }
  }
}
</script>

<style lang="scss">
@use "../../common/scss/base" as *;

.collectionView-wrapper {
  width: 100%;
}

.collectionView-wrapper-ul {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(264px, 1fr));
  gap: 20px;
  padding: 0;
  width: 100%;
}

.collectionView-wrapper .itemWrapper {
  position: relative;
  padding-bottom: 24px;
  background-color: white;
  width: 100%;
  max-width: 264px;
  margin: 0 auto;
  text-align: center;
  border-radius: 4px;
  transition: 0.5s;
}

.itemWrapper:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, .1);
}

.itemWrapper:hover .appItem-info-namewrapper p {
  color: #000;
}

.collectionView-wrapper .itemWrapper .appItem-platform {
  position: absolute;
  left: -2px;
  top: 24px;
  width: 52px;
  height: 38px;
  background-size: 52px 38px;
}

.collectionView-wrapper .itemWrapper .appItem-platform-ios {
  background-image: url("../../common/assets/tag_ios.png");
}

.collectionView-wrapper .itemWrapper .appItem-platform-android {
  background-image: url("../../common/assets/tag_android.png");
}

.collectionView-wrapper .itemWrapper .appItem-platform-harmony {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='52' height='38' viewBox='0 0 52 38'><path d='M0 0h46a6 6 0 0 1 6 6v26a6 6 0 0 1-6 6H0V0z' fill='%23007DFF'/><text x='24' y='23' font-family='sans-serif' font-size='8' font-weight='bold' fill='white' text-anchor='middle'>Harmony</text></svg>");
}

.itemWrapper .appItem-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  margin-top: 24px;
  cursor: pointer;
}

.itemWrapper .appItem-info {
  margin-top: 24px;
  overflow: hidden;
}

.appItem-info-namewrapper p {
  font-size: 18px;
  cursor: pointer;
  display: inline-block;
  color: $mainTitleColor;
  font-family: "PingFang SC";
  vertical-align: top;
}

.appItem-info-namewrapper p:hover {
  color: #000;
}

.appItem-info-table {
  width: 100%;
  table-layout: fixed;
  margin-top: 24px;
}

.appItem-info-title {
  font-size: 10px;
  color: #999;
  text-align: right;
  padding-right: 10px;
  width: 40%;
  height: 25px;
}

.appItem-info-appInfo {
  font-size: 10px;
  color: #333;
  max-width: 100%;
  line-height: 25px;
  text-align: left;
}

.collectionView-wrapper-ul .itemWrapper button {
  width: 36px;
  height: 36px;
  margin-top: 36px;
  float: right;
  border-color: #ccc;
  position: relative;
  overflow: hidden;
}

.collectionView-wrapper-ul .itemWrapper button i:before {
  color: #aaa;
}

.collectionView-wrapper-ul .itemWrapper button span {
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  line-height: 36px;
  background-color: white;
  opacity: 0;
}

.collectionView-wrapper-ul .itemWrapper button:hover {
  border-color: $mainColor;
}

.collectionView-wrapper-ul .itemWrapper button span:hover {
  opacity: 1;
}

.collectionView-wrapper-ul .itemWrapper .editor {
  margin-right: 12px;
}

.collectionView-wrapper-ul .itemWrapper .preview {
  margin-right: 24px;
}

@media screen and (max-width: 768px) {
  .collectionView-wrapper-ul {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .collectionView-wrapper .itemWrapper {
    max-width: 100%;
    display: grid;
    grid-template-columns: 52px minmax(0, 1fr) auto;
    grid-template-rows: auto auto;
    align-items: center;
    column-gap: 12px;
    row-gap: 6px;
    padding: 12px;
    text-align: left;
    border-radius: 8px;
    box-sizing: border-box;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  }

  .itemWrapper:hover {
    transform: none;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  }

  .collectionView-wrapper .itemWrapper .appItem-platform {
    top: 6px;
    left: -2px;
    width: 32px;
    height: 23px;
    background-size: 32px 23px;
    z-index: 1;
  }

  .itemWrapper .appItem-icon {
    grid-column: 1;
    grid-row: 1 / span 2;
    width: 52px;
    height: 52px;
    border-radius: 12px;
    margin-top: 0;
  }

  .itemWrapper .appItem-info {
    grid-column: 2;
    grid-row: 1 / span 2;
    margin-top: 0;
    min-width: 0;
  }

  .appItem-info-namewrapper p {
    display: block;
    font-size: 15px;
    font-weight: 600;
    line-height: 20px;
  }

  .appItem-info-table {
    margin-top: 4px;
  }

  .appItem-info-title {
    width: 74px;
    height: 18px;
    line-height: 18px;
    font-size: 11px;
    text-align: left;
    padding-right: 4px;
  }

  .appItem-info-appInfo {
    line-height: 18px;
    font-size: 11px;
  }

  .collectionView-wrapper-ul .itemWrapper button {
    float: none;
    width: auto;
    min-width: 56px;
    height: 28px;
    margin-top: 0;
    padding: 0 10px;
    border-radius: 14px;
    border-color: $mainColor;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 3px;
    font-size: 12px;
  }

  .collectionView-wrapper-ul .itemWrapper button i {
    font-size: 12px;
  }

  .collectionView-wrapper-ul .itemWrapper button i:before {
    color: $mainColor;
  }

  .collectionView-wrapper-ul .itemWrapper button span {
    position: static;
    width: auto;
    height: auto;
    line-height: 1;
    background-color: transparent;
    opacity: 1;
  }

  .collectionView-wrapper-ul .itemWrapper .preview {
    grid-column: 3;
    grid-row: 1;
    margin-right: 0;
  }

  .collectionView-wrapper-ul .itemWrapper .editor {
    grid-column: 3;
    grid-row: 2;
    margin-right: 0;
  }
}
</style>
