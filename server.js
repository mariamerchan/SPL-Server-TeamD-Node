const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');

// Configurar Firebase
const serviceAccount = require('./firebaseConfig.json'); // archivo JSON de credenciales de Firebase

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Obtén una instancia de Firestore
const db = admin.firestore();
// const testimoniosDb = db.collection()

// Configurar Express
const app = express();
app.use(cors());
app.use(bodyParser.json());


// Rutas de la API
// Ruta para agregar un testimonio
app.post('/api/crear-testimonio', async (req, res) => {
  try {
    const testimonio = {
      id: uuidv4(), // Generar un ID único
      nombre: req.body.nombre,
      descripcion: req.body.descripcion,
      socialUrl: req.body.socialUrl
    };
    await db.collection('testimonios-team-b-agosto').add(testimonio);
    res.json({ message: 'Testimonio creado exitosamente.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error al crear el testimonio.' });
  }
});

// Ruta para obtener todos los testimonios
app.get('/api/obtener-testimonios', async (req, res) => {
  try {
    const testimoniosSnapshot = await db.collection('testimonios-team-b-agosto').orderBy("nombre", "asc").get();
    const testimonios = testimoniosSnapshot.docs.map(doc => doc.data());
    res.json(testimonios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error al obtener los testimonios.' });
  }
});

// Ruta para actualizar un testimonio
app.put('/api/actualizar-testimonio/:id', async (req, res) => {
  try {
    const testimonioId = req.params.id
    // Ups parece que la línea de abajo es muy importante
    //const { nombre, descripcion, socialUrl } = req.body

    const testimonioRef = db.collection('testimonios-team-b-agosto').where('id', '==', testimonioId);
    const testimonioSnapshot = await testimonioRef.get();

    if (testimonioSnapshot.empty) {
      res.status(404).send('No se encontró el testimonio');
    } else {
      // Actualizar el testimonio encontrado
      const testimonioDoc = testimonioSnapshot.docs[0];
      await testimonioDoc.ref.update({ nombre, descripcion, socialUrl });
      res.status(200).send('Testimonio actualizado correctamente');
    }
  } catch (error) {
    console.error(error)
    res.status(500).send('Error al actualizar el testimonio')
  }
});

// Ruta para eliminar un testimonio
app.delete('/api/eliminar-testimonio/:id', async (req, res) => {
  try {
    const testimonioId = req.params.id
    const testimonioRef = db.collection('testimonios-team-b-agosto').where('id', '==', testimonioId);
    const testimonioSnapshot = await testimonioRef.get();

    if (testimonioSnapshot.empty) {
      res.status(404).send('No se encontró el testimonio');
    } else {
      // Eliminar el testimonio encontrado
      const testimonioDoc = testimonioSnapshot.docs[0];
      await testimonioDoc.ref.delete();
      res.status(200).json({ message: 'Testimonio eliminado exitosamente' });
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al eliminar el testimonio' })
  }
});


// Iniciar servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
});
