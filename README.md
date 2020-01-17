# CRUD-APP
CRUD Operation in Node.js using MongoDB as a database and Express.js as a framework.

For update and delete operation enter the "_id" of the person that is stored in the database.

Instead of entering "_id" that is uniquely generated for each user we can also use autoincrement sequence in MongoDB .I will use it later.

1.app.js

var express = require("express");
var fs = require('fs');
var path = require("path");
var morgan = require("morgan");
var cors = require("cors");
var bodyParser = require('body-parser');
var routes = require("./routes/routes");
var app = express();
//database connection setup
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/contestDB", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB!!'))
  .catch((err) => console.log(err));
//setup end 
//middlewares used

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
app.use(morgan('combined', { stream: accessLogStream }))
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:4200");
  res.setHeader('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});
//using route
app.use("/", routes)
app.listen(3000, function (req, res) {
  console.log("You are listening to port 3000")
});

***************************************************
2.routes.js
const express = require("express");
const router = express.Router();
const report = require("./report");


router.get("/report/:contestId/:pulseId", function (req, res) {
   report.generateExcelReport(req, res);
})
 
 module.exports = router
 ************************
 3.report.js
 const excel = require('node-excel-export');
var styles = require("../utilities/styles")
var func = require("../models/reportDB")


function process(pulseId, overview, correct, averageScore, summaryData, qDesc, konnectSummary, dataset3, noOfQuestions, specification2, req, res) {  console.log("in process")
  var playersScore;
  var ccc;
  func.playerData(pulseId)
    .then((data) => {
      playersScore = data;
      func.correct(pulseId)
        .then((data) => {
          ccc = data;
          console.log("process")
          for (let i = 0; i < playersScore.length; i++) {
            var element = playersScore[i];
            element.totalCorrect = ccc.get(element.id);
          }
          func.missed(pulseId)
            .then((data) => {
              ccc1 = data
              for (let i = 0; i < playersScore.length; i++) {
                var element = playersScore[i];
                element.totalMissed = ccc1.get(element.id);
                element.totalIncorrect = noOfQuestions - ccc.get(element.id) - ccc1.get(element.id)
              }
              //console.log(playersScore)
              generateReport(overview, correct, averageScore, summaryData, playersScore, qDesc, konnectSummary, dataset3, noOfQuestions, specification2, req, res);
            })

        })
        .catch((err) => {
          console.log(err)
        })
    })
    .catch((err) => {
      console.log(err)
    })
    .catch((err) => {
      console.log(err)
    })
    .catch((err) => {
      console.log(err)
    })
}


function generateReport(overview, correct, averageScore, summaryData, playersScore, qDesc, konnectSummary, dataset3, noOfQuestions, specification2, req, res) {
  console.log("I am in the heading")
  const heading = [
    [{ value: overview.cTitle, style: styles.headerLightPink }],
    [{ value: '', style: styles.headerCream }],
    [{ value: 'Contest Id:  ' + overview.cId, style: styles.headerCream }],
    [{ value: 'Organizer:  ' + overview.cOrganizer, style: styles.headerCream }],
    [{ value: 'Game Key:  ' + overview.cgameKey, style: styles.headerCream }],
    [{ value: 'Total Participants:  ' + overview.ctotalParticipants, style: styles.headerCream }],
    [{ value: '', style: styles.headerCream }],
    [{ value: 'Overall Performace', style: styles.headerLightPink }],
    [{ value: '', style: styles.headerCream }],
    [{ value: 'Total Correct Answers(%): ' + ' ' + correct.avgCorrect + '%', style: styles.headerCream }],
    [{ value: 'Total Incorrect Answers(%): ' + ' ' + correct.avgIncorrect + '%', style: styles.headerCream }],
    [{ value: 'Total Missed Answers(%): ' + ' ' + correct.avgMissed + '%', style: styles.headerCream }],
    [{ value: 'Average Score(points): ' + ' ' + averageScore + 'points', style: styles.headerCream }],
    [{ value: '', style: styles.headerCream }],
    [{ value: 'Switch tabs/pages to view other result breakdown', style: styles.headerBlue }]
  ];
  //merges of Overview Report
  const merges = [
    { start: { row: 1, column: 1 }, end: { row: 1, column: 18 } },
    { start: { row: 2, column: 1 }, end: { row: 2, column: 10 } },
    { start: { row: 3, column: 1 }, end: { row: 3, column: 10 } },
    { start: { row: 4, column: 1 }, end: { row: 4, column: 10 } },
    { start: { row: 5, column: 1 }, end: { row: 5, column: 10 } },
    { start: { row: 6, column: 1 }, end: { row: 6, column: 10 } },
    { start: { row: 7, column: 1 }, end: { row: 7, column: 10 } },
    { start: { row: 8, column: 1 }, end: { row: 8, column: 18 } },
    { start: { row: 9, column: 1 }, end: { row: 9, column: 10 } },
    { start: { row: 10, column: 1 }, end: { row: 10, column: 10 } },
    { start: { row: 11, column: 1 }, end: { row: 11, column: 10 } },
    { start: { row: 12, column: 1 }, end: { row: 12, column: 10 } },
    { start: { row: 13, column: 1 }, end: { row: 13, column: 10 } },
    { start: { row: 14, column: 1 }, end: { row: 14, column: 10 } },
    { start: { row: 15, column: 1 }, end: { row: 15, column: 10 } }
  ]
  //specification for Overview Report
  var specification = {}
  //dataset for overview report
  var dataset = []
  //overview report ended 
  //player report started  
  const specification1 = {
    id: {
      displayName: 'Id',
      headerStyle: styles.headerBrin,
      cellStyle: styles.cellWhite,
      width: 160
    },
    name: {
      displayName: 'Players',
      headerStyle: styles.headerBrin,
      cellStyle: styles.cellWhite,
      width: 160
    },
    position: {
      displayName: 'Position',
      headerStyle: styles.headerBrin,
      cellStyle: styles.cellWhite,
      width: 160
    },
    totalScore: {
      displayName: 'Total Score(points)',
      headerStyle: styles.headerBrin,
      cellStyle: styles.cellWhite,
      width: 167
    },
    totalCorrect: {
      displayName: 'Correct Answers',
      headerStyle: styles.headerBrin,
      cellStyle: styles.cellWhite,
      width: 160

    },
    totalIncorrect: {
      displayName: 'Incorrect Answers',
      headerStyle: styles.headerBrin,
      cellStyle: styles.cellWhite,
      width: 168

    },
    totalMissed: {
      displayName: 'Missed Answers',
      headerStyle: styles.headerBrin,
      cellStyle: styles.cellWhite,
      width: 160

    },
  }
  const heading1 = [
    [{ value: overview.cTitle, style: styles.headerLightPink }],
    [{ value: "Final Scores of Players", style: styles.headerBrin }],
    [{ value: "", style: styles.cellWhite }]
  ];
  const merges1 = [
    { start: { row: 1, column: 1 }, end: { row: 1, column: 10 } },
    { start: { row: 2, column: 1 }, end: { row: 2, column: 5 } },
    {
      start: { row: 2, column: 6 }, end: { row: 2, column: 10 },
    }
  ]
  const dataset1 = playersScore;
  //konnect summary report start
  const heading2 = [
    [{ value: overview.cTitle + ": " + summaryData[0].desc, style: styles.headerLightPink }],
    [{ value: "Author" + ": " + summaryData[0].author, style: styles.headerLightPink }],
    [{ value: "", style: styles.cellWhite }],
    [{ value: "Konnect! Summary", style: styles.headerBrin }],
    [{ value: "", style: styles.cellWhite }],
    [{ value: "Correct", style: styles.cellGreen }],
    [{ value: "Missed", style: styles.cellYellow }],
    [{ value: "Incorrect", style: styles.cellCrimson }],
    [{ value: "", style: styles.cellWhite }],
  ];
  const merges2 = [
    { start: { row: 1, column: 1 }, end: { row: 1, column: 18 } },
    { start: { row: 2, column: 1 }, end: { row: 2, column: 18 } },
    { start: { row: 3, column: 1 }, end: { row: 3, column: 18 } },
    { start: { row: 4, column: 1 }, end: { row: 4, column: 18 } },
    { start: { row: 5, column: 1 }, end: { row: 5, column: 18 } },
    { start: { row: 6, column: 1 }, end: { row: 6, column: 1 } },
    { start: { row: 7, column: 1 }, end: { row: 7, column: 1 } },
    { start: { row: 8, column: 1 }, end: { row: 8, column: 1 } },
    { start: { row: 9, column: 1 }, end: { row: 9, column: 18 } },
  ]
  const dataset2 = konnectSummary;
  //Konnect Summary Report End
  //question vise analysis report started
  function generateHeading(j) {
    const heading3 = [
      [{ value: overview.cTitle, style: styles.headerLightPink }],
      [{ value: "Author" + ": " + summaryData[0].author, style: styles.headerLightPink }],
      [{ value: '', style: styles.headerWhite }],
      [{ value: 'Question', style: styles.headerLightPink }],
      [{ value: qDesc[j].qId + ":" + qDesc[j].qTitle, style: styles.headerCream }],
      [{ value: 'Correct Answers:  ' + " " + qDesc[j].qCorrect, style: styles.headerCream }],
      [{ value: 'Player Correct :  ' + " " + qDesc[j].playersCorrectAverage + " " + "%", style: styles.headerCream }],
      [{ value: 'Question Points:  ' + qDesc[j].qPoints, style: styles.headerCream }],
      [{ value: 'Question Duration:  ' + qDesc[j].qTime, style: styles.headerCream }],
      [{ value: '', style: styles.headerWhite }],
      [{ value: "Answers Summary", style: styles.headerLightPink }],
      [{ value: "Answers Options:", style: styles.headerBrin }],
      [{ value: "<A>" + " " + qDesc[j].qOptions[0], style: styles.headerCream }],
      [{ value: "<B>" + " " + qDesc[j].qOptions[1], style: styles.headerCream }],
      [{ value: "<C>" + " " + qDesc[j].qOptions[2], style: styles.headerCream }],
      [{ value: "<D>" + " " + qDesc[j].qOptions[3], style: styles.headerCream }],
      [{ value: "Number of answers received(A,B,C,D)" + " : " + " " + qDesc[j].noOfTimesOptionsChoosen, style: styles.headerCream }],
      [{ value: "Average Time taken to answer(A,B,C,D) in seconds" + " : " + " " + qDesc[j].averageTimeTaken, style: styles.headerCream }],
      [{ value: '', style: styles.headerWhite }],
      [{ value: "Answers Details", style: styles.headerLightPink }]
    ];
    return heading3
  }
  const merges3 = [
    { start: { row: 1, column: 1 }, end: { row: 1, column: 18 } },
    { start: { row: 2, column: 1 }, end: { row: 2, column: 18 } },
    { start: { row: 3, column: 1 }, end: { row: 3, column: 18 } },
    { start: { row: 4, column: 1 }, end: { row: 4, column: 18 } },
    { start: { row: 5, column: 1 }, end: { row: 5, column: 15 } },
    { start: { row: 6, column: 1 }, end: { row: 6, column: 15 } },
    { start: { row: 7, column: 1 }, end: { row: 7, column: 15 } },
    { start: { row: 8, column: 1 }, end: { row: 8, column: 15 } },
    { start: { row: 9, column: 1 }, end: { row: 9, column: 15 } },
    { start: { row: 10, column: 1 }, end: { row: 10, column: 18 } },
    { start: { row: 11, column: 1 }, end: { row: 11, column: 18 } },
    { start: { row: 12, column: 1 }, end: { row: 12, column: 15 } },
    { start: { row: 13, column: 1 }, end: { row: 13, column: 15 } },
    { start: { row: 14, column: 1 }, end: { row: 14, column: 15 } },
    { start: { row: 15, column: 1 }, end: { row: 15, column: 15 } },
    { start: { row: 16, column: 1 }, end: { row: 16, column: 15 } },
    { start: { row: 17, column: 1 }, end: { row: 17, column: 15 } },
    { start: { row: 18, column: 1 }, end: { row: 18, column: 15 } },
    { start: { row: 19, column: 1 }, end: { row: 19, column: 18 } },
    { start: { row: 20, column: 1 }, end: { row: 20, column: 18 } },
  ]
  const specification3 = {
    name: {
      displayName: 'Players',
      headerStyle: styles.headerBrin,
      cellStyle: styles.cellWhite,
      width: 160
    },
    position: {
      displayName: 'Position',
      headerStyle: styles.headerBrin,
      cellStyle: styles.cellWhite,
      width: 160
    },
    option: {
      displayName: 'Option',
      headerStyle: styles.headerBrin,
      cellStyle: styles.cellWhite,
      width: 80,
      cellStyle: function (value, row) {
        if (row.score > 0) {
          return styles.cellGreen
        }
        else if (row.score == 0) {
          return styles.cellCrimson
        }
        else {
          return styles.cellYellow
        }
      }
    },
    score: {
      displayName: 'Score(points)',
      headerStyle: styles.headerBrin,
      cellStyle: styles.cellWhite,
      width: 180,
      cellFormat: function (value, row) {
        if (typeof row.score == "undefined") {
          value = "-----"
          return value
        }
        else {
          value = value
          return value
        }
      }
    },
    totalScore: {
      displayName: 'Current Total Score(points)',
      headerStyle: styles.headerBrin,
      cellStyle: styles.cellWhite,
      width: 200
    },
    time: {
      displayName: 'Answer Time (seconds)',
      headerStyle: styles.headerBrin,
      cellStyle: styles.cellWhite,
      width: 170
    },
  }
  //question vise analysis report ended 
  // generating the combined excel report 
  let genReportArray = [];
  genReportArray.push({
    name: 'Overview',
    heading: heading,
    merges: merges,
    specification: specification,
    data: dataset
  },
    {
      name: 'Rank Card',
      heading: heading1,
      merges: merges1,
      specification: specification1,
      data: dataset1
    },
    {
      name: 'Konnect! Summary ',
      heading: heading2,
      merges: merges2,
      specification: specification2,
      data: dataset2
    });
  for (var i = 0; i < noOfQuestions; i++) {
    genReportArray.push({
      name: "Q" + (i + 1),
      heading: generateHeading(i),
      merges: merges3,
      specification: specification3,
      data: dataset3[i]
    })
  }
  const report = excel.buildExport(genReportArray);
  res.attachment('report.xlsx');
  console.log('ye wala');
  res.end(report, 'binary')

}


function generateExcelReport(req,res) {
  let qDesc = []
  let noOfQuestions;
  let dataset3 = [];
  var specification2 = {};

  pulseId = req.params.pulseId
  contestId = req.params.contestId
  console.log(pulseId)
  let p1 = func.getOverviewData(pulseId)
    .then((data) => {
      overview = data
      console.log('data is ' + JSON.stringify(overview));
    })
    .catch((err) => {
      console.log(err)
    })
  //contest average 
  let p2 = func.getAverageScore(pulseId)
    .then((data) => {
      averageScore = data
      console.log("Avg score", averageScore)
    })
    .catch((err) => {
      console.log(err)
    })
  //getting average of correct,incorrect and missed answers  
  let p3 = func.getCorrect(pulseId)
    .then((data) => {
      correct = data
      console.log("getting average of correct,incorrect and missed answers  ")
    })
    .catch((err) => {
      console.log(err)
    })
  //for generating the data in the konnect summary 
  let p4 = func.konnectData(pulseId)
    .then((data) => {
      konnectSummary = data

      console.log("for generating the data in the konnect summary")
    })
    .catch((err) => {
      console.log(err)
    })
  //function for generating total correct,total missed and total incorrect answers in count

  // for getting question title,points for every question in Konnect Summary
  let p8;
  let p10;
  let p5 = func.getPointsForQuestions(pulseId)
    .then((data) => {
      scoresOfPlayers = data
console.log("Started getting question title,points for every question in Konnect Summary")
      //getting the array of questions
      p8 = func.getAnswerForQuestions(pulseId)
        .then((data) => {
          optionOfPlayers = data
          console.log("++++++++++++++++++",data)
          console.log("Started getting question title,points for every question in Konnect Summary - 1")
          p10 = func.getAllQuestions(contestId)
            .then((questions) => {
              console.log("Started getting question title,points for every question in Konnect Summary - 2")
              questionsCollection = questions
              for (let i = 0; i < konnectSummary.length; i++) {
                var element = konnectSummary[i];
                //console.log(element)
                //adding the scores field 
                name = 'Q'
                element.scores = scoresOfPlayers[element.id]
                element.allOptions = optionOfPlayers[element.id]
                specification2.position = {
                  displayName: 'Rank',
                  headerStyle: styles.headerBrin,
                  width: 100,
                  cellStyle: styles.cellSize
                }
                specification2.name = {
                  displayName: 'Players',
                  headerStyle: styles.headerBrin,
                  width: 160,
                  cellStyle: styles.cellSize
                }
                specification2.totalScore = {
                  displayName: 'Total Score(points)',
                  headerStyle: styles.headerBrin,
                  width: 167,
                  cellStyle: styles.cellSize
                }
                //adding the scores for Q1,Q2,Q3,...,Qn
                for (let j = 1; j <= noOfQuestions; j++) {
                  c = name + j + "(Points)"
                  d = name + j + "-:" + questionsCollection[j - 1]
                  noOfCharacters = c.length + d.length
                  //setting width of column according to number of characters
                  autoWidth = noOfCharacters.toString()
                  console.log("---------",element)
                  element[c] = element.scores[j - 1]
                  element[d] = element.allOptions[j - 1]
                  specification2[c] = {
                    displayName: c,
                    headerStyle: styles.headerBrin,
                    width: 90,
                    cellStyle: function (value, row) {
                      if (value > 0) {
                        return styles.cellGreen
                      }
                      else if (value == 0) {
                        return styles.cellCrimson
                      }
                      else {
                        return styles.cellYellow
                      }
                    }
                  },
                    specification2[d] = {
                      displayName: d,
                      headerStyle: styles.headerBrin,
                      width: autoWidth

                    }

                }
              console.log("-------------------"+specification2)
                console.log("Started getting question title,points for every question in Konnect Summary - 3")

              }
            })

        })

    })
    .catch((err) => {
      console.log(err)
    })
    .catch((err) => {
      console.log(err)
    })
    .catch((err) => {
      console.log(err)
    })
  //getting author,title,desc from questions collection
  let p6 = func.getQuestionData(contestId)
    .then((data) => {
      summaryData = data
      console.log("getting author,title,desc from questions collection")
    })
    .catch((err) => {
      console.log(err)
    })
  //konnect summary report end
  //analysis for each question started
  let p9;
  let p7 = func.getQuestionInfo(contestId)
    .then((data) => {
      noOfQuestions = data.length
      console.log("analysis for each question started")
      for (j = 0; j < noOfQuestions; j++) {
        //it should have index for getting info of particular question 
        Question = data[j]
        qId = "Q" + (j + 1)
        qTitle = Question.title
        qTime = Question.time + " " + "seconds"
        qCorrect = Question.correct
        qPoints = Question.points + " " + "points"
        qOptions = Question.options
        //for choosing the correct option name 
        var opt = ["A", "B", "C", "D"]
        var optionsGiven = []
        correctAnswer = ""
        for (var i = 0; i < qOptions.length; i++) {
          if (qOptions[i].optionId == qCorrect) {
            correctAnswer += "<" + opt[i] + ">" + qOptions[i].name
            index = i + 1
          }
          optionsGiven.push(qOptions[i].name)
        }
        //qDesc is an array which will contain info of all questions Q1,Q2..Qn
        qDesc.push({ "qId": qId, "qTitle": qTitle, "qTime": qTime, "qCorrect": correctAnswer, "qPoints": qPoints, "qOptions": optionsGiven })
      }
      console.log("analysis for each question started - 2")
      p9 = func.getIndividualQuesData(pulseId)
        .then((data) => {
          var noOfCorrectAnswers = 0
         
          for (var j = 0; j < noOfQuestions; j++) {
            // console.log("loop - 1");
            questionViseScore = data[0].answers[j].answer
            //pushing data to dataset 3
            dataset3.push(questionViseScore)
            noOfTimesOptionsChoosen = [0, 0, 0, 0]
            averageTimeTaken = [0, 0, 0, 0]

            // console.log(questionViseScore)

            for (var i = 0; i < questionViseScore.length; i++) {
              // console.log("loop - 2" , i,  questionViseScore.length);
              optionSelected = questionViseScore[i].option
              if (questionViseScore[i].score > 0) {
                noOfCorrectAnswers += 1
              }
              if (optionSelected == "A") {
                averageTimeTaken[0] += questionViseScore[i].time
                noOfTimesOptionsChoosen[0] += 1;
              }
              else if (optionSelected == "B") {
                averageTimeTaken[1] += questionViseScore[i].time
                noOfTimesOptionsChoosen[1] += 1;
              }
              else if (optionSelected == "C") {
                averageTimeTaken[2] += questionViseScore[i].time
                noOfTimesOptionsChoosen[2] += 1;
              }
              else if (optionSelected == "D") {
                averageTimeTaken[3] += questionViseScore[i].time
                noOfTimesOptionsChoosen[3] += 1;
              }
              else {
                for (var x in noOfTimesOptionsChoosen) {
                  noOfTimesOptionsChoosen[x] += 0
                }
              }
            }
            for (var k = 0; k < averageTimeTaken.length; k++) {
              // console.log("loop - 3");
              if (averageTimeTaken[k] == 0) {
                averageTimeTaken[k] = "--"
              }
              else {
                averageTimeTaken[k] = (averageTimeTaken[k] / noOfTimesOptionsChoosen[k]).toFixed(2)
              }
            }
            
            noOfTimesOptionsChoosen = noOfTimesOptionsChoosen
            averageTimeTaken = averageTimeTaken
            playersCorrectAverage = ((noOfCorrectAnswers / questionViseScore.length) * 100).toFixed(2)
            //j ->index of questions and qDesc is an array which will contain info of all questions Q1,Q2..Qn
            qDesc[j].noOfTimesOptionsChoosen = noOfTimesOptionsChoosen
            qDesc[j].averageTimeTaken = averageTimeTaken
            qDesc[j].playersCorrectAverage = playersCorrectAverage
            noOfCorrectAnswers = 0
            // console.log(qDesc)
          }
          console.log("analysis for each question started - 4")
        })
    })
    .catch((err) => {
      console.log(err)
    })
    .catch((err) => {
      console.log(err)
    })

    console.log("Done getting data")
  //analysis for each question ended
  //calling process for generating the playersScore and total correct,incorrect,missed  answers
  Promise.all([p1, p2, p3, p4, p5, p6, p7, p8, p9, p10]).then(() => {
    console.log("calling process")
    process(pulseId, overview, correct, averageScore, summaryData, qDesc, konnectSummary, dataset3, noOfQuestions, specification2, req, res);
  })
  //this function would be called atlast ,so that data would not become undefined
}

exports.generateExcelReport = generateExcelReport;
******************************
4.reportDB.js
var mongoose = require("mongoose");
const Contest = require("../models/contestModel");
const Question = require('../models/questionModel');
var totalScore = 0;
var count = 0;
var correctCount = 0;
var missed = 0;
const obj = {}
const ans = {}
const arr = []
const arr1 = []
const arr2 = []
const arrr = []
//getting contest Info
exports.getOverviewData = (pulseId) => {
    return  Contest.find({ "_id": new mongoose.Types.ObjectId(pulseId) }, { _id: 0, "contestId": 1, "contestTitle": 1, "organizer": 1, "gameKey": 1, "totalParticipants": 1 })
        .then((contests) => {
            // console.log(contests)
            obj.cId = contests[0].contestId;
            obj.cTitle = contests[0].contestTitle;
            obj.cOrganizer = contests[0].organizer;
            obj.cgameKey = contests[0].gameKey;
            obj.ctotalParticipants = contests[0].totalParticipants;
            return obj
        })
        .catch((err) => {
            console.log(err)
            return err
        })
}
//getting average score of the contest
exports.getAverageScore = (pulseId) => {
    return  Contest.aggregate([{ $match: { "_id": new mongoose.Types.ObjectId(pulseId) } }, { $project: { _id: 0, last: { $arrayElemAt: ["$answers.answer.totalScore", -1] } } }])
        .then((answers) => {
            answers[0].last.forEach(i => {
                totalScore += i;
            })

            averageScore = ((totalScore / answers[0].last.length)).toFixed(2)
            return averageScore
        })
        .catch((err) => {
            console.log(err)
        })
}
//getting correct and incorrect answers
exports.getCorrect = (pulseId) => {
    return  Contest.find({ "_id": new mongoose.Types.ObjectId(pulseId) }, { _id: 0, "answers.answer.score": 1 })
        .then((answers) => {
            answers[0].answers.forEach(i => {
                //console.log(i.answer)
                i.answer.forEach(j => {
                    count += 1
                    //console.log(j.score)
                    if (j.score > 0 && j.score != undefined) {
                        correctCount += 1
                    }
                    else if (j.score == undefined) {
                        missed += 1;
                    }
                })
            })
            incorrectCount = count - correctCount - missed
            ans.avgCorrect = ((correctCount / count) * 100).toFixed(2)
            ans.avgIncorrect = ((incorrectCount / count) * 100).toFixed(2)
            ans.avgMissed = ((missed / count) * 100).toFixed(2)
            return ans
        })
        .catch((err) => {
            console.log(err)
            return err
        })
}
//getting data for the player report 
exports.playerData = (pulseId) => {
    return  Contest.aggregate([{ $match: { "_id": new mongoose.Types.ObjectId(pulseId) } }, { $project: { _id: 0, last: { $arrayElemAt: ["$answers.answer", -1] } } }])
        .then((answers) => {
            playersScore = answers[0].last
            // console.log(playersScore)
            return playersScore
        })
        .catch((err) => {
            console.log(err)
        })
}
//for getting total correct  answers by players 
exports.correct = (pulseId) => {
    return  Contest.find({ "_id": new mongoose.Types.ObjectId(pulseId) }, { _id: 0, "answers": 1 })
        .then((CollectionAnswer) => {
            var base = CollectionAnswer[0].answers;
            var correctQuestionMap = new Map();
            base.forEach((ans) => {
                ans.answer.forEach(kthElem => {
                    // console.log(kthElem)
                    if (correctQuestionMap.has(kthElem.id)) {
                        if (kthElem.score > 0) {
                            correctQuestionMap.set(kthElem.id, correctQuestionMap.get(kthElem.id) + 1);
                        }
                    } else {
                        if (kthElem.score > 0) {
                            correctQuestionMap.set(kthElem.id, 1);
                        }
                        else {
                            correctQuestionMap.set(kthElem.id, 0);
                        }
                    }
                });
              
            })
            return correctQuestionMap
        })
        .catch((err) => {
            console.log(err)
        })
}
//getting missed answers by players
exports.missed = (pulseId) => {
    return  Contest.find({ "_id": new mongoose.Types.ObjectId(pulseId) }, { _id: 0, "answers": 1 })
        .then((CollectionAnswer) => {
            var base = CollectionAnswer[0].answers;
            var missedQuestionMap = new Map();
            base.forEach((ans) => {
                ans.answer.forEach(kthElem => {
                    //console.log(kthElem)
                    if (missedQuestionMap.has(kthElem.id)) {
                        if (kthElem.score == undefined) {
                            missedQuestionMap.set(kthElem.id, missedQuestionMap.get(kthElem.id) + 1);
                        }
                    } else {
                        if (kthElem.score == undefined) {
                            missedQuestionMap.set(kthElem.id, 1);
                        }
                        else {
                            missedQuestionMap.set(kthElem.id, 0);
                        }
                    }
                });
            })
           
            return missedQuestionMap
        })
        .catch((err) => {
            console.log(err)
        })
}
//from here functions for Kahoot Summary will begin 
//getting data for the player report 
exports.konnectData = (pulseId) => {
    return  Contest.aggregate([{ $match: { "_id": new mongoose.Types.ObjectId(pulseId) } }, { $project: { _id: 0, last: { $arrayElemAt: ["$answers.answer", -1] } } }])
        .then((answers) => {

            playersScore = answers[0].last
            //  console.log(playersScore)
            return playersScore
        })
        .catch((err) => {
            console.log(err)
        })
}
//getting points for every questions 
exports.getPointsForQuestions = (pulseId) => {
    return  Contest.aggregate([{ $match: { "_id": new mongoose.Types.ObjectId(pulseId) } }, { $project: { _id: 0, "answers.answer.score": 1, "answers.answer.id": 1 } }])
        .then((answers) => {
            answers[0].answers.forEach(i => {
                arr.push(i.answer.length)
                //2D Array of scores according to question vise
                // console.log(i.answer)
                arr1.push(i.answer)
            
            })
            // console.log(arr)
            //converting 2D Array in to  KV Pair where Key=>Player Name ,Value=>Array of Scores in Q1,Q2,...Qn
            var questionScores = {};
            for (var k = 0; k < arr1.length; k++) {
                arr1[k].forEach(j => {
                    function addScore(key, value) {
                        if (typeof value == "undefined") {
                            value = "Missed"
                        }
                        questionScores[key] = questionScores[key] || [];
                        questionScores[key].push(value);
                    }
                    addScore(j.id, j.score)
                })
            }    // console.log(questionScores)
            return questionScores
        })
        .catch((err) => {
            console.log(err)
            return err
        })
}
//Konnect Summary,now applying db operations on the questionModel
exports.getQuestionData = (contestId) => {
    return Question.find({ "contestId":  contestId}, { _id: 0, "desc": 1, "author": 1 })
        .then((questionData) => {
            return questionData
        })
        .catch((err) => {
            console.log(err)
        })
}
exports.getAllQuestions = (pulseId) => {
    return Question.find({ "contestId":  contestId }, { _id: 0, "questions": 1 })
        .then((questions) => {
            // console.log(questions[0].questions)
            questionsArray = []
            questions[0].questions.forEach(i => {
                questionsArray.push(i.title)
            })

            return questionsArray
        })
        .catch((err) => {
            console.log(err)
        })
}
exports.getAnswerForQuestions = (pulseId) => {
    return Contest.aggregate([{ $match: { "_id": new mongoose.Types.ObjectId(pulseId) } }, { $project: { _id: 0, "answers.answer.option": 1, "answers.answer.id": 1 } }])
        .then((answers) => {

            answers[0].answers.forEach(i => {
                arrr.push(i.answer.length)
                //2D Array of options according to question vise
                arr2.push(i.answer)

            })
            // console.log(arrr)
            //converting 2D Array in to  KV Pair where Key=>Player Name ,Value=>Array of Options in Q1,Q2,...Qn
            var questionOptions = {};
            for (var k = 0; k < arr2.length; k++) {
                arr2[k].forEach(j => {
                    function addOption(key, value) {

                        questionOptions[key] = questionOptions[key] || [];
                        questionOptions[key].push(value);
                    }
                    addOption(j.id, j.option)
                })
            }   //console.log(questionOptions)
            return questionOptions
        })
        .catch((err) => {
            console.log(err)
            return err
        })

}
//konnect summary ended
exports.getQuestionInfo = (pulseId) => {
    return Question.find({ "contestId":  contestId }, { _id: 0, questions: 1 })
        .then((qInfo) => {
            totalQuestions = 0
            QuesAr = []
            qInfo[0].questions.forEach(i => {
                totalQuestions += 1
                QuesAr.push(i)
            })
            //QuesAr is an array of questions which will return information of each question 
            return QuesAr
        })
        .catch((err) => {
            console.log(err)
        })
}
exports.getIndividualQuesData = (pulseId) => {
    return contest.find({ "_id": new mongoose.Types.ObjectId(pulseId) }, { _id: 0, "answers.answer": 1 })
        .then((answers) => {
            //  console.log(answers[0].answers[0].answer)
            data = answers
            return data
        })
        .catch((err) => {
            console.log(err)
        })
}
**************************

5.app.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { ContestService } from './contest.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  contestId:string="145"
  report_success: string
  error_message: string
  _Id='5e170764b5af302fe1985582';
  constructor(private contest: ContestService) { }
  ngOnInit() { }
  // this function will generate report from back end and download it
  generateReport() {
    this.contest.generateReport(this._Id, this.contestId)
      .then((data) => {
        this.report_success = "Report generated successfully "
      })
      .catch((err) => {
        console.log(err)
        this.error_message = "Unable to generate the report"
      })
  }
}

*************************************
6.contest.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from "@angular/common/http";
import { saveAs } from 'file-saver'
let headers = new HttpHeaders({
  "Authorization": "Bearer"
});

@Injectable({
  providedIn: 'root'
})
export class ContestService {
  dataActive = false;
  constructor(private http: HttpClient) { }
  generateReport(_id, contestId) {
    return this.http
      .get("http://localhost:3000/report/" + contestId + "/" + _id, { headers, responseType: "blob" })
      .toPromise()
      .then(blob => {
        saveAs(blob, "Konnect_Report.xlsx");
      })
      .catch(err => console.error("download error = ", err))
  }
}

