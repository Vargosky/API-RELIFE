const test = (req,res)=>{

    return res.status(200).send({
        message:"test message"
    });


}



module.exports = { test }