async function fetchPokemon() {
    const pokemonNameOrId = document.getElementById('pokemon-input').value.toLowerCase();
    const resultDiv = document.getElementById('result');
    const movesDiv = document.getElementById('moves-content');
    resultDiv.innerHTML = '';
    movesDiv.innerHTML = '';

    try {
        // Fetch basic Pokémon information
        const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonNameOrId}`);
        if (!pokemonResponse.ok) {
            throw new Error('Pokémon not found');
        }
        const pokemon = await pokemonResponse.json();

        // Display basic information
        const pokemonInfo = `
            <h2>${pokemon.name}</h2>
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
            <p>Height: ${pokemon.height / 10} m</p>
            <p>Weight: ${pokemon.weight / 10} kg</p>
            <p>Type(s): ${pokemon.types.map(type => type.type.name).join(', ')}</p>
        `;
        resultDiv.innerHTML = pokemonInfo;

        // Fetch moves
        const movesResponse = await fetch(pokemon.moves[0].move.url); // Example: Fetching moves from the first move in the list
        if (!movesResponse.ok) {
            throw new Error('Moves not found');
        }
        const movesData = await movesResponse.json();

        // Display moves
        const movesList = movesData.names.map(move => move.name).join(', ');
        const movesInfo = `
            <h3>Moves</h3>
            <p>${movesList}</p>
        `;
        movesDiv.innerHTML = movesInfo;

    } catch (error) {
        resultDiv.innerHTML = `<p id="error">${error.message}</p>`;
    }
}
