import axios from 'axios';
import { getApiBaseUrl } from './baseUrl';

const instance = axios.create({
  baseURL: getApiBaseUrl(),
});

export default instance;
