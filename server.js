//load dependencies
const express = require('express');
const fs = require('fs');
const path = require('path');
const util = require('util');

//initialize
const app = express();
const PORT = process.env.PORT || 3000;
const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);
//apply express app settings
app.use(express.urlencoded({ extended: true })); //needed for req.body to parse properly
app.use(express.json());
app.use(express.static(__dirname + '/public')); //needed to route the paths to asset files properly

app.get("/notes", (req,res)=>{
    res.sendFile(path.join(__dirname, "public/notes.html"));
});

app.get("/api/notes", (req,res)=>{

    readFileAsync("./db/db.json", "utf8")
    .then((result, err)=>{
        if(err) console.log(err);
        //console.log(result); 
        return res.json(JSON.parse(result));       
    });     
});
//default page needs to be below other get calls on the stack
app.get("*", (req,res)=>{
    res.sendFile(path.join(__dirname, "public/index.html"));
});

app.post("/api/notes", (req,res)=>{
    let newNote = req.body;
    
    
    readFileAsync("./db/db.json", "utf8")
    .then((result, err)=>{
        if(err) console.log(err);
        //console.log(result);
        return Promise.resolve(JSON.parse(result));               
    })
    .then(data =>{
        newNote.id = getLastIndex(data) + 1;
        (data.length > 0)? data.push(newNote):data = [newNote];
        //console.log(data);
        return Promise.resolve(data);
    })
    .then(data =>{
        writeFileAsync("./db/db.json", JSON.stringify(data));
        res.json(newNote);
    })
    .catch(err =>{
        console.log(err);
    });

    
});

app.delete('/api/notes/:id', (req,res)=>{
    
    let id = req.params.id;
        
    readFileAsync("./db/db.json", "utf8")
    .then((result, err)=>{
        if(err) console.log(err);
        //console.log(result);
        return Promise.resolve(JSON.parse(result));               
    })
    .then(data =>{        
        data.splice(data.indexOf(data.find(element => element.id == id)),1);
        return Promise.resolve(data);
    })
    .then(data =>{
        writeFileAsync("./db/db.json", JSON.stringify(data));
        res.send("OK");
    })
    .catch(err =>{
        console.log(err);
    });
});

app.use(function (req, res, next) {
  res.status(404).send("Sorry can't find that!")
})

app.listen(PORT, function(){
    console.log(`Listening on PORT ${PORT}`);
});

function getLastIndex(data){
    if (data.length > 0) return data[data.length-1].id;
    return 0;
}