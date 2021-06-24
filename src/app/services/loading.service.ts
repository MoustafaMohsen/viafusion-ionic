import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  loading = false;
  loading$ = new BehaviorSubject(false);
  constructor() {
    this.loading$.subscribe(d => this.loading = d);
  }

  async start() {
    await this.loading$.next(true)
  }
  async stop() {
    await this.loading$.next(false)
  }

}
