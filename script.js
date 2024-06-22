async function fetchPokemon() {
    const pokemonNameOrId = document.getElementById('pokemon-input').value.toLowerCase();
    const resultDiv = document.getElementById('result');
    const movesDiv = document.getElementById('moves-content');
    const locationsDiv = document.getElementById('locations-content');
    resultDiv.innerHTML = '';
    movesDiv.innerHTML = '';
    locationsDiv.innerHTML = '';

    try {
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

        // Fetch and display locations
        const locationResponse = await fetch(pokemon.location_area_encounters);
        if (!locationResponse.ok) {
            throw new Error('Location information not found');
        }
        const locations = await locationResponse.json();
        const locationInfo = locations.map(locationInfo => {
            const versionDetails = locationInfo.version_details.map(versionDetail => {
                const encounterDetails = versionDetail.encounter_details.map(detail => {
                    return `<li>Method: ${detail.method.name}, Level: ${detail.min_level}-${detail.max_level}, Chance: ${detail.chance}%</li>`;
                }).join('');
                return `<li>${versionDetail.version.name}:<ul>${encounterDetails}</ul></li>`;
            }).join('');
            return `<h4>${locationInfo.location_area.name}</h4><ul>${versionDetails}</ul>`;
        }).join('');
        const locationsContent = `
            <h3>Locations</h3>
            ${locationInfo}
        `;
        locationsDiv.innerHTML = locationsContent;

    } catch (error) {
        resultDiv.innerHTML = `<p id="error">${error.message}</p>`;
    }
}