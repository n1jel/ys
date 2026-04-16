import moment from "moment";
import { Store } from "../redux/Store";
import { setisSubscribe } from "../redux/auth";
import { updateCredData } from "../redux/creds";

export const abbreviateNumber = (number) => {
    if (number < 1000) {
        return number.toString(); // Return the number as is if it's less than 1000
    } else if (number < 1000000) {
        return (number / 1000).toFixed(1) + 'K'; // Convert to thousands with one decimal place
    } else if (number < 1000000000) {
        return (number / 1000000).toFixed(1) + 'M'; // Convert to millions with one decimal place
    } else {
        return (number / 1000000000).toFixed(1) + 'B'; // Convert to billions with one decimal place
    }
}
export const convertLen = (length, unit, prevunit) => {
    if (prevunit) {
        if (prevunit == unit) {
            return length
        }
    }
    if (unit.toLowerCase() === 'in') {
        return Math.round(length / 2.54);  // converts to inch
    } else if (unit.toLowerCase() === 'cm') {
        return Math.round(length * 2.54);  // converts to cm
    } else {
        // other unit
        return 'Invalid unit. Please provide either "inch" or "cm".';
    }
}

export const checkSub = (date) => {
    console.log((moment().unix() * 1000) <= date);
    console.log(moment().unix(), date);
    if ((moment().unix() * 1000) <= date) {
        Store.dispatch(setisSubscribe("1"))
    } else {
        Store.dispatch(setisSubscribe("0"))
    }
}

export const saveCreds = (email, password, type, arr) => {
    let temp = [...arr]
    let alreadyExists = temp?.some(x => (x?.email == email && x?.type == type))
    if (!alreadyExists) {
        temp.push({ email, password, type })
        Store.dispatch(updateCredData(temp))
    }
}

export const handleInputChange = (text) => {
    if (text.startsWith(".")) {
        return text.slice(1); // Remove the dot from the beginning
    }

    const sanitizedText = text.replace(/[^0-9.]/g, '');

    if (sanitizedText.includes(".") && sanitizedText.split('.').length > 2) {
        return sanitizedText.slice(0, -1);
    }

    return sanitizedText;
};