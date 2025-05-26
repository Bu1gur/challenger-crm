// Заглушка для utils
export const exampleUtil = () => {};

/**
 * Проверяет, считается ли клиент "оплаченным" по логике CRM
 * @param {object} client - объект клиента
 * @param {Array} periods - справочник периодов
 * @returns {boolean}
 */
export function isPaid(client, periods) {
  const period = periods.find(p => p.value === client?.subscriptionPeriod);
  if (!period) return false;
  if (client?.hasDiscount) {
    // Если скидка, обязательно должна быть причина и сумма > 0
    return (
      typeof client.paymentAmount !== 'undefined' &&
      Number(client.paymentAmount) > 0 &&
      client.discountReason && String(client.discountReason).trim().length > 0
    );
  }
  return Number(client?.paymentAmount) >= Number(period.price);
}
