const Proveedor = require('../models/Proveedor');

// Método para crear un nuevo proveedor en la base de datos
const nuevoProveedor = async (req, res) => {
  try {
    const { proveedor, plan } = req.body;

    // Normalizamos los campos proveedor y plan para ignorar mayúsculas/minúsculas
    const proveedorMinusculas = proveedor.trim().toLowerCase();
    const planMinusculas = plan.trim().toLowerCase();

    // Verificamos si ya existe un proveedor con el mismo nombre y plan (ignorando mayúsculas)
    const existente = await Proveedor.findOne({
      $expr: {
        $and: [
          { $eq: [{ $toLower: "$proveedor" }, proveedorMinusculas] },
          { $eq: [{ $toLower: "$plan" }, planMinusculas] }
        ]
      }
    });

    // Si existe, retornamos error con mensaje informativo
    if (existente) {
      return res.status(500).json({
        error: `El proveedor "${proveedor}" con el plan "${plan}" ya existe en base de datos.`
      });
    }

    // Creamos el nuevo proveedor con los datos del cuerpo de la solicitud
    const nuevo = new Proveedor(req.body);
    await nuevo.save();

    // Enviamos mensaje de éxito
    return res.status(201).json({
      message: `El proveedor "${proveedor}" con el plan "${plan}" ha sido guardado correctamente.`
    });
  } catch (error) {
    // Manejamos errores del servidor
    console.error("Error al guardar proveedor:", error);
    return res.status(500).json({ error: "Error interno al guardar proveedor" });
  }
};


// Devuelve un listado simplificado de proveedores para usar en selectores desplegables (combos)
const obtenerComboProveedores = async (req, res) => {
  try {
    const proveedores = await Proveedor.find({}, { proveedor: 1, plan: 1, _id: 1 })
      .sort({ proveedor: 1, plan: 1 }) // Ordenamos alfabéticamente para mostrar mejor en UI
      .lean(); // .lean() mejora rendimiento al traer objetos planos de Mongo

    // Transformamos los resultados al formato { id, nombre: "Proveedor (Plan)" }
    const resultado = proveedores.map(p => ({
      id: p._id,
      nombre: `${p.proveedor} (${p.plan})`
    }));

    res.json(resultado);
  } catch (error) {
    console.error("Error al obtener proveedores:", error);
    res.status(500).json({ error: "Error al cargar proveedores." });
  }
};

// Devuelve todos los datos de un proveedor concreto a partir de su ID
const obtenerProveedorPorId = async (req, res) => {
  try {
    const proveedor = await Proveedor.findById(req.params.id).lean();

    if (!proveedor)
      return res.status(404).json({ error: "Proveedor no encontrado" });

    res.json(proveedor);
  } catch (error) {
    res.status(500).json({ error: "Error al cargar proveedor" });
  }
};


// Actualiza los campos técnicos del proveedor (sin modificar nombre ni plan)
const editarProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    const { proveedor, plan, ...restoCampos } = req.body; // Ignoramos proveedor y plan

    // Actualizamos solo los campos técnicos usando $set
    const proveedorActualizado = await Proveedor.findByIdAndUpdate(
      id,
      { $set: restoCampos },
      { new: true } // Devolvemos el documento actualizado
    );

    if (!proveedorActualizado) {
      return res.status(404).json({ error: "Proveedor no encontrado." });
    }

    // Confirmamos la actualización con un mensaje
    res.status(200).json({
      message: `El proveedor "${proveedorActualizado.proveedor}" con el plan "${proveedorActualizado.plan}" ha sido actualizado correctamente.`
    });
  } catch (error) {
    console.error("Error al editar proveedor:", error);
    res.status(500).json({ error: "Error interno al editar proveedor." });
  }
};


// Elimina un proveedor de la base de datos usando su ID
const borrarProveedor = async (req, res) => {
  try {
    const { id } = req.params;

    // Intentamos borrar el proveedor
    const eliminado = await Proveedor.findByIdAndDelete(id);

    if (!eliminado) {
      return res.status(404).json({ error: "Proveedor no encontrado" });
    }

    // Confirmamos que se eliminó correctamente
    res.json({ message: "Proveedor eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar proveedor:", error);
    res.status(500).json({ error: "Error al eliminar proveedor" });
  }
};

module.exports = {
  nuevoProveedor,
  obtenerComboProveedores,
  obtenerProveedorPorId,
  editarProveedor,
  borrarProveedor
};