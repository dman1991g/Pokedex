/**********************
 * Helper Functions
 **********************/

function formatFormName(pokemonData) {
    if (pokemonData.name.includes('-')) {
        return pokemonData.name
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    return pokemonData.name.charAt(0).toUpperCase() + pokemonData.name.slice(1);
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

/**********************
 * Tabs
 **********************/

function openTab(tabName) {
    const tabs = document.getElementsByClassName("tabcontent");
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].style.display = "none";
    }
    const activeTab = document.getElementById(tabName);
    if (activeTab) activeTab.style.display = "block";
}

document.getElementById("btnBasicInfo")?.addEventListener("click", () => openTab('BasicInfo'));
document.getElementById("btnStats")?.addEventListener("click", () => openTab('Stats'));
document.getElementById("btnMoves")?.addEventListener("click", () => openTab('Moves'));
document.getElementById("btnLocations")?.addEventListener("click", () => openTab('Locations'));

/**********************
 * Main Pokédex Search
 **********************/

async function fetchPokemon() {
    const input = document.getElementById('pokemon-input').value.toLowerCase();
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = 'Loading...';

    try {
        // 1️⃣ Fetch species (key to all forms)
        const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${input}`);
        if (!speciesResponse.ok) throw new Error('Pokémon not found');

        const speciesData = await speciesResponse.json();

        // 2️⃣ Fetch evolution chain
        const evolutionResponse = await fetch(speciesData.evolution_chain.url);
        const evolutionData = await evolutionResponse.json();

        // 3️⃣ Fetch ALL forms (varieties)
        const formPromises = speciesData.varieties.map(v =>
            fetch(v.pokemon.url).then(res => res.json())
        );
        const formsData = await Promise.all(formPromises);

        // 4️⃣ Build Forms HTML
        const formsHTML = formsData.map(form => `
            <div class="form-card">
                <h3>${formatFormName(form)}</h3>
                <img src="${form.sprites.front_default}" alt="${form.name}">
                <p><strong>Types:</strong> ${form.types.map(t => t.type.name).join(', ')}</p>
                <p><strong>Abilities:</strong> ${form.abilities.map(a => a.ability.name).join(', ')}</p>
                <ul>
                    ${form.stats.map(stat => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
                </ul>
            </div>
        `).join('');

        // 5️⃣ Build Basic Info tab (species-based)
        const basicInfo = `
            <h2>${speciesData.name}</h2>
            <p>${speciesData.genera.find(g => g.language.name === 'en')?.genus || ''}</p>

            <p><strong>Evolution Chain:</strong></p>
            <ul>
                ${getEvolutionChain(evolutionData.chain).map(evo => `<li>${evo}</li>`).join('')}
            </ul>

            <p><strong>Flavor Text:</strong></p>
            <p>${speciesData.flavor_text_entries.find(e => e.language.name === 'en')?.flavor_text || ''}</p>
        `;

        // 6️⃣ Inject into DOM
        resultDiv.innerHTML = `
            <div id="BasicInfo" class="tabcontent">${basicInfo}</div>
            <div id="Forms" class="tabcontent" style="display:none;">
                ${formsHTML}
            </div>
        `;

        openTab('BasicInfo');

    } catch (error) {
        resultDiv.innerHTML = `<p style="color:red;">${error.message}</p>`;
    }
}

/**********************
 * Battle Simulator
 **********************/

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
        const response1 = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon1Name}`);
        const data1 = await response1.json();

        const response2 = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon2Name}`);
        const data2 = await response2.json();

        const pokemon1Stats = data1.stats.reduce((acc, stat) => {
            acc[stat.stat.name] = stat.base_stat;
            return acc;
        }, {});

        const pokemon2Stats = data2.stats.reduce((acc, stat) => {
            acc[stat.stat.name] = stat.base_stat;
            return acc;
        }, {});

        let pokemon1Health = pokemon1Stats.hp;
        let pokemon2Health = pokemon2Stats.hp;
        let turn = 1;

        while (pokemon1Health > 0 && pokemon2Health > 0) {
            const damage = Math.floor(Math.random() * 10) + 1;
            if (turn % 2 === 1) {
                pokemon2Health -= damage;
                resultDiv.innerHTML += `<p>Turn ${turn}: ${pokemon1Name} attacks ${pokemon2Name} for ${damage} damage!</p>`;
            } else {
                pokemon1Health -= damage;
                resultDiv.innerHTML += `<p>Turn ${turn}: ${pokemon2Name} attacks ${pokemon1Name} for ${damage} damage!</p>`;
            }
            resultDiv.innerHTML += `<p>${pokemon1Name} HP: ${pokemon1Health}, ${pokemon2Name} HP: ${pokemon2Health}</p>`;
            turn++;
        }

        resultDiv.innerHTML += pokemon1Health > 0
            ? `<p>${pokemon1Name} wins!</p>`
            : `<p>${pokemon2Name} wins!</p>`;

    } catch (error) {
        resultDiv.innerHTML = `<p style="color:red;">${error.message}</p>`;
    }
}