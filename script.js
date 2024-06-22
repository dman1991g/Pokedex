async function fetchPokemon() {
    const pokemonNameOrId = document.getElementById('pokemon-input').value.toLowerCase();
    const resultDiv = document.getElementById('result');
    const movesDiv = document.getElementById('moves-content');
    resultDiv.innerHTML = '';
    movesDiv.innerHTML = '';

    try {
        // Fetch basic Pokémon information
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonNameOrId}`);
        if (!response.ok) {
            throw new Error('Pokémon not found');
        }
        const pokemon = await response.json();

        // Display basic information
        const pokemonInfo = `
            <h2>${pokemon.name}</h2>
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
            <p>Height: ${pokemon.height / 10} m</p>
            <p>Weight: ${pokemon.weight / 10} kg</p>
            <p>Type: ${pokemon.types.map(typeInfo => typeInfo.type.name).join(', ')}</p>
        `;
        resultDiv.innerHTML = pokemonInfo;

        // Display moves
        const movesList = pokemon.moves.map(moveInfo => moveInfo.move.name).join(', ');
        const movesInfo = `
            <h3>Moves</h3>
            <p>${movesList}</p>
        `;
        movesDiv.innerHTML = movesInfo;

    } catch (error) {
        resultDiv.innerHTML = `<p id="error">${error.message}</p>`;
    }
}
