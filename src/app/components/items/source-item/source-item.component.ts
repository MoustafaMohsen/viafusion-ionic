import { LoadingService } from 'src/app/services/loading.service';
import { Component, Input, OnInit } from '@angular/core';
import { ISource, TStatus as _TStatus, TSourcePoint as _TSourcePoint } from 'src/app/interfaces/interfaces';
import { ListPayments } from 'src/app/interfaces/rapyd/ipayment';

@Component({
  selector: 'app-source-item',
  templateUrl: './source-item.component.html',
  styleUrls: ['./source-item.component.scss'],
})
export class SourceItemComponent implements OnInit {

  constructor() { }

  TStatus = _TStatus;
  TSourcePoint = _TSourcePoint;

  @Input() source_item:ListPayments.Response = {
    name:"First Transaction",
    amount:1000,
    status:this.TStatus.pending,
  };

  ngOnInit() {}

}
