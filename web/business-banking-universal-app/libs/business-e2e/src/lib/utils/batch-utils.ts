const todayDate = new Date();
export const todayDateString = `${todayDate.getMonth() + 1}/${todayDate.getDate()}/${todayDate
  .getFullYear()
  .toString()
  .substr(-2)}`;
