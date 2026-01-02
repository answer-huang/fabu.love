<template>
  <div class="appsetting-wrapper">
    <div class="top">
      <i class="el-icon-setting"></i>  设置
    </div>
    <div class="content">
      <el-form labelWidth="150px" label-position="left">
        <el-form-item label="应用短链">
          <div class="form-item-content">
            <span class="base-url">{{this.axios.defaults.baseURL}}</span>
            <el-input v-model="appInfo.shortUrl" class="shorturl"></el-input>
          </div>
        </el-form-item>
        <el-form-item label="安装方式">
          <div class="form-item-content">
            <div class="radio-group">
              <el-radio v-model="installType" label="公开">公开安装</el-radio>
              <el-radio v-model="installType" label="密码安装">密码安装</el-radio>
            </div>
            <el-input v-show="installType === '密码安装'" v-model="installPwd" type="password" class="installtype" placeholder="密码"></el-input>
          </div>
        </el-form-item>
        <el-form-item label="发布方式">
          <div class="form-item-content">
            <div class="radio-group">
              <el-radio v-model="publishType" label="手动发布">手动发布</el-radio>
              <el-radio v-model="publishType" label="自动发布">自动发布</el-radio>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="历史版本">
          <div class="form-item-content">
            <div class="radio-group">
              <el-radio v-model="showHistory" label="是">展示记录</el-radio>
              <el-radio v-model="showHistory" label="否">隐藏记录</el-radio>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="合并应用">
          <div class="form-item-content">
            <el-select v-model="mergedId" placeholder="请选择要合并的应用" clearable class="merge-select">
              <el-option
                v-for="app in availableApps"
                :key="app._id"
                :label="getAppLabel(app)"
                :value="app._id">
              </el-option>
            </el-select>
          </div>
        </el-form-item>
      </el-form>

      <button type="button" class="bottomBtn button-style-border" @click="clickSure">立即生效</button>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  import * as AppResourceApi from '../../api/moudle/appResourceApi'
  import {getUserTeam} from '../../mgr/userMgr'

  export default {
    props: {
      appInfo: {
        type: Object
      }
    },
    data() {
      return {
        installType: '公开',
        publishType: '手动发布',
        installPwd: '',
        showHistory: '是',
        mergedId: '',
        availableApps: []
      }
    },
    created() {
      this.loadAppList()
    },
    mounted() {
      this.installType = this.appInfo.installWithPwd === 1 ? '密码安装' : '公开'
      this.publishType = this.appInfo.autoPublish === true ? '自动发布' : '手动发布'
      this.showHistory = this.appInfo.showHistory === true ? '是' : '否'
      this.installPwd = this.appInfo.installPwd
      this.mergedId = this.appInfo.mergedId || ''
    },
    methods: {
      getAppLabel(app) {
        const platformText = app.platform === 'ios' ? 'iOS' : app.platform === 'android' ? 'Android' : app.platform || ''
        return `${app.appName} (${platformText})`
      },
      loadAppList() {
        AppResourceApi.getAppList(getUserTeam()._id).then((res) => {
          if (res.success && res.data) {
            // 过滤掉当前应用
            let apps = res.data.filter(app => app._id !== this.appInfo._id)
            // 按照相同 bundleId 优先排序（相同 bundleId 的应用排在前面）
            apps.sort((a, b) => {
              if (a.bundleId === this.appInfo.bundleId && b.bundleId !== this.appInfo.bundleId) {
                return -1
              }
              if (a.bundleId !== this.appInfo.bundleId && b.bundleId === this.appInfo.bundleId) {
                return 1
              }
              return 0
            })
            this.availableApps = apps
          }
        }, reject => {
          console.error('获取应用列表失败', reject)
        })
      },
      clickSure() {
        if (this.installType === '密码安装' && this.installPwd === '') {
            this.$message.error('密码不能为空')
            return
        }
        let body = {
          'shortUrl': this.appInfo.shortUrl,
          'installWithPwd': this.installType === '公开' ? 0 : 1,
          'installPwd': this.installPwd,
          'autoPublish': this.publishType === '手动发布' ? 0 : 1,
          'showHistory': this.showHistory === '是' ? 1 : 0,
        }
        // 如果选择了合并应用，添加 mergedId
        if (this.mergedId) {
          body.mergedId = this.mergedId
        } else {
          // 如果清空了选择，也需要更新 mergedId 为空
          body.mergedId = ''
        }
        AppResourceApi.updateAppSetting(getUserTeam()._id, this.appInfo._id, body).then((res) => {
            if (res.success) {
              this.$message.success(res.message)
            }
        }, reject => {

        })
      }
    }
  }
</script>

<style lang="scss">
  @use "../../common/scss/base" as *;

  .appsetting-wrapper {
    .top {
      width: 100%;
      height: 48px;
      background-color: white;
      margin-top: 12px;
      line-height: 48px;
      padding-left: 24px;
      box-sizing: border-box;
    }

    .content {
      width: 100%;
      height: 400px;
      background-color: white;
      margin-top: 1px;
      padding-top: 35px;

      .el-form {
        margin-left: 120px;

        .el-form-item {
          .el-form-item__label {
            font-size: 14px;
            color: $subTitleColor;
            margin-right: 20px;
          }

          .el-input__inner {
            border: 0;
            border-radius: 0;
            font-size: 14px;
            outline: 0;
            padding: 0 0 0 5px;
            height: 24px !important;
            line-height: 24px;
          }

          .shorturl {
            width: 150px;
            display: inline-block;
            margin-left: 2px;
          }

          .installtype {
            width: 150px;
          }

          .merge-select {
            width: 300px;
          }

          .el-radio span {
            font-size: 14px !important;
          }
        }
      }

      .el-radio__input.is-checked {
        .el-radio__inner {
          background-color: $mainColor;
          border-color: $mainColor;
        }

        + .el-radio__label {
          color: $mainColor;
        }
      }

      .bottomBtn {
        width: 96px;
        height: 36px;
        border-radius: 18px;
        line-height: 36px;
        margin-top: 18px;
        margin-left: calc(50% - 48px);
      }
    }
  }
</style>
