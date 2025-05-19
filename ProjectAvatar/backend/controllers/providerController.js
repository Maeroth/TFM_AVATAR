const Proveedor = require('../models/Proveedor');

// Crear un nuevo proveedor
const nuevoProveedor = async (req, res) => {
  try {

    const { proveedor, plan } = req.body;

    //Creamos variables auxiliares para contener en minúsculas los valores
    const proveedorMinusculas = proveedor.trim().toLowerCase();
    const planMinusculas = plan.trim().toLowerCase();

    // Buscar ignorando mayúsculas
    const existente = await Proveedor.findOne({
    $expr: {
        $and: [
        { $eq: [{ $toLower: "$proveedor" }, proveedorMinusculas] },
        { $eq: [{ $toLower: "$plan" }, planMinusculas] }
        ]
    }
    });

    //Si existe, devolvemos mensaje indicando su existencia
    if (existente) {
      return res.status(500).json({
        error: `El proveedor "${proveedor}" con el plan "${plan}" ya existe en base de datos.`
      });
    }

    const nuevo = new Proveedor(req.body);
    await nuevo.save();

    return res.status(201).json({
      message: `El proveedor "${proveedor}" con el plan "${plan}" ha sido guardado correctamente.`
    });
  } catch (error) {
    console.error("Error al guardar proveedor:", error);
    return res.status(500).json({ error: "Error interno al guardar proveedor" });
  }
};

const obtenerComboProveedores = async (req, res) => {
  try {
    const proveedores = await Proveedor.find({}, { proveedor: 1, plan: 1, _id: 1 })
      .sort({ proveedor: 1, plan: 1 }) //Lo traemos ordenado para mejor visualización
      .lean(); 

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

const obtenerProveedorPorId = async (req, res) => {
  try {
    const proveedor = await Proveedor.findById(req.params.id).lean();
    if (!proveedor) return res.status(404).json({ error: "Proveedor no encontrado" });
    res.json(proveedor);
  } catch (error) {
    res.status(500).json({ error: "Error al cargar proveedor" });
  }
};

const editarProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    const { proveedor, plan, ...restoCampos } = req.body; // Excluimos proveedor y plan

    const proveedorActualizado = await Proveedor.findByIdAndUpdate(
      id,
      { $set: restoCampos },
      { new: true }
    );

    if (!proveedorActualizado) {
      return res.status(404).json({ error: "Proveedor no encontrado." });
    }

    res.status(200).json({
      message: `El proveedor "${proveedorActualizado.proveedor}" con el plan "${proveedorActualizado.plan}" ha sido actualizado correctamente.`
    });
  } catch (error) {
    console.error("Error al editar proveedor:", error);
    res.status(500).json({ error: "Error interno al editar proveedor." });
  }
};

// Borrar un proveedor por ID
const borrarProveedor = async (req, res) => {
  try {
    const { id } = req.params;

    const eliminado = await Proveedor.findByIdAndDelete(id);

    if (!eliminado) {
      return res.status(404).json({ error: "Proveedor no encontrado" });
    }

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