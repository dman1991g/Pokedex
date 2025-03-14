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

// Battle Simulator
async function startBattle() {
    const pokemon1Input = document.getElementById('pokemon1');
    const pokemon2Input = document.getElementById('pokemon2');
    const resultDiv = document.getElementById('battle-result');

    if (!pokemon1Input || !pokemon2Input) {
        resultDiv.innerHTML = "Error: Pokémon input fields not found!";
        return;
    }

    const pokemon1Name = pokemon1Input.value.toLowerCase();
    const pokemon2Name = pokemon2Input.value.toLowerCase();

    resultDiv.innerHTML = 'Battle is starting...';

    try {
        // Fetch Pokémon data for both Pokémon
        const response1 = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon1Name}`);
        const data1 = await response1.json();
        
        const response2 = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon2Name}`);
        const data2 = await response2.json();

        // Extract stats for both Pokémon (simplified to base stats for this example)
        const pokemon1Stats = data1.stats.reduce((acc, stat) => {
            acc[stat.stat.name] = stat.base_stat;
            return acc;
        }, {});
        
        const pokemon2Stats = data2.stats.reduce((acc, stat) => {
            acc[stat.stat.name] = stat.base_stat;
            return acc;
        }, {});

        // Simplified battle logic: compare base stats and health
        let pokemon1Health = pokemon1Stats.hp;
        let pokemon2Health = pokemon2Stats.hp;

        let turn = 1;
        while (pokemon1Health > 0 && pokemon2Health > 0) {
            // Simulate battle turn: both Pokémon attack in alternating turns
            if (turn % 2 === 1) {
                // Pokémon 1 attacks Pokémon 2
                const damage = Math.floor(Math.random() * 10) + 1; // Simple random damage
                pokemon2Health -= damage;
                resultDiv.innerHTML += `<p>Turn ${turn}: ${pokemon1Name} attacks ${pokemon2Name} for ${damage} damage!</p>`;
            } else {
                // Pokémon 2 attacks Pokémon 1
                const damage = Math.floor(Math.random() * 10) + 1; // Simple random damage
                pokemon1Health -= damage;
                resultDiv.innerHTML += `<p>Turn ${turn}: ${pokemon2Name} attacks ${pokemon1Name} for ${damage} damage!</p>`;
            }

            // Update health display
            resultDiv.innerHTML += `<p>${pokemon1Name} HP: ${pokemon1Health}, ${pokemon2Name} HP: ${pokemon2Health}</p>`;
            turn++;
        }

        // Determine winner
        if (pokemon1Health > 0) {
            resultDiv.innerHTML += `<p>${pokemon1Name} wins!</p>`;
        } else {
            resultDiv.innerHTML += `<p>${pokemon2Name} wins!</p>`;
        }

    } catch (error) {
        resultDiv.innerHTML = `<p style="color:red;">${error.message}</p>`;
    }
}