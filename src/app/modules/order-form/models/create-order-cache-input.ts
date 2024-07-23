/**
 * Класс входной модели создания заказа в кэше.
 */
export class CreateOrderCacheInput {
  /**
   * Публичный ключ тарифа.
   */
  publicId: string = "";

  /**
   * Кол-во месяцев, на которые оформляется подписка на тариф.
   */
  paymentMonth: number = 0;

  /**
   * Кол-во сотрудников.
   */
  employeesCount: number = 0;

  /**
   * Признак совершенного действия пользователя.
   * Если требуются действия от пользователя.
   */
  isCompleteUserAction: boolean = false;
}
