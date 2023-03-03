/**
 * Класс входной модели вакансии.
 */
export class VacancyInput {
    /**
     * Название вакансии.
     */
    VacancyName: string = "";

    /**
     * Описание вакансии.
     */
    VacancyText: string = "";

    /**
     * Опыт работы.
     */
    WorkExperience: any = "";

    /**
     * Занятость у вакансии.
     */
    Employment: any = "";

    /**
     * Оплата у вакансии.
     */
    Payment: string = "";

    /**
     * Id вакансии.
     */
    VacancyId: number = 0;

}
