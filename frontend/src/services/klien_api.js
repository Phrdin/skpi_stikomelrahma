import axios from 'axios';

const klienApi = axios.create({
  
  // PASTIKAN NAMA FOLDER 'skpi-stikom-elrahma' SESUAI DENGAN NAMA FOLDER ASLI AKANG DI LARAGON
  baseURL: 'https://skpi-stikomelrahma.my.id/backend',
  
  headers: {
    'Content-Type': 'application/json',
  },
});

export default klienApi;