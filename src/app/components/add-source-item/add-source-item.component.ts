import { Component,Input, OnInit } from '@angular/core';
import { ISource, TStatus as _TStatus, TSourcePoint as _TSourcePoint } from 'src/app/services/static/interfaces';


@Component({
  selector: 'app-add-source-item',
  templateUrl: './add-source-item.component.html',
  styleUrls: ['./add-source-item.component.scss'],
})
export class AddSourceItemComponent implements OnInit {

  constructor() { }

  TStatus = _TStatus;
  TSourcePoint = _TSourcePoint;

  @Input() transaction:ISource = {
    name:"source title",
    description:"Details about source",
    start_date:new Date(),
    type:this.TSourcePoint.bank,
    amount:1000,
    status:this.TStatus.pending
  };

  ngOnInit() {}

}
