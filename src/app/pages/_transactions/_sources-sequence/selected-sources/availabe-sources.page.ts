import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { ISource, TStatus as _TStatus, TSourcePoint as _TSourcePoint } from 'src/app/interfaces/interfaces';


@Component({
  selector: 'app-sources-page',
  templateUrl: './availabe-sources.page.html',
  styleUrls: ['./availabe-sources.page.scss'],
})
export class SelectedSourcesPage implements OnInit {

  source_item:ISource = {
    name:"wallet",
    description:"",
    start_date:new Date(),
    amount:0 ,
  };


  constructor(private router:Router) { }

  ngOnInit() {
  }
  continue_to_destination(){
    this.router.navigateByUrl("transaction/destinations/list-destinations");
  }

  add_source(){
    this.router.navigateByUrl("transaction/sources-sequence/available-sources");
  }

}
