import { create } from "apisauce";
import { getData } from "../utils/asyncstore";

export const fileUrl = "https://d1ibgiujerad7s.cloudfront.net/"
export const baseUrl = "https://api.yourseasonapp.com/api/v1/"
//  export const baseUrl = "http://192.168.0.111:5068/api/v1/"

export const api = create({
  baseURL: baseUrl,
  // timeout: 30000
});

// const naviMonitor = response => console.log('Api Response ==> ', response);
// api.addMonitor(naviMonitor);

api.addAsyncRequestTransform(request => async () => {
  const tokens = await getData("@tokens");
  // console.log(tokens, "Tokennnnnnn");
  request.headers['Authorization'] = `Bearer ${tokens}`;
});