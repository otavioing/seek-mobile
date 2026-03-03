import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://192.168.14.187:4500',
});