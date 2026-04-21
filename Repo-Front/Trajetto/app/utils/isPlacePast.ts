  export const isPlacePast = (date: string, time: string) => {
    const now = new Date();

    const [year, month, day] = date.split('-');
    const [hour, minute] = time.split(':');

    const placeDateTime = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute)
    );

    return now.getTime() > placeDateTime.getTime();
  };

  export default isPlacePast;