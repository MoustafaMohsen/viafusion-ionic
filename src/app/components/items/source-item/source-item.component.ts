import { Component, Input, OnInit } from '@angular/core';
import { ISource, TStatus as _TStatus, TSourcePoint as _TSourcePoint } from 'src/app/services/static/interfaces';

@Component({
  selector: 'app-source-item',
  templateUrl: './source-item.component.html',
  styleUrls: ['./source-item.component.scss'],
})
export class SourceItemComponent implements OnInit {

  constructor() { }

  TStatus = _TStatus;
  TSourcePoint = _TSourcePoint;

  @Input() source_item:ISource = {
    name:"First Transaction",
    description:"Details about Transaction status",
    start_date:new Date(),
    type:this.TSourcePoint.bank,
    amount:1000,
    status:this.TStatus.pending
  };

  ngOnInit() {}

}
