const multer = require('multer');

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};

const storage = multer.diskStorage({ // On prépare ce qu'on va aller enregistrer dans le disque dur
    destination: (req, file, callback) => {
        callback(null, 'images') // Sera stocké dans le dossier images
    },
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_'); // On récupère le nom du fichier et on lui remplace ses espaces par des underscores
        const extension = MIME_TYPES[file.mimetype]; // On retrouve l'extension de notre fichier
        callback(null, name + Date.now() + '.' + extension); // On recrée le nom de notre fichier en le rendant unique avec Date
    }
});

module.exports = multer({ storage }).single('image');