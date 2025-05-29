const mongoose = require("mongoose");

const AvatarSchema = new mongoose.Schema({
  id_avatar: {
    type: String,
    required: true,
    unique: true
  },
  saludo: {
    type: String,
    required: false
  },
  instrucciones: {
    type: String,
    required: false
  },
  presentador: {
    voice_id: {
      type: String,
      required: false
    },
    presenter_id: {
      type: String,
      required: false
    }
  }
});

//module.exports = mongoose.model("avatar_stream", AvatarSchema);
module.exports = mongoose.model("AvatarStream", AvatarSchema, "avatar_stream");
