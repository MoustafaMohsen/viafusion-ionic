import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sources-page',
  templateUrl: './sources.page.html',
  styleUrls: ['./sources.page.scss'],
})
export class SourcesPage implements OnInit {

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
