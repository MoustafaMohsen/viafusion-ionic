import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss'],
})
export class CategoryComponent implements OnInit {

  constructor() { }

  products_details: {product_name: string; img_src?: string}[] = [
      {product_name:"First prod"},
      {product_name:"second prod"},
      {product_name:"Third prod"},
      {product_name:"Fourth prod"},
    ]
  ngOnInit() { }

}
