import {Component, DoCheck, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {forkJoin} from "rxjs";
import {ProjectManagmentService} from "../../services/project-managment.service";
import {FixationStrategyInput} from "../../task/models/input/fixation-strategy-input";
import {AccessService} from "../../../access/access.service";

@Component({
  selector: "project-management-header",
  templateUrl: "./project-management-header.component.html",
  styleUrls: ["./project-management-header.component.scss"]
})

/**
 * Класс модуля управления проектами (хидера).
 */
export class ProjectManagementHeaderComponent implements OnInit, DoCheck {
  constructor(private readonly _projectManagmentService: ProjectManagmentService,
              private readonly _router: Router,
              private readonly _activatedRoute: ActivatedRoute,
              private readonly _accessService: AccessService) {
  }

  public readonly headerItems$ = this._projectManagmentService.headerItems$;
  public readonly searchTasks$ = this._projectManagmentService.searchTasks$;
  public readonly checkAccess$ = this._accessService.checkAccess$;
  public readonly selectedWorkSpace$ = this._projectManagmentService.selectedWorkSpace$;


  projectId: number = 0;
  projectTaskId: number = 0;
  home: string = "project name";
  items: any[] = [
    {
      label: "Проект не выбран."
    }
  ];

  isDisableViewStrategy: boolean = false;
  searchText: string = "";
  isSearch: boolean = false;
  aProjectTasks: any[] = [];
  projectTaskName: any;
  searchById: boolean = false;
  searchByName: boolean = true;
  searchByDescription: boolean = false;
  aHeaderItems: any[] = [];
  aPanelItems: any[] = [];
  aDisabledHeaderPanelItems: any[] = [
    "Create",
    "Filters",
    "Export"
  ];
  isVisibleDropDownMenu: boolean = false;
  isVisibleAccessModal = false;
  isVisibleHeader: boolean = false;

  public async ngOnInit() {
    forkJoin([
      this.checkUrlParams(),
      await this.getHeaderItemsAsync()
    ]).subscribe();
  };

  ngDoCheck() {
    // Если роут не Kanban или Scrum, то дизейблим пункты меню стратегия представления и настройки.
    let projectId = this.projectId;
    const disableButtonSettings = this._router.url.indexOf(`projectId=${projectId}`) < 0;
    const disableButtonStrategy = this._router.url !== `/project-management/space?projectId=${projectId}`;

    this.disableButtonIfNeeded('Strategy', disableButtonStrategy);
    this.disableButtonIfNeeded('Settings', disableButtonSettings);

    this.aHeaderItems.forEach(x => {
      if (this.aDisabledHeaderPanelItems.includes((x.id))
        && this._router.url == "/project-management/workspaces") {
        x.disabled = true;
      }
    });

    // Скрываем хидер УП.
    this.isVisibleHeader = this._router.url.includes(`project-management`);

    // Удаляем из хлебных крошек выбранного проекта.
    if (!this.isVisibleHeader) {
      this.items = [];
    }
  };

  /**
   * Функция отключает кнопку хидера, если не выбран проект.
   */
  private disableButtonIfNeeded(buttonId: string, disabled: boolean) {
    const button = this.findButton(buttonId);
    if (button) {
      button.disabled = disabled;
    }
  }

  /**
   * Функция ищет необходимый элемент Хидера.
   * @returns - искомый элемент хидера.
   */
  private findButton = (id: string) => {
    return this.aHeaderItems.find(headerItem => headerItem.id === id);
  }

  private async checkUrlParams() {
    this._activatedRoute.queryParams
      .subscribe(async params => {
        console.log("params: ", params);

        this.projectId = params["projectId"];

        if (params["projectId"]) {
          this.projectId = Number(params["projectId"]);
          await this.getSelectedWorkSpaceAsync(this.projectId);
        }

        else {
          this.updateBreadcrumbLabel("Проект не выбран.");
        }
      });
  };

  /**
   * Функция получает выбранное раб.пространство.
   */
  private async getSelectedWorkSpaceAsync(projectId: number) {
    (await this._projectManagmentService.getSelectedWorkSpaceAsync(projectId))
      .subscribe(_ => {
        console.log("Выбранное раб.пространство: ", this._projectManagmentService.selectedWorkSpace$.value);

        this._projectManagmentService.companyId = this._projectManagmentService.selectedWorkSpace$.value.companyId;

        if (this.selectedWorkSpace$.value.projectManagementName) {
          this.updateBreadcrumbLabel(this.selectedWorkSpace$.value.projectManagementName);
        }
      });
  }

  /**
   * Функция меняет items для breadcrumb.
   */
  private async updateBreadcrumbLabel(projectName: string) {
    this.items = [
      {
        label: projectName
      }
    ];
  }

  /**
   * Функция получает список элементов меню хидера (верхнее меню).
   * @returns - Список элементов.
   */
  private async getHeaderItemsAsync() {
    (await this._projectManagmentService.getHeaderItemsAsync())
      .subscribe(_ => {
        console.log("Хидер УП: ", this.headerItems$.value);
        this.aHeaderItems = this.headerItems$.value.headerItems;
        this.aPanelItems = this.headerItems$.value.panelItems;
      });
  };

  /**
   * Функция обработки выбранного пункта меню модуля УП.
   * @param event - Событие.
   */
  public async onSelectMenu(event: any) {
    console.log("onSelectMenu", event.target.textContent);

    let selectedValue = event.target.textContent;
    let projectId = this.projectId;
    let isNotRoute = false;

    // Проверяем доступ к компонентам.
    switch (selectedValue) {
      case "Фильтры":
        (await this._accessService.checkAccessProjectManagementModuleOrComponentAsync(this.projectId, "ProjectManagement", "ProjectTaskFilter"))
          .subscribe(_ => {
            console.log("Проверка доступа: ", this.checkAccess$.value);

            if (this.checkAccess$.value.isAccess) {
              // Отображаем выпадающее меню фильтров.
              this.isVisibleDropDownMenu = true;
              this.isVisibleAccessModal = false;
            }

            // Отображаем модалку запрета (тариф владельца проекта не прошел проверку).
            else {
              this.isVisibleDropDownMenu = false;
              this.isVisibleAccessModal = true;
            }
          });
        break;

      default:
        this.isVisibleDropDownMenu = true;
        break;
    }

    this.aHeaderItems.forEach((firstLevel: any) => {
      // Если первый уровень выбран, то проверяем доступность тут.
      if (firstLevel.label == selectedValue) {
        // Не пускаем дальше если стоит блокировка пункта.
        if (firstLevel.disabled) {
          isNotRoute = true;
        }
      }

      // Если на первом уровне не нашли, смотрим еще ниже.
      if (firstLevel.label !== selectedValue) {
        firstLevel.items.forEach((secondLevel: any) => {
          // Не пускаем дальше если стоит блокировка пункта.
          if (secondLevel.disabled) {
            isNotRoute = true;
          }
        });
      }
    });

    // Не даем редиректить, если пункт блокирован.
    if (isNotRoute) {
      return;
    }

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
        this._router.navigate(["/project-management/space/view-settings"], {
          queryParams: {
            projectId
          }
        });
        break;

      case "Настройки проекта":
        this._router.navigate(["/project-management/space/project-settings"], {
          queryParams: {
            projectId
          }
        });
        break;

      case "Scrum (список)":
        let fixationScrumInput = new FixationStrategyInput();
        fixationScrumInput.projectId = projectId;
        fixationScrumInput.strategySysName = "Scrum";

        (await this._projectManagmentService.fixationSelectedViewStrategyAsync(fixationScrumInput))
          .subscribe(_ => {
            window.location.reload();
          });
        break;

      case "Kanban (доска)":
        let fixationKanbanInput = new FixationStrategyInput();
        fixationKanbanInput.projectId = projectId;
        fixationKanbanInput.strategySysName = "Kanban";

        (await this._projectManagmentService.fixationSelectedViewStrategyAsync(fixationKanbanInput))
          .subscribe(_ => {
            window.location.reload();
          });
        break;
    }
  };

  public async onSearchProjectTasksAsync(event: any) {
    (await this._projectManagmentService.searchTasksAsync(event.query, [this.projectId], false, true, true))
      .subscribe(_ => {
        console.log("Поиск: ", this.searchTasks$.value);
      });
  };

  public onSelectTask(event: any) {
    let projectId = this.projectId;
    let companyId: number = this._projectManagmentService.companyId;

    this._router.navigate(["/project-management/space/details"], {
      queryParams: {
        projectId,
        taskId: event.projectTaskId,
        companyId
      }
    });

    this.isSearch = false;
  };
}
