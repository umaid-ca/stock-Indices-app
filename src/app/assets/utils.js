
export const timestampConverter = (timestamp) => {

    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    let formattedHours = hours % 12;
    formattedHours = formattedHours === 0 ? 12 : formattedHours;
    const period = hours < 12 ? 'am' : 'pm';
    const formattedTime = `${formattedHours}:${minutes < 10 ? '0' + minutes : minutes} ${period}`;
    return formattedTime

  }