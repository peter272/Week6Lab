let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let viewsPath = __dirname + "/views/";

app.engine("html", require('ejs').renderFile)
app.set('views engine', 'html')

let mongodb = require('mongodb');
let MongoDBClient = mongodb.MongoClient;

let db = null;
let col = null;
let url = "mongodb://localhost:27017";

MongoDBClient.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
},
function (err, client) {
    db = client.db('week6lab');
    col = db.collection('tasks');
});


app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(express.static('images'));
app.use(express.static('css'));


app.get('/', function (req, res) {
    res.sendFile(viewsPath + "index.html");
});

app.get('/addtask', function (req, res) {
    res.sendFile(viewsPath + "addnewtasks.html");
});

app.get('/listalltasks', function (req, res) {
    db.collection('tasks').find({}).toArray(function (err, data) {
        res.render('list.html', { tasksdb: data });
    });
});

app.post("/addthistask", function (req, res) {
    let taskID = randomID();
    let duedate = req.body.date
    let from = duedate.split('-')
    let d = new Date(from[0],from[1],from[2])
    duedate = d;
    let newTask = {
        id: taskID,
        Name: req.body.name,
        Handler: req.body.handler,
        Date: duedate,
        Status: req.body.status,
        Description: req.body.desc
    };
    col.insertOne(newTask);
    res.sendFile(viewsPath + "addnewtasks.html");
});
app.get('/deleteID', function (req, res) {
    res.sendFile(viewsPath + "deletebyID.html");
});
app.post('/deletethisID', function (req, res) {
    let query = {
        id: {
            $eq: req.body.id2
        }
    };
    col.deleteOne(query, function (err, data) {
      res.render('/listalltasks', { tasksdb: data });

    })
})

app.get('/deletetask', function (req, res) {
    res.sendFile(viewsPath + "deletebyID.html");
});

app.post('/deletethistask', function (req, res) {
    let taskToDelete = req.body;
    let taskToDeleteID = parseInt(taskToDelete.taskID);
    filter = {
        id: taskToDeleteID
    };

    db.collection('tasks').deleteOne(
        filter //taskToDeleteID
    );
    res.redirect('/listalltasks');
});

app.get('/deletecompleted', function (req, res) {
    res.sendFile(viewsPath + 'deletecompleted.html');
});

app.post('/deletecompleted', function (req, res) {
    db.collection('tasks').deleteMany({
        Status: 'Complete'
    });
    res.redirect('/listalltasks');
});

app.get('/updatetask', function (req, res) {
    res.sendFile(viewsPath + "updatetask.html");
});

app.post('/updatetask', function (req, res) {
    let taskToUpdate = req.body;
    let taskToUpdateID = parseInt(taskToUpdate.taskID);
    let filter = {
        id: taskToUpdateID
    };
    let taskUpdate = {
        $set: {
            Status: taskToUpdate.statusnew
        }
    };
    db.collection('tasks').updateOne(filter, taskUpdate);
    res.redirect('/listalltasks');
});

app.get('/findNotTomorrow', function (req, res) {
    let query = {
        date: {
            $ne: today()
        }
    }
    db.collection('tasks').find(query).toArray(function (err, data) {
        res.render('findNotTomorrow.html', { tasksdb: data });
        console.log(query);
        
    });
});


function today()
    {
       let today = new Date();
       let tomorrow = new Date();
       tomorrow.setDate(today.getDate()+1)
       return tomorrow;
    }
    
   

function randomID() {
    let id;
    id = Math.round(Math.random() * 1000);
    return id;
};
app.listen(8080);