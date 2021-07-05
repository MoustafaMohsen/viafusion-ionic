import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-complete-transaction',
  templateUrl: './complete-transaction.page.html',
  styleUrls: ['./complete-transaction.page.scss'],
})
export class CompleteTransactionPage implements OnInit {


  source = {
    amount:50,
    metadata:{
      category:"card",
      name:"Card with visa or mastercard wads",
      image:""
    }
  }
  constructor() { }

  ngOnInit() {
  }

  card_clicked(){
    console.log(this.source)
  }
}
