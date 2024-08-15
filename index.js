import express from "express";
import axios from "axios";
import pg from "pg";
import bodyParser from "body-parser";

const app = express();
const port = 3000;
const API_URL = "https://covers.openlibrary.org/b";
const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "onlineFreeBook",
    password: "q",
    port: 5432,
})
let temp;
db.connect();
let img = []; // you need truy cap "/" before see view
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", async (req, res) => {
    
    const query = await db.query("SELECT * FROM book");
    const books = query.rows;
    
    for(let i=0 ;i<books.length; i++){
        let url = API_URL + `/${books[i].key}` + `/${books[i].value}` + `-${books[i].size}.jpg`;
        url = url.replace(/\s+/g, '');
        img[books[i].id]= url;
    }
    res.render("home.ejs", {
        books: books,
        img: img
    });
})

app.get("/add", (req, res) => {
    res.render("addBook.ejs");
})

app.post("/add", async (req, res) => {
    const name = req.body["title"];
    const rate = req.body["rate"];
    const description = req.body["description"];
    const key = req.body["key"];
    const value = req.body["value"];
    const size = req.body["size"];
    const detailDescription = req.body["detailDescription"];
    const linkAmazonPage = req.body["linkAmazonPage"];
    let currentDate = new Date().toJSON().slice(0, 10);
    console.log(name + rate + description+ key + value + size + detailDescription + linkAmazonPage + currentDate);

    await db.query("INSERT INTO book(name,rate,description,key,value,size,detailDescription,linkAmazonPage,dateRead) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)",
        [name,rate,description,key,value,size,detailDescription,linkAmazonPage,currentDate]
    )
    res.redirect("/");
})
app.get("/update/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const currentBook = await db.query("SELECT * FROM book WHERE id = $1",[id]); // get obj id need find
    const book = currentBook.rows[0];
    let result = await db.query("SELECT * FROM book");
    let checkValue = false;
    if(result.rows.length > id)
    {
        checkValue = true;
    } 
    res.render("updateBook.ejs", {
        book: book,    
        checkValue: checkValue,   
    })
})
app.post("/update/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    
    const name = req.body["title"];
    const rate = req.body["rate"];
    const description = req.body["description"];
    const key = req.body["key"];
    const value = req.body["value"];
    const size = req.body["size"];
    const detailDescription = req.body["detailDescription"];
    const linkAmazonPage = req.body["linkAmazonPage"];
    let currentDate = new Date().toJSON().slice(0, 10);

    console.log(name + rate + description+ key + value + size + detailDescription + linkAmazonPage + currentDate);

    await db.query("UPDATE book SET name = $1, dateRead= $2, rate= $3, description= $4, key= $5, value= $6, size= $7, detailDescription= $8, linkAmazonPage= $9", 
        [name,currentDate,rate,description,key,value,size,detailDescription,linkAmazonPage])
    
    res.redirect("/");
})

app.get("/view/:id", async (req ,res) => {
    const id= parseInt(req.params.id);
    const bookfound= await db.query("SELECT * FROM book WHERE id= $1", [id]);
    res.render("viewBook.ejs", {
        book: bookfound.rows[0],
        img: img,
    })
})



app.listen(port, () => {
    console.log(`Server running in port ${port}`);
})