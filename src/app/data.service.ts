import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  selectedFiles$$ = new BehaviorSubject<string[]>([]);

  setSelectedFiles(selected: string[]) {
    this.selectedFiles$$.next(selected);
  }
}
