/**********************
 * Global State
 **********************/
let allForms = [];
let activePokemon = null;
let currentEvolutionChain = null;

/**********************
 * Helpers
 **********************/
function formatFormName(pokemon) {
    return pokemon.name
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

function getEvolutionChain(chain) {
    let evoChain = [];
    let current = chain;

    while (current) {
        evoChain.push(current.species.name);
        current = current.evolves_to[0];
    }
    return evoChain;
}

/**********************
 * Tabs
 **********************/
function openTab(tabName) {
    document.querySelectorAll('.tabcontent').forEach(tab => {
        tab.style.display = 'none';
    });
    const active = document.getElementById(tabName);
    if (active) active.style.display = 'block';
}

document.getElementById("btnBasicInfo")?.addEventListener("click", () => openTab('BasicInfo'));
document.getElementById("btnStats")?.addEventListener("click", () => openTab('Stats'));
document.getElementById("btnMoves")?.addEventListener("click", () => openTab('Moves'));
document.getElementById("btnLocations")?.addEventListener("click", () => openTab('Locations'));
document.getElementById("btnForms")?.addEventListener("click", () => openTab('Forms'));

/**********************
 * Main Search
 **********************/
async function fetchPokemon() {
    const input = document.getElementById('pokemon-input').value.toLowerCase();
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = 'Loading...';

    try {
        // Fetch species
        const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${input}`);
        if (!speciesRes.ok) throw new Error('Pokémon not found');
        const species = await speciesRes.json();

        // Fetch evolution chain
        const evoRes = await fetch(species.evolution_chain.url);
        const evoData = await evoRes.json();
        currentEvolutionChain = evoData.chain;

        // Fetch all forms
        allForms = await Promise.all(
            species.varieties.map(v =>
                fetch(v.pokemon.url).then(res => res.json())
            )
        );

        activePokemon = allForms[0];

        // Build base layout ONCE
        resultDiv.innerHTML = `
            <div id="BasicInfo" class="tabcontent"></div>
            <div id="Stats" class="tabcontent" style="display:none;"></div>
            <div id="Moves" class="tabcontent" style="display:none;"></div>
            <div id="Locations" class="tabcontent" style="display:none;"></div>
            <div id="Forms" class="tabcontent" style="display:none;"></div>
        `;

        renderForms();
        await renderPokemonDetails(activePokemon);

        openTab('BasicInfo');

    } catch (err) {
        resultDiv.innerHTML = `<p style="color:red;">${err.message}</p>`;
    }
}

/**********************
 * Render Forms
 **********************/
function renderForms() {
    const formsDiv = document.getElementById('Forms');

    formsDiv.innerHTML = allForms.map(form => `
        <div class="form-card" onclick="selectForm(${form.id})">
            <img src="${form.sprites.front_default}" alt="${form.name}">
            <p>${formatFormName(form)}</p>
        </div>
    `).join('');
}

/**********************
 * Render Pokémon Details
 **********************/
async function renderPokemonDetails(pokemon) {
    activePokemon = pokemon;

    const locationRes = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${pokemon.id}/encounters`
    );
    const locations = await locationRes.json();

    document.getElementById('BasicInfo').innerHTML = `
        <h2>${formatFormName(pokemon)}</h2>
        <img src="${pokemon.sprites.front_default}">
        <p>Height: ${pokemon.height}</p>
        <p>Weight: ${pokemon.weight}</p>
        <p>Types: ${pokemon.types.map(t => t.type.name).join(', ')}</p>
        <p>Abilities: ${pokemon.abilities.map(a => a.ability.name).join(', ')}</p>

        <p><strong>Evolution Chain:</strong></p>
        <ul>
            ${getEvolutionChain(currentEvolutionChain).map(e => `<li>${e}</li>`).join('')}
        </ul>
    `;

    document.getElementById('Stats').innerHTML = `
        <ul>
            ${pokemon.stats.map(s =>
                `<li>${s.stat.name}: ${s.base_stat}</li>`
            ).join('')}
        </ul>
    `;

    document.getElementById('Moves').innerHTML = `
        <p>
            ${pokemon.moves.slice(0, 20).map(m => m.move.name).join(', ')}
        </p>
    `;

    document.getElementById('Locations').innerHTML = `
        <ul>
            ${locations.map(l => `<li>${l.location_area.name}</li>`).join('')}
        </ul>
    `;
}

/**********************
 * Select Form
 **********************/
function selectForm(id) {
    const selected = allForms.find(f => f.id === id);
    if (selected) {
        renderPokemonDetails(selected);
        openTab('BasicInfo');
    }
}

/**********************
 * Battle Simulator (UNCHANGED)
 **********************/
async function startBattle() {
    const pokemon1Name = document.getElementById('pokemon1').value.toLowerCase();
    const pokemon2Name = document.getElementById('pokemon2').value.toLowerCase();
    const resultDiv = document.getElementById('battle-result');

    resultDiv.innerHTML = 'Battle is starting...';

    try {
        const p1 = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon1Name}`).then(r => r.json());
        const p2 = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon2Name}`).then(r => r.json());

        let hp1 = p1.stats.find(s => s.stat.name === 'hp').base_stat;
        let hp2 = p2.stats.find(s => s.stat.name === 'hp').base_stat;

        let turn = 1;
        while (hp1 > 0 && hp2 > 0) {
            const dmg = Math.floor(Math.random() * 10) + 1;
            if (turn % 2 === 1) {
                hp2 -= dmg;
                resultDiv.innerHTML += `<p>${pokemon1Name} hits ${pokemon2Name} for ${dmg}</p>`;
            } else {
                hp1 -= dmg;
                resultDiv.innerHTML += `<p>${pokemon2Name} hits ${pokemon1Name} for ${dmg}</p>`;
            }
            turn++;
        }

        resultDiv.innerHTML += hp1 > 0
            ? `<p>${pokemon1Name} wins!</p>`
            : `<p>${pokemon2Name} wins!</p>`;

    } catch (err) {
        resultDiv.innerHTML = `<p style="color:red;">${err.message}</p>`;
    }
}