const mongoose = require("mongoose");

const AvatarSchema = new mongoose.Schema({
  id_avatar: {
    type: String,
    required: true,
    unique: true
  },
  ruta_video:{
    type: String,
    required: false
  },
  ruta_fisica_video:{
    type: String,
    required: false
  },
  status:{
    type: String,
    required: false
  },
  errores:{
    type: String,
    required: false
  }

  
});

module.exports = mongoose.model("avatars", AvatarSchema);
