const { mongoose } = require('../../config/database');
const { GridFSBucket } = require('mongodb');
// const { ObjectId } = require('bson');
const taskUtil = require('../utils/task-util');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const User = require('../models/User');

let bucket;

mongoose.connection.once('open', () => {
  bucket = new GridFSBucket(mongoose.connection.db, {
    bucketName: 'documents',
  });
  console.log('GridFSBucket initialized in docsService');
});

exports.postDocument = async (file, taskId, userId) => {
  try {
    const isExistingTask = await taskUtil.isExistingResource(Task, taskId);
    if (!isExistingTask) {
      throw new Error('No task found');
    }

    const isAccessible = await taskUtil.scopeChecker(userId, isExistingTask);
    if (!isAccessible) {
      throw new Error('You don’t have any privilege to upload file');
    }

    return new Promise((resolve, reject) => {
      try {
        if (!bucket) {
          return reject(new Error('GridFSBucket is not initialized'));
        }

        const uploadStream = bucket.openUploadStream(file.originalname, {
          metadata: { taskId: taskId, uploadedBy: userId },
        });

        uploadStream.end(file.buffer);

        uploadStream.on('finish', async () => {
          try {
            const task = await Task.findById(taskId).select('assignedTo title');

            const notifications = task.assignedTo
              .filter((uid) => uid.toString() !== userId.toString())
              .map((uid) => ({
                message: `[${task.title}] 업무에 ${file.originalname} 문서가 업로드 되었습니다.`,
                receiver: uid,
                sender: userId,
                noticeType: 'document_uploaded',
                relatedTask: taskId,
                relatedDocument: uploadStream.id,
              }));

            if (notifications.length > 0) {
              await Notification.insertMany(notifications);
            }

            resolve({
              success: true,
              message: 'Document uploaded successfully',
              fileId: uploadStream.id,
            });
          } catch (err) {
            console.error(err.message);
            resolve({
              success: true,
              message: 'Document uploaded, but failed to notify users',
              fileId: uploadStream.id,
            });
          }
        });

        uploadStream.on('error', (err) => {
          console.error('GridFS Upload Error:', err.message);
          return reject(new Error('Error during file upload: ' + err.message));
        });
      } catch (error) {
        console.error('Error in uploadDocument function:', error.message);
        return reject(
          new Error('Unexpected error in uploadDocument: ' + error.message)
        );
      }
    });
  } catch (err) {
    console.error('Error in postDocument:', err.message);
    throw new Error('Error occurred during uploading file(s): ' + err.message);
  }
};

exports.getDocuments = async (taskId, userId) => {
  try {
    const isExistingTask = await taskUtil.isExistingResource(Task, taskId);
    if (!isExistingTask) {
      throw new Error('Invalid taskId');
    }
    const isAccessible = await taskUtil.scopeChecker(userId, isExistingTask);
    if (!isAccessible) {
      throw new Error('You dont have privilege to access this task');
    }

    const documents = await bucket
      .find({ 'metadata.taskId': taskId })
      .toArray();

    const uploaderIds = documents
      .map((doc) => doc.metadata?.uploadedBy?.toString())
      .filter((id) => id);

    const users = await User.find({ _id: { $in: uploaderIds } }).select('name');

    const userMap = {};
    users.forEach((user) => {
      userMap[user._id.toString()] = user.name;
    });

    const docsWithUploader = documents.map((doc) => {
      const uploaderId = doc.metadata?.uploadedBy?.toString();
      const uploaderName = userMap[uploaderId] || 'Unknown';
      return {
        ...doc,
        uploaderName,
      };
    });

    return docsWithUploader;
  } catch (err) {
    console.error(err);
    throw new Error('Error occured during getting documents');
  }
};

exports.downloadDocument = async (data, res) => {
  try {
    // ✅ ObjectId 유효성 검사
    if (!mongoose.Types.ObjectId.isValid(data.did)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid document ID' });
    }
    const objectId = new mongoose.Types.ObjectId(data.did);

    // ✅ 파일 존재 여부 확인
    const file = await bucket.find({ _id: objectId }).toArray();
    if (!file || file.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'Document not found' });
    }

    const taskId = new mongoose.Types.ObjectId(file[0].metadata.taskId);
    const task = await Task.findById(taskId);

    if (!(await taskUtil.scopeChecker(data.userId, task))) {
      throw new Error('You dont have privilege to download this file');
    }

    // ✅ 다운로드 스트림 생성
    const downloadStream = bucket.openDownloadStream(objectId);

    // ✅ 다운로드 스트림 생성 및 응답 헤더 설정
    res.set({
      'Content-Type': file[0].contentType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename=${encodeURIComponent(file[0].filename)}`,
    });

    // ✅ 파일을 클라이언트로 스트리밍
    downloadStream.pipe(res);

    // ❌ 스트림 에러 처리 (응답 중단)
    downloadStream.on('error', (err) => {
      console.error('GridFS Download Error:', err.message);
      if (!res.headersSent) {
        return res
          .status(500)
          .json({ success: false, message: 'Error downloading file' });
      }
    });

    // ✅ 다운로드 완료 로깅
    downloadStream.on('end', () => {
      console.log(`File ${file[0].filename} downloaded successfully`);
    });
  } catch (err) {
    console.error('Error in downloadDocument:', err.message);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: 'Error occurred during downloading document',
      });
    }
  }
};

exports.searchDocuments = async (taskId, userId, keyword) => {
  try {
    const isExistingTask = await taskUtil.isExistingResource(Task, taskId);
    if (!isExistingTask) {
      throw new Error('No task found');
    }
    const isAccessible = await taskUtil.scopeChecker(userId, isExistingTask);
    if (!isAccessible) {
      throw new Error('You dont have privilege to access this task');
    }

    const documents = await bucket
      .find({
        'metadata.taskId': taskId,
        filename: { $regex: keyword, $options: 'i' },
      })
      .toArray();

    return documents;
  } catch (err) {
    console.error(err);
    throw new Error('Error occured during searching documents');
  }
};
