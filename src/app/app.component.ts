import { Component, inject, OnInit } from "@angular/core";
import { DataService } from "./data.service";


type Schema = {
  theme: 'dark' | 'light';
  startFullscreen: boolean;
}


@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {

  dataService = inject(DataService);

  async ngOnInit() {
    await this.dataService.registerProgressEvent();
    await this.dataService.loadUserData();
  }
}
