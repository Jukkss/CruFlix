const API_KEY = 'e545efcffe7242ab3c02c57d5baf9f86';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Gêneros mapeados para IDs
const genres = {
    "Ação": 10759,
    "Comédia": 35,
    "Drama": 18,
    "Ficção Científica": 10765,
};

//Carregamento da página
document.addEventListener('DOMContentLoaded', () => {
    const toastMessage = document.getElementById('toastMessage');
    
    // Defina a mensagem como "Séries gerais" ao carregar a página
    toastMessage.textContent = "Séries gerais";
    
    // Exibe o Toast automaticamente ao carregar a página
    const toast = new bootstrap.Toast(document.getElementById('genreToast'));
    toast.show();

    // Carrega as séries gerais
    fetchPopularSeries();
});

function showGenreToast(genreName) {
    const toastMessage = document.getElementById('toastMessage');
    toastMessage.textContent = `Agora mostrando séries de: ${genreName}`;

    // Exibir o Toast
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

// Função para exibir séries
function displaySeries(seriesList) {
    const container = document.getElementById('seriesContainer');
    container.innerHTML = "";

    if (!seriesList || seriesList.length === 0) {
        container.innerHTML = "<p class='text-center text-white'>Nenhuma série encontrada.</p>";
        return;
    }

    const cards = seriesList.map(serie => {
        const poster = serie.poster_path
            ? `${IMAGE_BASE_URL}${serie.poster_path}`
            : "imagens/placeholder.png"; // Substitua com um caminho válido para um placeholder
        return `
            <div class="col-md-4">
                <div class="card" style="border-radius: 20px; background-color: #10002e;">
                    <img src="${poster}" class="card-img-top" alt="${serie.name}" style="border-radius: 20px; max-height: 250px; object-fit: cover;">
                    <div class="card-body">
                        <h5 class="card-title text-center text-white">${serie.name}</h5>
                        <p class="card-text text-center text-white">${serie.overview ? serie.overview.substring(0, 100) + '...' : 'Descrição indisponível.'}</p>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = cards.join("");
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

// Event Listener para busca
document.getElementById('searchInput').addEventListener('input', (event) => {
    const query = event.target.value.trim();
    if (query.length > 2) {
        searchSeries(query);
    } else {
        fetchPopularSeries();
    }
});

//Série por genero
document.getElementById('filterGenre').addEventListener('change', (event) => {
    const genreId = genres[event.target.value];
    const toastMessage = document.getElementById('toastMessage');

    if (genreId) {
        fetchSeriesByGenre(genreId);
        toastMessage.textContent = `Gênero: ${event.target.value}`;
    } else {
        fetchPopularSeries();
        toastMessage.textContent = "Séries gerais";
    }

    // Exibe o Toast
    const toast = new bootstrap.Toast(document.getElementById('genreToast'));
    toast.show();
});