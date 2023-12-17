import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { distinctUntilChanged } from 'rxjs';
import { DataService } from '../data.service';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.css']
})
export class ProgressComponent {
  dataService = inject(DataService);
  refDect = inject(ChangeDetectorRef)
  router = inject(Router);

  completed: boolean = false;
  progress: number = 0;

  ngOnInit() {
    this.dataService.uploadProgress$$.pipe(distinctUntilChanged()).subscribe(prog => {
      this.progress = prog;
      this.refDect.detectChanges();
    });
    this.dataService.uploadCompleted$$.subscribe(comp => this.completed = comp);
  }

  home(){
    this.router.navigateByUrl("/");
  }
}
