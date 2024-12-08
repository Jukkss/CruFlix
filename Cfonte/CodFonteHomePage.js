const API_KEY = 'e545efcffe7242ab3c02c57d5baf9f86';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const container = document.getElementById('cards-container');
const modal = new bootstrap.Modal(document.getElementById('seriesModal'));
const modalContent = document.getElementById('modalContent');
const favorites = [];

//{Funcionalidades de Suporte}
// Chamando displays no carregamento
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Chamar checkServerStatus antes de carregar os dados
        await checkServerStatus();

        // Carregar todas as séries populares de uma vez
        const response = await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}&language=pt-BR&page=1`);
        const data = await response.json();

        // Exibir séries no carrossel (com limite diferente)
        const uniqueCarouselSeries = data.results.slice(4, 9);
        displayCarousel(uniqueCarouselSeries);

        // Exibir séries nos cards (primeiras 4)
        displayCards(data.results.slice(0, 4));

        // Exibir os favoritos
        showFavoriteCards();

        // Carregar as informações do aluno dinamicamente
        loadAlunoInfo();
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showToast('Erro ao carregar dados. Por favor, tente novamente.', 'danger');
    }
});

// Buscar séries populares
async function fetchPopularSeries() {
    try {
        const response = await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}&language=pt-BR&page=1`);
        const data = await response.json();
        displayCards(data.results.slice(0, 4));
    } catch (error) {
        console.error('Erro ao buscar dados da API:', error);
    }
}

async function addEventListeners() {
    document.querySelectorAll('.favorite-btn').forEach(async (button) => {
        if (!button.hasAttribute('data-listener')) {
            button.setAttribute('data-listener', 'true');
            
            const serieId = button.getAttribute('data-id');
            const icon = button.querySelector('.favorite-icon');
            const tooltip = button.querySelector('.tooltiptext');
            
            const isFavorite = await checkIfFavorite(serieId);
            updateFavoriteUI(icon, tooltip, isFavorite);

            button.addEventListener('click', async () => {
                const updatedIsFavorite = await handleFavorite(serieId);
                updateFavoriteUI(icon, tooltip, updatedIsFavorite);
            });
        }
    });

    // Adiciona evento de clique ao botão "Assistir"
    document.querySelectorAll('.watch-btn').forEach((button) => {
        if (!button.hasAttribute('data-listener')) {
            button.setAttribute('data-listener', 'true');
            
            const serieId = button.getAttribute('data-id');
            
            button.addEventListener('click', () => {
                showSeriesDetails(serieId); // Chama a função de detalhes
            });
        }
    });
}
async function checkIfFavorite(serieId) {
    const response = await fetch('http://localhost:3000/favorites');
    const favorites = await response.json();
    return favorites.some(fav => fav.id === serieId);
}
async function handleFavorite(serieId) {
    const isFavorite = await checkIfFavorite(serieId);

    if (isFavorite) {
        await removeFromFavorites(serieId);
    } else {
        await addToFavorites(serieId);
    }

    return !isFavorite;
}
function updateFavoriteUI(icon, tooltip, isFavorite) {
    if (isFavorite) {
        icon.src = 'imagens/delete.png';
        tooltip.textContent = 'Deseja remover dos favoritos?';
    } else {
        icon.src = 'imagens/adicionar.png';
        tooltip.textContent = 'Deseja adicionar aos favoritos?';
    }
}
// Função para mostrar o toast
function showToast(message, type = 'primary') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    // Define a mensagem e o tipo de alerta (ex: primary, success, danger)
    toastMessage.textContent = message;
    toast.querySelector('.toast').className = `toast align-items-center text-bg-${type} border-0`;

    // Exibe o toast
    toast.style.display = 'block';
    const bootstrapToast = new bootstrap.Toast(toast.querySelector('.toast'));
    bootstrapToast.show();

    // Esconde o toast após um tempo
    setTimeout(() => {
        bootstrapToast.hide();
    }, 8000);
}
async function checkServerStatus() {
    const toastMessage = document.getElementById('toast-message');

    // Exibe a mensagem "Verificando problemas..." no toast
    showToast('Verificando JsonServer...', 'warning');  // Tipo de alerta pode ser 'warning'

    try {
        const response = await fetch('http://localhost:3000/favorites');
        if (!response.ok) throw new Error('Erro no servidor');
        
        // Se o servidor estiver ativo
        showToast('JSON Server está ativo!', 'success');
    } catch (error) {
        // Se o servidor não estiver ativo
        showToast('Erro: JSON Server não está ativo! Ative-o no seu terminal.', 'danger');
    }
}

//{Funcionalidades de exibição}
// Display dos cards
function displayCards(series) {
    container.innerHTML = '';

    series.forEach((serie) => {
        const card = document.createElement('div');
        card.classList.add('col-md-3', 'p-2');
        card.innerHTML = `
            <div class="card" style="max-width: auto; border-radius: 20px; background-color: #10002e; height: 100%;">
                <img src="${IMAGE_BASE_URL}${serie.poster_path}" class="card-img-top" alt="${serie.name}" style="border-radius: 20px; max-height: 250px; object-fit: cover;">
                <div class="card-body" style="max-height: 150px;">
                    <h5 class="card-title text-center" style="color: aliceblue;">${serie.name}</h5>
                    <p class="card-text text-center" style="color: aliceblue;">${serie.overview || 'Sem descrição disponível.'}</p>
                </div>
                <div class="card-footer text-center" style="border-top: 1px solid #444; background-color: #10002e;">
                    <div class="card-buttons">
                        <button class="btn btn-secondary watch-btn" data-id="${serie.id}">
                            Assistir
                        </button>
                        <button class="btn btn-sm favorite-btn" data-id="${serie.id}" style="background-color: white; width: 40px; height: 40px; border-radius: 50%; padding: 0; display: flex; justify-content: center; align-items: center;">
                            <img src="imagens/adicionar.png" class="favorite-icon" style="max-width: 24px; max-height: 24px; object-fit: contain;"/>
                            <span class="tooltiptext">Deseja adicionar aos favoritos?</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    addEventListeners();
}

// Display detalhes (Modal)
async function showSeriesDetails(id) {
    try {
        const response = await fetch(`${BASE_URL}/tv/${id}?api_key=${API_KEY}&language=pt-BR`);
        const data = await response.json();

        const castResponse = await fetch(`${BASE_URL}/tv/${id}/credits?api_key=${API_KEY}&language=pt-BR`);
        const castData = await castResponse.json();

        modalContent.innerHTML = `
            <div class="container">
                <!-- Primeira Row - Imagem e Título -->
                <div class="row justify-content-center" style="background-color:#10002e; border-top-left-radius: 20px; border-top-right-radius: 20px;">
                    <div class="col-12 text-center position-relative">
                        <img src="${IMAGE_BASE_URL}${data.backdrop_path}" class="w-100 pt-2" style="max-height: 400px; object-fit: cover; border-radius: 20px;">
                        
                        <div class="position-relative" style="top: -100px; color: aliceblue; text-shadow: 2px 2px 10px rgba(0, 0, 0, 0.8);">
                            <h3>${data.name}</h3>
                            
                            <button type="button" class="btn btn-lg" style="background-color: #10002e; color: aliceblue;" id="assistirBtn">
                                Assistir
                                <span class="tooltiptext">Função indisponível no momento</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Segunda Row - Descrição, Gêneros e Outras Informações -->
                <div class="row justify-content-center" style="background-color: #10002e; border-bottom-left-radius: 20px; border-bottom-right-radius: 20px;">
                    <div class="col-md-8 text-center">
                        <p class="list-group-item pt-4" style="color: white; height: 100%;">${data.overview || 'Descrição indisponível.'}</p>
                    </div>
                    <div class="col-md-4">
                        <ul class="list-group list-group-flush p-2" style="border-radius: 20px;">
                            <li class="list-group-item text-center"><strong>${data.genres.map((g) => g.name).join(' • ') || 'Sem gênero disponível'}</strong></li>
                            <li class="list-group-item text-center"><strong>${data.number_of_seasons} Temporadas</strong></li>
                            <li class="list-group-item text-center"><strong>${data.first_air_date.split('-')[0]}</strong></li>
                            <li class="list-group-item text-center">
                                <img src="imagens/NR16-AUTO.jpg" style="width: 10%; height: 10%; border-radius: 10px;">
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- Terceira Row - Elenco Principal -->
                <div class="row justify-content-center">
                    <div class="col-12">
                        <h4 class="mt-4 text-center">Elenco Principal</h4>
                        <div id="castCarousel" class="carousel slide" data-bs-ride="carousel">
                            <div class="carousel-inner">
                                ${castData.cast && castData.cast.length > 0 
                                    ? castData.cast
                                        .reduce((acc, actor, index) => {
                                            // Verifica se estamos começando um novo slide
                                            if (index % 5 === 0) acc.push([]);
                                            acc[acc.length - 1].push(actor);
                                            return acc;
                                        }, [])
                                        .map((slide, i) => `
                                            <div class="carousel-item ${i === 0 ? 'active' : ''}">
                                                <div class="d-flex justify-content-center">
                                                    ${slide
                                                        .map(actor => `
                                                            <div class="m-2 text-center">
                                                                <img src="${actor.profile_path ? IMAGE_BASE_URL + actor.profile_path : 'https://via.placeholder.com/150'}" 
                                                                    class="rounded" style="width: 80px; height: 80px; object-fit: cover;">
                                                                <p class="mt-1" style="font-size: 14px; color: #10002e;">${actor.name}</p>
                                                            </div>
                                                        `)
                                                        .join('')}
                                                </div>
                                            </div>
                                        `)
                                        .join('')
                                    : `<div class="carousel-item active text-center">
                                        <p style="font-size: 18px; color: #10002e;">Atores não encontrados</p>
                                    </div>`
                                }
                            </div>
                            <button class="carousel-control-prev btn-dark" type="button" data-bs-target="#castCarousel" data-bs-slide="prev">
                                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                                <span class="visually-hidden">Previous</span>
                            </button>
                            <button class="carousel-control-next btn-dark" type="button" data-bs-target="#castCarousel" data-bs-slide="next">
                                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                                <span class="visually-hidden">Next</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Adicionar funcionalidade ao botão "Adicionar aos Favoritos" no modal
        // O botão de favoritos agora está no card, não no modal.

        modal.show();
    } catch (error) {
        console.error('Erro ao carregar os detalhes da série:', error);
    }
}

// Display Carrosel
function displayCarousel(series) {
    const carouselContainer = document.getElementById('carouselContainer'); // Contêiner do carrossel
    carouselContainer.innerHTML = `
        <div id="carrosselSeries" class="carousel slide" data-bs-ride="carousel">
            <div class="carousel-inner">
                ${series.map((serie, index) => `
                    <div class="carousel-item ${index === 0 ? 'active' : ''}">
                        <img src="${IMAGE_BASE_URL}${serie.backdrop_path}" class="d-block w-100 h-50" alt="${serie.name}" style="height: 500px; object-fit: cover; border-radius: 50px;">
                        <div class="carousel-caption d-none d-md-block">
                            <h5>${serie.name.replace(/\s/g, '')}</h5>
                            <p style="text-shadow: 4px 4px 10px rgba(0, 0, 0, 0.8); color: aliceblue;">${serie.overview || 'Descrição indisponível.'}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
            <a class="carousel-control-prev" href="#carrosselSeries" role="button" data-bs-slide="prev" style="text-decoration: none;">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="sr-only">Anterior</span>
            </a>
            <a class="carousel-control-next" href="#carrosselSeries" role="button" data-bs-slide="next" style="text-decoration: none;">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="sr-only">Próxima</span>
            </a>
        </div>
    `;
}
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}&language=pt-BR&page=1`);
        const data = await response.json();
        const uniqueCarouselSeries = data.results.slice(4, 9); // Selecionando séries diferentes das exibidas nos cards
        displayCarousel(uniqueCarouselSeries);
    } catch (error) {
        console.error('Erro ao carregar séries para o carrossel:', error);
    }
});

//Display favoritas
async function addToFavorites(serieId) {
    try {
        await fetch('http://localhost:3000/favorites', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: serieId }),
        });
        alert('Série adicionada aos favoritos!');
    } catch (error) {
        alert('Erro ao adicionar aos favoritos!');
    }
}

async function removeFromFavorites(serieId) {
    try {
        await fetch(`http://localhost:3000/favorites/${serieId}`, {
            method: 'DELETE',
        });
        alert('Série removida dos favoritos!');
    } catch (error) {
        alert('Erro ao remover dos favoritos!');
    }
}

async function showFavoriteCards() {
    try {
        const response = await fetch('http://localhost:3000/favorites');
        const favorites = await response.json();

        // Limpar os favoritos antes de exibir
        const favoritesContainer = document.getElementById('favoritesContainer');
        favoritesContainer.innerHTML = '';

        if (favorites.length === 0) {
            favoritesContainer.innerHTML = '<p>Você ainda não tem séries favoritas.</p>';
            return;
        }

        // Pega os detalhes das séries favoritas
        const seriesDetails = await Promise.all(favorites.map(async (fav) => {
            const seriesResponse = await fetch(`${BASE_URL}/tv/${fav.id}?api_key=${API_KEY}&language=pt-BR`);
            return seriesResponse.json();
        }));

        // Exibe os favoritos sem duplicação
        displayFavoriteCards(seriesDetails, favoritesContainer);

    } catch (error) {
        console.error('Erro ao carregar os favoritos:', error);
    }
}

async function displayFavoriteCards(series, favoritesContainer) {
    favoritesContainer.innerHTML = ''; // Limpa o conteúdo atual

    series.forEach((serie) => {
        const card = document.createElement('div');
        card.classList.add('col-md-3', 'p-2');

        const isFavorite = true; // Série é sempre favorita quando chega aqui

        // Ajusta o botão e a lógica de adicionar/remover
        const buttonHTML = isFavorite
            ? `<button class="btn btn-danger remove-btn" data-id="${serie.id}">Remover dos Favoritos</button>`
            : `<button class="btn btn-primary fav-btn" data-id="${serie.id}">Adicionar aos Favoritos</button>`;

        card.innerHTML = `
            <div class="card" style="max-width: auto; border-radius: 20px; background-color: #10002e; height: 100%;">
                <img src="${IMAGE_BASE_URL}${serie.poster_path}" class="card-img-top" alt="${serie.name}" style="border-radius: 20px; max-height: 250px; object-fit: cover;">
                <div class="card-body" style="max-height: 150px;">
                    <h5 class="card-title text-center" style="color: aliceblue;">${serie.name}</h5>
                    <p class="card-text text-center" style="color: aliceblue;">${serie.overview || 'Sem descrição disponível.'}</p>
                </div>
                <div class="card-footer text-center" style="border-top: 1px solid #444; background-color: #10002e;">
                    <div class="card-buttons">
                        <button class="btn btn-secondary watch-btn" data-id="${serie.id}">Assistir</button>
                        <button class="btn btn-sm favorite-btn" data-id="${serie.id}" style="background-color: white; width: 40px; height: 40px; border-radius: 50%; padding: 0; display: flex; justify-content: center; align-items: center;">
                            <img src="imagens/adicionar.png" class="favorite-icon" style="max-width: 24px; max-height: 24px; object-fit: contain;"/>
                            <span class="tooltiptext">Deseja adicionar aos favoritos?</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        favoritesContainer.appendChild(card);
    });

    addEventListeners(); // Adiciona os listeners de evento aos botões
}

// Informações Aluno
async function loadAlunoInfo() {
    try {
        // Fetch para buscar os dados do aluno a partir do endpoint JSON
        const response = await fetch('http://localhost:3000/aluno'); // Caminho correto para o JSON
        if (!response.ok) throw new Error('Não foi possível carregar o arquivo JSON');

        // O JSON contém um array, então precisamos acessar o primeiro item
        const alunoInfoArray = await response.json();
        const alunoInfo = alunoInfoArray[0]; // Acessando o primeiro objeto do array

        // Verificar se as propriedades existem no JSON
        if (!alunoInfo || !alunoInfo.redes_sociais) {
            throw new Error('Dados do aluno não encontrados no arquivo JSON');
        }

        // Preencher os dados na página
        document.querySelector('.container .col-md-5 p.text-center').textContent = alunoInfo.comentários;

        // Atualizar links das redes sociais
        const redesSociais = alunoInfo.redes_sociais;
        document.getElementById('instagram').href = redesSociais.instagram;
        document.getElementById('linkedin').href = redesSociais.linkedin;
        document.getElementById('letterboxd').href = redesSociais.letterboxd;

        // Informações do aluno no lado direito
        const listaAluno = document.querySelector('.container .col-md-6 .list-group');
        listaAluno.innerHTML = `
            <li class="list-group-item"><strong>Aluno:</strong> ${alunoInfo.nome}</li>
            <li class="list-group-item"><strong>Curso:</strong> ${alunoInfo.curso}</li>
            <li class="list-group-item"><strong>Turma:</strong> ${alunoInfo.turma}</li>
        `;
    } catch (error) {
        console.error('Erro ao carregar as informações do aluno:', error);
        showToast('Erro ao carregar as informações do aluno.', 'danger');
    }
}