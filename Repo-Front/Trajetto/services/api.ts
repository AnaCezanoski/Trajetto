import axios from 'axios';


const ip = '192.168.100.237'; // IP do seu PC

export const api = axios.create({
    // Usar o IP do seu PC aqui (o celular nao roda no localhost com o backend)
    baseURL: `http://${ip}:8081`,
})