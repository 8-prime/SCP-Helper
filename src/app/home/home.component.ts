import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { open } from "@tauri-apps/api/dialog"
import { DataService } from '../data.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  dataService = inject(DataService);
  router = inject(Router);

  async selectFiles() {
    try {
      const selected = await open({
        multiple: true,
        directory: false,
        title: "Select File or Directory to transfer"
      }) as string[];
      if(selected && selected.length > 0 ){
        this.dataService.setSelectedFiles(selected);
        this.router.navigateByUrl("/selected");
      }
    } catch (error) {
      console.error(error);
    }
  }
}
