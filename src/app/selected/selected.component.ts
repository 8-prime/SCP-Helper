import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-selected',
  templateUrl: './selected.component.html',
  styleUrls: ['./selected.component.css']
})
export class SelectedComponent {
  dataService = inject(DataService);
}
