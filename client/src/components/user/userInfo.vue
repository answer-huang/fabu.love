<template>
  <div class="userInfo-wrapper" @click="cancel">
    <transition name="fadeRight">
      <div v-show="this.show" class="userInfo-wrapper-body" @click.stop="clickcontent">
        <div class="userWrapper">
            <div class="imgwrapper">
                <img src="../../common/assets/ic_touxiang_l.png" alt="">
            </div>
            <div class="userInfo-name-token">
                <p class="userInfo-name">{{this.userInfo.userName}}</p>
                <div v-show="hasApiToken" class="userInfo-apiToken-contain">
                    <label class="userInfo-apiToken-text"> {{ maskedApiToken }} </label>
                    <div class="userInfo-apiToken-actions">
                        <button class="copy-button" @click="copyApiToken" title='点击复制ApiToken'>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5.5 3.5H3.5C2.94772 3.5 2.5 3.94772 2.5 4.5V12.5C2.5 13.0523 2.94772 13.5 3.5 13.5H9.5C10.0523 13.5 10.5 13.0523 10.5 12.5V10.5M5.5 3.5H11.5C12.0523 3.5 12.5 3.94772 12.5 4.5V8.5M5.5 3.5C5.5 2.94772 5.94772 2.5 6.5 2.5H10.5L13.5 5.5V9.5C13.5 10.0523 13.0523 10.5 12.5 10.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                        <button class="reset-button" @click="apiTokenAction" title='点击重置ApiToken'>
                            <img style="{width: 24; height: 24px;}" src="../../common/assets/btn_redraw@2x.png">
                        </button>
                    </div>
                </div>
            </div>
            <div v-show="!hasApiToken">
                     <el-button class= "userInfo-apiToken-initButton" type="primary" @click="apiTokenAction" round>生成ApiToken</el-button>
            </div>
        </div>

        <ul class="userInfo-wrapper-nav">
          <li v-for="item in navArr" :style="getactiveClass(item)" :key="item" class="userInfo-wrapper-nav-sub" @click="clickItem(item)">
            {{item}}
          </li>
        </ul>

        <personalInfo :userInfo="this.userInfo" v-if="this.currentItem === '个人资料'" @cancel="cancel"></personalInfo>
        <changePassword v-if="this.currentItem === '修改密码'" @cancel="cancel"></changePassword>
      </div>
    </transition>

  </div>
</template>

<script type="text/ecmascript-6">
    import ChangePassword from './changePassword.vue'
    import PersonalInfo from './personalInfo.vue'
    import {
        getUserInfo, saveUserInfo
    } from '../../mgr/userMgr'
    import {
        apiTokenActive
    } from '../../api/moudle/userApi'

    export default {
        components: {
            ChangePassword,
            PersonalInfo
        },
        data() {
            return {
                show: false,
                navArr: ['个人资料', '修改密码'],
                currentItem: '个人资料',
                userInfo: {},
                apiToken: undefined
            }
        },
        created() {
            setTimeout(() => {
                this.show = true
            }, 100)
            this.userInfo = getUserInfo()
            this.apiToken = this.userInfo.apiToken
        },
        computed: {
            hasApiToken: function() {
                return this.apiToken !== undefined
            },
            maskedApiToken: function() {
                if (!this.apiToken) {
                    return ''
                }
                // 显示前6位和后6位，中间用省略号
                const token = this.apiToken
                if (token.length <= 12) {
                    // 如果 token 太短，直接显示
                    return token
                }
                return token.substring(0, 6) + '...' + token.substring(token.length - 6)
            }
        },
        methods: {
            clickItem(item) {
                this.currentItem = item
            },
            getactiveClass(item) {
                if (item === this.currentItem) {
                    return `color: #6477F2;borderBottomColor: #6477F2`
                }
            },
            cancel() {
                this.show = false
                setTimeout(() => {
                    this.bus.emit('hiddenUserInfo')
                }, 500)
            },
            clickcontent() {},
            apiTokenAction() {
                apiTokenActive().then(resp => {
                    this.$message({
                        type: resp.success ? 'success' : 'error',
                        message: resp.message || (!this.hasApiToken) ? '生成apiToken成功' : '重置apiToken成功'
                    })
                    this.userInfo.apiToken = resp.data
                    this.apiToken = resp.data
                    saveUserInfo(this.userInfo)
                }).catch(error => {
                    this.$message({
                        type: 'error',
                        message: error
                    })
                })
            },
            copyApiToken() {
                if (!this.apiToken) {
                    this.$message({
                        type: 'error',
                        message: 'ApiToken不存在'
                    })
                    return
                }
                // 使用 Clipboard API 复制文本
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(this.apiToken).then(() => {
                        this.$message({
                            type: 'success',
                            message: 'ApiToken已复制到剪贴板'
                        })
                    }).catch(err => {
                        // 降级方案：使用传统方法
                        this.fallbackCopyText(this.apiToken)
                    })
                } else {
                    // 降级方案：使用传统方法
                    this.fallbackCopyText(this.apiToken)
                }
            },
            fallbackCopyText(text) {
                const textArea = document.createElement('textarea')
                textArea.value = text
                textArea.style.position = 'fixed'
                textArea.style.left = '-999999px'
                textArea.style.top = '-999999px'
                document.body.appendChild(textArea)
                textArea.focus()
                textArea.select()
                try {
                    const successful = document.execCommand('copy')
                    if (successful) {
                        this.$message({
                            type: 'success',
                            message: 'ApiToken已复制到剪贴板'
                        })
                    } else {
                        this.$message({
                            type: 'error',
                            message: '复制失败，请手动选择文本复制'
                        })
                    }
                } catch (err) {
                    this.$message({
                        type: 'error',
                        message: '复制失败，请手动选择文本复制'
                    })
                }
                document.body.removeChild(textArea)
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

    .fadeRight-enter,
    .fadeRight-leave-to {
        transform: translateX(100%);
    }

    .userInfo-wrapper {
        position: fixed;
        top: 72px;
        left: 0px;
        bottom: 0px;
        width: 100%;
        background-color: rgba(255, 255, 255, 0.5);
        z-index: 1000;
    }

    .userInfo-wrapper-body {
        float: right;
        width: 480px;
        height: 100%;
        margin-right: 0;
        background-color: white;
        box-shadow: 0 2px 6px rgba(120, 120, 120, 0.5);
        overflow: scroll;
    }

    .userInfo-wrapper-body .userWrapper {
        font-size: 0px;
        padding-top: 22px;
        display: flex;
        justify-content: flex-start;
        align-items: center;
    }

    .userWrapper .imgwrapper {
        width: 72px;
        height: 72px;
        border-radius: 36px;
        margin-left: 48px;
        display: inline-block;
        vertical-align: middle;
    }

    .userWrapper .imgwrapper img {
        width:  72px;
        height: 72px;
        border-radius: 26px;
        background-size: 72px 72px;
    }

    .userInfo-wrapper-nav {
        margin-top: 24px;
        width: 100%;
        height: 48px;
        border-bottom: solid 1px #eee;
    }

    .userInfo-wrapper-nav-sub {
        width: 96px;
        height: 48px;
        display: inline-block;
        color: $subTitleColor;
        margin-left: 48px;
        line-height: 48px;
        text-align: center;
        border-bottom: solid 1px transparent;
    }

    .userInfo-name-token {
        display: flex;
        flex-direction: column;
        justify-content: center;
        height: 72px;
        margin-left: 12px;
        .userInfo-name {
            font-size: 24px;
            font-weight: bold;
            color: $mainColor;
        }
        .userInfo-apiToken-contain {
            display: flex;
            align-items: center;
            justify-content: space-between;
            .userInfo-apiToken-text {
                height: 24px;
                font-size: 14px;
                font-family: PingFangSC-Regular;
                font-weight: 400;
                color: rgba(170, 186, 210, 1);
                line-height: 24px;
                flex: 1;
                margin-right: 8px;
            }
            .userInfo-apiToken-actions {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .copy-button {
                height: 26px;
                width: 26px;
                border: none;
                line-height: 26px;
                background-color: rgba(0,0,0,0);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                color: rgba(170, 186, 210, 1);
                transition: color 0.2s;
                padding: 0;
                &:hover {
                    color: $mainColor;
                }
                &:active {
                    opacity: 0.7;
                }
            }
            .reset-button {
                height: 26px;
                border: none;
                line-height: 26px;
                background-color: rgba(0,0,0,0);
                cursor: pointer;
            }

        }

    }

    .userInfo-apiToken-initButton {
        margin-left: 12px;
    }


</style>
