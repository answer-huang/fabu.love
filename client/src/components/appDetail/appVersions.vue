<template>
  <div class="appVersion-wrapper">
    <div class="detail-header-bottom">
      <ul>
        <li v-for="(item, index) in this.headerOperationData" :key="index" class="itemwrapper">
          <div class="top">
            <p class="title">{{item}}</p>
          </div>
          <div class="subWrapper" v-if="appInfo._id">
            <p class="subtitle">{{subTitleArr[index]}}</p>
          </div>
        </li>
      </ul>
    </div>
    <div v-if="this.dataArr.length>0">
      <!--头部-->
      <div class="detail-content-top">
        <span style="margin-right: 6px" class="el-icon-tickets"></span>版本信息
        <div class="top-right" @click="setGrayVersion">
          <span class="icon-ic_greyfb" style="margin-right: 8px"></span>设置灰度版本
        </div>
      </div>
      <!--内容-->
      <el-table
        :data="dataArr"
        style="width: 100%;box-sizing: border-box"
        stripe
        class="version-table"
      >
        <el-table-column
          width="60"
          label=""
          class="version-table-one"
        >
          <template #default="scope">
            <span :class="getIconClass(scope.row)"></span>
          </template>
        </el-table-column>
        <el-table-column
          label="版本"
        >
          <template #default="scope">
            <p v-html="getVersion(scope.row)"></p>
          </template>
        </el-table-column>
        <el-table-column
          label="更新时间"
          width="150"
        >
          <template #default="scope">
            <p v-html="getCreatTime(scope.row.uploadAt)"></p>
          </template>
        </el-table-column>
        <el-table-column
          label="文件大小"
          width="120"
        >
          <template #default="scope">
            <p v-html="getAppSize(scope.row.size)"></p>
          </template>
        </el-table-column>
        <el-table-column
          label="下载次数"
          width="120"
        >
          <template #default="scope">
            <span style="color: #9B9B9B;display: inline-block" v-html="getAllowDownLoadCount(scope.row)"></span>
          </template>
        </el-table-column>
        <el-table-column
          prop="changelog"
          label="更新日志">
        </el-table-column>
        <el-table-column
          label="操作"
          width="200"
        >
          <template #default="scope">
            <button class="appversion-elButton" @click="releaseApp(scope.row)"><i class="icon-ic_overview"></i></button>
            <button class="appversion-elButton" @click="clickDownLoad(scope.row)"><i class="icon-ic_download"></i></button>
            <button class="appversion-elButton" @click="clickEditor(scope.row)"><i class="icon-ic_edit"></i></button>
            <button class="appversion-elButton" @click="clickDelete(scope.row)"><i class="icon-ic_delete"></i></button>
          </template>
        </el-table-column>
      </el-table>

      <!--移动端版本卡片列表-->
      <div class="mobile-version-list">
        <div
          v-for="(row, idx) in dataArr"
          :key="row._id || idx"
          class="mobile-version-card"
        >
          <div class="mobile-version-card-header">
            <div class="mobile-version-title">
              <span v-if="getIconClass(row)" :class="getIconClass(row)" class="mobile-version-status-icon"></span>
              <span class="mobile-version-str" v-html="getVersion(row)"></span>
              <span
                v-if="appInfo.releaseVersionId && appInfo.releaseVersionId === row._id"
                class="mobile-version-tag tag-release"
              >当前发布</span>
              <span
                v-else-if="appInfo.grayReleaseVersionId && appInfo.grayReleaseVersionId === row._id"
                class="mobile-version-tag tag-gray"
              >灰度版本</span>
            </div>
            <span class="mobile-version-time" v-html="getCreatTime(row.uploadAt)"></span>
          </div>
          <div class="mobile-version-meta">
            <span>大小：{{ getAppSize(row.size) }}</span>
            <span>下载次数：{{ getAllowDownLoadCount(row) }}</span>
          </div>
          <div v-if="row.changelog" class="mobile-version-changelog">
            更新日志：{{ row.changelog }}
          </div>
          <div class="mobile-version-actions">
            <button class="mobile-action-btn" @click="releaseApp(row)">
              <i class="icon-ic_overview"></i><span>发布</span>
            </button>
            <button class="mobile-action-btn" @click="clickDownLoad(row)">
              <i class="icon-ic_download"></i><span>下载</span>
            </button>
            <button class="mobile-action-btn" @click="clickEditor(row)">
              <i class="icon-ic_edit"></i><span>编辑</span>
            </button>
            <button class="mobile-action-btn btn-danger" @click="clickDelete(row)">
              <i class="icon-ic_delete"></i><span>删除</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="appversion-footerwrapper">
      <div class="totalwrapper">
        <div class="downloadwrapper">
          <i class="icon-ic_download_s"></i>
        </div>
        <p>总下载次数  {{this.appInfo.totalDownloadCount || 0}}</p>
        <div class="downloadCount"></div>
      </div>
      <div class="todaywrapper">
        <div class="downloadwrapper">
          <i class="icon-ic_download_s"></i>
        </div>
        <p v-html="getTodayCount()"></p>
        <div class="downloadCount"></div>
      </div>
    </div>

    <editorVersion
      v-if="this.showEditorVersion"
      @cancel="cancel"
      :versionInfo="this.versionInfo"
      :appInfo="this.appInfo"
      @updateSuccess="updateSuccess"
    ></editorVersion>
    <graySetting v-if="this.showGraySetting" @cancel="cancelGraySetting" @graySettingSuccess="graySettingSuccess" :versionList="this.dataArr" :appInfo="this.appInfo"></graySetting>
  </div>
</template>

<script type="text/ecmascript-6">
  import { useRouter } from "vue-router";
  import * as AppResourceApi from '../../api/moudle/appResourceApi'
  import {getUserTeam} from '../../mgr/userMgr'
  import EditorVersion from './editorVersion.vue'
  import GraySetting from './graySetting.vue'

  export default {
    props: {
      appInfo: {
        type: Object
      },
      subTitleArr: {
        type: Array
      }
    },
    components: {
      EditorVersion, GraySetting
    },
    data() {
      return {
        headerOperationData: ['Bundle ID', '下载地址', 'App Key'],
        dataArr: [],
        userteam: {},
        showEditorVersion: false,
        showGraySetting: false,
        versionInfo: {}
      }
    },
    computed: {
    },
    created() {
      this.$nextTick(() => {
        this.userteam = getUserTeam()
        this.getAppVersionListData()
      })

      this.bus.on('uploadSuccess', () => {
        this.getAppVersionListData()
      })

      this.router = useRouter()
    },
    destroyed() {
      this.bus.off('uploadSuccess')
    },
    methods: {
      getAppVersionListData() {
        AppResourceApi.getAppVersionList(this.userteam._id, this.appInfo._id, this.currentPage).then((res) => {
          this.dataArr = res.data
        }, reject => {

        })
      },
      // 下载应用
      clickDownLoad(item) {
        const a = document.createElement('a')
        let url = `${this.axios.defaults.baseURL}${item.downloadUrl}`
        a.setAttribute('href', url)
        a.click()
        fetch(url).then(response => {
          var reader = response.body.getReader()
          var headers = response.headers
          var totalLength = headers.get('Content-Length')
          var bytesReceived = 0
          var _this = this
          reader.read().then(function processResult(result) {
            if (result.done) {
              console.log('下载完成')
              AppResourceApi.downloadedCount(_this.appInfo._id, item._id).then(() => {
              }, reject => {
              })
              return
            }
            bytesReceived += result.value.length
            console.log(`progress: ${bytesReceived / totalLength * 100}%`)
            return reader.read().then(processResult)
          })
        })
      },
      clickEditor(item) {
        this.showEditorVersion = true
        item.appName = this.appInfo.appName
        this.versionInfo = item
      },
      clickPreview(item) {
        const {href} = this.router.resolve({
          name: 'AppPreView',
          path: '/',
          params: { 'id': this.appInfo.shortUrl }
        })
        window.open(href, '_blank')
      },
      clickDelete(item) {
        this.$confirm('确认删除？')
          .then(() => {
            AppResourceApi.deleteAppVersion(this.userteam._id, this.appInfo._id, item._id).then((res) => {
              this.$message.success('删除成功')
              var index = this.dataArr.indexOf(item)
              this.dataArr.splice(index, 1)
              console.log(this.dataArr)
            }, reject => {
              this.$message.error(reject)
            })
          }).catch(() => {})
      },
      // 发布应用
      releaseApp(item) {
        AppResourceApi.releaseApp(this.userteam._id, this.appInfo._id, item._id, item.versionCode, true).then((res) => {
          this.$message.success(res.message)

          this.appInfo.releaseVersionId = item._id

          this.getAppVersionListData()
        }, reject => {

        })
      },
      getCreatTime(date) {
        return new Date(date).toFormat()
      },
      getAppSize(size) {
        return `${(size / 1024 / 1024).toFixed(2)}M`
      },
      getDownLoadCount(count) {
        if (count) {
          return count
        } else {
          return 0
        }
      },
      getAllowDownLoadCount(item) {
        // 灰度版本
        if (this.appInfo.grayReleaseVersionId && this.appInfo.grayReleaseVersionId === item._id) {
          if (this.appInfo.grayStrategy && this.appInfo.grayStrategy.downloadCountLimit) {
            return `${item.downloadCount}/${this.appInfo.grayStrategy.downloadCountLimit}`
          } else {
            return `${item.downloadCount}/不限`
          }
        } else {
          return `${item.downloadCount}`
        }
      },
      cancel() {
        this.showEditorVersion = false
      },
      setGrayVersion() {
        this.showGraySetting = true
      },
      cancelGraySetting() {
        this.showGraySetting = false
      },
      updateSuccess() {
        this.$emit('updateAppInfoSuccess')
        this.getAppVersionListData()
      },
      // 灰度版本设置成功
      graySettingSuccess() {
        this.$emit('updateAppInfoSuccess')
        this.getAppVersionListData()
      },
      getIconClass(item) {
        // 灰度版本
        if (this.appInfo.grayReleaseVersionId && this.appInfo.grayReleaseVersionId === item._id) {
            return 'version-table-one-gray'
        } else if (this.appInfo.releaseVersionId && this.appInfo.releaseVersionId === item._id) {
          return 'version-table-one-lighting'
        }
      },
      getTodayCount() {
        if (this.appInfo.todayDownloadCount && new Date(this.appInfo.todayDownloadCount.date).toDateString() === new Date().toDateString()) {
          return `今日下载次数  ${this.appInfo.todayDownloadCount.count}`
        } else {
          return '今日下载次数  0'
        }
      },
      getVersion(item) {
        return `${item.versionStr}(${item.versionCode})`
      }
    }
  }
</script>

<style lang="scss">
  @use "../../common/scss/base" as *;

  .appVersion-wrapper .detail-header-bottom {
    background-color: white;
  }
  .appVersion-wrapper .detail-header-bottom .itemwrapper {
    display: inline-block;
    width: 33%;
    height: 108px;
    vertical-align: top;
  }
  .appVersion-wrapper .detail-header-bottom .itemwrapper .top {
    border-left: solid 4px $mainColor;
    width: 100%;
    height: 24px;
    margin-left: 24px;
    margin-top: 24px;
  }
  .appVersion-wrapper .detail-header-bottom .itemwrapper .top .title {
    font-size: 18px;
    line-height: 24px;
    margin-left: 8px;
    font-family: "PingFang SC";
    color: $mainTitleColor;
  }
  .appVersion-wrapper .detail-header-bottom .itemwrapper .subWrapper {
    margin-left: 36px;
    margin-top: 12px;
    height: 48px;
    width: calc(100% - 36px);
  }
  .appVersion-wrapper .detail-header-bottom .itemwrapper .subWrapper .subtitle {
    font-size: 14px;
    color: $subTitleColor;
    line-height: 16px;
    word-wrap: break-word;
    word-break: normal;
    user-select: text;
  }
  .detail-content-top {
    width: 100%;
    height: 48px;
    background-color: white;
    color: $mainTitleColor;
    font-size: 16px;
    line-height: 48px;
    margin-top: 10px;
    padding-left: 24px;
    box-sizing: border-box;
    border-bottom: solid 1px #eee;
  }
  .detail-content-top .top-right {
    float: right;
    margin-right: 36px;
    font-size: 12px;
    color: $mainColor;
  }
  .appVersion-wrapper .tabletitle {
    font-size: 12px;
    color: $subTitleColor;
    line-height: 16px;
  }
  .appVersion-wrapper .tablecontent {
    font-size: 12px;
    color: $mainTitleColor;
    line-height: 16px;
  }
  .appversion-elButton {
    width: 24px;
    height: 24px;
    font-size: 12px;
    border: solid 1px #aaa;
    color: #D5DFED;
    border-radius: 12px;
    margin-right: 6px;
    padding: 0;
    background-color: transparent;
  }
  .appversion-elButton:hover {
    border-color: $mainColor;
  }
  .appversion-elButton:hover i:before {
    color: $mainColor;
  }
  .appversion-elButton i {
    width: 24px;
    height: 24px;
    line-height: 24px;
  }
  .appversion-elButton i:before {
    color: #aaa;
  }
  .appVersion-wrapper .version-table {
  }
  .version-table-one-gray {
    display: inline-block;
    width: 18px;
    height: 16px;
    background-size: 18px 18px;
    background-image: url("../../common/assets/sign_grey.png");
  }
  .version-table-one-lighting {
    display: inline-block;
    width: 18px;
    height: 16px;
    background-size: 18px 18px;
    background-image: url("../../common/assets/sign_now.png");
  }
  .appVersion-wrapper .version-table .cell {
    text-align: center;
  }
  .appversion-footerwrapper {
    width: 100%;
    padding: 24px;
    background-color: white;
    font-size: 0px;
    display: flex;
    flex-direction: row;
    box-sizing: border-box;
    margin-top: 12px;
  }
  .appversion-footerwrapper .totalwrapper {
    width: 50%;
    height: 48px;
  }
  .appversion-footerwrapper .totalwrapper:after {
    content: '';
    display: inline-block;
    width: 1px;
    height: 72px;
    background-color: #eee;
    float: right;
    margin-top: -13px;
  }
  .appversion-footerwrapper .downloadwrapper {
    width: 48px;
    height: 48px;
    text-align: center;
    display: inline-block;
    background-color: #97DFF9;
  }
  .appversion-footerwrapper .downloadwrapper i {
    font-size: 15px;
    line-height: 48px;
  }
  .appversion-footerwrapper  p {
    display: inline-block;
    font-size: 16px;
    color: $mainTitleColor;
    margin-left: 24px;
    line-height: 48px;
  }
  .appversion-footerwrapper .downloadCount {
    font-size: 16px;
    color: $mainTitleColor;
    display: inline-block;
    margin-left: 80px;
  }
  .appversion-footerwrapper .todaywrapper {
    display: inline-block;
    width: 50%;
    height: 48px;
    padding-left: 24px;
  }
  .appversion-footerwrapper .todaywrapper .downloadwrapper {
    background-color: #D5DFED;
  }

  .mobile-version-list {
    display: none;
  }

  @media screen and (max-width: 768px) {
    .appVersion-wrapper .detail-header-bottom {
      border-radius: 8px;
      padding: 4px 12px;
      box-sizing: border-box;
    }

    .appVersion-wrapper .detail-header-bottom .itemwrapper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      height: auto;
      padding: 8px 0;
      border-bottom: 1px dashed #f0f2f7;
    }

    .appVersion-wrapper .detail-header-bottom .itemwrapper:last-child {
      border-bottom: none;
    }

    .appVersion-wrapper .detail-header-bottom .itemwrapper .top {
      width: auto;
      height: 18px;
      margin-left: 0;
      margin-top: 0;
      border-left: solid 3px $mainColor;
      flex-shrink: 0;
    }

    .appVersion-wrapper .detail-header-bottom .itemwrapper .top .title {
      font-size: 13px;
      line-height: 18px;
      margin-left: 6px;
    }

    .appVersion-wrapper .detail-header-bottom .itemwrapper .subWrapper {
      margin-left: 12px;
      margin-top: 0;
      height: auto;
      width: auto;
      flex: 1;
      min-width: 0;
      text-align: right;
    }

    .appVersion-wrapper .detail-header-bottom .itemwrapper .subWrapper .subtitle {
      font-size: 12px;
      line-height: 18px;
      word-break: break-all;
    }

    .detail-content-top {
      height: 42px;
      line-height: 42px;
      font-size: 14px;
      padding: 0 12px;
      border-radius: 8px 8px 0 0;
    }

    .detail-content-top .top-right {
      margin-right: 0;
    }

    .appVersion-wrapper .version-table {
      display: none;
    }

    .mobile-version-list {
      display: block;
      background-color: white;
      border-radius: 0 0 8px 8px;
      padding: 0 12px;
    }

    .mobile-version-card {
      padding: 12px 0;
      border-bottom: 1px solid #f0f2f7;
    }

    .mobile-version-card:last-child {
      border-bottom: none;
    }

    .mobile-version-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .mobile-version-title {
      display: flex;
      align-items: center;
      gap: 6px;
      min-width: 0;
    }

    .mobile-version-status-icon {
      flex-shrink: 0;
    }

    .mobile-version-str {
      font-size: 14px;
      font-weight: 600;
      color: $mainTitleColor;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .mobile-version-tag {
      font-size: 10px;
      line-height: 16px;
      padding: 0 6px;
      border-radius: 8px;
      flex-shrink: 0;
    }

    .mobile-version-tag.tag-release {
      background-color: #e8ecff;
      color: $mainColor;
    }

    .mobile-version-tag.tag-gray {
      background-color: #f2f4f7;
      color: #666;
    }

    .mobile-version-time {
      font-size: 12px;
      color: $subTitleColor;
      flex-shrink: 0;
    }

    .mobile-version-meta {
      margin-top: 6px;
      display: flex;
      align-items: center;
      gap: 16px;
      font-size: 12px;
      color: $subTitleColor;
    }

    .mobile-version-changelog {
      margin-top: 6px;
      font-size: 12px;
      color: #555;
      line-height: 1.4;
      word-break: break-word;
    }

    .mobile-version-actions {
      margin-top: 10px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;
      flex-wrap: wrap;
    }

    .mobile-action-btn {
      height: 28px;
      padding: 0 10px;
      border-radius: 14px;
      border: 1px solid #d5dfed;
      background-color: white;
      color: $mainTitleColor;
      font-size: 12px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      cursor: pointer;
    }

    .mobile-action-btn i {
      font-size: 12px;
    }

    .mobile-action-btn i:before {
      color: $mainColor;
    }

    .mobile-action-btn.btn-danger {
      border-color: #ffd6d6;
      color: $warmRed;
    }

    .mobile-action-btn.btn-danger i:before {
      color: $warmRed;
    }

    .appversion-footerwrapper {
      padding: 12px;
      border-radius: 8px;
      align-items: center;
    }

    .appversion-footerwrapper .totalwrapper,
    .appversion-footerwrapper .todaywrapper {
      width: 50%;
      height: auto;
      padding-left: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .appversion-footerwrapper .totalwrapper {
      border-right: 1px solid #eee;
      padding-right: 8px;
      box-sizing: border-box;
    }

    .appversion-footerwrapper .totalwrapper:after {
      display: none;
    }

    .appversion-footerwrapper .todaywrapper {
      padding-left: 10px;
      box-sizing: border-box;
    }

    .appversion-footerwrapper .downloadwrapper {
      width: 34px;
      height: 34px;
      border-radius: 6px;
      flex-shrink: 0;
    }

    .appversion-footerwrapper .downloadwrapper i {
      line-height: 34px;
      font-size: 14px;
    }

    .appversion-footerwrapper p {
      margin-left: 0;
      font-size: 12px;
      line-height: 1.3;
    }

    .appversion-footerwrapper .downloadCount {
      display: none;
    }
  }
</style>
