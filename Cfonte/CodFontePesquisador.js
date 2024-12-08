const API_KEY = 'e545efcffe7242ab3c02c57d5baf9f86';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Gêneros mapeados
const genres = {
    "Ação": 10759,
    "Comédia": 35,
    "Drama": 18,
    "Ficção Científica": 10765,
};

// Carregamento da página
document.addEventListener('DOMContentLoaded', () => {
    const toastMessage = document.getElementById('toastMessage');
    toastMessage.textContent = "Séries gerais";

    const toast = new bootstrap.Toast(document.getElementById('genreToast'));
    toast.show();

    // Carrega as séries gerais
    fetchPopularSeries();
});
async function addEventListeners() {
    // Adiciona evento de clique ao botão "Favoritar"
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
                showSeriesDetails(serieId);
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

// Função para exibir a Toast com o nome do gênero
function showGenreToast(genreName) {
    const toastMessage = document.getElementById('toastMessage');
    toastMessage.textContent = `Séries de: ${genreName}`;
    const toast = new bootstrap.Toast(document.getElementById('genreToast'));
    toast.show();
}

// Função para buscar séries populares
async function fetchPopularSeries() {
    try {
        const response = await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}&language=pt-BR&page=1`);
        const data = await response.json();
        displaySeries(data.results);
    } catch (error) {
        console.error('Erro ao buscar séries populares:', error);
    }
}

// Função para buscar séries por gênero
async function fetchSeriesByGenre(genreId) {
    try {
        const response = await fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&language=pt-BR&with_genres=${genreId}`);
        const data = await response.json();
        displaySeries(data.results);
    } catch (error) {
        console.error('Erro ao buscar séries por gênero:', error);
    }
}

// Função para exibir séries no layout
function displaySeries(seriesList) {
    const container = document.getElementById('seriesContainer');
    container.innerHTML = '';

    seriesList.forEach((serie) => {
        const card = document.createElement('div');
        card.classList.add('col-md-3', 'p-2');
        const poster = serie.poster_path
            ? `${IMAGE_BASE_URL}${serie.poster_path}`
            : 'imagens/placeholder.png';
        card.innerHTML = `
            <div class="card" style="max-width: auto; border-radius: 20px; background-color: #10002e; height: 100%;">
                <img src="${poster}" class="card-img-top" alt="${serie.name}" style="border-radius: 20px; max-height: 250px; object-fit: cover;">
                <div class="card-body">
                    <h5 class="card-title text-center" style="color: aliceblue;">${serie.name}</h5>
                    <p class="card-text text-center" style="color: aliceblue;">
                        ${serie.overview ? serie.overview.substring(0, 100) + '...' : 'Sem descrição disponível.'}
                    </p>
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

// Função de busca por texto
async function searchSeries(query) {
    try {
        const response = await fetch(`${BASE_URL}/search/tv?api_key=${API_KEY}&language=pt-BR&query=${query}`);
        const data = await response.json();
        displaySeries(data.results);
    } catch (error) {
        console.error('Erro ao buscar séries:', error);
    }
}
document.getElementById('searchInput').addEventListener('input', (event) => {
    const query = event.target.value.trim();
    if (query.length > 2) {
        searchSeries(query);
    } else {
        fetchPopularSeries();
    }
});

// Filtro de gênero
document.getElementById('filterGenre').addEventListener('change', (event) => {
    const genreId = genres[event.target.value];

    if (genreId) {
        fetchSeriesByGenre(genreId);
        showGenreToast(event.target.value); 
    } else {
        fetchPopularSeries();  
        showGenreToast("Séries gerais");
    }
});

//Exibição Modal
async function showSeriesDetails(id) {
    try {
        const response = await fetch(`${BASE_URL}/tv/${id}?api_key=${API_KEY}&language=pt-BR`);
        const data = await response.json();

        const castResponse = await fetch(`${BASE_URL}/tv/${id}/credits?api_key=${API_KEY}&language=pt-BR`);
        const castData = await castResponse.json();

        const modalContent = document.getElementById('modalContent'); 
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
        const modal = new bootstrap.Modal(document.getElementById('seriesModal'));
        modal.show();

    } catch (error) {
        console.error('Erro ao carregar os detalhes da série:', error);
    }
}

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
        const favoritesContainer = document.getElementById('favoritesContainer');
        favoritesContainer.innerHTML = '';

        if (favorites.length === 0) {
            favoritesContainer.innerHTML = '<p>Você ainda não tem séries favoritas.</p>';
            return;
        }

        const seriesDetails = await Promise.all(favorites.map(async (fav) => {
            const seriesResponse = await fetch(`${BASE_URL}/tv/${fav.id}?api_key=${API_KEY}&language=pt-BR`);
            return seriesResponse.json();
        }));
        displayFavoriteCards(seriesDetails, favoritesContainer);
    } catch (error) {
        console.error('Erro ao carregar os favoritos:', error);
    }
}