const express = require('express');
const admin = require('firebase-admin');
const app = express();
app.use(express.json());

// حماية السيرفر عبر API Key
app.use((req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.MY_API_KEY) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid API Key' });
  }
  next();
});

// تحميل بيانات Firebase من المتغيرات البيئية
const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.post('/send-notification', async (req, res) => {
  const { title, body, token, topic } = req.body;

  const message = {
    notification: { title, body },
    ...(token && { token }),
    ...(topic && { topic }),
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('✅ Notification sent:', response);
    res.status(200).send({ success: true, response });
  } catch (err) {
    console.error('❌ Error sending notification:', err);
    res.status(500).send({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 السيرفر يعمل على البورت: ${PORT}`);
});

