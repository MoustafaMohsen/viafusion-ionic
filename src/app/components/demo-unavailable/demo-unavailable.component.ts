import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';

/** The note shown next to an action the demo does not simulate; renders nothing outside demo mode */
@Component({
  selector: 'app-demo-unavailable',
  template: `<small *ngIf="demo" class="demo-unavailable">Not available in this demo</small>`,
  styles: [`
    .demo-unavailable {
      display: block;
      margin-top: 0.25rem;
      font-size: 0.75rem;
      line-height: 1.2;
      font-weight: 400;
      color: #6b7280;
    }
  `],
})
export class DemoUnavailableComponent {

  demo = environment.demo;

  constructor() { }
}
