import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { forkJoin } from "rxjs";
import { ProjectManagmentService } from "../../services/project-managment.service";

@Component({
    selector: "project-management-header",
    templateUrl: "./project-management-header.component.html",
    styleUrls: ["./project-management-header.component.scss"]
})

/**
 * Класс модуля управления проектами (хидера).
 */
export class ProjectManagementHeaderComponent implements OnInit {
    constructor(private readonly _projectManagmentService: ProjectManagmentService,
        private readonly _router: Router,
        private readonly _activatedRoute: ActivatedRoute) {
    }

    public readonly headerItems$ = this._projectManagmentService.headerItems$;

    projectId: number = 0;
    projectTaskId: number = 0;
    aHeaderItems: any[] = [];
    home: string = "project name";
    items: any[] = [
        {
            label: "[Тут будет название проекта]"
        }
    ];

    public async ngOnInit() {
        forkJoin([
            this.checkUrlParams(),
            await this.getHeaderItemsAsync()
        ]).subscribe();
    };

    private async checkUrlParams() {
        this._activatedRoute.queryParams
            .subscribe(async params => {
                console.log("params: ", params);

                this.projectId = params["projectId"];
            });
    };

    /**
  * Функция получает список элементов меню хидера (верхнее меню).
  * @returns - Список элементов.
  */
    private async getHeaderItemsAsync() {
        (await this._projectManagmentService.getHeaderItemsAsync())
            .subscribe(_ => {
                console.log("Хидер УП: ", this.headerItems$.value);
                this.aHeaderItems = this.headerItems$.value;
            });
    };

    /**
     * Функция обработки выбранного пункта меню модуля УП.
     * @param event - Событие.
     */
    public onSelectMenu(event: any) {
        let selectedValue = event.target.textContent;
        let projectId = this.projectId;

        // Переход к созданию задачи.
        switch (selectedValue) {
            case "Настройки":
                break;

            case "Задачу":
                this._router.navigate(["/project-management/space/create"], {
                    queryParams: {
                        projectId
                    }
                });
                break;

            case "Настройки представлений":
                this._router.navigate(["/project-management/space/settings"], {
                    queryParams: {
                        projectId
                    }
                });
                break;
            default:
                console.error(`Неизвестный тип события: ${selectedValue}`);
        }
    };
}