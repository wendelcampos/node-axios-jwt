const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors")
const { urlencoded } = require("express");
const jwt = require("jsonwebtoken")


const JWTSecret = "fdadadafvgfrafvatgagagagahbretafaytgawfabg";


app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


function auth(req, res, next){
    const authToken = req.headers['authorization'];

    if(authToken != undefined){

        const bearer = authToken.split(' ');
        const token = bearer[1];

        jwt.verify(token, JWTSecret, (err, data) => {
            if(err){
                res.status(401);
                res.json({
                    err: "Token invalido"
                })
            }else{

                req.token = token;
                req.loggedUser = {id: data.id, email: data.email};
                next();
            }
        })

    }else{
        res.status(401);
        res.json({
            err: "Token Invalido"
        })
    }
}


let DB = {
    games: [
        {
            id: 23,
            title: "Call of duty MW",
            year: 2019,
            price: 60 
        },
        {
            id: 65,
            title: "Sea of thieves",
            year: 2018,
            price: 40
        },
        {
            id: 2,
            title: "Minecraft",
            year: 2012,
            price: 20
        }
    ],

    users: [
        {
            id: 1,
            nome: "Wendel Campos Aguiar",
            email: "wendel@email.com",
            password: "nodejs"
        },
        {
            id: 20,
            nome: "Guilherme Almeida",
            email: "guilherme@email.com",
            password: "java123"
        }

    ]

}

app.get("/games", auth, (req, res) => {
    res.statusCode = 200;
    res.json(DB.games);
})

app.get("/game/:id", (req, res) => {
    
    if(isNaN(req.params.id)){
        res.sendStatus(400);
    }else{
        
        let id = parseInt(req.params.id);

        let game = DB.games.find(g => g.id == id);

        if(game != undefined){
            res.statusCode = 200;
            res.json(game);
        }else{
            res.sendStatus(404);
        }

    }
})

app.post("/game", (req, res) => {
    
    let { title, price, year} = req.body;

    DB.games.push({
        id: 123,
        title,
        price,
        year
    })

    res.sendStatus(200);
})

app.delete("/game/:id", (req, res) => {

    if(isNaN(req.params.id)){
        res.sendStatus(400);
    }else{
        
        let id = parseInt(req.params.id);
        let index = DB.games.findIndex(g => g.id == id);

        if(index == -1){
            res.sendStatus(404);
        }else{
            DB.games.splice(index, 1);
            res.sendStatus(200);
        }
    }

})   

app.put("/game/:id", (req, res) => {

    if(isNaN(req.params.id)){
        res.sendStatus(400);
    }else{
        
        let id = parseInt(req.params.id);

        let game = DB.games.find(g => g.id == id);

        if(game != undefined){

            let { title, price, year} = req.body;

            if(title != undefined){
                game.title = title;
            }

            if(price != undefined){
                game.price = price;
            }

            if(year != undefined){
                game.year = year;
            }

            res.sendStatus(200);

        }else{
            res.sendStatus(404);
        }
    }
})

app.post("/auth", (req, res) => {

    let { email, password } = req.body;

    if (email != undefined){

        let user = DB.users.find(user => user.email == email);

        if(user != undefined){

            if(user.password == password){
                jwt.sign({
                    id: user.id,
                    email: user.email
                }, JWTSecret, {
                    expiresIn: "48h"
                }, (err, token) => {
                    if(err){
                        res.status(400);
                        res.json("Falha interna");
                    }else{
                        res.status(200);
                        res.json({
                            token: token
                        });
                    }
                });
            }else{
                res.status(401);
                res.json({
                    err: "Credenciais invalidas"
                })
            }


        }else{
            res.status(404);
            res.json({
                err: "O E-mail enviado é não existe na base de dados"
            })
        }

    }else{
        res.status(400);
        res.json({
            err: "O E-mail enviado é invalido"
        })
    }

})

app.listen(8080, () => {
    console.log("Servidor iniciado");
})