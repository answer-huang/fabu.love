import {
  request,
  summary,
  tags,
  description,
  responses,
  query,
} from '../swagger';
import config from '../config';

const Version = require('../model/version');
const fs = require('fs');
const path = require('path');

const { responseWrapper } = require('../helper/util');

const tag = tags(['存储管理']);
const uploadDir = path.join(config.fileDir, 'upload');

/**
 * 递归扫描目录，返回所有文件的相对路径列表（相对于 uploadDir）
 * 只扫描 .apk 和 .ipa 文件，跳过 icon 目录
 */
function scanUploadFiles(dir, baseDir) {
  let results = [];
  if (!fs.existsSync(dir)) {
    return results;
  }
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      // 跳过 icon 目录
      if (file === 'icon') continue;
      results = results.concat(scanUploadFiles(fullPath, baseDir));
    } else {
      const ext = path.extname(file).toLowerCase();
      if (ext === '.apk' || ext === '.ipa') {
        // 返回相对于 uploadDir 的路径，使用 upload/ 前缀（与 Version.downloadUrl 格式一致）
        const relPath = path.relative(baseDir, fullPath);
        results.push({
          absolutePath: fullPath,
          relativePath: relPath, // e.g. "teamId/android/xxx.apk"
          downloadUrl: path.join('upload', relPath), // e.g. "upload/teamId/android/xxx.apk"
          size: stat.size,
          modifiedAt: stat.mtime,
        });
      }
    }
  }
  return results;
}

module.exports = class StorageRouter {
  @request('get', '/api/storage/orphaned-files')
  @summary('扫描 upload 目录，返回数据库中没有记录的孤儿文件列表')
  @tag
  @responses({ 200: { description: 'success' } })
  static async getOrphanedFiles(ctx) {
    // 扫描磁盘上的所有 apk/ipa 文件
    const diskFiles = scanUploadFiles(uploadDir, uploadDir);

    // 从数据库中获取所有版本的 downloadUrl
    const versions = await Version.find({}, 'downloadUrl').lean();
    // 统一成 Set，规范化路径分隔符
    const dbUrls = new Set(
      versions
        .map(v => v.downloadUrl)
        .filter(Boolean)
        .map(u => u.replace(/\\/g, '/'))
    );

    // 找出磁盘上存在但数据库中没有记录的文件
    const orphaned = diskFiles.filter(f => {
      const normalizedUrl = f.downloadUrl.replace(/\\/g, '/');
      return !dbUrls.has(normalizedUrl);
    });

    const result = orphaned.map(f => ({
      filePath: f.relativePath.replace(/\\/g, '/'),
      downloadUrl: f.downloadUrl.replace(/\\/g, '/'),
      size: f.size,
      modifiedAt: f.modifiedAt,
    }));

    ctx.body = responseWrapper(true, '扫描完成', result);
  }

  @request('delete', '/api/storage/orphaned-files')
  @summary('删除指定的孤儿文件')
  @tag
  @query({ filePath: { type: 'string', required: true, description: '文件相对路径（相对于 upload 目录）' } })
  @responses({ 200: { description: 'success' } })
  static async deleteOrphanedFile(ctx) {
    const { filePath } = ctx.query;
    if (!filePath) {
      ctx.status = 400;
      ctx.body = responseWrapper(false, '缺少 filePath 参数');
      return;
    }

    // 安全校验：确保路径在 uploadDir 内，防止路径穿越攻击
    const absolutePath = path.resolve(uploadDir, filePath);
    if (!absolutePath.startsWith(path.resolve(uploadDir))) {
      ctx.status = 403;
      ctx.body = responseWrapper(false, '非法的文件路径');
      return;
    }

    if (!fs.existsSync(absolutePath)) {
      ctx.status = 404;
      ctx.body = responseWrapper(false, '文件不存在');
      return;
    }

    // 双重校验：确保该文件确实不在数据库中
    const downloadUrl = path.join('upload', filePath).replace(/\\/g, '/');
    const exists = await Version.findOne({ downloadUrl: downloadUrl });
    if (exists) {
      ctx.status = 400;
      ctx.body = responseWrapper(false, '该文件在数据库中有记录，不能删除');
      return;
    }

    fs.unlinkSync(absolutePath);
    ctx.body = responseWrapper(true, '文件删除成功', { filePath });
  }
};
