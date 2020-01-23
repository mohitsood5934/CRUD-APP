
1.app.html
<br>
<div class="container">
  <div class="row">
    <div class="col-md-5">
      <mat-card class="example-card">
        <mat-card-header>
                  
          <mat-card-title><span style="color:LightCoral ">"HTML to RTF conversion"</span></mat-card-title>
          <mat-card-subtitle>Choose a file</mat-card-subtitle>
        </mat-card-header>

        <form [formGroup]="contestForm">
          <!--file upload using angular -->
          <mat-form-field>
            <ngx-mat-file-input placeholder="Upload HTML File" (change)="onSelectFile($event)"  required
              formControlName="cardImage"></ngx-mat-file-input>
            <mat-icon matSuffix>folder</mat-icon>

          </mat-form-field>
        </form>
        <mat-card-actions>
          <div *ngIf="url">
            {{url}}
          </div>
          <button type ="submit" class="btn btn-primary btn-md">Convert</button>
        </mat-card-actions>
      </mat-card>
    </div>
  </div>


2..
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '../../node_modules/@angular/forms';
import {FormControl, FormGroupDirective, NgForm, FormGroup,Validators} from '@angular/forms';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
 //setting image path
 public filePath;
 url: any;
 //event listener function for image
 onSelectFile(event) { // called each time file input changes
   if (event.target.files && event.target.files[0]) {
     //file preview
     var reader = new FileReader();
     console.log("reader",reader)
     //it is for url of the image
     this.filePath = event.target.files[0].name;
     console.log("File path",this.filePath);
     reader.readAsDataURL(event.target.files[0]); // read file as data url
     reader.onload = (event) => { // called once readAsDataURL is completed
     this.url = reader.result; //add source to file
     }
   }}
 
 
   //creation form group object  
   public contestForm:FormGroup;
   constructor(private formBuilder:FormBuilder) {
    this.contestForm=this.formBuilder.group({
 
      cardImage:["",Validators.required],
  
      
    })

   
  }



}

3.generateRTFFile.js
const htmlToRtf = require('html-to-rtf');
const fs = require("fs");
var util = require("util");
exports.generateFile=(req,res)=>{
    fs.readFile(__dirname + '/RTF/convert.html','utf8', function(err, data){
         if(err){
             console.log(err);
         }else{
             //console.log(data)
             content=util.format(data)
            const report = htmlToRtf.convertHtmlToRtf(content)
            res.attachment('report.rtf');
            res.end(report, 'binary')
         }
      });
 }

4.route.js
const express = require("express");
const router = express.Router();
const generateRTF=require("./generateRTFFile");

router.get("/rtfFile", function (req, res) {
    generateRTF.generateFile(req,res)

})
 module.exports = router
5.
app.js
var express = require('express');
var fs = require("fs");
var path = require("path");
var morgan = require("morgan");
var cors = require("cors");
var bodyParser = require("body-parser");
var routes = require("./routes/route")
var app = express();
//middlewares used 
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'rtfLogFile.log'), { flags: 'a' })
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
