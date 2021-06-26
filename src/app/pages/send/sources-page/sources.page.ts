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
    this.router.navigateByUrl("destination");
  }

  add_source(){

  }

}
