import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { forkJoin } from "rxjs";
import { ProjectManagmentService } from "../../../services/project-managment.service";
import { CreateProjectManagementTaskInput } from "../../models/input/create-task-input";
import { TranslateService } from '@ngx-translate/core';
import {MessageService, PrimeNGConfig} from "primeng/api";

@Component({
    selector: "",
    templateUrl: "./create-task.component.html",
    styleUrls: ["./create-task.component.scss"]
})

/**
 * Класс модуля управления проектами (создание задачи).
 */
export class CreateTaskComponent implements OnInit {
  constructor(private readonly _projectManagmentService: ProjectManagmentService,
              private readonly _router: Router,
              private readonly _activatedRoute: ActivatedRoute,
              private readonly _config: PrimeNGConfig,
              private readonly _translateService: TranslateService,
              private readonly _messageService: MessageService) {

  }

    projectId: number = 0;
    projectTaskId: number = 0;
    selectedPriority: any;
    selectedTaskType: any;
    selectedTag: any;
    selectedStatus: any;
    selectedExecutor: any;
    selectedWatcher: any;
    taskName: string = "";
    taskDetails: string = "";
    aSelectedTags: Set<any> = new Set<any>();
    aSelectedWachers: Set<any> = new Set<any>();
    aPeople: any[] = [];
    isCreateTask: boolean = false;
    isCreateEpic: boolean = false;
    isCreateHistory: boolean = false;
    aTaskTypes: any[] = [];
    dateStart: any = null;
    dateEnd: any = null;
    locale: any;
    selectedHistoryStatus: any;

    public readonly priorities$ = this._projectManagmentService.priorities$;
    public readonly taskTypes$ = this._projectManagmentService.taskTypes$;
    public readonly projectTags$ = this._projectManagmentService.projectTags$;
    public readonly taskStatuses$ = this._projectManagmentService.taskStatuses$;
    public readonly epicStatuses$ = this._projectManagmentService.epicStatuses$;
    public readonly taskPeople$ = this._projectManagmentService.taskExecutors$;
    public readonly createdTask$ = this._projectManagmentService.createdTask$;
    public readonly userStoryStatuses$ = this._projectManagmentService.userStoryStatuses$;

  public async ngOnInit() {
    forkJoin([
      this.checkUrlParams()
    ]).subscribe();

    this._translateService.setDefaultLang('ru');
    this.translate('ru');
    this.locale = this._translateService.getDefaultLang();
  };

  translate(lang: string) {
    this._translateService.use(lang);
    this._translateService.get('primeng').subscribe(res => this._config.setTranslation(res));
  }

    private async checkUrlParams() {
        this._activatedRoute.queryParams
            .subscribe(async params => {
                console.log("params: ", params);

                this.projectId = params["projectId"];
            });
    };

     /**
    * Функция получает приоритеты задачи для выбора.
    * @returns - Приоритеты задачи.
    */
    public async onGetTaskPrioritiesAsync() {
        (await this._projectManagmentService.getTaskPrioritiesAsync())
            .subscribe(_ => {
                console.log("Приоритеты задачи для выбора: ", this.priorities$.value);
            });
    };

      /**
    * Функция получает типы задач для выбора.
    * @returns - Типы задач.
    */
      public async onGetTaskTypesAsync() {
        if (this.aTaskTypes.length == 0) {
          (await this._projectManagmentService.getTaskTypesAsync())
            .subscribe(_ => {
              console.log("Типы задач для выбора: ", this.taskTypes$.value);
              this.aTaskTypes = this.taskTypes$.value;
            });
        }

        // Отображаем нужные поля, смотря что создаем.
        switch (this.selectedTaskType) {
          case "Task":
            this.isCreateTask = true;
            this.isCreateHistory = false;
            this.isCreateEpic = false;
            break;

          case "Error":
            this.isCreateTask = true;
            this.isCreateHistory = false;
            this.isCreateEpic = false;
            break;

          case "Story":
            this.isCreateTask = false;
            this.isCreateHistory = true;
            this.isCreateEpic = false;

            await this.getUserStoryStatusesAsync();
            break;

          case "Epic":
            this.isCreateTask = false;
            this.isCreateHistory = false;
            this.isCreateEpic = true;
            break;
        }
    };

      /**
    * Функция получает теги проекта для выбора.
    * @returns - Список тегов.
    */
       public async onGetProjectTagsAsync() {
        (await this._projectManagmentService.getProjectTagsAsync(this.projectId))
            .subscribe(_ => {
                console.log("Теги для выбора: ", this.projectTags$.value);
            });
    };

  /**
   * Функция получает статусы задач для выбора.
   * Статусы выводятся в рамках шаблона.
   * @returns - Список статусов.
   */
  public async onGetTaskStatusesAsync() {
    (await this._projectManagmentService.getTaskStatusesAsync(this.projectId))
      .subscribe(_ => {
        console.log("Статусы задачи для выбора: ", this.taskStatuses$.value);
      });
  };

  /**
   * Функция получает статусы эпиков для выбора.
   * @returns - Список статусов.
   */
  public async onGetEpicStatusesAsync() {
    (await this._projectManagmentService.getEpicStatusesAsync())
      .subscribe(_ => {
        console.log("Статусы эпика для выбора: ", this.epicStatuses$.value);
      });
  };

      /**
    * Функция получает исполнителей для выбора.
    * @returns - Список статусов.
    */
      public async onGetSelectTaskPeopleAsync() {
        (await this._projectManagmentService.getSelectTaskPeopleAsync(this.projectId))
            .subscribe(_ => {
                console.log("Исполнители и наблюдатели для выбора: ", this.taskPeople$.value);
                this.aPeople = this.taskPeople$.value;
            });
    };

    public onSelectTaskTag() {
        console.log("selectedTag", this.selectedTag);

        let isDublicate = Array.from(this.aSelectedTags).find(x => x.tagId == this.selectedTag.tagId);
        if (isDublicate == undefined) {
            this.aSelectedTags.add(this.selectedTag);
        }
    };

    /**
    * Функция получает список исполнителей для выбора для полей "Исполнитель" и "Наблюдатели".
    * @returns{string} - Список статусов.
    */
    public getEmptyMessageToTaskPeople(): string {
      if (!this.taskPeople$.value) {
        return 'Загрузка...';
      } else if (this.aPeople.length === 0) {
        return 'Нет других пользователей';
      } else {
        return '';
      }
    }

    // TODO: Эта логика дублируется.
    public onSelectWachers() {
        console.log("selectedWatcher", this.selectedWatcher);

        let checkDublicate = Array.from(this.aSelectedWachers).find(x => x.userId == this.selectedWatcher.userId);
        if (checkDublicate == undefined || checkDublicate == null) {
            this.aSelectedWachers.add(this.selectedWatcher);
        }
    };

  // TODO: Эта логика дублируется.
    public async onSetMeWatcher() {
         // Если еще не подгружали, то подгрузим, затем сделаем текущего пользователя наблюдателем.
         if (this.aPeople.length == 0) {
            new Promise(function (resolve, reject) {
                setTimeout(() => resolve(1), 500); // TODO: Должны ставить задержку, иначе не успевает подгрузиться.
            }).then(async () => {
                await this.onGetSelectTaskPeopleAsync()

                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        let findUser = this.aPeople.find(x => x.userCode == localStorage["u_c"]);

                        if (findUser !== undefined && findUser !== null) {
                            this.aSelectedWachers.add(findUser);
                        }
                    }, 500); // TODO: Должны ставить задержку, иначе не успевает подгрузиться.
                });

            });
        }

        else {
            let findUser = this.aPeople.find(x => x.userCode == localStorage["u_c"]);

            if (findUser !== undefined && findUser !== null) {
                this.aSelectedWachers.add(findUser);
            }
        }
    };

    // TODO: Эта логика дублируется.
    public async onSetMeExecutor() {
        // Если еще не подгружали, то подгрузим, затем сделаем текущего пользователя исполнителем.
        if (this.aPeople.length == 0) {
            new Promise(function (resolve, reject) {
                setTimeout(() => resolve(1), 500); // TODO: Должны ставить задержку, иначе не успевает подгрузиться.
            }).then(async () => {
                await this.onGetSelectTaskPeopleAsync()

                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        let findUser = this.aPeople.find(x => x.userCode == localStorage["u_c"]);

                        if (findUser !== undefined && findUser !== null) {
                            this.selectedExecutor = findUser;
                        }
                    }, 500); // TODO: Должны ставить задержку, иначе не успевает подгрузиться.
                });

            });
        }

        else {
            let findUser = this.aPeople.find(x => x.userCode == localStorage["u_c"]);

            if (findUser !== undefined && findUser !== null) {
                this.selectedExecutor = findUser;
            }
        }
    };

    /**
     * Функция создает задачу.
     */
    public async onCreateProjectTaskAsync() {
        let createTaskInput = this.createProjectManagementTaskRequest();

        (await this._projectManagmentService.createProjectTaskAsync(createTaskInput))
        .subscribe((response: any) => {
            console.log("Задача создана: ", this.createdTask$.value);

          if (response.errors !== null && response.errors.length > 0) {
            response.errors.forEach((item: any) => {
              this._messageService.add({ severity: "error", summary: "Что то не так", detail: item.errorMessage });
            });
          }

          else {
            setTimeout(() => {
              // Редиректим в раб.пространство.
              window.location.href = this.createdTask$.value.redirectUrl;
            }, 4000);
          }
        });
    };

    /**
     * Функция создает входную модель для запроса создания задачи.
     */
    private createProjectManagementTaskRequest(): CreateProjectManagementTaskInput {
      let createTaskInput = new CreateProjectManagementTaskInput();
      createTaskInput.isQuickCreate = false;
      createTaskInput.name = this.taskName;
      createTaskInput.details = this.taskDetails;
      createTaskInput.executorId = this.selectedExecutor?.userId ?? null;
      createTaskInput.projectId = this.projectId;
      createTaskInput.priorityId = this.selectedPriority;
      createTaskInput.dateStart = this.dateStart;
      createTaskInput.dateEnd = this.dateEnd;

      let aTags = Array.from(this.aSelectedTags).map(x => {
        return x.tagId;
      });

      let aWatchers = Array.from(this.aSelectedWachers).map(x => {
        return x.userId;
      });

      createTaskInput.tagIds = aTags;
      createTaskInput.taskStatusId = !this.isCreateHistory ? this.selectedStatus : this.selectedHistoryStatus;
      createTaskInput.watcherIds = aWatchers;

      // Находим Id типа задачи.
      createTaskInput.taskTypeId = this.aTaskTypes.filter(t => t.typeSysName == this.selectedTaskType)[0].typeId;

      return createTaskInput;
    };

    public onSelecteTaskType(selectedTaskType: any) {
      console.log("selectedTaskType", selectedTaskType);
    };

  /**
   * Функция получает статусы истории для выбора.
   */
    private async getUserStoryStatusesAsync() {
      (await this._projectManagmentService.getUserStoryStatusesAsync())
        .subscribe(_ => {
          console.log("Статусы истории для выбора: ", this.userStoryStatuses$.value);
        });
    };
}
