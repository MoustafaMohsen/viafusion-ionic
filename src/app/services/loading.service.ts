import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  loading=false;
  loading$ = new BehaviorSubject(false);
  constructor() {
    this.loading$.subscribe(d=>this.loading=d);
  }

}
