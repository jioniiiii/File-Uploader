const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getCreateFolderForm = (req, res) => {
    res.render('create-folder', { title: 'Create Folder'});
};

exports.createFolder = async (req, res) => {
    const { name } = req.body;
    
    if(!req.user) {
        return res.redirect('/log-in');
    }

    try {
        const folder = await prisma.folder.create({
            data: {
                name: name,
                user: { connect: { id: req.user.id }},
            },
        });
        res.redirect('/dashboard?message=Folder deleted successfully!');
    } catch(error) {
        console.error('Error creating folder:', error);
        res.render('create-folder', { message: 'Error creating folder. Please try again.', title: 'Create Folder' });
    }
};

exports.deleteFolder = async (req, res) => {
    const { id } = req.params;
  
    if(!req.user) {
        return res.redirect('/log-in');
    }
  
    try{ 
      await prisma.folder.delete({
        where: {
          id: parseInt(id),
        },
    });
  
    res.redirect('/dashboard?message=Folder deleted successfully!');
    } catch(error){
      console.error('Error deleting folder:', error);
      res.render('dashboard', { message: 'Error deleting folder. Please try again.', title: 'Dashboard' });
    }
};

exports.addFIleToFOlder = async (req, res) => {
    const { folderId } = req.body;

    if(!req.user) {
        return res.redirect('/log-in');
    }

    try{
        const newFile = await prisma.file.create({
            data: {
                name: req.file.originalname, 
                content: req.file.buffer,                   
                user: {
                    connect: {
                        id: req.user.id,
                    },
                },         
                folder: {
                    connect: {
                        id: parseInt(folderId),
                    },
                },  
                createdAt: new Date(),         
                updatedAt: new Date(), 
            },
        });
        res.redirect('/dashboard?message=File added to folder successfully!');
    } catch(error) {
        console.error('Error adding file to folder:', error);
        res.redirect('/dashboard?message=Error adding file to folder. Please try again.');
    }
};

exports.delFIleToFOlder = async (req, res) => {
    const { fileId } = req.body;

    if(!req.user) {
        return res.redirect('/login');
    }

    try{
        const updatedFile = await prisma.file.delete({
            where: { id: parseInt(fileId) }
        });
        res.redirect('/dashboard?message=File removed from folder successfully!');
    } catch (error) {
        console.error('Error removing file from folder:', error);
        res.redirect('/dashboard?message=Error removing file from folder. Please try again.');
    }
}

exports.downloadFolder = async (req, res) => {
  try {
    const folderId = req.params.id;

    
    const folder = await prisma.folder.findUnique({
      where: { id: parseInt(folderId) },
      include: { files: { select: { name: true, userId: true, content: true } } }, 
    });

    if (!folder || folder.userId !== req.user.id) {
      return res.status(403).send('Access denied.');
    }

    console.log('Folder object:', folder);

    res.setHeader('Content-Disposition', `attachment; filename="${folder.name}.zip"`);
    res.setHeader('Content-Type', 'application/zip');

    //create a zip stream
    const zip = require('archiver')('zip');
    zip.pipe(res);

    //loop through each file in the folder and append to the zip
    for (const file of folder.files) {
      if (file.content) {
        zip.append(file.content, { name: file.name });
      } else {
        console.error(`File content not found for: ${file.name}`);
      }
    }

    //finalize the zip archive
    zip.finalize();

  } catch (error) {
    console.error('Error downloading folder:', error);
    res.status(500).send('Server error.');
  }
};