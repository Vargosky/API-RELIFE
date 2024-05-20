const jwt = require("jwt-simple");
const moment = require("moment");
const {hashear} = require("./fx");


//clave secreta

const secret = hashear("Jehová es mi pastor; nada me faltará");
const adminSecret = hashear("");

 const createToken = (user)=>{

    const payload = {
        id: user.id,
        name: user.name,
        surname: user.surname,
        wallet:user.wallet,
        email: user.email,
        role: user.role,
        image:user.image,
        iat:moment().unix(),
        exp:moment().add(30,"day").unix()
    };

    return jwt.encode(payload,secret);

}


module.exports= {
    secret,
    createToken,
    
}