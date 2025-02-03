const { mongoose } = require('../../config/database');
const { GridFSBucket } = require('mongodb');
const taskUtil = require('../utils/task-util');
const Task = require('../models/Task');

let bucket;

mongoose.connection.once('open', () => {
  bucket = new GridFSBucket(mongoose.connection.db, {
    bucketName: 'documents',
  });
  console.log('✅ GridFSBucket initialized in docsService');
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
          metadata: { taskId },
        });

        uploadStream.end(file.buffer);

        uploadStream.on('finish', () => {
          resolve({
            success: true,
            message: 'Document uploaded successfully',
            fileId: uploadStream.id,
          });
        });

        uploadStream.on('error', (err) => {
          console.error('❌ GridFS Upload Error:', err.message);
          return reject(new Error('Error during file upload: ' + err.message));
        });
      } catch (error) {
        console.error('❌ Error in uploadDocument function:', error.message);
        return reject(
          new Error('Unexpected error in uploadDocument: ' + error.message)
        );
      }
    });
  } catch (err) {
    console.error('❌ Error in postDocument:', err.message);
    throw new Error('Error occurred during uploading file(s): ' + err.message);
  }
};
