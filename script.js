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

        // Fetch species information
        const speciesResponse = await fetch(data.species.url);
        const speciesData = await speciesResponse.json();

        // Fetch evolution chain
        const evolutionResponse = await fetch(speciesData.evolution_chain.url);
        const evolutionData = await evolutionResponse.json();

        resultDiv.innerHTML = `
            <h2>${data.name}</h2>
            <img src="${data.sprites.front_default}" alt="${data.name}">
            <p>Height: ${data.height}</p>
            <p>Weight: ${data.weight}</p>
            <p>Type: ${data.types.map(type => type.type.name).join(', ')}</p>
            <p>Base Stats:</p>
            <ul>
                ${data.stats.map(stat => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
            </ul>
            <p>Abilities: ${data.abilities.map(ability => ability.ability.name).join(', ')}</p>
            <p>Species: ${speciesData.genera.find(genus => genus.language.name === 'en').genus}</p>
            <p>Evolution Chain:</p>
            <ul>
                ${getEvolutionChain(evolutionData.chain).map(evo => `<li>${evo}</li>`).join('')}
            </ul>
            <p>Flavor Text:</p>
            <p>${speciesData.flavor_text_entries.find(entry => entry.language.name === 'en').flavor_text}</p>
        `;
    } catch (error) {
        resultDiv.innerHTML = `<p style="color:red;">${error.message}</p>`;
    }
}

function getEvolutionChain(chain) {
    let evoChain = [];
    let evoData = chain;

    do {
        evoChain.push(evoData.species.name);
        evoData = evoData.evolves_to[0];
    } while (!!evoData && evoData.hasOwnProperty('evolves_to'));

    return evoChain;
}