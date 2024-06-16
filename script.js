async function fetchPokemon() {
    const input = document.getElementById('pokemon-input').value.toLowerCase();
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = 'Loading...';

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${input}`);
        if (!response.ok) {
            throw new Error('Pokémon not found');
        }
        const data = await response.json();

        resultDiv.innerHTML = `
            <h2>${data.name}</h2>
            <img src="${data.sprites.front_default}" alt="${data.name}">
            <p>Height: ${data.height}</p>
            <p>Weight: ${data.weight}</p>
            <p>Type: ${data.types.map(type => type.type.name).join(', ')}</p>
        `;
    } catch (error) {
        resultDiv.innerHTML = `<p style="color:red;">${error.message}</p>`;
    }
}
