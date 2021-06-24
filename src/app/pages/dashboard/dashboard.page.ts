import { TDirection as _TDirection, Transaction, TStatus  as _TStatus } from 'src/app/services/static/interfaces';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  past_transactions:Transaction[]=[];
  TDirection = _TDirection;
  TStatus = _TStatus;
  constructor() { }

  ngOnInit() {
    this.past_transactions=[
      {
        name:"First Transaction",
        description:"Details about Transaction status",
        points:[],
        start_date:new Date(),
        direction:this.TDirection.up,
        amount:1000,
        status:this.TStatus.pending
      },
      {
        name:"Second Transaction",
        description:"Details about Transaction status",
        points:[],
        start_date:new Date(),
        direction:this.TDirection.down,
        amount:1000,
        status:this.TStatus.success
      },
      {
        name:"First Transaction",
        description:"Details about Transaction status",
        points:[],
        start_date:new Date(),
        direction:this.TDirection.up,
        amount:1000,
        status:this.TStatus.failed
      },
    ]
  }

}
