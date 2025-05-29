import React, { useState } from "react";

const colores = [
  "#ffffff", "#f8f9fa", "#47ffff", "#ffb347",
  "#ffc0cb", "#d3d3d3", "#000000", "#1e90ff",
  "#90ee90", "#ffa07a"
];

const SelectorFondo = ({ onSeleccionarFondo }) => {
  const [tipo, setTipo] = useState("color");
  const [color, setColor] = useState("#ffffff");
  const [file, setFile] = useState(null);

  const handleColorChange = (colorSeleccionado) => {
    setColor(colorSeleccionado);
    onSeleccionarFondo({ tipo: "color", valor: colorSeleccionado });
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      onSeleccionarFondo({ tipo: "imagen", valor: selected });
    }
  };

  return (
    <div className="mt-4">
      <label className="form-label fw-semibold">Tipo de fondo</label>
      <select
        className="form-select mb-3"
        value={tipo}
        onChange={(e) => {
          const nuevoTipo = e.target.value;
          setTipo(nuevoTipo);
          if (nuevoTipo === "color") {
            onSeleccionarFondo({ tipo: "color", valor: color });
          } else if (file) {
            onSeleccionarFondo({ tipo: "imagen", valor: file });
          }
        }}
      >
        <option value="color">Color</option>
        <option value="imagen">Imagen</option>
      </select>

      {tipo === "color" && (
        <div className="d-flex gap-2 flex-wrap">
          {colores.map((c) => (
            <div
              key={c}
              title={c}
              onClick={() => handleColorChange(c)}
              style={{
                width: 35,
                height: 35,
                backgroundColor: c,
                border: c === color ? "2px solid black" : "1px solid #ccc",
                cursor: "pointer",
                borderRadius: 4
              }}
            ></div>
          ))}
        </div>
      )}

      {tipo === "imagen" && (
        <div className="mt-2">
          <input type="file" accept="image/*" onChange={handleFileChange} />
          {file && (
            <div className="mt-2">
              <p className="text-muted">{file.name}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SelectorFondo;
