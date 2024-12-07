const API_KEY = 'e545efcffe7242ab3c02c57d5baf9f86';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const container = document.getElementById('cards-container');
const modal = new bootstrap.Modal(document.getElementById('seriesModal'));
const modalContent = document.getElementById('modalContent');
const modalFavBtn = document.getElementById('modalFavBtn');
const favorites = [];

//{Funcionalidades de Suporte}
// Chamando displays no carregamento
document.addEventListener('DOMContentLoaded', async () => {
    await Promise.all([
        fetchPopularSeries(),
        showFavoriteCards() 
    ]);
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

// Adicionar aos favoritos
async function addToFavorites(id) {
    try {
        // Verifica se a série já está nos favoritos do servidor
        const response = await fetch('http://localhost:3000/favorites');
        const favorites = await response.json();

        if (favorites.some(fav => fav.id === id)) {
            alert('A série já está nos favoritos.');
            return;
        }

        // Adiciona a nova série aos favoritos no servidor
        const favoriteData = { id };
        const addResponse = await fetch('http://localhost:3000/favorites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(favoriteData),
        });

        if (addResponse.ok) {
            alert('Série adicionada aos favoritos!');
        } else {
            alert('Erro ao adicionar aos favoritos.');
        }
    } catch (error) {
        console.error('Erro ao adicionar aos favoritos:', error);
        alert('Erro ao adicionar aos favoritos.');
    }
}
// Adicionar eventos aos botões
function addEventListeners() {
    document.querySelectorAll('.watch-btn').forEach((button) => {
        button.addEventListener('click', async () => {
            const serieId = button.getAttribute('data-id');
            await showSeriesDetails(serieId);
        });
    });

    document.querySelectorAll('.fav-btn').forEach((button) => {
        button.addEventListener('click', () => {
            const serieId = button.getAttribute('data-id');
            addToFavorites(serieId);
        });
    });
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
                <div class="card-body">
                    <h5 class="card-title text-center" style="color: aliceblue;">${serie.name}</h5>
                    <p class="card-text text-center" style="color: aliceblue;">${serie.overview || 'Sem descrição disponível.'}</p>
                </div>
                <div class="card-footer text-center" style="border-top: 1px solid #444; background-color: #10002e;">
                    <div class="card-buttons">
                        <button class="btn btn-secondary watch-btn" data-id="${serie.id}">Assistir</button>
                        <button class="btn btn-primary fav-btn" data-id="${serie.id}">Adicionar aos Favoritos</button>
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
                <div class="row" style="background-color:#10002e; border-top-left-radius: 20px; border-top-right-radius: 20px;">
                    <div class="col-12 justify-content-center position-relative">
                        <img src="${IMAGE_BASE_URL}${data.backdrop_path}" class="w-100 pt-2" style="max-height: 400px; object-fit: cover; border-radius: 20px;">
                        <div class="text-center position-relative" style="top: -100px; color: aliceblue; text-shadow: 2px 2px 10px rgba(0, 0, 0, 0.8);">
                            <h3>${data.name}</h3>
                            <button type="button" class="btn btn-lg" style="background-color: #10002e; color: aliceblue;" id="assistirBtn">
                                Assistir
                                <span class="tooltiptext">Função indisponível no momento</span>
                            </button>

                            <button class="btn btn-sm" style="background-color: white; width: 40px; height: 40px; border-radius: 50%;" id="modalFavBtn">
                                <img src="imagens/adicionar.png" style="max-width: 100%;">
                                <span class="tooltiptext">Deseja adicionar aos favoritos?</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="row" style="background-color: #10002e; border-bottom-left-radius: 20px; border-bottom-right-radius: 20px;"; border-top-right-radius: 20px;">
                    <div class="col-md-8">
                        <p class="list-group-item text-center pt-4" style="color: white; height: 100%;">${data.overview || 'Descrição indisponível.'}</p>
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
            <div class="row">
                <div class="col-12">
                    <h4 class="mt-4">Elenco Principal</h4>
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

        // Adicionar funcionalidade ao botão "Adicionar aos Favoritos"
        const favButton = document.getElementById('modalFavBtn');
        favButton.addEventListener('click', () => addToFavorites(id));

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
async function showFavoriteCards() {
    try {
        // Recuperando o container de favoritos
        const favoritesContainer = document.getElementById('favoritesContainer');
        favoritesContainer.innerHTML = ''; // Limpar o container antes de adicionar novos cards

        // Fazendo a requisição para pegar as séries favoritas salvas
        const response = await fetch('http://localhost:3000/favorites');
        const favorites = await response.json();

        // Caso não haja favoritos, exibe uma mensagem
        if (favorites.length === 0) {
            favoritesContainer.innerHTML = '<p>Você ainda não tem séries favoritas.</p>';
            return;
        }

        // Agora buscamos os detalhes de cada série favorita usando a API externa
        const seriesDetails = await Promise.all(favorites.map(async (fav) => {
            const seriesResponse = await fetch(`https://api.themoviedb.org/3/tv/${fav.id}?api_key=${API_KEY}&language=pt-BR`);
            return seriesResponse.json();
        }));

        // Exibe os detalhes das séries favoritas
        seriesDetails.forEach((favorite) => {
            const card = document.createElement('div');
            card.classList.add('col-md-3', 'p-2');
            card.innerHTML = `
                <div class="card" style="max-width: auto; border-radius: 20px; background-color: #10002e; height: 100%;">
                    <img src="${IMAGE_BASE_URL}${favorite.poster_path}" class="card-img-top" alt="${favorite.name}" style="border-radius: 20px; max-height: 250px; object-fit: cover;">
                    <div class="card-body">
                        <h5 class="card-title text-center" style="color: aliceblue;">${favorite.name}</h5>
                        <p class="card-text text-center" style="color: aliceblue;">${favorite.overview || 'Sem descrição disponível.'}</p>
                    </div>
                    <div class="card-footer text-center" style="border-top: 1px solid #444; background-color: #10002e;">
                        <div class="card-buttons">
                            <button class="btn btn-secondary watch-btn" data-id="${favorite.id}">Assistir</button>
                            <button class="btn btn-primary fav-btn" data-id="${favorite.id}">Remover dos Favoritos</button>
                        </div>
                    </div>
                </div>
            `;
            favoritesContainer.appendChild(card);

            // Adicionar eventos aos botões
            card.querySelector('.watch-btn').addEventListener('click', async () => {
                await showSeriesDetails(favorite.id);
            });

            card.querySelector('.fav-btn').addEventListener('click', () => {
                removeFromFavorites(favorite.id); // Função para remover dos favoritos
            });
        });
    } catch (error) {
        console.error('Erro ao carregar os favoritos:', error);
    }
}

// Função para remover uma série dos favoritos
async function removeFromFavorites(id) {
    try {
        // Enviar uma requisição para remover o favorito
        const response = await fetch(`http://localhost:3000/favorites/${id}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            alert('Série removida dos favoritos!');
            showFavoriteCards(); // Recarrega os favoritos após remoção
        } else {
            alert('Erro ao remover a série dos favoritos.');
        }
    } catch (error) {
        console.error('Erro ao remover a série dos favoritos:', error);
    }
}







