export {}

interface MovieResult {
  poster_path?: string
  adult?: boolean
  overview?: string
  release_date?: string
  genre_ids?: Array<number>
  id?: number
  media_type: 'movie'
  original_title?: string
  original_language?: string
  title?: string
  backdrop_path?: string
  popularity?: number
  vote_count?: number
  video?: boolean
  vote_average?: number
}
interface IHttpClientRequestParameters<T> {
  url: string
  method: string
  body: T
}

interface IHttpClient {
  get<T>({url, method, body}: IHttpClientRequestParameters<any>): Promise<T>
  post<T>(parameters: IHttpClientRequestParameters<any>): Promise<T>
}


var apiKey : string = '3f301be7381a03ad8d352314dcc3ec1d';
let apiKey;
let requestToken;
let username;
let password;
let sessionId;
let listId = '7101979';

let loginButton = document.getElementById('login-button')! as HTMLButtonElement;
let searchButton = document.getElementById('search-button')! as HTMLButtonElement;
let searchContainer = document.getElementById('search-container');


loginButton.addEventListener('click', async () => {
  await criarRequestToken();
  await logar();
  await criarSessao();
})



searchButton.addEventListener('click', async () => {
  let lista = document.getElementById("lista");
  if (lista) {
    lista.outerHTML = "";
  }
  let query = (document.getElementById('search') as HTMLInputElement).value;
  let listaDeFilmes: MovieResult  = await procurarFilme(query);
  let ul = document.createElement('ul');
  ul.id = "lista"
  for (const item of listaDeFilmes.results) {
    let li = document.createElement('li');
    li.appendChild(document.createTextNode(item.original_title))
    ul.appendChild(li)
  }
  console.log(listaDeFilmes);
  searchContainer.appendChild(ul);
})

function preencherSenha() {
  password = (document.getElementById('senha') as HTMLInputElement).value;
  validateLoginButton();
}

function preencherLogin() {
  username =  (document.getElementById('login') as HTMLInputElement).value;
  validateLoginButton();
}

function preencherApi() {
  apiKey = (document.getElementById('api-key') as HTMLInputElement).value;
  validateLoginButton();
}

function validateLoginButton() {
  if (password && username && apiKey) {
    loginButton.disabled = false;
  } else {
    loginButton.disabled = true;
  }
}

class HttpClient {
  static async get<T>({url, method, body = null}): Promise<any> {
    return new Promise((resolve, reject) => {
      let request = new XMLHttpRequest();
      request.open(method, url, true);

      request.onload = () => {
        if (request.status >= 200 && request.status < 300) {
          resolve(JSON.parse(request.responseText));
        } else {
          reject({
            status: request.status,
            statusText: request.statusText
          })
        }
      }
      request.onerror = () => {
        reject({
          status: request.status,
          statusText: request.statusText
        })
      }

      if (body) {
        request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        body = JSON.stringify(body);
      }
      request.send(body);
    })
  }
}

async function procurarFilme(query: string) : Promise<MovieResult> {
  query = encodeURI(query)
  console.log(query)
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`,
    method: "GET"
  })
  return result
}

async function adicionarFilme(filmeId: number) {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/movie/${filmeId}?api_key=${apiKey}&language=en-US`,
    method: "GET"
  })
  console.log(result);
}

async function criarRequestToken () {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/token/new?api_key=${apiKey}`,
    method: "GET"
  })
  requestToken = result.request_token
}

async function logar() {
  await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/token/validate_with_login?api_key=${apiKey}`,
    method: "POST",
    body: {
      username: `${username}`,
      password: `${password}`,
      request_token: `${requestToken}`
    }
  })
}

async function criarSessao() {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/session/new?api_key=${apiKey}&request_token=${requestToken}`,
    method: "GET"
  })
  sessionId = result.session_id;
}

async function criarLista(nomeDaLista, descricao) {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/list?api_key=${apiKey}&session_id=${sessionId}`,
    method: "POST",
    body: {
      name: nomeDaLista,
      description: descricao,
      language: "pt-br"
    }
  })
  console.log(result);
}

async function adicionarFilmeNaLista(filmeId, listaId) {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/list/${listaId}/add_item?api_key=${apiKey}&session_id=${sessionId}`,
    method: "POST",
    body: {
      media_id: filmeId
    }
  })
  console.log(result);
}

async function pegarLista() {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/list/${listId}?api_key=${apiKey}`,
    method: "GET"
  })
  console.log(result);
}

{/* <div style="display: flex;">
  <div style="display: flex; width: 300px; height: 100px; justify-content: space-between; flex-direction: column;">
      <input id="login" placeholder="Login" onchange="preencherLogin(event)">
      <input id="senha" placeholder="Senha" type="password" onchange="preencherSenha(event)">
      <input id="api-key" placeholder="Api Key" onchange="preencherApi()">
      <button id="login-button" disabled>Login</button>
  </div>
  <div id="search-container" style="margin-left: 20px">
      <input id="search" placeholder="Escreva...">
      <button id="search-button">Pesquisar Filme</button>
  </div>
</div>*/}