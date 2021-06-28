import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-vcc-history',
  templateUrl: './vcc-history.page.html',
  styleUrls: ['./vcc-history.page.scss'],
})
export class VccHistoryPage implements OnInit {

  constructor(private router:Router,private route:ActivatedRoute) { }

  ngOnInit() {
  }
  segmentChanged(e){
    let tab = e.detail.value;
    this.router.navigate(["settings"], {relativeTo:this.route})
    console.log(e);
    var target = e.target;
    console.log(target);
    return;


  }
}
