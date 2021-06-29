import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-pcc-history',
  templateUrl: './pcc-history.page.html',
  styleUrls: ['./pcc-history.page.scss'],
})
export class PccHistoryPage implements OnInit {

  constructor(private router:Router,private route:ActivatedRoute) { }

  ngOnInit() {
  }
  segmentChanged(e){
    let tab = e.detail.value;
    this.router.navigate(["cc","pcc","pcc-details","pcc-"+tab], {relativeTo:this.route})
    console.log(e);
    var target = e.target;
    console.log(target);
    return;


  }
}
