import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-pcc-details',
  templateUrl: './pcc-details.page.html',
  styleUrls: ['./pcc-details.page.scss'],
})
export class PccDetailsPage implements OnInit {

  constructor(private router:Router,private route:ActivatedRoute) { }

  ngOnInit() {
  }

  segmentChanged(e){
    let tab = e.detail.value;
    this.router.navigate(["cc","pcc","pcc-details","pcc-"+tab])
  }

}

