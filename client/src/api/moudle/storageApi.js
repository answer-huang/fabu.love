import { getHttp, deleteHttp } from '../basehttp'

/**
 * 扫描 upload 目录，返回数据库中没有记录的孤儿文件列表
 */
export function getOrphanedFiles() {
  return getHttp('api/storage/orphaned-files')
}

/**
 * 删除指定孤儿文件
 * @param {string} filePath 文件相对路径（相对于 upload 目录）
 */
export function deleteOrphanedFile(filePath) {
  return deleteHttp(`api/storage/orphaned-files?filePath=${encodeURIComponent(filePath)}`)
}
