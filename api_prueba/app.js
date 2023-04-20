const redis = require("redis");
var express = require("express");
const cors = require('cors');

const redisclient = redis.createClient({
  url: "redis://db-redis-node:6379",
});
redisclient.connect();

var app = express();

app.use(cors());

redisclient.on("connect", function () {
  console.log("Connected to redis");
});

redisclient.on("ready", () => {
  console.log("Connected!");
});

redisclient.on("error", (err) => {
  console.log("Error in the Connection");
});


/*app.get("/cargar", async function (req, res) {
  res.send("cargado");
    redisclient.LPUSH('Chapter 1', 'The Mandalorian')
    redisclient.LPUSH('Chapter 1', '2000')
    redisclient.LPUSH('Chapter 1', 'disponible')


    redisclient.LPUSH('Chapter 2', 'The Child')
    redisclient.LPUSH('Chapter 2', '2000')
    redisclient.LPUSH('Chapter 2', 'disponible')


    redisclient.LPUSH('Chapter 3', 'The Sin')
    redisclient.LPUSH('Chapter 3', '2000')
    redisclient.LPUSH('Chapter 3', 'disponible')


    redisclient.LPUSH('Chapter 4', 'Sanctuary')
    redisclient.LPUSH('Chapter 4', '2000')
    redisclient.LPUSH('Chapter 4', 'disponible')

    redisclient.LPUSH('Chapter 5', 'The Gunslinger')
    redisclient.LPUSH('Chapter 5', '2000')
    redisclient.LPUSH('Chapter 5', 'disponible')

    redisclient.LPUSH('Chapter 6', 'The Prisoner')
    redisclient.LPUSH('Chapter 6', '2000')
    redisclient.LPUSH('Chapter 6', 'disponible')

    redisclient.LPUSH('Chapter 7', 'The Reckoning')
    redisclient.LPUSH('Chapter 7', '2000')
    redisclient.LPUSH('Chapter 7', 'disponible')

    redisclient.LPUSH('Chapter 8', 'Redemption')
    redisclient.LPUSH('Chapter 8', '2000')
    redisclient.LPUSH('Chapter 8', 'disponible')
});*/



app.get("/capitulos", async function (req, res) {
  let todosLosCapitulos = [];
  for (let i = 1; i <= 8; i++) {
    let cap = await redisclient.LRANGE(`Chapter ${i}`, 0, -1);
    let capitulo = cap.reduce((obj, val, index) => {
      if (index === 0) {
        obj["estado"] = val;
      }
      if (index === 1) {
        obj["precio"] = val;
      }
      if (index === 2) {
        obj["nombre"] = val;
      }
      obj["capitulo"] = `Capitulo ${i}`;
      return obj;
    }, {});
    todosLosCapitulos.push(capitulo);
  }
  res.json(Object.values(todosLosCapitulos));
});

//POdemos servir las imagenes al frontend con esta opcion
app.use('/Imagenes', express.static("Pictures"));

app.get("/reservar/:capitulo", async function (req, res) {
  const capitulo = req.params.capitulo;
  ///const capitulo_reservar = await redisclient.LRANGE(`Chapter ${capitulo}`,0,-1);

  //cambia la cadena "disponible" a "reservado"
  const estado = await redisclient.LINDEX(`Chapter ${capitulo}`, 0);

  if (estado === "disponible") {

    await redisclient.LSET(
      `Chapter ${capitulo}`,
      0,
      "reservado"
    );

    if (estado != "alquilado") {
      setTimeout(() => {
        // cambia la cadena "reservado" de nuevo a "disponible" cuando pasen los 4 min
        redisclient.LSET(
          `Chapter ${capitulo}`,
          0,
          "disponible"
        );
      }, 240000);  
    }

    //use 240 segundos para prueba

    
}   

  res.send("ok");
});

app.get("/pagar/:capitulo", async function (req, res) {
    const capitulo = req.params.capitulo;
  ///const capitulo_reservar = await redisclient.LRANGE(`Chapter ${capitulo}`,0,-1);

  //cambia la cadena "reservado" a "alquilado"
  const estado = await redisclient.LINDEX(`Chapter ${capitulo}`, 0);

  if (estado === "reservado") {
    await redisclient.LSET(
      `Chapter ${capitulo}`,
      0,
      "alquilado"
    );
     
 
    setTimeout(() => {
        // cambia la cadena "alquilado" de nuevo a "disponible" cuando pasen las 24 hrs 
        redisclient.LSET(
          `Chapter ${capitulo}`,
          0,
          "disponible"
        );
      }, 60000);
      //use 60 segundo para prueba
}   

  res.send("ok");
});
    



/*app.get("/eliminar", async function (req, res) {
  await redisclient.FLUSHDB();
  res.send("Eliminado");
});*/
app.listen(3000, function () {
  console.log("Aplicación ejemplo, escuchando el puerto 3000!");
});
