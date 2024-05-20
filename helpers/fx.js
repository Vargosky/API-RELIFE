const User = require("../model/User.js");
const bcrypt = require("bcrypt");
const crypto = require('crypto');



const equivalenciasCO2  = 
  {
      "papel": 0.5,
      "carton": 0.5,
      "vidrio": 0.3,
      "P-PET": 1.2,
      "P-HDPE": 1.5,
      "P-LDPE": 2,
      "P-PVC": 3,
      "P-PP": 2,
      "neumatico": 14,
      "P-PS": 2,
      "lubricante": 3,
      "pila": 60,
      "aerosol": 1.5,

 }


const validarRegistro=(name,surname,nick,email)=>{

    return(name && surname && nick && email)
}

// const existe = (user_to_save)=>{
    
//     const users = User.find({$or:[
//             { email:user_to_save.email.toLowerCase()},
//             { nick: user_to_save.nick.toLowerCase()}
        
//         ]}).exec()

//     if (users.legth >=1)return false;
//     else return true;
// }


function hashear(text) {
    // Creamos un objeto de la clase SHA-256
    const hash = crypto.createHash('sha256');    
    // Actualizamos el hash con el texto pasado como parámetro
    hash.update(text);    
    // Devolvemos el hash en formato hexadecimal
    return hash.digest('hex');
  }




async function verifyPassword(password, hashedPassword) {
// Comparamos la contraseña ingresada con el hash almacenado
const match = await bcrypt.compare(password, hashedPassword);
return match;
}




async function hashPassword(password) {
const saltRounds = 10;
  // Generamos un salt aleatorio
const salt = await bcrypt.genSalt(saltRounds);
  // Hasheamos la contraseña con el salt
const hashedPassword = await bcrypt.hash(password, salt);
return hashedPassword;
}


function getCo2e(material, cantidad) {
  // Verifica si el material existe en las equivalencias de CO2
  if (material in equivalenciasCO2) {
    // Calcula la cantidad de CO2 equivalente
    const cantidadCO2 = cantidad * equivalenciasCO2[material];
    return cantidadCO2
    // console.log(`El material ${material} produce ${cantidadCO2} kg de CO2 equivalente por ${cantidad} unidades`);
  } else {
    return null;
  }
}







module.exports = {
    validarRegistro,
    // existe,
    hashear,
    hashPassword,
    verifyPassword,
    getCo2e
}