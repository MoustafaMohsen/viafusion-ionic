import { Component, Input, OnInit } from '@angular/core';
import { TDirection as _TDirection, Transaction, TStatus  as _TStatus, TPoint  as _TPoint, TransactionPoint } from 'src/app/interfaces/interfaces';

@Component({
  selector: 'app-transaction-item',
  templateUrl: './transaction-item.component.html',
  styleUrls: ['./transaction-item.component.scss'],
})
export class TransactionItemComponent implements OnInit {

  TDirection = _TDirection;
  TStatus = _TStatus;
  TPoint = _TPoint;
  @Input() transaction:Transaction = {
    name:"First Transaction",
    description:"Details about Transaction status",
    points:[],
    start_date:new Date(),
    direction:this.TDirection.up,
    amount:1000,
    status:this.TStatus.pending
  };
  constructor() { }

  ngOnInit() {}

  dash_class(p_length:number,i:number){
    let key = "points_count_"+p_length
    return {
      [key]:true
    }
  }
}
