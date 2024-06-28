// arquivo de padronização da configuração do AXIOS

// pegando o token
const getToken = () => {
    return localStorage.getItem('token')
}

const url_base = "https://web-5gnex1an3lly.up-us-nyc1-k8s-1.apps.run-on-seenode.com/";

// função de configuração de requisições do AXIOS

const createAxiosConfig = (method, endpoint, data = null) => {

    const config = {
        method: method,
        url: `${url_base}${endpoint}`,
        headers: {
            'Content-Type' : 'application/json'
        }
    }

    if (method.toLowerCase() === 'get') {
        config.headers['Authorization'] = `Bearer ${getToken()}`;
    }

    if (data) {
        config.data = JSON.stringify(data)
    }

    return config;
}

export default createAxiosConfig;

