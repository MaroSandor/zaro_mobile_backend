const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const app = express();
const port = 24001;

var connection;

function kapcsolat() {
  connection = mysql.createConnection({
    host: "192.168.0.200",
    user: "u59_U7OcBrILLQ",
    password: "JlCRCJ+BOT+xxoG8Xuqn6=Fp",
    database: "s59_db",
  });
  connection.connect();
}

app.use(cors());
app.use(express.json());

// Backend elindulásának visszajelzése konzolon
app.get("/", (req, res) => {
  res.send("Saját alkalmazás backend szerver oldal");
});

app.delete('/delNews', (req, res) => {
    kapcsolat();
    
    connection.query("DELETE FROM news WHERE news_id = '" + req.body.id + "'",
                     (err, rows, field) => {
        if (err) throw err;
        res.send({ message: 'Sikeres törlés' });
    });
    
    connection.end();
});

app.post("/setNews", (req, res) => {
  kapcsolat();

  connection.query(
      "INSERT INTO news VALUES (NULL, '" + req.body.news_title + "', '" + req.body.news_description + "', '" + req.body.news_date + "')",
    function (err, rows, fields) {
      if (err) console.log(err);
      else {
        console.log("Sikeres felvitel az adatbázisba!");
      }
    }
  );

  connection.end();
});

app.delete('/delSchedules', (req, res) => {
    kapcsolat();
    
    connection.query("DELETE FROM routes WHERE route_id = '" + req.body.id + "'",
                     (err, rows, field) => {
        if (err) throw err;
        res.send({ message: 'Sikeres törlés' });
    });
    
    connection.end();
});

// API végpont a stops tábla lekérdezéséhez
app.get("/stops", (req, res) => {
  kapcsolat();

  connection.query(
    "SELECT * FROM stops",
    (err, rows, fields) => {
      if (err) throw err;

      console.log("The solution is: ", rows);
      res.send(rows);
    }
  );

  connection.end();
});

// API végpont a routes tábla lekérdezéséhez
app.get("/routes", (req, res) => {
    kapcsolat();
    
    connection.query("SELECT routes_id, route_short_name, route_long_name, route_type, route_favorit FROM routes ORDER BY route_short_name", (err, rows, fields) => {
        if (err) throw err;
        
        console.log("Lekérdezés megtörtént!");
        res.json(rows);
    }
    );
    
    connection.end();
});

// Összes járat rövid illetve hosszú nevének lekérdezése járat id-vajl együtt
app.get("/jaratok", (req, res) => {
  kapcsolat();

  connection.query(
    "SELECT routes_id, route_id, route_short_name, route_long_name, route_type FROM routes ORDER BY route_short_name ASC",
    (err, rows, fields) => {
      if (err) throw err;

      console.log("The solution is: ", rows);
      res.send(rows);
    }
  );

  connection.end();
});

app.delete('/delSchedule', (req, res) => {
    kapcsolat();
    
    const id = req.body.id + 1;
    
    connection.query("DELETE FROM trips WHERE route_id = " + id + "", (err, rows, field) => {
        if (err) throw err;
        
        console.log("Törölve")
        res.send('Törölve')
    })
    
    connection.end()
})

// Megállók kenevinek lekérdezése meállók id-val együtt
app.get("/megallok", (req, res) => {
  kapcsolat();

  connection.query(
    "SELECT stops.stop_id, stops.stop_name FROM stops",
    (err, rows, fields) => {
      if (err) throw err;

      console.log("The solution is: ", rows);
      res.send(rows);
    }
  );

  connection.end();
});

// Hírek/információk lekérése az adatbázisból
app.get("/hirek", (req, res) => {
    kapcsolat();
    
    connection.query("SELECT news_id, news_title, news_description, DATE_FORMAT(news_date, '%Y. %m. %d.') AS news_date  FROM `news` ORDER BY news_date DESC", (err, rows, fields) => {
        if (err) throw err;
        
        console.log("Lekérés sikeres!");
        res.send(rows);
    });
    connection.end();
});

// Adott járatról vélemények lekérése
app.post("/szuro_kereses", (req, res) => {
   kapcsolat();

   connection.query(
     "SELECT opinion_id AS route_id, routes.route_short_name, comfort.opinions_desc AS comfort, ido.opinions_desc AS ido, crowd.opinions_desc AS crowd, opinions.opinion_comment FROM opinions INNER JOIN routes ON routes.route_id = opinions.opinion_route INNER JOIN opinions_desc AS comfort ON comfort.opinions_desc_id = opinions.opinion_comfort INNER JOIN opinions_desc AS ido ON ido.opinions_desc_id = opinions.opinion_time INNER JOIN opinions_desc AS crowd ON crowd.opinions_desc_id = opinions.opinion_crowd WHERE routes.route_short_name = '" + req.body.bemenet_1 + "'",
     (err, rows, fields) => {
       if (err) throw err;

       console.log("The solution is: ", rows);
       res.send(rows);
     }
   );
   connection.end();
});

app.get("/kedvencek", (req, res) => {
  kapcsolat();

  connection.query(
    "SELECT route_id, route_short_name, route_long_name, route_favorit FROM routes INNER JOIN kedvencek ON kedvencek.kedvencek_route_id = routes.route_id WHERE kedvencek.kedvencek_logikai = 'true' AND kedvencek.kedvencek_user_id = 1",
    (err, rows, fields) => {
      if (err) throw err;

      console.log("The solution is: ", rows);
      res.send(rows);
    }
  );
  connection.end();
});

app.post("/szures", (req, res) => {
  kapcsolat();
    
  let parancs =
    "select * from routes where route_long_name like '%" +
    req.body.bevitel1 +
    "%'";
  connection.query(parancs, (err, rows, fields) => {
    if (err) console.log(err);
    else res.send(rows);
  });

  connection.end();
});

app.listen(port, () => {
  console.log(
    `Alap backend szerver elérése: https://maro-sandor-peter.dszcbaross.tk`
  );
});