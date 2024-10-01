const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


exports.indexGet = (req, res) => {
    res.render('index', { title: 'Home' });
};

exports.getFoldersAndFiles = async (req, res) => {
    try{
        if(!req.user) {
            return res.redirect('/log-in');
        }

        const folders = await prisma.folder.findMany({
            where: {
                userId: req.user.id, //ensure folders are filtered by the logged-in user
            },
            include: {
                files: true,//inlcude files from folder
            },
        });

        const filesWithoutFolder = await prisma.file.findMany({
            where: {
                userId: req.user.id,
                folderId: null,//no folder assigned
            },
        });
        const message = req.query.message || '';
        res.render('dashboard', {
            folders,
            filesWithoutFolder,
            message,
            user: req.user,
            title: 'Dashboard',
        });
    } catch(error){
        console.error('Error fetching folders and files:', error);
        res.render('dashboard', {
            title: 'Dashboard',
            message: 'Error loading folders and files.',
        });
    }
};