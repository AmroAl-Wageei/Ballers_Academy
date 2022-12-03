import axios from 'axios'

const baseURL = window.wpAmeliaUrls.wpAmeliaPluginAjaxURL

const params = {
  ameliaNonce: window.wpAmeliaNonce
}

const httpClient = axios.create({
  baseURL,
  params
})

export default httpClient
