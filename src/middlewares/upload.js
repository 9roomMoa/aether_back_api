const multer = require('multer');

// ✅ 메모리 스토리지 사용 (GridFS 업로드용)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 20 },
});

// ✅ 단일 파일 업로드 설정 (필드명: 'file')
module.exports = {
  // uploadSingle: upload.single('file'),
  uploadMultiple: upload.array('files', 5),
};
