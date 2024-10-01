const express = require('express');
const router = express.Router();
const indexController = require('../controllers/indexController');
const fileController = require('../controllers/fileController');
const folderController = require('../controllers/folderController');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/', indexController.indexGet);

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/log-in');
}
  
router.get('/dashboard', ensureAuthenticated, indexController.getFoldersAndFiles);

router.get('/upload', ensureAuthenticated, fileController.getUploadForm);
router.post('/upload', ensureAuthenticated, upload.single('file'), fileController.uploadFile);

router.get('/create-folder', ensureAuthenticated, folderController.getCreateFolderForm);
router.post('/create-folder', ensureAuthenticated, folderController.createFolder);

router.post('/delete-file/:id', ensureAuthenticated, fileController.deleteFile);
router.post('/delete-folder/:id', ensureAuthenticated, folderController.deleteFolder);

router.post('/add-file-to-folder', ensureAuthenticated, upload.single('file'), folderController.addFIleToFOlder);
router.post('/remove-file-from-folder', ensureAuthenticated, folderController.delFIleToFOlder);

router.get('/download-file/:id', ensureAuthenticated, fileController.downloadFile);
router.get('/download-folder/:id', ensureAuthenticated, folderController.downloadFolder);

  
module.exports = router;