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

        // Fetch locations
        const locationAreaResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${data.id}/encounters`);
        const locationAreas = await locationAreaResponse.json();

        // Basic Information Tab
        const basicInfo = `
            <h2>${data.name}</h2>
            <img src="${data.sprites.front_default}" alt="${data.name}">
            <p>Height: ${data.height}</p>
            <p>Weight: ${data.weight}</p>
            <p>Type: ${data.types.map(type => type.type.name).join(', ')}</p>
            <p>Abilities: ${data.abilities.map(ability => ability.ability.name).join(', ')}</p>
            <p>Species: ${speciesData.genera.find(genus => genus.language.name === 'en').genus}</p>
            <p>Evolution Chain:</p>
            <ul>
                ${getEvolutionChain(evolutionData.chain).map(evo => `<li>${evo}</li>`).join('')}
            </ul>
            <p>Flavor Text:</p>
            <p>${speciesData.flavor_text_entries.find(entry => entry.language.name === 'en').flavor_text}</p>
        `;

        // Moves Tab
        const movesList = data.moves.map(move => move.move.name).slice(0, 15).join(', '); // Display first 10 moves
        const movesInfo = `<p>Moves: ${movesList}</p>`;

        // Locations Tab
        const locationsInfo = `
            <p>Locations:</p>
            <ul>
                ${locationAreas.map(area => `<li>${area.location_area.name}</li>`).join('')}
            </ul>
        `;

        // Combine all tabs into the result div
        resultDiv.innerHTML = `
            <div id="BasicInfo" class="tabcontent">${basicInfo}</div>
            <div id="Stats" class="tabcontent" style="display:none;">
                <p>Base Stats:</p>
                <ul>
                    ${data.stats.map(stat => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
                </ul>
            </div>
            <div id="Moves" class="tabcontent" style="display:none;">${movesInfo}</div>
            <div id="Locations" class="tabcontent" style="display:none;">${locationsInfo}</div>
        `;

        // Show basic info by default
        openTab('BasicInfo');

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

// Function to open tabs
function openTab(tabName) {
    const tabs = document.getElementsByClassName("tabcontent");
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].style.display = "none"; // Hide all tabs
    }
    document.getElementById(tabName).style.display = "block"; // Show selected tab
}

// Add event listeners to tab buttons
document.getElementById("btnBasicInfo").addEventListener("click", () => openTab('BasicInfo'));
document.getElementById("btnStats").addEventListener("click", () => openTab('Stats'));
document.getElementById("btnMoves").addEventListener("click", () => openTab('Moves'));
document.getElementById("btnLocations").addEventListener("click", () => openTab('Locations'));