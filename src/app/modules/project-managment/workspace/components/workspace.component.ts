import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { forkJoin } from "rxjs";
import { ProjectManagmentService } from "../../services/project-managment.service";

@Component({
  selector: "",
  templateUrl: "./workspace.component.html",
  styleUrls: ["./workspace.component.scss"]
})

/**
 * Класс компонента пространств проектов.
 */
export class WorkSpaceComponent implements OnInit {
  constructor(private readonly _projectManagmentService: ProjectManagmentService,
              private readonly _router: Router,
              private readonly _activatedRoute: ActivatedRoute) {
  }

  public readonly workspaces$ = this._projectManagmentService.workspaces$;

  aWorkspaces: any[] = [];

  public async ngOnInit() {
    forkJoin([
      await this.getWorkSpacesAsync()
    ]).subscribe();
  };

  /**
   * Функция получает все раб.пространства, в которых есть текущий пользователь.
   */
  private async getWorkSpacesAsync() {
    (await this._projectManagmentService.getWorkSpacesAsync())
      .subscribe(_ => {
        console.log("Список раб.пространств проектов: ", this.workspaces$.value);
        this.aWorkspaces = this.workspaces$.value;
      });
  };
}
