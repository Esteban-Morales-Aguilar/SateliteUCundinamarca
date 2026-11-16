db = db.getSiblingDB('spacenet');
['marco_teorico', 'guias', 'creditos', 'referencias'].forEach((c) => db.createCollection(c));
db.marco_teorico.createIndex({ slug: 1 }, { unique: true });
db.guias.createIndex({ slug: 1 }, { unique: true });
db.referencias.createIndex({ citeKey: 1 }, { unique: true });
