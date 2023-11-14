const mongoose = require('mongoose');
const connect = mongoose.connect("mongodb://0.0.0.0/Login", {
    useNewUrlParser: true
});
// Check database connected or not
connect.then(() => {
    console.log("Database Connected Successfully");
})
.catch(() => {
    console.log("Database cannot be Connected");
})

// Create Schema
const Loginschema = new mongoose.Schema({
    name: {
        type:String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

const Cargoschema = new mongoose.Schema({
    CargoName: {
        type:String,
        required:true
    },
    CargoSub: {
        type:String,
        required:true
    },
    modalidad: {
        type: String,
        required: true
    },
    horario: {
        type: String,
        required: true
    },
    vacantes: {
        type: Number,
        required: true
    }
    ,
    renta: {
        type: Number,
        required: true
    }
});

// collection part
const collection = new mongoose.model("users", Loginschema);
const collectioncargo = new mongoose.model("cargos", Cargoschema);

module.exports = {
    collection: collection,
    collectioncargo: collectioncargo
};
