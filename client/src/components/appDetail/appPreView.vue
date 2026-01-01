<template>
    <div class="previewapp-wrapper">
      <!--微信浏览器提示模态框-->
      <div class="modal_box" v-show="showWeChatModal">
        <p class="modal_text">点击右上角按钮，在弹出菜单中选择在浏览器中打开以安装</p>
        <img src="data:image/png;base64,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" alt="" @click="closeWeChatModal">
      </div>
      <!--中间-->
      <div :class="getContentClass()" v-if="this.appBaseData">
        <div :class="getLeftClass()">
          <!--手机上查看-->
          <div v-show="isPhone">
            <p>手机</p>
            <phoneWrapper
              :appBaseData="appBaseData"
              :appVersionInfo="appVersionInfo"
              :platformStr="platformStr"
              @clickDownLoadBtn="clickDownLoadBtn"
            ></phoneWrapper>
          </div>

          <!--pc上查看-->
          <div class="pcWrapper" v-show="!isPhone">
            <p>33333333</p>
            <img class="appicon" :src="getIconUrl()" alt="">
            <p class="title">{{this.appBaseData.appName}}</p>
            <div class="info">
              <p v-if="this.appVersionInfo.versionStr" class="desc">版本：{{this.appVersionInfo.versionStr}}({{this.appVersionInfo.versionCode}})</p><span>大小：{{(this.appVersionInfo.size/1024/1024).toFixed(1)}}M</span>
            </div>
            <p class="date">发布日期： {{ this.appVersionInfo.creatDateStr }} </p>
            <div v-if="showPasswordInput">
              <el-input v-model="pwd" type="password" placeholder="请输入密码" class="pwd"></el-input>
              <el-button @click="clickSure" type="primary" round class="downloadBtn">确定</el-button>
            </div>

            <el-button v-if="showDownLoadBtn" @click="clickDownLoadBtn" class="downloadBtn" type="primary" round><i :class="this.platformStr === 'ios' ? 'icon-ic_ios':'icon-ic_andr'"></i>    下载安装</el-button>
          </div>
        </div>

        <!--右侧二维码-->
        <div class="preview-mobilewrapper" v-show="!isPhone">
          <img class="mobieImg" src="../../common/assets/ic_mobilphone.png">
          <vue-qr class="qrcodeImg" :text="downloadUrl" :margin="20"></vue-qr>
          <p class="codetips">请扫描二维码下载APP</p>
          <p class="platform">适用于{{this.platformStr}}系统</p>
        </div>

        <div v-if="history.length !== 0">
          <ul>
            <li v-for="(item, index) in history" :key="index" @click="historyClickDownLoadBtn(item)">
              <div>{{item.versionStr}}(build {{item.versionCode}})</div>
              <div>{{formatTime(item.uploadAt)}}</div>
            </li>
          </ul>
        </div>
      </div>
    </div>
</template>

<script type="text/ecmascript-6">
  import * as AppResourceApi from '../../api/moudle/appResourceApi'
  import VueQr from 'vue-qr/src/packages/vue-qr.vue'
  import PhoneWrapper from './phoneWrapper.vue'

  export default {
    components: {
      VueQr, PhoneWrapper
    },
    data() {
      return {
        versionArr: [],
        appVersionInfo: {},
        appBaseData: null,
        downloadUrl: '',
        platformStr: '',
        pwd: '',
        isPhone: false,
        history: [],
        showWeChatModal: false
      }
    },
    computed: {
      isIos() {
        var u = navigator.userAgent
        var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)
        return isiOS
      },
      isAndroid() {
        var u = navigator.userAgent
        var isAndroid = !!(u.match(/(Android)\s+([\d.]+)/))
        return isAndroid
      },
      showDownLoadBtn() { // mac端不显示，密码安装且密码不正确时不显示
        var p = navigator.platform
        if (p.indexOf('Mac') === 0) {
          return false
        } else {
          if (this.appBaseData.installWithPwd !== 1 || this.pwd === this.appBaseData.installPwd) {
            return true
          } else {
            return false
          }
        }

      },
      showPasswordInput() {
          if (this.appBaseData.installWithPwd === 1 && this.pwd !== this.appBaseData.installPwd) { // 密码安装,且密码不对的情况下展示，其他情况都隐藏
              return true
          }
      }
    },
    mounted() {
      this.getAppInfo(this.$route.params.id)

      // 判断是否是手机设备
      if (this.isIos || this.isAndroid) {
        this.isPhone = true
      } else {
        this.isPhone = false
      }

      // 检测微信内置浏览器
      this.detectWeChatBrowser()
    },
    created() {
      this.$nextTick(() => {
      })

    },
    methods: {
      formatTime(time) {
        return new Date(time).toFormat()
      },
      getTableBackground(index) {
        if (index % 2 === 0) {
          return `backgroundColor: rgb(244, 245, 247)`
        } else {
          return `backgroundColor: white`
        }
      },
      getAppInfo(shortUrl) {
        AppResourceApi.getAppInfoByShortUrl(shortUrl).then((res) => {
          if (res.data.version === null) {
              this.$message.error('未检测到版本信息')
              return
          }
          this.appVersionInfo = res.data.version
          this.appBaseData = res.data.app
          this.history = res.data.history || []
          let releaseDate = new Date(this.appVersionInfo.uploadAt)
          this.downloadUrl = `${window.origin}${this.$route.fullPath}`
          this.platformStr = res.data.app.platform
          this.appVersionInfo.creatDateStr = releaseDate.toFormat()
          if (this.appBaseData.installPwd === 1) {
            this.installWithPwd = true
          } else {
            this.installWithPwd = false
          }

        }, reject => {
          this.$message.error('服务器错误')
        })
      },
      getIconUrl() {
        return `${this.axios.defaults.baseURL}${this.appBaseData.icon}`
      },

      historyClickDownLoadBtn(item) {
        if (this.isIos) {
          const a = document.createElement('a')
          a.setAttribute('href', item.installUrl)
          a.click()
        } else {
          const a = document.createElement('a')
          let url = `${this.axios.defaults.baseURL}${item.downloadUrl}`
          a.setAttribute('href', url)
          a.click()
          let _this = this
          fetch(url).then(response => {
            var reader = response.body.getReader()
            var headers = response.headers
            var totalLength = headers.get('Content-Length')
            var bytesReceived = 0
            reader.read().then(function processResult(result) {
              if (result.done) {
                AppResourceApi.downloadedCount(item.appId, item._id).then(() => {
                }, reject => {})
                return
              }
              bytesReceived += result.value.length
              console.log(`progress: ${bytesReceived / totalLength * 100}%`)
              return reader.read().then(processResult)
            })
          })
        }
      },

      clickDownLoadBtn() {
        if (this.isIos) {
          const a = document.createElement('a')
//            `itms-services://?action=download-manifest&url=${this.axios.defaults.baseURL}api/plist/${this.appBaseData._id}/${this.appVersionInfo._id}`
          a.setAttribute('href', this.appVersionInfo.installUrl)
          a.click()
        } else {
          const a = document.createElement('a')
          let url = `${this.axios.defaults.baseURL}${this.appVersionInfo.downloadUrl}`
          a.setAttribute('href', url)
          a.click()
          let _this = this
          fetch(url).then(response => {
            var reader = response.body.getReader()
            var headers = response.headers
            var totalLength = headers.get('Content-Length')
            var bytesReceived = 0
            reader.read().then(function processResult(result) {
              if (result.done) {
                console.log('下载完成')
                console.log(_this.appBaseData)
                AppResourceApi.downloadedCount(_this.appBaseData._id, _this.appVersionInfo._id).then(() => {
                }, reject => {

                })
                return
              }
              bytesReceived += result.value.length
              console.log(`progress: ${bytesReceived / totalLength * 100}%`)
              return reader.read().then(processResult)
            })
          })
        }
      },
      getContentClass() {
        // 判断是否是手机设备
        if (this.isPhone) {
          return 'preview-middlewrapper-forPhone'
        } else {
          return 'preview-middlewrapper'
        }
      },
      getLeftClass() {
        if (this.isPhone) {
          return 'left-forPhone'
        } else {
          return 'left'
        }
      },
      clickSure() {
        if (this.pwd !== this.appBaseData.installPwd) {
          this.$message.error('密码错误')
        }
      },
      is_weixin() {
        const ua = navigator.userAgent.toLowerCase()
        if (ua.match(/MicroMessenger/i)) {
          return true
        } else {
          return false
        }
      },
      detectWeChatBrowser() {
        const ua = navigator.userAgent

        if (this.is_weixin()) {
          this.showWeChatModal = true
        }
      },
      closeWeChatModal() {
        this.showWeChatModal = false
      }
    }
  }
</script>

<style lang="scss">
  @use "../../common/scss/base" as *;
  body{
    background-color: white;
  }
  /*网页样式*/
  .previewapp-wrapper {
    position: absolute;
    background-color: white;
    width: 100%;
    height: 100%;
    background-image: url("../../common/assets/bg_picture.png");
    background-size: cover;

    ul  {
      padding: 16px 32px;
      li {
        padding: 12px 0;
        display: flex;
        justify-content: space-around;
        font-size: 12px;
        &:nth-child(2n - 1) {
          background: #f2f6f8;
        }
      }
    }

    .preview-middlewrapper ul{
      padding: 0;
      margin-top: 140px;
    }
  }
  .preview-middlewrapper {
    margin-top: 0px;
    margin-left: 25%;
    width: 50%;
    height: 100%;
    max-width: 800px;
    text-align: center;
    position: absolute;
    font-size: 0px;
  }
  .preview-middlewrapper-mobile {
    margin-top: 0px;
    margin-left: 25%;
    width: 50%;
    height: 100%;
    max-width: 800px;
    text-align: center;
    position: absolute;
    font-size: 0px;
  }
  .preview-middlewrapper .left {
    display: inline-block;
    width: 50%;
    //height: 100%;
    vertical-align: top;
    text-align: left;
  }
  .preview-mobilewrapper {
    display: inline-block;
    width: 50%;
    //height: 100%;
    vertical-align: top;
    position: relative;
    text-align: center;
  }

  .preview-mobilewrapper > img {
    margin-top: 120px;
    width: 300px;
    position: absolute;
    left: 0px;
    height: auto;
  }

  .pcWrapper .appicon {
    width: 126px;
    height: 126px;
    border-radius: 15px;
    margin-top: 160px;
  }
  .previewapp-wrapper .title {
    color: #354052;
    font-weight: bold;
    font-size: 26px;
    height: 37px;
    line-height: 37px;
    margin-top: 33px;
  }
  .pcWrapper .info {
    display: flex;
    flex-direction: row;
    color: #242A34;
    font-size: 14px;
    line-height: 20px;
    margin-top: 12px;
    opacity: 0.5;
  }
  .previewapp-wrapper .desc {
    margin-right: 12px;
  }
  .preview-middlewrapper .date {
    color: #242A34;
    font-size: 14px;
    text-align: left;
    line-height: 20px;
    margin-top: 2px;
    opacity: 0.5;
  }
  .preview-middlewrapper .pwd {
    width: 70%;
    height: 40px;
    border-radius: 6px;
    margin-top: 12px;
    background-color: transparent;
    color: red;
  }
  .preview-middlewrapper .downloadBtn{
    background-color: #8393F5;
    width: 70%;
    height: 44px;
    color: white;
    font-size: 14px;
    margin-top: 16px;
    border-color: transparent;
  }
  .downloadBtn i:before {
    color: white;
  }

  .preview-mobilewrapper .qrcodeImg {
    position: absolute;
    width: 150px;
    height: auto;
    left: 32px;
    margin-top: 200px;
  }

  .preview-mobilewrapper .codetips {
    color: #354052;
    font-size: 14px;
    text-align: center;
    line-height: 20px;
    height: 20px;
    left: 35px;
    top: 380px;
    position: absolute;
  }
  .preview-mobilewrapper .platform {
    color: #354052;
    opacity: 0.5;
    font-size: 14px;
    text-align: center;
    line-height: 20px;
    height: 20px;
    left: 60px;
    top: 400px;
    position: absolute;
  }

  /*手机样式*/
  .preview-middlewrapper-forPhone {
    margin-top: 0px;
    width: 100%;
    //height: 100%;
    text-align: center;
    position: absolute;
    font-size: 0px;
  }
  .preview-middlewrapper-forPhone .left-forPhone {
    display: inline-block;
    width: 100%;
    height: 100%;
    vertical-align: top;
    text-align: center;
  }

  /*微信浏览器提示模态框样式*/
  .modal_box {
    z-index: 7;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4);
  }

  .modal_box img {
    position: absolute;
    top: 5px;
    right: 23px;
    width: 40px;
    cursor: pointer;
  }

  .modal_text {
    box-sizing: border-box;
    padding: 10px 70px 20px 20px;
    color: #f0f0f0;
    font-size: 16px;
    font-weight: 500;
    line-height: 1.5;
  }
</style>
