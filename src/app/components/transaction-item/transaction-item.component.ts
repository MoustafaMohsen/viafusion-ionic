import { Component, Input, OnInit } from '@angular/core';
import { ITransaction } from 'src/app/interfaces/db/idbmetacontact';
import { TDirection as _TDirection, Transaction, TStatus  as _TStatus, TPoint  as _TPoint, TransactionPoint } from 'src/app/interfaces/interfaces';

@Component({
  selector: 'app-transaction-item',
  templateUrl: './transaction-item.component.html',
  styleUrls: ['./transaction-item.component.scss'],
})
export class TransactionItemComponent implements OnInit {

  @Input() transaction:ITransaction;
  constructor() { }

  ngOnInit() {}

  dash_class(p_length:number,i:number){
    let key = "points_count_"+p_length
    return {
      [key]:true
    }
  }
}
