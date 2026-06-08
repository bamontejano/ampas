const admin = require('firebase-admin');
const serviceAccount = {
  projectId: 'ampa-connect',
  clientEmail: 'firebase-adminsdk-fbsvc@ampa-connect.iam.gserviceaccount.com',
  privateKey: '-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDGZUPmfak9ANaC\nbcweqTvFrcTpSjWLByNdg1+nBG4e/+q69ZOeZjmwpePuXgOFua49tjVTHojIyMfQ\nxWTrhJbLZvPgRTJn/kkgdoCnSGcTK53b+MXzoOwJPy3Xmqo5I9iP0RnTkM8vRJZm\n3lwTGGmYLqC0++IL1R+FSmFIGdebSPAqTRBD2mWqL1xeH79WAQg0KCjVqu801pSu\n3EzADVSrzoOEKglYkMSRuB6ApLSxKamHoPXhUOP/NivDVjA8HZFTZDJLlDKZVbA9\nVWDI+r31JyFs1zG2PNFul3YFO8Y3n749oOcQsduOZ3/qFrg1zQNKgDs+NXo8t9mJ\nZb/PiAORAgMBAAECggEAA+dTLjJTxaUCE3/oj8PhrrKMGNECe7FQw1LF64ndRtPf\nQP17AZdeVDj3YqXL6PIt2P4AT5netCCrOdLgePfbZbYpX0TNSJmKw85BGsmEaa6m\nhQEAmBoW+tmY49Chv80SQkYpfW2wfewaD30Zj7Cfx0RHmjgIixYO8Db18g68HMyK\nOOlZvtICfN5RUmzNEpR2ovO+1rH1Z9ny1LboNLYd++nDyFbNn1eq0Gv+N12sAcPV\nHVoHstwenG3KTzdU8l4CMWDj8FROR7j3WUf7gQ3zCjdoTCK/iW1R4NvEKIJcktao\nLCsDiFhzrzGnBQv61XApUjvLFamX4nDEGhfoONLQdwKBgQDqzyRzAV7CLM3aJS3/\nVDW7YGOTkjpT1RSrKRuuczPk09KGuxlHmGxoxfdJudxj5Uzzc7kO3gznyXHOyacy\nyQwitIxh/BtMki7mLtixg4TSq8lDreahfosKmNN1dh+ct0eDWiX3gJQFzqGmqi9T\nS6NER59xDUHNzrDpo9kRolhj1wKBgQDYTNmrOM3EeCiX0Evhrk57sj2G+zdpSKh2\n8LYDU6Jn/vIFstA+TAu1z11w8hVegdf4csXYV/klfnKF3tq7mTGuRUp/w6k30LTS\nJaYevJX2XwQ6jGfX8zsyGm1XjuhUiri2NVXe6ibDQdcT+VPppV/kdFAzBaNCzpST\nzupr7A/m1wKBgQCM6sHCL0lSGRd1WqjPOheBG2jHMJPGqfNcgTA2srarFqCa8QBL\n4mL1QhGVcnCclwlmdcXS8VonZNLjOkwYg2XAEkDJsUYk3vo8dFLhvb9hu2zvLBdk\nRhBlzK/jJ3/zSl8lql1suwKatZZ38lyyjYsvOBis/TrHq8qqfQWRuq93QwKBgQCa\nXh5qqFuR//9YeXvuUKwKc6adkuR06znvyNLdhO6/MaAgmQEttLAWzStu1BaUIC62\nTZMNV5ukOp4ZFHces7JVIXaNwGIgR38FC4GHJigQcLdf4Zyq7hgtJdcrSf5dd7Nj\ntqTWNl37tB1/T82nTjMlpC0ofLmLkEtRQbbj1tFyeQKBgQCFMsbgr2uBkKOjDy+v\nFiNQQPkrLMZ/zAjJcO6rfhXmGl9wqqB+q1hPaFB0wwSMQoXrH8A+/sy1+1JIywSQ\noh6sLlcPgTD8A7S6ytodKXK+CuCTMg4ZiBNZXO3ysO+uL616FfxpzEczBE208BtP\nJwM4d7A/gJgOmarPKnQNE+D5tQ==\n-----END PRIVATE KEY-----\"
};
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function check() {
  const profiles = await db.collection('profiles').get();
  profiles.forEach(d => console.log('Profile:', d.id, d.data()));
  
  const ampas = await db.collection('ampas').get();
  ampas.forEach(d => console.log('Ampa:', d.id, d.data()));

  const invitaciones = await db.collection('invitaciones').get();
  invitaciones.forEach(d => console.log('Invitacion:', d.id, d.data()));
}
check().catch(console.error);
