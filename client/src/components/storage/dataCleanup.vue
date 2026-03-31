<template>
  <div class="data-cleanup">
    <!-- Header -->
    <div class="cleanup-header">
      <div class="cleanup-title">
        <h2>数据清理</h2>
        <p class="subtitle">扫描 upload 目录，找出数据库中无记录的孤儿文件，释放存储空间</p>
      </div>
      <el-button
        class="scan-btn"
        type="primary"
        :loading="scanning"
        @click="scanFiles"
      >
        <i class="el-icon-refresh-right" v-if="!scanning"></i>
        {{ scanning ? '扫描中...' : '开始扫描' }}
      </el-button>
    </div>

    <!-- Stats bar -->
    <div class="cleanup-stats" v-if="scanned">
      <div class="stat-card">
        <div class="stat-number">{{ orphanedFiles.length }}</div>
        <div class="stat-label">孤儿文件数量</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ formatSize(totalSize) }}</div>
        <div class="stat-label">可释放空间</div>
      </div>
    </div>

    <!-- Empty state -->
    <div class="cleanup-empty" v-if="scanned && orphanedFiles.length === 0">
      <div class="empty-icon">✅</div>
      <p>太棒了！未发现孤儿文件，存储空间状态良好。</p>
    </div>

    <!-- File table -->
    <div class="cleanup-table" v-if="scanned && orphanedFiles.length > 0">
      <div class="table-toolbar">
        <span class="table-tip">以下文件在磁盘上存在，但数据库中无对应记录</span>
        <el-button
          type="danger"
          size="small"
          :disabled="orphanedFiles.length === 0"
          @click="confirmDeleteAll"
        >
          全部删除
        </el-button>
      </div>
      <el-table
        :data="orphanedFiles"
        style="width: 100%"
        stripe
        border
      >
        <el-table-column prop="filePath" label="文件路径" min-width="320" show-overflow-tooltip />
        <el-table-column label="文件大小" width="120">
          <template #default="scope">
            {{ formatSize(scope.row.size) }}
          </template>
        </el-table-column>
        <el-table-column label="修改时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.modifiedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="scope">
            <el-button
              type="danger"
              size="small"
              :loading="scope.row._deleting"
              @click="confirmDelete(scope.row, scope.$index)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Initial state -->
    <div class="cleanup-init" v-if="!scanned">
      <div class="init-icon">🔍</div>
      <p>点击「开始扫描」按钮，扫描 upload 目录中的孤儿文件</p>
    </div>

    <!-- Confirm delete single dialog -->
    <el-dialog
      title="确认删除"
      v-model="deleteDialogVisible"
      width="420px"
      center
    >
      <p>确定要删除以下文件吗？此操作不可撤销。</p>
      <p class="delete-path">{{ pendingDeleteFile && pendingDeleteFile.filePath }}</p>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">取 消</el-button>
          <el-button type="danger" @click="executeDelete">确 定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Confirm delete all dialog -->
    <el-dialog
      title="确认全部删除"
      v-model="deleteAllDialogVisible"
      width="420px"
      center
    >
      <p>确定要删除全部 <strong>{{ orphanedFiles.length }}</strong> 个孤儿文件吗？</p>
      <p>共计 <strong>{{ formatSize(totalSize) }}</strong>，此操作不可撤销。</p>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="deleteAllDialogVisible = false">取 消</el-button>
          <el-button type="danger" :loading="deletingAll" @click="executeDeleteAll">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import * as StorageApi from '../../api/moudle/storageApi'

export default {
  name: 'DataCleanup',
  data() {
    return {
      scanning: false,
      scanned: false,
      orphanedFiles: [],
      deleteDialogVisible: false,
      deleteAllDialogVisible: false,
      deletingAll: false,
      pendingDeleteFile: null,
      pendingDeleteIndex: -1,
    }
  },
  computed: {
    totalSize() {
      return this.orphanedFiles.reduce((sum, f) => sum + (f.size || 0), 0)
    }
  },
  methods: {
    async scanFiles() {
      this.scanning = true
      this.scanned = false
      try {
        const resp = await StorageApi.getOrphanedFiles()
        this.orphanedFiles = (resp.data || []).map(f => ({ ...f, _deleting: false }))
        this.scanned = true
      } catch (e) {
        this.$message.error('扫描失败: ' + e)
      } finally {
        this.scanning = false
      }
    },
    confirmDelete(file, index) {
      this.pendingDeleteFile = file
      this.pendingDeleteIndex = index
      this.deleteDialogVisible = true
    },
    async executeDelete() {
      this.deleteDialogVisible = false
      if (!this.pendingDeleteFile) return
      const file = this.pendingDeleteFile
      const index = this.pendingDeleteIndex
      file._deleting = true
      try {
        await StorageApi.deleteOrphanedFile(file.filePath)
        this.orphanedFiles.splice(index, 1)
        this.$message({ type: 'success', message: '文件已删除' })
      } catch (e) {
        this.$message.error('删除失败: ' + e)
      } finally {
        file._deleting = false
        this.pendingDeleteFile = null
        this.pendingDeleteIndex = -1
      }
    },
    confirmDeleteAll() {
      this.deleteAllDialogVisible = true
    },
    async executeDeleteAll() {
      this.deletingAll = true
      const errors = []
      for (let i = this.orphanedFiles.length - 1; i >= 0; i--) {
        try {
          await StorageApi.deleteOrphanedFile(this.orphanedFiles[i].filePath)
          this.orphanedFiles.splice(i, 1)
        } catch (e) {
          errors.push(this.orphanedFiles[i].filePath)
        }
      }
      this.deletingAll = false
      this.deleteAllDialogVisible = false
      if (errors.length === 0) {
        this.$message({ type: 'success', message: '全部孤儿文件已删除' })
      } else {
        this.$message.error(`${errors.length} 个文件删除失败，请重新扫描后再试`)
      }
    },
    formatSize(bytes) {
      if (!bytes) return '0 B'
      if (bytes < 1024) return bytes + ' B'
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
      if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(2) + ' MB'
      return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB'
    },
    formatDate(dateStr) {
      if (!dateStr) return '-'
      const d = new Date(dateStr)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    }
  }
}
</script>

<style lang="scss" scoped>
@use '../../common/scss/base' as *;

.data-cleanup {
  margin: 24px 72px;
  user-select: text;

  .cleanup-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 24px;

    .cleanup-title {
      h2 {
        font-size: 24px;
        font-weight: 600;
        margin: 0 0 6px 0;
        color: #1a1a2e;
      }
      .subtitle {
        font-size: 14px;
        color: #8a9ab5;
        margin: 0;
      }
    }

    .scan-btn {
      height: 48px;
      min-width: 140px;
      font-size: 15px;
      background-color: $mainColor;
      border-color: $mainColor;
    }
  }

  .cleanup-stats {
    display: flex;
    gap: 20px;
    margin-bottom: 24px;

    .stat-card {
      flex: 1;
      max-width: 200px;
      background: white;
      border-radius: 14px;
      padding: 20px 24px;
      box-shadow: 0 2px 12px rgba(100, 119, 242, 0.08);
      border: 1px solid #eef2ff;

      .stat-number {
        font-size: 28px;
        font-weight: 700;
        color: $mainColor;
        line-height: 1.2;
      }
      .stat-label {
        font-size: 13px;
        color: #8a9ab5;
        margin-top: 4px;
      }
    }
  }

  .cleanup-empty {
    text-align: center;
    padding: 80px 0;
    color: #8a9ab5;

    .empty-icon {
      font-size: 60px;
      margin-bottom: 16px;
    }
    p { font-size: 16px; }
  }

  .cleanup-init {
    text-align: center;
    padding: 120px 0;
    color: #b0bdd0;

    .init-icon {
      font-size: 64px;
      margin-bottom: 20px;
    }
    p { font-size: 16px; }
  }

  .cleanup-table {
    background: white;
    border-radius: 14px;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(100, 119, 242, 0.06);
    border: 1px solid #eef2ff;

    .table-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;

      .table-tip {
        font-size: 13px;
        color: #f59e0b;
        background: #fffbeb;
        padding: 6px 12px;
        border-radius: 6px;
        border: 1px solid #fde68a;
      }
    }
  }

  .delete-path {
    font-family: monospace;
    font-size: 12px;
    color: #e53e3e;
    background: #fff5f5;
    padding: 8px 12px;
    border-radius: 6px;
    word-break: break-all;
    margin-top: 8px;
  }

  .dialog-footer {
    display: flex;
    align-items: center;
    justify-content: space-around;
  }
}
</style>
