let express = require('express')
const path = require("path")
const fs = require("fs");
const request = require("request")
let FormData = require('form-data');
let bodyParser = require('body-parser')
let multer = require('multer')
ip = 'http://10.116.239.164:5000/'
// const User = require('./schema')
const axios = require("axios")
// const mongoose = require('mongoose')
// mongoose.set('useNewUrlParser', true);
// mongoose.set('useFindAndModify', false);
// mongoose.set('useCreateIndex', true);
// mongoose.set('useUnifiedTopology', true);
const { IamAuthenticator } = require('ibm-watson/auth');
const SpeechToTextV1 = require('ibm-watson/speech-to-text/v1');
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');

const speechToText = new SpeechToTextV1({
  authenticator: new IamAuthenticator({
    apikey: 'DF5YNiwBRe8qtj7SE2h6DdfSl6tQRLBw5wZug8E_GvsH',
  }),
  serviceUrl: 'https://api.eu-gb.speech-to-text.watson.cloud.ibm.com/instances/9d38605c-5d35-440b-938a-386b5c8fde39',
});

const params = {
  objectMode: true,
  audio: fs.createReadStream(path.join(__dirname,"/asset/appAudio/Sample.wav")),
  contentType: 'audio/wav',
  model: 'en-US_BroadbandModel',
  keywords: ['colorado', 'tornado', 'tornadoes'],
  keywordsThreshold: 0.5,
  maxAlternatives: 3,
};
var glo = 0;

// Create the stream.
// const recognizeStream = speechToText.recognizeUsingWebSocket(params);

// Listen for events.
// recognizeStream.on('data', function(event) { onEvent('Data:', event); });
// recognizeStream.on('error', function(event) { onEvent('Error:', event); });
// recognizeStream.on('close', function(event) { onEvent('Close:', event); });

// // Display events on the console.
// function onEvent(name, event) {
//     stot = JSON.stringify(event["results"])
//     console.log(JSON.stringify(event["results"]))
//     // console.log(name, JSON.stringify(event["results"], null, 2));
//     console.log("hello Data")
// };
// Assumption
// const Location = {  
//     lat: 12.7515547,
//     long: 80.1968071
// }

let app = express();
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "*");
    next(); 
  });

//Sockets

let server = app.listen(process.env.PORT||2000,()=>{
    console.log("Server running on PORT :: ",2000);
})

let io = require('socket.io').listen(server)

io.on('connection',(socket)=>{
    console.log("Socket Connection Check :: Success")
})

// let Service = require('./service.js')

app.get("/", (req, res) => {
    res.send("Connection Check :: Success");
})


//Resgistering Employees image----------------------------------

// const reg_img = multer.diskStorage({
//     destination:(req, file, cb)=>{
//         cb(null, "asset/regImg")
//     },
//     filename:(req, file, cb)=>{
//         cb(null, "Face.jpg")
//     }
// })

// const regImg = multer({
//     storage:reg_img,
// })


// app.post('/registerImage', regImg.single("image"),(req, res) => {

//     let curpath = path.join(__dirname,"/asset/regImg/Face.jpg");
//     console.log(req.body["eid"],curpath);
//     let formData = {
//     target: req.body.eid,
//     face_image: fs.createReadStream(curpath)
//     };
//     glo++;
//     console.log("SENDING COUNT :: ",glo)
//     request.post({
//         url: 'http://192.168.43.128:5000/addFace',
//         formData: formData
//      }, function optionalCallback(err, httpResponse, body) {
//     if (err) {
//         return console.error('upload failed:', err);
//     }
//     console.log('Upload successful!  Server responded with:', body);
//     res.send({
//         status : 200
//     })    
//     })
// })


//Resgistering Employees image----------------------------------

//Resgistering Employees Audio----------------------------------

const reg_audio = multer.diskStorage({
    destination:(req, file, cb)=>{
        cb(null, "asset/regAudio")
    },
    filename:(req, file, cb)=>{
        cb(null, "audio1.wav")
    }
})

const regAudio = multer({
    storage:reg_audio,
})

app.post("/registerAudio", async (req,res) => {
    let arr = ["audio1.wav"]
    try{
        // console.log("hellllo", req.body["eid"])
        let curpath = path.join(__dirname,"/asset/regAudio/");
        console.log(req.body)
        eid = req.body["eid"]
        // let a1 = await SendFiles(arr,curpath,req.body["eid"])
        obj = {}
    let formData = {
    speaker: eid,
    audio_file: fs.createReadStream(curpath+arr[0]),
    audio_text: req.body["sentence"]
    };
    glo++;
    console.log(eid)
    console.log("SENDING COUNT :: ",glo)
    request.post({
        url: ip + 'addSpeaker',
        formData: formData
     }, function optionalCallback(err, httpResponse, body) {
    if (err) {
        return console.error('upload failed:', err);
    }
    console.log('Upload successful!  Server responded with:');
    obj = JSON.parse(body)
    console.log(obj.result)
    console.log("Response After HItting Flask :: ",obj.result);
    // registerDb(req.body["name"],req.body["eid"])
    res.send({
        status: 200,
        msg: obj.result
    })
    })
       
    }
    catch(err){
        console.log(err)
        res.send({
            status: 400
        })
    }
})

// app.get('/checkStatus',async (req,res)=>{
//     console.log(req.query.eid);
//     let checkUsr = await User.find({eid : req.query.eid})
//     console.log(checkUsr);
//     let result = Object.keys(checkUsr[0].attendanceParams).filter((date)=>{
//         let predate = new Date().toLocaleDateString();
//         return (predate == date)
//     })
//     console.log(result);
//     if(result.length == 0){
//         res.send({status : false})
//     }
//     else{
//         res.send({status : true})
//     }
// })


//Resgistering Employees Audio----------------------------------

// app.get('/getUsers', async(req, res) => {
//     let key = new Date().toLocaleDateString()
//     let usr = await User.find({})
//     if (!usr) {
//         return res.send({"code": 400, "message": "No users obtained"})
//     }
//     console.log(usr)
//     let newUsrBase = usr.filter(ele=>{
//         return ele.attendanceParams[key]
//     })
//     res.send({body : newUsrBase})
// })

// app.get('/getUser', async(req, res) => {
//     console.log(req.query)
//     let eid = req.query.eid
//     let key = req.query.date
//     let usr = await User.findOne({eid})
//     if (!usr) {
//         return res.send({"code": 400, "message": "No users obtained"})
//     }
//     else{
//         if(usr.attendanceParams[key].attendance){
//             res.send({attendance : true})
//         }
//     }
//     res.send(res.send({attendance : false}))
// })

const reg1_audio = multer.diskStorage({
    destination:(req, file, cb)=>{
        cb(null, "asset/regAudio")
    },
    filename:(req, file, cb)=>{
        cb(null, "audio1.wav")
    }
})

const reg1Audio = multer({
    storage:reg1_audio,
})



app.post('/reg1Audio', reg1Audio.single('audio'),(req, res) => {
    console.log("1 uploaded")
})


//Validating Attendance via Audio ------------------------------------------------------------------

const upload_audio = multer.diskStorage({
    destination:(req, file, cb)=>{
        cb(null, "asset/appAudio")
    },
    filename:(req, file, cb)=>{
        cb(null, "Sample.wav")
    }
})

const uploadAudio = multer({
    storage:upload_audio,
})

app.post('/apptest', (req, res) => {
    speechToText.recognize(params)
  .then(response => {
    console.log(JSON.stringify(response.result['results'][0]['alternatives'][0]['transcript'], null, 2));
    res.send({data: response.result['results'][0]['alternatives'][0]['transcript']})
  })
  .catch(err => {
    console.log(err);
    res.send({error: err})
  });
})

compareSentences = (s1, s2) => {
    s1 = s1.toLowerCase()
    s2 = s2.toLowerCase()
    l2 = s2.length
    count = 0
    s1.forEach(element => {
        i = 0
        while(i<l2){
            if(s2[i] == element){
                count = count + 1
                break
            }  
        }    
    });
    if( abs(l2 - count) < (int)(0.3 * l2))
      return true
}

app.post('/appAudio', uploadAudio.single('audio'),(req, res) => {
    let curpath = path.join(__dirname,"/asset/appAudio/Sample.wav");
    console.log(req.body["eid"],req.body["sentence"],curpath," Lat:",req.body["lat"]," Long",req.body["long"]);
//     speechToText.recognize(params)
//   .then(response => {
//     sen = JSON.stringify(response.result['results'][0]['alternatives'][0]['transcript'], null, 2);
//     console.log(sen)
    // equi = compareSentences(sen, req.body["sentence"])
    
    // if(convertToM(Location.lat,Location.long,req.body["lat"],req.body["long"]) <= 500 ){
    let formData = {
        // speaker: req.body.eid,
        audio_file: fs.createReadStream(curpath),
        audio_text: req.body["sentence"]
        };
    glo++;
    console.log("SENDING COUNT :: ",glo)
    // if(equi){
        console.log("Text match successful")
        request.post({
            url:  ip + 'findSpeaker',
            formData: formData
            }, function optionalCallback(err, httpResponse, body) {
            if (err) {
                return console.error('upload failed:', err);
            }
            console.log('Upload successful! ll Server responded with:');
            obj = JSON.parse(body)
            // if(body.substring(10,11)==='1'){
                console.log(obj.text)
                console.log(obj.speaker)
                obj2 = {}
                obj2.text = obj.text
                obj2.speaker = obj.speaker
                // updateDb(req.body["eid"],req.body["timestamp"]);
                res.send({
                    valid:true,
                    data: obj2
                });
            // } else{
            //     console.log("Not inside ready to update")
            //     res.send({
            //         valid:false,
            //         data: null
            //     })
            // }
        });
    // }
    // else{
    //     console.log("Speech to text no match")
    //     res.send({
    //         valid:false,
    //         data: null
    //     })
    // }
    
// })
})

app.post('/removeUser', async (req,res) => {
    let formData = {
        speaker: req.body["eid"],
    };
    console.log(req.body)
    request.post({
        url: ip + 'removeSpeaker',
        formData: formData
    }, function optionalCallback(err, httpResponse, body) {
        if (err) {
            return console.error('Request failed:', err);
        }
        console.log('Server responded with:', body);
        obj = JSON.parse(body)
        res.send({
          data:obj.result
        });
    })
    return null
}) 


// Validating Attendance via Audio ------------------------------------------------------------------


// Validating Attendance via Image------------------------------------------------------------------

// const upload_image = multer.diskStorage({
//     destination:(req, file, cb)=>{
//         cb(null, "asset/appImage")
//     },
//     filename:(req, file, cb)=>{
//         cb(null, "Face.jpg")
//     }
// })

// const uploadImage = multer({
//     storage:upload_image,
// })


// app.post('/appImage',uploadImage.single("image") ,(req, res) => {
//     // console.log(req)

//     let curpath = path.join(__dirname,"/asset/appImage/Face.jpg");
//     console.log(req.body["eid"],curpath,req.body["timestamp"]," Lat:",req.body["lat"]," Long",req.body["long"]);
//     if(convertToM(Location.lat,Location.long,req.body["lat"],req.body["long"]) <= 500 ){
//         let formData = {
//             target: req.body.eid,
//             face_image: fs.createReadStream(curpath)
//             };
//             glo++;
//             console.log("SENDING COUNT :: ",glo)
//             request.post({
//                 url: 'http://192.168.43.128:5000/findFace',
//                 formData: formData
//              }, function optionalCallback(err, httpResponse, body) {
//             if (err) {
//                 return console.error('upload failed:', err);
//             }
//             console.log('Upload successful!  Server responded with:', req.body["eid"],req.body["timestamp"]);
//             console.log("Result from ram :: ",body.substring(10,11));
//             if(body.substring(10,11)==='1'){
//                 updateDb(req.body["eid"],req.body["timestamp"]);
//                 res.send({valid:true});
//             } else{
//                 res.send({valid:false});
//             }
//             });

//     }else{
//         res.send({valid:false});
//     }
// })

// Validating Attendance via Image------------------------------------------------------------------

// Speech to Text-----------------------------------------------
// const upload_speech = multer.diskStorage({
//     destination:(req, file, cb)=>{
//         cb(null, "asset/speechTo")
//     },
//     filename:(req, file, cb)=>{
//         cb(null, "Speech.wav")
//     }
// })

// const uploadSpeech = multer({
//     storage:upload_speech,
// })

// app.post('/speechTo',uploadSpeech.single('audio'),(req,res) => {
//     let curpath = path.join(__dirname,"/asset/speechTo/Speech.wav");
//     var options = {
//         'method': 'POST',
//         'url': 'https://westus.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US',
//         'headers': {
//           'Ocp-Apim-Subscription-Key': 'b32ce6ab77e14591aac2646405775cdf',
//           'Host': 'westus.stt.speech.microsoft.com',
//           'Content-Type': 'application/octet-stream',
//           'Accept': 'application/json'
//         },
//         body: fs.createReadStream(curpath)
      
//       };
//       request(options, function (error, response) { 
//         if (error){
//             res.send({data: false});
//         }
//         console.log(response.body);
//         let reqSpeech = JSON.parse(response.body);
//         if(reqSpeech.DisplayText){
//             res.send({data: reqSpeech.DisplayText});
//         }
//         else{
//             res.send({data: false});
//         }
//       });
    

// })

// Speech to Text-----------------------------------------------

// Utils--------------------------------------------------------------------

// async function updateDb(eid,timestamp){
//     let key = new Date().toLocaleDateString();
//     console.log("Attendance Key :: ",key);
//     let updUsr = await User.findOne({eid})
//     updUsr.attendanceParams[key] = {
//         timestamp,
//         attendance: true
//     };
//     let replaceUsr = {}
//     replaceUsr.attendanceParams = updUsr.attendanceParams
//     console.log(" UpdatedUser Id :: ",updUsr._id)
//     await User.findOneAndUpdate({"_id":updUsr._id},{ "attendanceParams" : replaceUsr.attendanceParams})
//     updUsr.save().then(() => {
//             console.log("successful update XD ::  ",updUsr)
//             io.sockets.emit('changeAttendance',updUsr)
//             return null
//         })
//         .catch(err => {
//             console.log(err)
//         })
// }

// 

async function SendFiles(arr,curpath,eid){
    
    return obj.result;
}

// function convertToM(lat, long, lat1, long1) { 
//     //Math function to calculate Distance between two nodes in metres

//     function toRadians(l) {
//         return (Math.PI * l) / 180;
//     }

//     let R = 6371e3;
//     let φ1 = toRadians(lat);
//     let φ2 = toRadians(lat1);
//     let Δφ = toRadians((lat1 - lat));
//     let Δλ = toRadians((long1 - long));
//     let a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
//         Math.cos(φ1) * Math.cos(φ2) *
//         Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
//     let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     let d = R * c;

//     return d;

// };