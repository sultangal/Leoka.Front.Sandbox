import { Component, OnInit } from "@angular/core";
import { BackOfficeService } from "../../services/backoffice.service";

@Component({
    selector: "left-menu",
    templateUrl: "./left-menu.component.html",
    styleUrls: ["./left-menu.component.scss"]
})

/**
 * Класс календаря пользователя.
 */
export class LeftMenuComponent implements OnInit {
    public readonly profileItems$ = this._backOfficeService.profileItems$;
    public readonly selectMenu$ = this._backOfficeService.selectMenu$;

    sysName: string = "";
    isFindSysName: boolean = false;
    aProfileMenuLine: any[] = [];

    constructor(private readonly _backOfficeService: BackOfficeService) {
    }

    public async ngOnInit() {
        await this.getProfileInfoAsync();        
    }

    /**
     * Функция получает пункты меню профиля пользователя.
     * @returns Список меню.
     */
    private async getProfileInfoAsync() {
        (await this._backOfficeService.getProfileItemsAsync())
        .subscribe(_ => {
            console.log("Меню профиля: ", this.profileItems$.value);
        });
    };

     /**
     * Функция находит элемент списка, который выделили в меню. 
     * Если на первом уровне его нет, то опускаемся ниже и снова ищем и тд.
     * @param event - Событие.
     */
    public async onSelectMenu(event: any) {
        console.log("event", event);
        let text = event.target.textContent;

        (await this._backOfficeService.selectProfileMenuAsync(text))
        .subscribe(_ => {
            console.log("Выбрали меню: ", this.selectMenu$.value);
        });
    };
}