async function fetchPokemon() {
    const input = document.getElementById('pokemon-input').value.toLowerCase();
    
    // Clear all content areas and show loading
    document.getElementById('BasicInfo').innerHTML = 'Loading...';
    document.getElementById('Stats').innerHTML = '';
    document.getElementById('Moves').innerHTML = '';
    document.getElementById('Locations').innerHTML = '';

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

        // Display Basic Info in the "Basic Info" tab
        document.getElementById('BasicInfo').innerHTML = `
            <h2>${data.name}</h2>
            <img src="${data.sprites.front_default}" alt="${data.name}">
            <p>Height: ${data.height}</p>
            <p>Weight: ${data.weight}</p>
            <p>Type: ${data.types.map(type => type.type.name).join(', ')}</p>
            <p>Abilities: ${data.abilities.map(ability => ability.ability.name).join(', ')}</p>
            <p>Species: ${speciesData.genera.find(genus => genus.language.name === 'en').genus}</p>
            <p>Flavor Text:</p>
            <p>${speciesData.flavor_text_entries.find(entry => entry.language.name === 'en').flavor_text}</p>
        `;

        // Display Stats in the "Stats" tab
        document.getElementById('Stats').innerHTML = `
            <h3>Base Stats:</h3>
            <ul>
                ${data.stats.map(stat => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
            </ul>
            <h3>Evolution Chain:</h3>
            <ul>
                ${getEvolutionChain(evolutionData.chain).map(evo => `<li>${evo}</li>`).join('')}
            </ul>
        `;

        // Fetch moves and display in the "Moves" tab
        const movesList = data.moves.map(move => move.move.name).slice(0, 10).join(', ');
        document.getElementById('Moves').innerHTML = `
            <h3>Top Moves:</h3>
            <p>${movesList || 'No moves available'}</p>
        `;

        // Fetch location data (location encounters) and display in the "Locations" tab
        const locationResponse = await fetch(data.location_area_encounters);
        const locationData = await locationResponse.json();
        const locationList = locationData.map(loc => loc.location_area.name).join(', ');
        
        document.getElementById('Locations').innerHTML = `
            <h3>Location(s) Found:</h3>
            <p>${locationList || 'Location data not available'}</p>
        `;

    } catch (error) {
        document.getElementById('BasicInfo').innerHTML = `<p style="color:red;">${error.message}</p>`;
    }
}

// Utility function to get the evolution chain
function getEvolutionChain(chain) {
    let evoChain = [];
    let evoData = chain;

    do {
        evoChain.push(evoData.species.name);
        evoData = evoData.evolves_to[0];
    } while (!!evoData && evoData.hasOwnProperty('evolves_to'));

    return evoChain;
}

// Tab switch function
function openTab(evt, tabName) {
    let i, tabcontent, tablinks;

    // Hide all tabcontent elements
    tabcontent = document.getElementsByClassName('tabcontent');
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = 'none';
    }

    // Remove the "active" class from all tablinks
    tablinks = document.getElementsByClassName('tablinks');
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(' active', '');
    }

    // Show the clicked tab
    document.getElementById(tabName).style.display = 'block';
    evt.currentTarget.className += ' active';
}