1...app.js
var express = require('express');
var fs = require("fs");
var path = require("path");
var morgan = require("morgan");
var cors = require("cors");
var bodyParser = require("body-parser");
var routes = require("./routes/route")
//const userFiles = '../serverSide/userUploads/'
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
//for downloading the file
app.use("/download", routes)
app.use('/download', express.static(path.join(__dirname, 'userUploads')))
//for uploading the files 
app.use("/upload",routes)
app.listen(3000, function (req, res) {
  console.log("You are listening to port 3000")
});


2...route.js
const express = require("express");
const router = express.Router();
const generateRTF = require("./generateRTFFile");
const fs=require("fs")
// const userFiles = '../serverSide/userUploads/'
router.get("/download/:fileName", function (req, res) {
    const fileName = req.params.fileName;
    generateRTF.downloadFile(fileName,req,res);
})
router.put('/', (req, res) => {
  console.log("files")
  const file = req.body;
  generateRTF.uploadFile(file,req,res);
 });

module.exports = router

3...generateRTFFile.js
const fs = require("fs");
var util = require("util");
const userFiles = '../serverSide/userUploads/'
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
 exports.uploadFile=(file,req,res)=>{
    const base64data = file.content.replace(/^data:.*,/, '');
    fs.writeFile(userFiles + file.name, base64data, 'base64', (err) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      } else {
        res.set('Location', userFiles + file.name);
        res.status(200);
        res.send(file);
      }
    });
 }


4..rtf.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from "@angular/common/http";
import { finalize } from 'rxjs/operators';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
let headers = new HttpHeaders({
  "Authorization": "Bearer"
});
@Injectable({
  providedIn: 'root'
})
export class RtfService {
  [x: string]: any;
  constructor(private http: HttpClient) { }
  public upload(fileName: string, fileContent: string) {
    return this.http.put("http://localhost:3000/upload", {name: fileName, content: fileContent})
    .toPromise()
    
  }
 
  
  public download (fileName:string){
    return this.http.get("http://localhost:3000/download/"+fileName, { responseType: 'blob'})
    .toPromise()
  }
 

}


5..app.compo.ts
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
  fileList:any=[]
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
  download(filename){
    this.rtf.download(filename)
   .then(
        blob => {
        saveAs(blob, "RTFFile.rtf");
        this.success_message = "RTF File downloaded successfully "
      })
      .catch((err) => {
        this.failure_message = "Unable to download the file"
      })
 
  }
  remove(filename){
    this.fileList.pop(filename)
  }
  upload(){
    this.fileList.push(this.filePath);
    this.rtf.upload(this.filePath, this.url)
    .then((data)=>{
      this.success_message="File Uploaded successfully"
    })
    .catch((err)=>{
      this.failure_message = "Unable to upload the file"
    })
      
    
  }

}


6....app.htmlll
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
          <button type="submit" class="btn btn-primary"  (click)="upload()" >Upload</button>
         <!-- <button type="submit" class="btn btn-primary btn-md" (click)="download()">Download File</button>-->
          <div *ngIf="success_message">
            <span style="color:green"><b>{{success_message}}</b></span>
          </div>
          <div *ngIf="failure_message">
            <span style="color:red"><b>{{failure_message}}</b></span>
          </div>
          <h1>Your files</h1>
<ul>
 <li *ngFor="let fileName of fileList" >
   {{fileName}}&nbsp;&nbsp;
   <button class="btn btn-primary"  (click)="download(fileName)">Download</button>&nbsp;
 </li>
</ul>
        </mat-card-actions>
      </mat-card>
    </div>
  </div>
  
  7..app.module.ts
  import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {ReactiveFormsModule} from '@angular/forms';
import {MatCardModule} from '@angular/material/card';
import {MatInputModule} from '@angular/material/input';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import {MatButtonModule, MatIconModule} from '@angular/material';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MaterialFileInputModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
