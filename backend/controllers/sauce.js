const Sauce = require('../models/Sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id; // Ces infos sont envoyées par le frontend et doivent être retirées. On traitera avec nos informations sécurisées
    delete sauceObject._userId;
    const sauce = new Sauce({
      ...sauceObject,
      userId: req.auth.userId,
      imageUrl: `${ req.protocol }://${ req.get('host') }/images/${ req.file.filename }`
    });
  
    sauce.save()
      .then(() => { res.status(201).json({ message: 'Sauce enregistrée !' }) })
      .catch(error => { res.status(400).json({ error }) })
};

exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error: error }));
}

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })  // req.params.id donne l'id qui a été passé en paramètre de la requête
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }));
}

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ? {
    // L'opérateur spread (...) permet de copier le contenu de mon objet sauce dans sauceObject
    ...JSON.parse(req.body.sauce),
    imageUrl: `${ req.protocol }://${ req.get('host') }/images/${ req.file.filename }`
  } : { ...req.body };

  delete sauceObject._userId;
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message : 'Requête non authorisée !' });
      } else {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${ filename }`, () => {
          Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
          .then(() => res.status(200).json({ message : 'Sauce modifiée !' }))
            .catch(error => res.status(400).json({ error }));
        })
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.modifyLikedSauce = (req, res, next) => {
  if(req.body.like === 1) {
    // $inc et $push sont des mots-clé permettant d'incrémenter et d'ajouter à un tableau
    // Ces noms ne sortent pas de nulle part
    Sauce.updateOne({ _id: req.params.id }, { $inc: { likes: req.body.like }, $push: { usersLiked: req.body.userId } })
    .then (()=> res.status(200).json({ message: 'Like ajouté !' }))
    .catch(error => res.status(400).json({ error }));
  }
  else {
    if (req.body.like === -1) {
      Sauce.updateOne({ _id: req.params.id }, { $inc: { dislikes: (req.body.like)*-1}, $push: { usersDisliked: req.body.userId } })
      .then (()=> res.status(200).json({ message: 'Dislike ajouté !' }))
      .catch(error => res.status(400).json({ error }));
    }
    else {  
      Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
          if (sauce.usersLiked.includes(req.body.userId)) {
            Sauce.updateOne({ _id: req.params.id }, { $pull: { usersLiked: req.body.userId }, $inc: { likes: -1 } })
              .then(() => { res.status(200).json({ message: 'Like retiré !' }) }) 
              .catch(error => res.status(400).json({ error }))
          }
          else {
            if (sauce.usersDisliked.includes(req.body.userId)) {
              Sauce.updateOne({ _id: req.params.id }, { $pull: { usersDisliked: req.body.userId }, $inc: { dislikes: -1 } })
                .then(() => { res.status(200).json({ message: 'Dislike retiré !' }) }) 
                .catch(error => res.status(400).json({ error }))  
            }
          }
        })
        .catch(error => res.status(400).json({ error }));
    }
  }
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      if(sauce.userId != req.auth.userId) {
        res.status(401).json({ message: 'Requête non authorisée !' })
      }
      else {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${ filename }`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message : 'Sauce supprimée !' }))
            .catch(error => res.status(400).json({ error }));
        });
      }
    })
    .catch(error => res.status(400).json({ error }));
}