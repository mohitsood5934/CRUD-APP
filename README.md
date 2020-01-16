# CRUD-APP
CRUD Operation in Node.js using MongoDB as a database and Express.js as a framework.

For update and delete operation enter the "_id" of the person that is stored in the database.

Instead of entering "_id" that is uniquely generated for each user we can also use autoincrement sequence in MongoDB .I will use it later.


const express = require("express");
const router = express.Router();
const excel = require('node-excel-export');
var styles = require("../utilities/styles")
var func = require("./functions")
var qDesc = []
var noOfQuestions;
var specification2 = {};
var dataset3 = [];
var overview = {};
var correct = {};
var playersScore;
var summaryData = [{}];
var konnectSummary = [];
var averageScore;

router.get("/report/:contestId", function (req, res) {

  contestId = req.params.contestId
  console.log( contestId)
  
  function fun1(){
    return new Promise(function(resolve, reject) {
      console.log("world");
      resolve();
    });
  }
  func.getOverviewData(contestId)
  .then((data) => {
    overview = data
    console.log('data is '+JSON.stringify(overview));
  })
  .catch((err) => {
    console.log(err)
  })
  //contest average 
  func.getAverageScore(contestId)
  .then((data) => {
    averageScore = data
    console.log("Avg score",averageScore)
  })
  .catch((err) => {
    console.log(err)
  })
  //getting average of correct,incorrect and missed answers  
  func.getCorrect(contestId)
  .then((data) => {
    correct = data
  })
  .catch((err) => {
    console.log(err)
  })
  
  //for generating the data in the konnect summary 
  func.konnectData(contestId)
  .then((data) => {
    //console.log(data)
    konnectSummary = data
  })
  .catch((err) => {
    console.log(err)
  })
  //function for generating total correct,total missed and total incorrect answers in count
  function process() {
  var playersScore;
  var ccc;
  func.playerData(contestId)
    .then((data) => {
      playersScore = data;
      func.correct(contestId)
        .then((data) => {
          ccc = data;
         console.log("process")
          for (let i = 0; i < playersScore.length; i++) {
            var element = playersScore[i];
            element.totalCorrect = ccc.get(element.id);
          }
          func.missed(contestId)
            .then((data) => {
              ccc1 = data
              for (let i = 0; i < playersScore.length; i++) {
                var element = playersScore[i];
                element.totalMissed = ccc1.get(element.id);
                element.totalIncorrect = noOfQuestions - ccc.get(element.id) - ccc1.get(element.id)
              }
              //console.log(playersScore)
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
  // for getting question title,points for every question in Konnect Summary
  func.getPointsForQuestions(contestId)
  .then((data) => {
    scoresOfPlayers = data
  
    //getting the array of questions
    func.getAnswerForQuestions(contestId)
      .then((data) => {
        optionOfPlayers = data
        //console.log(data)
        func.getAllQuestions(contestId)
          .then((questions) => {
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
                c = name + j+"(Points)"
                d = name+j+"-:"+questionsCollection[j - 1]
                noOfCharacters=c.length+d.length
                //setting width of column according to number of characters
                autoWidth=noOfCharacters.toString()
               
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
                    displayName:d,
                    headerStyle: styles.headerBrin,
                    width: autoWidth 
  
                  }
              }
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
  func.getQuestionData(contestId)
  .then((data) => {
    summaryData = data
    //console.log(summaryData)
  })
  .catch((err) => {
    console.log(err)
  })
  //konnect summary report end
  //analysis for each question started
  func.getQuestionInfo(contestId)
  .then((data) => {
    noOfQuestions = data.length
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
      var opt=["A","B","C","D"]
      var optionsGiven = []
      correctAnswer=""
      for (var i = 0; i < qOptions.length; i++) {
        if (qOptions[i].optionId == qCorrect) {
          correctAnswer += "<"+opt[i]+">"+qOptions[i].name
          index = i + 1
        }
        optionsGiven.push(qOptions[i].name)
      }
      //qDesc is an array which will contain info of all questions Q1,Q2..Qn
      qDesc.push({ "qId": qId, "qTitle": qTitle, "qTime": qTime, "qCorrect": correctAnswer, "qPoints": qPoints, "qOptions": optionsGiven })
    }
    func.getIndividualQuesData(contestId)
      .then((data) => {
        var noOfCorrectAnswers = 0
        for (var j = 0; j < noOfQuestions; j++) {
          questionViseScore = data[0].answers[j].answer
          //pushing data to dataset 3
          dataset3.push(questionViseScore)
          noOfTimesOptionsChoosen = [0, 0, 0, 0]
          averageTimeTaken = [0, 0, 0, 0]
  
          for (var i = 0; i < questionViseScore.length; i++) {
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
              for (var i in noOfTimesOptionsChoosen) {
                noOfTimesOptionsChoosen[i] += 0
              }
            }
          }
          for (var k = 0; k < averageTimeTaken.length; k++) {
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
        
       //  console.log(qDesc)
       
        }
      })
   
  })
  .catch((err) => {
    console.log(err)
  })
  .catch((err) => {
    console.log(err)
  })
  
  //analysis for each question ended
  //calling process for generating the playersScore and total correct,incorrect,missed  answers
process()
  //this function would be called atlast ,so that data would not become undefined
console.log("I am in the heading")
  const heading = [
    [{ value: overview.cTitle, style: styles.headerLightPink }],
    [{ value: '', style: styles.headerCream  }],
    [{ value: 'Contest Id:  ' + overview.cId, style: styles.headerCream  }],
    [{ value: 'Organizer:  ' + overview.cOrganizer,style: styles.headerCream }],
    [{ value: 'Game Key:  ' + overview.cgameKey, style: styles.headerCream  }],
    [{ value: 'Total Participants:  ' + overview.ctotalParticipants, style:styles.headerCream  }],
    [{ value: '', style: styles.headerCream  }],
    [{ value: 'Overall Performace', style: styles.headerLightPink }],
    [{ value: '', style: styles.headerCream  }],
    [{ value: 'Total Correct Answers(%): ' + ' ' + correct.avgCorrect + '%', style: styles.headerCream  }],
    [{ value: 'Total Incorrect Answers(%): ' + ' ' + correct.avgIncorrect + '%', style: styles.headerCream  }],
    [{ value: 'Total Missed Answers(%): ' + ' ' + correct.avgMissed + '%', style: styles.headerCream  }],
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
      [{ value: 'Correct Answers:  ' + " " + qDesc[j].qCorrect, style: styles.headerCream  }],
      [{ value: 'Player Correct :  ' + " " + qDesc[j].playersCorrectAverage + " " + "%", style: styles.headerCream }],
      [{ value: 'Question Points:  ' + qDesc[j].qPoints, style:styles.headerCream  }],
      [{ value: 'Question Duration:  ' + qDesc[j].qTime, style: styles.headerCream }],
      [{ value: '', style: styles.headerWhite }],
      [{ value: "Answers Summary", style: styles.headerLightPink }],
      
      [{ value: "Answers Options:", style: styles.headerBrin }],
      [{ value: "<A>" + " " +qDesc[j].qOptions[0] ,style: styles.headerCream }],
      [{ value: "<B>" + " " +qDesc[j].qOptions[1] , style:  styles.headerCream  }],
      [{ value: "<C>" + " " +qDesc[j].qOptions[2] , style:  styles.headerCream }],
      [{ value: "<D>" + " " +qDesc[j].qOptions[3] , style:  styles.headerCream  }],
      [{ value: "Number of answers received(A,B,C,D)" +" : "+ " " + qDesc[j].noOfTimesOptionsChoosen, style: styles.headerCream  }],
      [{ value: "Average Time taken to answer(A,B,C,D) in seconds" +" : " + " " + qDesc[j].averageTimeTaken, style: styles.headerCream  }],
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
      specification:specification1,
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
})


module.exports = router

