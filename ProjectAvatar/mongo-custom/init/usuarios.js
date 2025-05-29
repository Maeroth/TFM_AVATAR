db = db.getSiblingDB('AvatarDB');

db.usuarios.insertMany([
  {
    usuario: "admin",
    password: "$2a$12$ceM4Bw7oZmSipIGww3zjD.bA5kzmukzbYw0nZzS4RPcjhEQIHcKdO",
  },
  {
    usuario: "experto",
    password: "$2a$12$dGlLyLIuCSaNBadYMUp.neEd4S2ZxMS9rkqTdhUz4yrfKYvqva4eS",
  }
]);