import { Component, Input, OnInit } from '@angular/core';
import { ICardDetails } from 'src/app/interfaces/interfaces';

@Component({
  selector: 'app-cc',
  templateUrl: './cc.component.html',
  styleUrls: ['./cc.component.scss'],
})
export class CcComponent implements OnInit {

  @Input() card_details:ICardDetails;
  constructor() { }

  ngOnInit() {}

  show=true;

  go_to_card(){

  }
}
