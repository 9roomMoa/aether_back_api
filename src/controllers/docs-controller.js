const { StatusCodes } = require('http-status-codes');
const docsService = require('../services/docs-service');

exports.postDocument = async (req, res) => {
  try {
    const { tid } = req.params;
    const { userId } = req.body;

    if (!tid || !userId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'TaskId or userId omitted',
      });
    }
    console.log('✅ Received File:', req.file);

    if (!req.file) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'No file provided',
      });
    }

    const document = await docsService.postDocument(req.file, tid, userId);

    return res.status(StatusCodes.CREATED).json({
      data: document,
      success: true,
      message: 'File(s) uploaded successfully',
    });
  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error: ' + err.message,
    });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const { tid } = req.params;
    const { userId } = req.body;

    if (!tid) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'taskId omitted',
      });
    }

    if (!userId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'userId omitted',
      });
    }

    const documents = await docsService.getDocuments(tid, userId);

    if (!documents) {
      return res.status(StatusCodes.OK).json({
        data: [],
        success: true,
        message: 'No documents found',
      });
    }

    return res.status(StatusCodes.OK).json({
      data: documents,
      success: true,
      message: 'Documents retreived successfully',
    });
  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error: ' + err.message,
    });
  }
};
