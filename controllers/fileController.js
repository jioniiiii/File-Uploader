const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getUploadForm = (req, res) => {
    res.render('upload', { title: 'Upload' });
};

exports.uploadFile = async (req, res) => {
  if(!req.file) {
    return res.render('upload', { message: 'Please select a file to upload.' });
  }
  
  if(!req.user) {
    return res.redirect('/log-in');
}

  try {
    await prisma.file.create({
      data: {
        name: req.file.originalname, 
        path: req.file.path ,
        content: req.file.buffer,
        user: {
          connect: { id: req.user.id }, 
        },
        folder: req.params.id ? {
          connect: { id: parseInt(req.params.id) } 
        } : undefined,
      },
  });

  res.redirect('/dashboard?message=File uploaded successfully!');
  } catch(error) {
    console.error('Error saving file to database:', error);
    res.render('upload', { message: 'Error uploading file. Please try again.', title: 'upload' });
  }
};

exports.deleteFile = async (req, res) => {
  const { id } = req.params;

  if(!req.user) {
    return res.redirect('/log-in');
}

  try{ 
    await prisma.file.delete({
      where: {
        id: parseInt(id),
      },
  });

  res.redirect('/dashboard?message=File deleted successfully!');
  } catch(error){
    console.error('Error deleting file:', error);
    res.render('dashboard', { message: 'Error deleting file. Please try again.', title: 'Dashboard' });
  }
};

exports.downloadFile = async (req, res) => {
  try {
    const fileId = req.params.id;
    
    //find the file by ID (ensure its owned by the loggedin user)
    const file = await prisma.file.findUnique({
      where: { id: parseInt(fileId) },
      select: { name: true, userId: true, content: true }, //include content
    });

    if (!file || file.userId !== req.user.id) {
      return res.status(403).send('Access denied.');
    }

    console.log('File object:', { ...file, content: file.content ? `${file.content.length} bytes` : 'undefined' });

    //set appropriate headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    //send the file content
    if (file.content) {
      res.send(file.content);
    } else {
      res.status(404).send('File content not found.');
    }

  } catch (error) {
    console.error('Error fetching file:', error);
    res.status(500).send('Server error.');
  }
};