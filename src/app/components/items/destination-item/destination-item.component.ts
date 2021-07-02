import { Component, OnInit, Input } from '@angular/core';
import { ISource, TStatus as _TStatus, TSourcePoint as _TSourcePoint } from 'src/app/interfaces/interfaces';

@Component({
  selector: 'app-destination-item',
  templateUrl: './destination-item.component.html',
  styleUrls: ['./destination-item.component.scss'],
})
export class DestinationItemComponent implements OnInit {

  constructor() {
  }


  TStatus = _TStatus;
  TSourcePoint = _TSourcePoint;

  @Input() transaction:ISource = {
    name:"First Transaction",
    description:"Details about Transaction status",
    start_date:new Date(),
    type:this.TSourcePoint.bank,
    amount:1000,
    status:this.TStatus.pending
  };

  ngOnInit() {}

}
