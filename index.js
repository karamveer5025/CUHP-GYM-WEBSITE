const express = require("express");
const fs=require("fs");
const app = express();
const path= require("path"); 
const mongoose=require("mongoose");


mongoose.connect("mongodb+srv://karam:karam2443@cluster0.oc0jolj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("we are connected now!");
});
const kittySchema = new mongoose.Schema({
    name: String,
    id:String,
    age: String,
    batch:String,
    timing:String
  });

const contactdoc = mongoose.model('contact', kittySchema);

app.use('/static', express.static('static'))
app.use(express.urlencoded())

app.set('view engine', 'ejs')


app.set("views", path.join(__dirname,"views"))


app.get("/", (req,res)=>{
    const con='Welcome to CU GYM';
    const param={"title":'CU GYM',"content":con};
    res.sendFile(path.join(__dirname,"views", "index.html"))
})

app.get("/index", (req,res)=>{
    const con='Welcome to CU GYM';
    const param={"title":'CU GYM',"content":con};
    res.sendFile(path.join(__dirname,"views", "index.html"))
})
app.get("/contact", async (req, res) => {
    try {
        const { timing } = req.query; 
        const count = await contactdoc.countDocuments({ timing }); 
        const slotsAvailable = Math.max(0, 30 - count); 
        
        
        return res.status(200).render('contact.ejs', { title: 'CU GYM' });
    } catch (err) {
        console.error("Error occurred during registration:", err);
        return res.status(500).send("Error occurred during registration.");
    }
});


app.post("/contact", async (req, res) => {
    try {
        const { name, id, age, batch, timing } = req.body;
        const count = await contactdoc.countDocuments({ timing }); 
        const slotsAvailable = Math.max(0, 30 - count);
        
        if (slotsAvailable === 0) {
            return res.status(200).render('result.ejs', { title: 'CU GYM', content: 'Sorry, all slots for this time slot are full.' });
        }else {
            const newEntry = new contactdoc({ name, id, age, batch, timing });
            await newEntry.save();
        }

        return res.status(200).render('result.ejs', { title: 'CU GYM', content: 'Thank you for filling up the form!' });
    } catch (err) {
        console.error("Error occurred during registration:", err);
        return res.status(500).send("Error occurred during registration.");
    }
});

app.get('/check-slots', async (req, res) => {
    try {
        const { timing } = req.query;
        const count = await contactdoc.countDocuments({ timing });
        const slotsAvailable = Math.max(0, 30 - count);
        
        
        res.json({ slotsAvailable });
    } catch (err) {
        console.error("Error counting slots:", err);
        res.status(500).json({ error: 'Failed to count slots' });
    }
});


app.post("/cancel-membership", async (req, res) => {
    try {
        const { name, id } = req.body;

        const member = await contactdoc.findOne({ name, id });

        if (!member) {
            return res.status(200).render('result.ejs', { title: 'CU GYM', content: 'Member not found!' });
        }

        await member.deleteOne();

        return res.status(200).render('result.ejs', { title: 'CU GYM', content: 'Membership cancelled successfully!' });
    } catch (err) {
        console.error("Error cancelling membership:", err);
        return res.status(500).json({ error: "Error cancelling membership" });
    }
});


app.get("/send",(req,res)=>{
    contactdoc.find({}).then(users => {
        console.log(users);
        res.json(users);
    }).catch(err => {
        res.status(500).send("Error occurred: Database query failed.");
    });
})

app.get("/log", (req, res) => {
    const { username, password } = req.query;
    if (username === 'admin' && password === '1234') {
        res.redirect("./static/allUser.html")
    } else {
        res.send("Invalid username or password");
    }
});

app.listen(3000,()=>{
    console.log("The application started successfully");
})