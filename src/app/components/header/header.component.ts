import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {

  @Input() title = "";
  @Input() back_url = "dashboard";
  constructor(private router:Router) { }

  ngOnInit() {}
  back(){
    this.router.navigateByUrl(this.back_url)
  }

}
