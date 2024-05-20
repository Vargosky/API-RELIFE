const Contacto = require('../model/Contacto');


const solicitarContacto = async (req, res) => {
    //const usuarioSolicitanteId = req.user._id;
    const {usuarioSolicitanteId} = req.body;
    const usuarioSolicitadoId = req.params.usuarioSolicitadoId;

    if (usuarioSolicitanteId === usuarioSolicitadoId) {
        return res.status(400).json({
            message: "No puedes enviarte una solicitud de contacto a ti mismo.",
        });
    }

    try {
        // Verificar si ya existe una solicitud o amistad entre estos usuarios
        const contactoExistente = await Contacto.findOne({
            $or: [
                { usuarioSolicitante: usuarioSolicitanteId, usuarioSolicitado: usuarioSolicitadoId },
                { usuarioSolicitante: usuarioSolicitadoId, usuarioSolicitado: usuarioSolicitanteId },
            ],
        });

        if (contactoExistente) {
            return res.status(400).json({
                message: "Ya existe una solicitud o amistad entre estos usuarios.",
            });
        }

        // Crear una nueva solicitud de contacto
        const nuevaSolicitud = new Contacto({
            usuarioSolicitante: usuarioSolicitanteId,
            usuarioSolicitado: usuarioSolicitadoId,
        });

        await nuevaSolicitud.save();

        res.status(201).json({
            message: "Solicitud de contacto enviada exitosamente.",
            solicitud: nuevaSolicitud,
        });
    } catch (error) {
        console.error("Error al enviar la solicitud de contacto:", error);
        res.status(500).json({
            message: "Error al enviar la solicitud de contacto.",
        });
    }
};



module.exports = { solicitarContacto };
