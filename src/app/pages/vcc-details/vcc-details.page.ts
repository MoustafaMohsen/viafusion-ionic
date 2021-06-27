import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-vcc-details',
  templateUrl: './vcc-details.page.html',
  styleUrls: ['./vcc-details.page.scss'],
})
export class VccDetailsPage implements OnInit {

  constructor(private router:Router,private route:ActivatedRoute) { }

  ngOnInit() {
  }

  segmentChanged(e){
    let tab = e.detail.value;
    this.router.navigate(["vcc-details",tab])
  }

}
