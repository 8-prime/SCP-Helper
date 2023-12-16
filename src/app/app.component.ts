import { ChangeDetectorRef, Component, Inject, inject, OnInit } from "@angular/core";
import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog"
import { emit, listen } from '@tauri-apps/api/event'
import { SettingsManager, get, set } from "tauri-settings";
import { ToastrService } from "ngx-toastr";


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
  state = "initial";

  progress = 0

  user = '';
  password = '';
  remote_url = '';
  remote_path = '';

  selectedFiles: string[] = [];

  refCheck = inject(ChangeDetectorRef);
  toastService = inject(ToastrService);

  async ngOnInit() {
    await listen('progress', (event: any) => {
      console.log(event.payload.progress);
      
      this.progress = event.payload.progress;
      this.refCheck.detectChanges();
    });
  }

  async selectFiles() {
    try {
      this.selectedFiles = await open({
        multiple: true,
        directory: false,
        title: "Select File or Directory to transfer"
      }) as string[];
      this.state = "selected"
    } catch (error) {
      console.error(error);
    }
  }

  async upload() {
    for (let file of this.selectedFiles) {
      this.state = "loading";
      
      invoke<string>("copy_files", {  
        localPath: file, 
        user: this.user, 
        password: this.password, 
        remoteUrl: this.remote_url, 
        remotePath: this.remote_path,  
      }).then((res) => {
          this.state = "initial"
          this.toastService.success("File Transfer complete", undefined,  {
            positionClass: "toast-bottom-center",
            timeOut: 2000
          })
      }).catch((err) => {
        console.error(err);
        this.state = "initial"
      });
    }
  }
}
