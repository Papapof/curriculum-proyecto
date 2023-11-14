const express = require("express");
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const path = require("path");
const { collection, collectioncargo } = require("./config");
const bcrypt = require('bcrypt');

const app = express();
// Middleware para analizar JSON y formularios URL-encoded
app.use(bodyParser.json());
// Static file
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
//use EJS as the view engine
app.set("view engine", "ejs");
// En tu archivo de servidor (indexog.js)


app.get("/", (req, res) => {
    res.render("login");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

const curriculumSchema = new mongoose.Schema({
    nombre: String,
    rut: String,
    telefono: Number,
    email: String,
    experiencia: String,
    habilidades: [String],
    idiomas: [String],
    cargo: String,
    educacion: [String], // Cambiado a un array para almacenar múltiples recintos de educación
    idoneidad: Number,
});
const Curriculum = mongoose.model('Curriculum', curriculumSchema);
// Ruta para guardar un nuevo currículum con habilidades y educación
app.post('/logcurriculums', async (req, res) => {
    try {
      const { nombre, rut, telefono, email, experiencia, habilidades, idiomas, cargo, educacion } = req.body;

      // Calcular la puntuación de idoneidad bas ada en las habilidades seleccionadas
      const puntuacionHabilidades = habilidades.reduce((total, habilidad) => {
        switch (habilidad) {
        case 'sony vegas':
        case 'adobe photoshop':
            return total + 1;
        case 'adobe premiere':
            return total + 2;
        case 'visual studio code':
            return total + 15;
        case 'ruby':
            return total + 4;
        case 'c++':
            return total + 20;
        case 'java':
            return total + 15;
        case 'javascript':
            return total + 15;
        case 'python':
            return total + 30;
        case 'c':
            return total + 15;
        case 'assembly':
            return total + 6;
        case 'netbeans':
            return total + 10;
        case 'mongodb':
            return total + 25;
        case 'mysql':
            return total + 30;
          default:
            return total;
        }
      }, 0);

      // Calcular la puntuación de idoneidad bas ada en las habilidades seleccionadas
      const puntuacionIdiomas = idiomas.reduce((total, idioma) => {
        switch (idioma) {
        case 'ingles':
            return total + 25;
        case 'mandarin':
            return total + 25;
        case 'español':
            return total + 2;
        case 'arabe':
            return total + 25;
        case 'frances':
            return total + 14;
        case 'ruso':
            return total + 20;
        case 'portugues':
            return total + 15;
          default:
            return total;
        }
      }, 0);

      // Calcular la puntuación de idoneidad total
      const puntuacionEducacion = 15;
      const idoneidad = puntuacionHabilidades + puntuacionEducacion + puntuacionIdiomas;

      const newCurriculum = new Curriculum({
        nombre,
        rut,
        telefono,
        email,
        experiencia,
        habilidades,
        idiomas,
        cargo,
        educacion,
        idoneidad,
      });
      await newCurriculum.save();
      res.status(201).json(newCurriculum);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
});

//ordenar curriculums
app.get('/curriculums', async (req, res) => {
    try {
      const candidatosOrdenados = await Curriculum.find().sort({ idoneidad: -1 }).exec();
      res.render('curriculums', { curriculums: candidatosOrdenados });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

// Register User
app.post("/signup", async (req, res) => {

    const data = {
        name: req.body.username,
        password: req.body.password
    }

    // Check if the username already exists in the database
    const existingUser = await collection.findOne({ name: data.name });

    if (existingUser) {
        res.send('User already exists. Please choose a different username.');
    } else {
        // Hash the password using bcrypt
        const saltRounds = 10; // Number of salt rounds for bcrypt
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);

        data.password = hashedPassword; // Replace the original password with the hashed one

        const userdata = await collection.insertMany(data);
        console.log(userdata);
    }

});

// Login user
app.post("/login", async (req, res) => {
    try {
        const check = await collection.findOne({ name: req.body.username });
        if (!check) {
            res.send("User name cannot found")
        }
        // Compare the hashed password from the database with the plaintext password
        const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
        if (!isPasswordMatch) {
            res.send("wrong Password");
        }
        else {
            res.redirect('/logcurriculums')
        }
    }
    catch {
        res.send("wrong Details");
    }
});

// insertar cargos

app.post("/admin", async (req, res) => {

    const data = {
        CargoName: req.body.CargoName,
        CargoSub: req.body.CargoSub,
        modalidad: req.body.modalidad,
        horario: req.body.horario,
        vacantes: req.body.vacantes,
        renta: req.body.renta,
    }

    // ver si existe el cargo en la base de datos
    const existingjob = await collectioncargo.findOne({ CargoName: data.CargoName });

    if (existingjob) {
        res.send('cargo ya existe');
    } else {
        const cargodata = await collectioncargo.insertMany(data);
        console.log(cargodata);
    }
});

// En tu archivo de servidor (app.js u otro)
app.get("/admin", async (req, res) => {
    // Obtener todos los cargos de la base de datos
    const allCargos = await collectioncargo.find();
    res.render("admin", { cargos: allCargos });
});

app.get("/logcurriculums", async (req, res) => {
    try {
        const allCargos = await collectioncargo.find();
        res.render("logcurriculums", { cargos: allCargos });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Define Port for Application
const port = 3000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
});
