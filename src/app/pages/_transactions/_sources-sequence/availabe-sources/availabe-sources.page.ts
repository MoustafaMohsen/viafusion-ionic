import { Component, OnInit } from '@angular/core';
import { ISource } from 'src/app/interfaces/interfaces';

@Component({
  selector: 'app-availabe-sources',
  templateUrl: './availabe-sources.page.html',
  styleUrls: ['./availabe-sources.page.scss'],
})
export class AvailabeSourcesPage implements OnInit {

  source_item:ISource = {
    name:"wallet",
    description:"",
    start_date:new Date(),
    amount:0 ,
  };


  constructor() { }

  ngOnInit() {
  }

}
