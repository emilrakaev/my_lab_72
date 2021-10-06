function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        let cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function csrfSafeMethod(method) {
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

async function makeRequest(url, method='GET', data=undefined) {
    let opts = {method, headers: {}};
    if (!csrfSafeMethod(method))
        opts.headers['X-CSRFToken'] = getCookie('csrftoken');

    if (data) {
        opts.headers['Content-Type'] = 'application/json';
        opts.body = JSON.stringify(data);
        console.log(opts.body);
    }
    let response = await fetch(url, opts);
    if (response.ok) {  // нормальный ответ
        return response.json();
    }
    else {            // ошибка
        let error = new Error(response.statusText);
        error.response = response;
        throw error;
    }
}

window.addEventListener('load', function() {
    const mainPage = document.getElementById('main');
    const addQuote = document.getElementById('addQuote');
    const submit = document.getElementById('submit');

    mainPage.onclick = MainPage;
    addQuote.onclick = ViewForm;
    submit.onclick = AddQuote;
});

async function AddQuote() {
    const allQuotes = document.getElementById('get');
    const form = document.getElementById('post');
    const message = document.getElementById('message');
    const Quote = document.getElementById('Quote');
    Quote.style.display = 'none';
    message.style.display = '';
    form.style.display = 'none';
    allQuotes.style.display = 'none';
    const text = document.getElementById('text').value;
    const author = document.getElementById('author').value;
    const email = document.getElementById('email').value;

    try {
        let response = await makeRequest('http://localhost:8000/api/quote/', 'POST',
            {"text": text, "author": author, "email": email} );
        console.log(response);
        message.innerHTML = '<h5 style="font-size:40px;">Цитата созданна успешно!</h5>';
        message.style.background = '';
    }
    catch (error) {
        error = await error.response;
        console.log(error)
        console.log(error.status)
        console.log(error.statusText)
        message.innerHTML =  `<h4 style="font-size:50px;"> ${error.status}<b> ${error.statusText}</b> </h4> `;
        message.style.background = 'grey';
        }
    }


async function ViewForm() {
    const allQuotes = document.getElementById('get');
    const form = document.getElementById('post');
    const message = document.getElementById('message');
    const Quote = document.getElementById('Quote');
    Quote.style.display = 'none';
    message.style.display = 'none';
    form.style.display = '';
    allQuotes.style.display = 'none'
        let response = await makeRequest('http://localhost:8000/api/quote/', 'GET');
        console.log(response)
    }

async function MainPage() {
    const allQuotes = document.getElementById('get');
    const form = document.getElementById('post');
    const message = document.getElementById('message');
    const Quote = document.getElementById('Quote');
    Quote.style.display = 'none';
    message.style.display = 'none';
    form.style.display = 'none';
    allQuotes.innerHTML = '';
    allQuotes.style.display = '';
    allQuotes.innerHTML =  `<h1>Лучшие цитаты нашего двора!</h1>`
        let response = await makeRequest('http://localhost:8000/api/quote/', 'GET');
        for (let i = 0; i < response.length; i++){
            let p = document.createElement('p');
            p.innerHTML = `<a onclick='onClick(event);' href="http://localhost:8000/api/quote/${response[i]['id']}">
<b>№ ${response[i]['id']}</b> :  ${response[i]['text'].slice(0,30)} | Статус: ${response[i]['status_display']}<br/></a>`;
            allQuotes.appendChild(p)
        }
    }

 async function onClick(event) {
    event.preventDefault();
    let a = event.target;
    let url = a.href;
    console.log(url);
    const allQuotes = document.getElementById('get');
    const form = document.getElementById('post');
    const message = document.getElementById('message');
    const Quote = document.getElementById('Quote');
    Quote.style.display = '';
    Quote.innerHTML = '';
    message.style.display = 'none';
    form.style.display = 'none';
    allQuotes.style.display = 'none';
        let response = await makeRequest(url, 'GET');
               console.log(response);
        let p = document.createElement('p');
        p.innerHTML = `Цитата:<br/><div class="box">${response['text']}<b></div>
<br/><i>Добавленно: ${response['created_at']}</i><p>Автор -<b> ${response['author']}<b></p>
 Статус: ${response['status_display']}.`;
        Quote.appendChild(p);
    }