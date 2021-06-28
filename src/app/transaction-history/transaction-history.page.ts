import { Component, OnInit } from '@angular/core';
import { TPoint, TransactionPoint } from '../services/static/interfaces';
import { TDirection as _TDirection, Transaction, TStatus  as _TStatus } from 'src/app/services/static/interfaces';
import { LoadingService } from 'src/app/services/loading.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-transaction-history',
  templateUrl: './transaction-history.page.html',
  styleUrls: ['./transaction-history.page.scss'],
})
export class TransactionHistoryPage implements OnInit {

  past_transactions:Transaction[]=[];
  TDirection = _TDirection;
  TStatus = _TStatus;
  constructor(public loading:LoadingService, public router:Router) { }

  ngOnInit() {
    let points:TransactionPoint[]=[{
      name:"Bank of America",
      type:TPoint.bank,
      status:this.TStatus.success
    },
    {
      name:"Wallet",
      type:TPoint.wallet,
      status:this.TStatus.pending
    },
    {
      name:"Virtural Card",
      type:TPoint.vcard,
      status:this.TStatus.pending
    },
    {
      name:"Physical Card",
      type:TPoint.pcard,
      status:this.TStatus.pending
    }
  ]
    this.past_transactions=[
      {
        name:"",
        description:"Details about Transaction status",
        points:points,
        start_date:new Date(),
        direction:this.TDirection.up,
        amount:1000,
        status:this.TStatus.pending
      },
      {
        name:"",
        description:"Details about Transaction status",
        points:points,
        start_date:new Date(),
        direction:this.TDirection.down,
        amount:1000,
        status:this.TStatus.success
      },
      {
        name:"",
        description:"Details about Transaction status",
        points:[points[1], points[2]],
        start_date:new Date(),
        direction:this.TDirection.up,
        amount:1000,
        status:this.TStatus.failed
      },
    ]
  }


}
