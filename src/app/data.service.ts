import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject } from 'rxjs';
import { UserSettings } from './user-settings';
import { invoke } from "@tauri-apps/api/tauri";
import { listen } from '@tauri-apps/api/event'
import { Store } from 'tauri-plugin-store-api';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  toastService = inject(ToastrService);
  router = inject(Router);

  store = new Store(".settings.dat");

  selectedFiles$$ = new BehaviorSubject<string[]>([]);
  currentFile$$ = new BehaviorSubject<number>(0);
  uploadProgress$$ = new BehaviorSubject<number>(0);
  uploadCompleted$$ = new BehaviorSubject<boolean>(false);
  userData$$ = new BehaviorSubject<UserSettings>(new UserSettings());

  setSelectedFiles(selected: string[]) {
    this.selectedFiles$$.next(selected);
  }

  async loadUserData() {
    const loaded = new UserSettings();
    this.store.get("user").then((data: any) => {
      loaded.user = data.value;
    });
    this.store.get("password").then((data: any) => {
      loaded.password = data.value;
    });
    this.store.get("remote").then((data: any) => {
      loaded.remote = data.value;
    });
    this.store.get("movies").then((data: any) => {
      loaded.movies = data.value;
    });
    this.store.get("shows").then((data: any) => {
      loaded.shows = data.value;
    });
    this.userData$$.next(loaded);
  }

  async saveUserData(data: UserSettings) {
    await this.store.set("user", { value: data.user });
    await this.store.set("password", { value: data.password });
    await this.store.set("remote", { value: data.remote });
    await this.store.set("movies", { value: data.movies });
    await this.store.set("shows", { value: data.shows });
    await this.store.save();
    this.userData$$.next(data);
  }



  async registerProgressEvent() {
    await listen('progress', (event: any) => {
      console.log(event.payload.progress);
      this.uploadProgress$$.next(event.payload.progress);
    });
  }

  async upload(pathType: string) {
    this.uploadCompleted$$.next(false);
    this.userData$$.subscribe(userSettings => {
      if (userSettings.user == "" || userSettings.password == "" || userSettings.remote == "") {
        this.router.navigateByUrl("settings");
        return;
      }
      const remotePath = pathType === "Movies" ? userSettings.movies : userSettings.shows;

      this.router.navigateByUrl("progress");

      this.selectedFiles$$.subscribe(data => {
        data.forEach(element => {
          invoke<string>("copy_files", {
            localPath: element,
            user: userSettings.user,
            password: userSettings.password,
            remoteUrl: userSettings.remote,
            remotePath: remotePath,
          }).then((res) => {
            this.uploadCompleted$$.next(true);
          }).catch((err) => {
            console.error(err);
            this.router.navigateByUrl("/");
          });
        });
      });
    });
  }
}
