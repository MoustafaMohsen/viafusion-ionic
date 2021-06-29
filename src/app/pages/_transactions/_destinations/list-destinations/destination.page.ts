import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-destination',
  templateUrl: './destination.page.html',
  styleUrls: ['./destination.page.scss'],
})
export class DestinationPage implements OnInit {

  constructor(private router:Router) { }

  ngOnInit() {
  }
  add_destination(){

  }

  continue_to_overview(){
    //TODO make transaction overview page
    this.router.navigateByUrl("transaction-overview")
  }

}
