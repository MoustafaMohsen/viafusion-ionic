import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sources-page',
  templateUrl: './availabe-sources.page.html',
  styleUrls: ['./availabe-sources.page.scss'],
})
export class SelectedSourcesPage implements OnInit {

  constructor(private router:Router) { }

  ngOnInit() {
  }
  continue_to_destination(){
    this.router.navigateByUrl("transaction/destinations/list-destinations");
  }

  add_source(){
    this.router.navigateByUrl("transaction/sources/add-source");
  }

}
