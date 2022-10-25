import { Component, OnDestroy, OnInit } from "@angular/core";
import { forkJoin, Subscription } from "rxjs";
import { BackOfficeService } from "../../services/backoffice.service";
import { SignalrService } from "src/app/modules/notifications/signalr/services/signalr.service";
import { ProfileInfoInput } from "../models/input/profile-info-input";

@Component({
    selector: "aboutme",
    templateUrl: "./aboutme.component.html",
    styleUrls: ["./aboutme.component.scss"]
})

/**
 * Класс страницы профиля пользователя (Обо мне).
 */
export class AboutmeComponent implements OnInit, OnDestroy {
    public readonly profileSkillsItems$ = this._backofficeService.profileSkillsItems$;
    public readonly profileIntentsItems$ = this._backofficeService.profileIntentsItems$;

    isShortFirstName: boolean = false;
    phoneNumber!: string;
    aSelectedSkills: any[] = [];
    allFeedSubscription: any;
    lastName!: string;
    firstName!: string;
    patronymic!: string;
    telegram!: string;
    whatsApp!: string;
    vkontakte!: string;
    otherLink!: string;
    aboutme!: string;
    job!: string;
    email!: string;
    experience!: string;

    constructor(private readonly _backofficeService: BackOfficeService,
        private readonly _signalrService: SignalrService) {

    }

    public async ngOnInit() {
        forkJoin([
            await this.getProfileSkillsAsync(),
            await this.getProfileIntentsAsync()
        ]).subscribe();

        // Подключаемся.
        this._signalrService.startConnection().then(() => {
            console.log("Подключились");

            // Регистрация всех.
            this._signalrService.listenToAllFeeds();

            // Подписываемся на получение всех сообщений.
            this.allFeedSubscription = this._signalrService.AllFeedObservable
                .subscribe((res: any) => {
                    console.log("Подписались на сообщения", res);
                });
        });
    };

    /**
    * Функция получает список навыков пользователя для выбора.
    * @returns - Список навыков.
    */
    private async getProfileSkillsAsync() {
        (await this._backofficeService.getProfileSkillsAsync())
            .subscribe(_ => {
                console.log("Список навыков для выбора: ", this.profileSkillsItems$.value);
            });
    };

    /**
     * Функция получает список целей на платформе для выбора пользователем.
     * @returns - Список целей.
     */
    private async getProfileIntentsAsync() {
        (await this._backofficeService.getProfileIntentsAsync())
            .subscribe(_ => {
                console.log("Список целей для выбора: ", this.profileIntentsItems$.value);
            });
    };

    /**
     * Функция сохраняет данные профиля пользователя.
     * @returns - Сохраненные данные.
     */
    public async onSaveProfileInfoAsync() {
        let model = this.createProfileInfoModel();
        console.log("ProfileInfoInput", model);
    };

    /**
     * Функция создает входную модель для сохранения данных профиля пользователя.
     * @returns - Данные модели для сохранения.
     */
    private createProfileInfoModel(): ProfileInfoInput {
        let profileInfoInput = new ProfileInfoInput();
        profileInfoInput.FirstName = this.firstName;
        profileInfoInput.LastName = this.lastName;
        profileInfoInput.Patronymic = this.patronymic;
        profileInfoInput.Aboutme = this.aboutme;
        profileInfoInput.Email = this.email;
        profileInfoInput.IsShortFirstName = this.isShortFirstName;
        profileInfoInput.Job = this.job;
        profileInfoInput.PhoneNumber = this.phoneNumber;
        profileInfoInput.Telegram = this.telegram;
        profileInfoInput.WhatsApp = this.whatsApp;
        profileInfoInput.Vkontakte = this.vkontakte;
        profileInfoInput.OtherLink = this.otherLink;

        return profileInfoInput;
    };

    ngOnDestroy(): void {
        (<Subscription>this.allFeedSubscription).unsubscribe();
    };
}