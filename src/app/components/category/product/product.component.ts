import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
})
export class ProductComponent implements OnInit {

  @Input() product_name : string = "product name";
  @Input() img_src : string = "../../../assets/images/car.jpg";

  constructor() { }

  ngOnInit() {}

}
