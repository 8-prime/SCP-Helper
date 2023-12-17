import { Component, inject } from '@angular/core';
import { DataService } from '../data.service';
import { UserSettings } from '../user-settings';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  dataService = inject(DataService);

  userData: UserSettings = new UserSettings();

  ngOnInit() {
    this.dataService.userData$$.subscribe(data => this.userData = data);
  }

  async saveData(){
    await this.dataService.saveUserData(this.userData);
  }
}
