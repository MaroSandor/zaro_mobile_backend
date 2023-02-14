const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const app = express();
const port = 24001;

var connection;

function kapcsolat() {
    connection = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "exam_db",
    });
    connection.connect();
}

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Saját alkalmazás backend szerver oldal");
});

// # Első backend végpont: Összes adat az 'agency' táblából
app.get("/osszes_adat", (req, res) => {
    kapcsolat();

    connection.query("SELECT * FROM users", (err, rows, fields) => {
        if (err) throw err;

        console.log("The solution is: ", rows);
        res.send(rows);
    });

    connection.end();
});

// # Második backend végpont: Járatszámok lekérdezéses a 'routes' táblából
app.get("/jaratok", (req, res) => {
    kapcsolat();

    connection.query(
        "SELECT route_id, route_short_name FROM routes ORDER BY route_short_name ASC",
        (err, rows, fields) => {
            if (err) throw err;

            console.log("The solution is: ", rows);
            res.send(rows);
        }
    );

    connection.end();
});

// # Harmadik végpont: Vélemény felvitele az 'opinions' táblába (a későbbi megjelenítéshez)
app.post("/felvitel", (req, res) => {
    kapcsolat();

    connection.query(
        "INSERT INTO opinions VALUES (NULL, " + req.body.jaratszam + ", " + req.body.comfort + ", " + req.body.time + ", '" + req.body.traffic + "', '" + req.body.velemeny + "')",
        function (err, rows, fields) {
            if (err) console.log(err);
            else {
                console.log("Sikeres felvitel az adatbázisba!");
                console.log(rows)
            }
        }
    );

    connection.end();
});

// # Ötödik végpont: Vélemények lekérdezése az adatbázisból
app.get("/velemenyek", (req, res) => {
    kapcsolat();

    connection.query(
        "SELECT opinion_id AS route_id, routes.route_short_name, comfort.opinions_desc AS comfort, ido.opinions_desc AS ido, crowd.opinions_desc AS crowd, opinions.opinion_comment FROM opinions INNER JOIN routes ON routes.route_id = opinions.opinion_route INNER JOIN opinions_desc AS comfort ON comfort.opinions_desc_id = opinions.opinion_comfort INNER JOIN opinions_desc AS ido ON ido.opinions_desc_id = opinions.opinion_time INNER JOIN opinions_desc AS crowd ON crowd.opinions_desc_id = opinions.opinion_crowd",
        (err, rows, fields) => {
            if (err) throw err;

            console.log("The solution is: ", rows);
            res.send(rows);
        }
    );
    connection.end();
});

// # Hatodik végpont: Adott járatról vélemények lekérése
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

app.post("/fiok_infok", (req, res) => {
    kapcsolat();

    connection.query(
        "SELECT * FROM users WHERE user_username='" + req.body.username + "' AND user_password='" + req.body.password + "'",
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

app.post("/kedvenc_torles", (req, res) => {
    kapcsolat();

    connection.query(
        "UPDATE kedvencek SET kedvencek_logikai = 'false' WHERE kedvencek.kedvencek_route_id = " + req.body.ertek + "",
        (err, rows, fields) => {
            if (err) throw err;

            console.log("The solution is: ", rows);
            res.send(rows);
        }
    );
    connection.end();
});

app.post("/kedvenc_megjeloles", (req, res) => {
    kapcsolat();

    connection.query(
        "INSERT INTO kedvencek VALUES (NULL, '" + req.body.jaratszam + "', '1', 'true')",
        (err, rows, fields) => {
            if (err) throw err;

            console.log("The solution is: ", rows);
            res.send(rows);
        }
    );
    connection.end();
});

app.post("/login", (req, res) => {
    kapcsolat();

    const { email, password } = req.body;

    connection.query(
        "SELECT * FROM users WHERE user_email = '" + email + "' AND user_password = '" + password + "'",
        (err, rows, fields) => {
            if (err) {
                res.send('Disz iz dö hiba: ', err)
            } else if (rows.length === 1) {
                res.send({ success: true })
            } else {
                res.send({ success: false })
            }
        }
    );
    connection.end();
});

app.listen(port, () => {
    console.log(
        `Alap backend szerver elérése: https://maro-sandor-peter.dszcbaross.tk`
    );
});