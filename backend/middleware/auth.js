const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]; // On récupère la valeur du token
        const decodeToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET'); // On vérifie la concordance entre notre token et la clé secrète définie lors de la connexion de l'utilisateur
        const userId = decodeToken.userId; // On récupère le userId du token décodé
        req.auth = { // On l'inscrit dans req.auth
            userId: userId
        };
        next();
    }
    catch(error) {
        res.status(401).json({ error });
    }
};