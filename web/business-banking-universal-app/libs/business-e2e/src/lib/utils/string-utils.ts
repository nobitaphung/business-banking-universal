import { US_CURRENCY } from '../data/general.data';

export const amountToNumber = (value: string) => {
  //Immediate implementation that works for US formats where comma is thousand separator
  const sanitizedAmount = value.replace(US_CURRENCY, '');
  return parseFloat(sanitizedAmount.replace(',', ''));
};
