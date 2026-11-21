<template>
  <div class="editorVersion-wrapper" @click="cancel">
    <transition name="fadeRight">
      <div v-show="this.show" class="editorVersion-content" @click.stop="clickcontent">
        <div class="top">
          <div class="top-title">
            <i class="icon-ic_editor"></i>
            <span>版本编辑</span>
          </div>
          <div class="top-switch">
            <el-switch
              v-model="showinDownLoadPage"
              active-color="#6477F2"
              inactive-color="#333">
            </el-switch>
            <p>显示到下载页</p>
          </div>
        </div>
        <el-form label-position="left" labelWidth="100px">
          <el-form-item label="版本名称" class="info-row">
            <p class="versioninput">{{this.versionInfo.appName}}</p>
          </el-form-item>
          <el-form-item label="文件大小" class="info-row">
            <p class="versioninput">{{(this.versionInfo.size / 1024 / 1024).toFixed(2)}}M</p>
          </el-form-item>
          <el-form-item label="下载次数" class="info-row">
            <div class="download-count-value">
              <p class="versiondownload" style="display: inline-block" v-html="getDownLoadCount(this.versionInfo.downloadCount)"></p>/<span style="color: #9B9B9B;display: inline-block" v-html="getAllowDownLoadCount(this.versionInfo.strategy)"></span>
            </div>
          </el-form-item>
          <el-form-item label="更新安装地址">
            <input v-model="downloadUrl" class="borderLine-input install-url-input" type="text">
          </el-form-item>
          <el-form-item label="更新方式">
            <div class="update-type-group">
              <el-radio v-model="updateType" label="normal">普通更新</el-radio>
              <el-radio v-model="updateType" label="silent">静默更新</el-radio>
              <el-radio v-model="updateType" label="force">强制更新</el-radio>
            </div>
          </el-form-item>
          <el-form-item label="更新日志">
            <p class="textareacount">{{this.updataContent.length}}/100</p>
            <el-input
              class="editorVersion-updatatextarea"
              type="textarea"
              placeholder="更新日志"
              :maxlength="100"
              v-model="updataContent">
            </el-input>
          </el-form-item>
        </el-form>

        <div class="editorVersion-actions">
          <el-button round class="elbutton-style sureBtn" @click="sure">确认</el-button>
          <el-button round class="elbutton-style cancelBtn" @click="cancel">取消</el-button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script type="text/ecmascript-6">
  import * as AppResourceApi from '../../api/moudle/appResourceApi'
  import {getUserTeam} from '../../mgr/userMgr'

  export default {
    props: {
      versionInfo: {
        type: Object
      },
      appInfo: {
        type: Object
      }
    },
    data() {
      return {
        show: false,
        updataContent: '',
        showinDownLoadPage: false,
        downloadUrl: '',
        updateType: ''
      }
    },
    created() {
      setTimeout(() => {
        console.log(this.versionInfo)
        this.show = true
        this.downloadUrl = this.versionInfo.installUrl
        if (this.versionInfo.changelog) {
          this.updataContent = this.versionInfo.changelog
        }
        this.updateType = this.versionInfo.updateMode
        this.showinDownLoadPage = this.versionInfo.showOnDownloadPage
      }, 200)
    },
    methods: {
      cancel() {
        this.show = false
        setTimeout(() => {
          this.$emit('cancel')
        }, 500)
      },
      sure() {
        let body = {
          'installUrl': this.installUrl,
          'showOnDownloadPage': this.showinDownLoadPage,
          'changelog': this.updataContent,
          'updateMode': this.updateType
        }
        AppResourceApi.updateNote(getUserTeam()._id, this.appInfo._id, this.versionInfo._id, body).then((res) => {
          console.log(res)
          this.$message.success(res.message)
          this.$emit('updateSuccess')
        }, reject => {

        })
      },
      clickcontent() {

      },
      getDownLoadCount(count) {
        if (count) {
          return count
        } else {
          return 0
        }
      },
      getAllowDownLoadCount(strategy) {
        if (strategy && strategy.downloadCountLimit) {
          return strategy.downloadCountLimit
        } else {
          return '不限'
        }
      }
    }
  }
</script>

<style lang="scss">
  @use "../../common/scss/base" as *;

  .fadeRight-enter-active {
    transition: all .5s ease;
  }
  .fadeRight-leave-active {
    transition: all .5s ease;
  }
  .fadeRight-enter, .fadeRight-leave-to {
    transform: translateX(100%);
  }
  .editorVersion-wrapper {
    position: absolute;
    top: 72px;
    left: 0px;
    bottom: 0px;
    width: 100%;
    background-color: rgba(255, 255, 255, 0.5);
    z-index: 100;
  }
  .editorVersion-content {
    float: right;
    width: 480px;
    height: 100%;
    margin-right: 0;
    background-color: white;
    box-shadow: 0 2px 6px rgba(120, 120, 120, 0.5);
    overflow: scroll;
    overflow-x: hidden;
    overflow-y: hidden;
  }
  .editorVersion-content .top {
    padding-left: 41px;
    padding-top: 22px;
    position: relative;
  }
  .editorVersion-content .top .top-title {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .editorVersion-content .top span {
    color: $mainTitleColor;
    font-size: 14px;
    line-height: 24px;
  }
  .editorVersion-content .top .top-switch {
    position: absolute;
    top: 22px;
    right: 24px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .editorVersion-content .top p {
    font-size: 12px;
    color: #354052;
    line-height: 24px;
  }
  .editorVersion-content .el-form {
    margin-top: 24px;
    margin-left: 60px;
  }
  .editorVersion-content .el-form .el-form-item {
    margin-bottom: 5px;
  }
  .editorVersion-content .el-form .el-form-item label {
    font-size: 14px;
    color: $subTitleColor;
  }
  .editorVersion-content .el-form .el-form-item .versioninput {
    width: calc(100% - 40px);
    font-size: 14px;
    color: $mainTitleColor;
  }
  .editorVersion-content .el-form .el-form-item .versiondownload {
    font-size: 14px;
    color: $mainTitleColor;
  }
  .editorVersion-content .install-url-input {
    width: calc(100% - 40px);
  }
  .editorVersion-content .el-form .el-form-item .textareacount {
    text-align: right;
    padding-right: 40px;
  }
  .editorVersion-content .el-form .el-form-item .el-radio {
    margin-right: -10px;
  }
  .editorVersion-content .editorVersion-updatatextarea {
    width: calc(100% - 40px);
    font-size: 14px;
    color: $mainTitleColor;
  }
  .editorVersion-content .editorVersion-updatatextarea textarea {
    height: 168px !important;
    outline: 0;
    padding-left: 5px;
  }
  .editorVersion-content .el-button {
    margin-top: 48px;
  }
  .editorVersion-content .el-button span {
    line-height: 36px !important;
  }
  .editorVersion-content .sureBtn {
    background-color: $mainColor !important;
    color: white !important;
    margin-left: calc(100% - 40px - 96px - 96px - 10px);
  }

  @media screen and (max-width: 768px) {
    .editorVersion-wrapper {
      position: fixed;
      top: 54px;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.35);
      z-index: 200;
    }

    .editorVersion-content {
      float: none;
      width: 100%;
      max-width: 100vw;
      height: 100%;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      padding-bottom: calc(24px + env(safe-area-inset-bottom));
      box-sizing: border-box;
    }

    .editorVersion-content .top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px;
      border-bottom: 1px solid #f0f2f7;
    }

    .editorVersion-content .top .top-title span {
      font-size: 16px;
      font-weight: 600;
    }

    .editorVersion-content .top .top-switch {
      position: static;
      gap: 6px;
    }

    .editorVersion-content .el-form {
      margin: 0;
      padding: 8px 16px 0;
    }

    .editorVersion-content .el-form .el-form-item {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      margin-bottom: 14px;
    }

    .editorVersion-content .el-form .el-form-item .el-form-item__label {
      width: auto !important;
      height: auto;
      line-height: 22px;
      padding: 0;
      margin-bottom: 6px;
      font-size: 13px;
      font-weight: 500;
      color: $subTitleColor;
    }

    .editorVersion-content .el-form .el-form-item .el-form-item__content {
      margin-left: 0 !important;
      width: 100%;
      line-height: 24px;
    }

    .editorVersion-content .el-form .el-form-item.info-row {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      padding: 10px 0;
      margin-bottom: 0;
      border-bottom: 1px dashed #f0f2f7;
    }

    .editorVersion-content .el-form .el-form-item.info-row:nth-of-type(3) {
      margin-bottom: 14px;
    }

    .editorVersion-content .el-form .el-form-item.info-row .el-form-item__label {
      margin-bottom: 0;
      flex-shrink: 0;
    }

    .editorVersion-content .el-form .el-form-item.info-row .el-form-item__content {
      width: auto;
      flex: 1;
      text-align: right;
      min-width: 0;
    }

    .editorVersion-content .el-form .el-form-item .versioninput {
      width: 100%;
      text-align: right;
      word-break: break-all;
    }

    .editorVersion-content .el-form .el-form-item .download-count-value {
      width: 100%;
      text-align: right;
      font-size: 14px;
    }

    .editorVersion-content .install-url-input {
      width: 100%;
      height: 36px;
      line-height: 36px;
      padding: 0 10px;
      border: 1px solid #dcdfe6;
      border-radius: 6px;
      font-size: 14px;
      color: $mainTitleColor;
      box-sizing: border-box;
    }

    .editorVersion-content .update-type-group {
      display: flex;
      flex-wrap: wrap;
      gap: 6px 16px;
      width: 100%;
    }

    .editorVersion-content .el-form .el-form-item .el-radio {
      margin-right: 0;
      height: 32px;
    }

    .editorVersion-content .el-form .el-form-item .textareacount {
      width: 100%;
      text-align: right;
      padding-right: 0;
      font-size: 12px;
      color: $subTitleColor;
      line-height: 20px;
      margin-bottom: 4px;
    }

    .editorVersion-content .editorVersion-updatatextarea {
      width: 100%;
    }

    .editorVersion-content .editorVersion-updatatextarea textarea {
      height: 120px !important;
      padding: 8px 10px;
      border-radius: 6px;
      box-sizing: border-box;
    }

    .editorVersion-content .editorVersion-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 16px 0;
      box-sizing: border-box;
    }

    .editorVersion-content .editorVersion-actions .el-button {
      flex: 1;
      width: auto;
      height: 40px;
      margin: 0;
    }

    .editorVersion-content .editorVersion-actions .el-button span {
      line-height: 40px !important;
    }

    .editorVersion-content .sureBtn {
      margin-left: 0;
    }
  }
</style>
