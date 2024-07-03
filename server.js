const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');

dotenv.config();

// Configurar Firebase
const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Obtén una instancia de Firestore
const db = admin.firestore();
// const ofrecimientosDb = db.collection()

// Configurar Express
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Rutas de la API
// Ruta para agregar un ofrecimiento
app.post('/api/crear-ofrecimiento', async (req, res) => {
  try {
    const ofrecimiento = {
      id: uuidv4(), // Generar un ID único
      nombre: req.body.nombre,
      descripcion: req.body.descripcion,
      socialUrl: req.body.socialUrl
    };
    await db.collection('ofrecimientos-team-c-julio-2024').add(ofrecimiento);
    res.json({ message: 'Ofrecimiento creado exitosamente.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error al crear el ofrecimiento.' });
  }
});

// Ruta para obtener todos los ofrecimientos
app.get('/api/obtener-ofrecimientos', async (req, res) => {
  try {
    const ofrecimientosSnapshot = await db.collection('ofrecimientos-team-c-julio-2024').get();
    const ofrecimientos = ofrecimientosSnapshot.docs.map(doc => doc.data());
    res.json(ofrecimientos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error al obtener los ofrecimientos.' });
  }
});

// Ruta para actualizar un ofrecimiento
app.put('/api/actualizar-ofrecimiento/:id', async (req, res) => {
  try {
    const ofrecimientoId = req.params.id
    // Ups parece que la línea de abajo esta comentada y es muy importante
    //const { nombre, descripcion, socialUrl } = req.body

    const ofrecimientoRef = db.collection('ofrecimientos-team-c-julio-2024').where('id', '==', ofrecimientoId);
    const ofrecimientoSnapshot = await ofrecimientoRef.get();

    if (ofrecimientoSnapshot.empty) {
      res.status(404).send('No se encontró el ofrecimiento');
    } else {
      // Actualizar el ofrecimiento encontrado
      const ofrecimientoDoc = ofrecimientoSnapshot.docs[0];
      await ofrecimientoDoc.ref.update({ nombre, descripcion, socialUrl });
      res.status(200).send('Ofrecimiento actualizado correctamente');
    }
  } catch (error) {
    console.error(error)
    res.status(500).send('Error al actualizar el ofrecimiento')
  }
});

// Ruta para eliminar un ofrecimiento
app.delete('/api/eliminar-ofrecimiento/:id', async (req, res) => {
  try {
    const ofrecimientoId = req.params.id
    const ofrecimientoRef = db.collection('ofrecimientos-team-c-julio-2024').where('id', '==', ofrecimientoId);
    const ofrecimientoSnapshot = await ofrecimientoRef.get();

    if (ofrecimientoSnapshot.empty) {
      res.status(404).send('No se encontró el ofrecimiento');
    } else {
      // Eliminar el ofrecimiento encontrado
      const ofrecimientoDoc = ofrecimientoSnapshot.docs[0];
      await ofrecimientoDoc.ref.delete();
      res.status(200).json({ message: 'Ofrecimiento eliminado exitosamente' });
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al eliminar el ofrecimiento' })
  }
});


// Iniciar servidor
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
});
