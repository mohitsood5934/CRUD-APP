>>>>>>>>server side<<<<<<
1.app.js
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

2.routes/generateRTFFile.js
const fs = require("fs");
var util = require("util");
exports.generateFile=(req,res)=>{
    fs.readFile(__dirname + '/RTF/convert.html','utf8', function(err, data){
         if(err){
             console.log(err);
         }else{
            report=util.format(data)
            res.attachment('report.rtf');
            res.end(report, 'binary')
         }
      });
 }
 exports.downloadFile=(fileName,req,res)=>{
      fs.readFile(fileName,'utf8', function(err, data){
        if(err){
            console.log(err);
        }else{
           report=util.format(data)
           res.attachment('report.rtf');
           res.end(report, 'binary')
        }
     });
 }

3.routes/route.js
const express = require("express");
const router = express.Router();
const generateRTF = require("./generateRTFFile");
router.get("/rtfFile", function (req, res) {
    generateRTF.generateFile(req, res)

})
router.get("/files/:fileName", function (req, res) {
    const fileName = req.params.fileName;
    generateRTF.downloadFile(fileName,req,res);
})
module.exports = router

4.rtf.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from "@angular/common/http";
import { BehaviorSubject, Subject, Observable } from 'rxjs';
let headers = new HttpHeaders({
  "Authorization": "Bearer"
});
@Injectable({
  providedIn: 'root'
})
export class RtfService {

  constructor(private http: HttpClient) { }
  generateRTFFile() {
    return this.http
      .get("http://localhost:3000/rtfFile" , { headers, responseType: "blob" })
      .toPromise()
  }
  public download (fileName:string){
    return this.http.get("http://localhost:3000/files/"+fileName, { responseType: 'blob'})
    .toPromise()
  }
 

}

5.app.com.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '../../node_modules/@angular/forms';
import { FormControl, FormGroupDirective, NgForm, FormGroup, Validators } from '@angular/forms';
import { RtfService } from './rtf.service'
import { saveAs } from 'file-saver'
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  //setting File path
  public filePath;
  url: any;
  //event listener function for file
  onSelectFile(event) { // called each time file input changes
    if (event.target.files && event.target.files[0]) {
      //file preview
      var reader = new FileReader();
      console.log("reader", reader)
      //it is for url of the file
      this.filePath = event.target.files[0].name;
      console.log("File path", this.filePath);
      const [file] = event.target.files;
      reader.readAsDataURL(file); // read file as data url
      reader.onload = (event) => { // called once readAsDataURL is completed
      this.url = reader.result; //add source to file
      console.log(this.url)
      }
    }
  }
  public success_message: string;
  public failure_message: string;
  public contestForm: FormGroup;
  constructor(private formBuilder: FormBuilder, private rtf: RtfService) {
    this.contestForm = this.formBuilder.group({
      cardImage: ["", Validators.required]
    })
  }
  convertFile() {
    this.rtf.generateRTFFile()
      .then(
        blob => {
          saveAs(blob, "File.rtf");
          this.success_message = "RTF File generated successfully "
        })
      .catch((err) => {
        this.failure_message = "Unable to generate the file"
      })
  }
  download(){
    this.rtf.download(this.filePath)
   .then(
        blob => {
        saveAs(blob, "RTFFile.rtf");
        this.success_message = "RTF File generated successfully "
      })
      .catch((err) => {
        this.failure_message = "Unable to generate the file"
      })
 
  }

}
6.
app.comp.html<<<<<<<<<
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
            <ngx-mat-file-input placeholder="Upload HTML File" (change)="onSelectFile($event)" required
              formControlName="cardImage"></ngx-mat-file-input>
            <mat-icon matSuffix>folder</mat-icon>
          </mat-form-field>
        </form>
        <mat-card-actions>
          <button type="submit" class="btn btn-primary btn-md" (click)="convertFile()">Convert</button><br><br>
          <button type="submit" class="btn btn-primary btn-md" (click)="download()">Download File</button>
          <div *ngIf="success_message">
            <span style="color:red"><b>{{success_message}}</b></span>
          </div>
          <div *ngIf="failure_message">
            <span style="color:red"><b>{{failure_message}}</b></span>
          </div>
        </mat-card-actions>
      </mat-card>
    </div>
  </div>
