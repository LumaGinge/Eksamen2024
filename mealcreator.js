//Foodinspectorknap. 
//Jeg henter knappen fra HTML, så jeg kan bruge den
let foodinspectorbutton = document.querySelector(".foodinspectorbutton")

//Jeg tilføjer en eventlistener, der ved klick på knappen, navigerer til en ny side. Den sørger for jeg kan tilgå foodinspector
foodinspectorbutton.addEventListener("click", function () {
    window.location.href = "foodinspector.html";
})

//Her interagerer jeg med den runde grønne knap
document.addEventListener('DOMContentLoaded', function () {
    const greenButton = document.querySelector('.greenbutton');
    //Den container der skal indeholde dropdown og inputfelter
    const lineContainer = document.querySelector('.grey-line-container');

    //Ved tryk på den grønne knap --> Ved første klik, kommer den grå boks frem. Hvis den grå boks er fremme, skjules den ved næste klik.
    greenButton.addEventListener('click', function () {
        // Tjek om lineContainer er synlig
        if (lineContainer.style.display === 'block') {
            lineContainer.style.display = 'none'; // Skjul lineContainer hvis den er synlig
        } else {
            lineContainer.style.display = 'block'; // Vis lineContainer hvis den er skjult
        }
    });
});

//Funktion der skal opdatere tabellen fra local storage
async function updateTableFromLocalStorage() {
    // Hent data fra localStorage, hvis ingen data findes, brug et tomt array
    const data = JSON.parse(localStorage.getItem('mealcreator')) || [];
    // Få fat i tbody-elementet i tabellen
    const tbody = document.getElementById('creatorTable').querySelector('tbody');
    // Ryd tabellen ved at fjerne al indhold
    tbody.innerHTML = '';

    // Promise.all venter på, at alle asynkrone opkald er færdige, før den fortsætter
    await Promise.all(data.map(async ({
        mealCounter,
        mealName,
        totalKcal,
        date,
        numIngredients,
        timesEaten,
        ingredients
    }) => {
        // Indsæt en ny række i tabellen
        const newRow = tbody.insertRow();

        // Opret et array med celler til hver data
        const cells = [mealCounter, mealName, totalKcal, date, numIngredients, timesEaten];

        // Indsæt data i hver celle i rækken
        cells.forEach((cellContent, index) => {
            const cell = newRow.insertCell(index);
            cell.textContent = cellContent;
        });

        // Opret en celle til knapperne
        const buttonCell = newRow.insertCell(6);

        // Indsæt HTML-knapper i knapcellen (delete, edit, info)
        buttonCell.innerHTML = `
            <button class="infoButton">
                <img src="aInfo.png" alt="infoButton">
            </button>
            <button class="editButton">
                <img src="aEdit.png" alt="editButton">
            </button>
            <button class="deleteButton">
                <img src="aDelete.png" alt="deleteButton">
            </button>`;

        // Tilføj en addEventListener til slet-knappen
        const deleteButton = buttonCell.querySelector('.deleteButton');
        deleteButton.addEventListener('click', function () {
            // Find indekset for den række, der skal slettes
            const index = newRow.rowIndex - 1;
            // Fjern måltidet fra data-arrayet
            data.splice(index, 1);
            // Opdater localStorage med det nye data-array
            localStorage.setItem('mealcreator', JSON.stringify(data));
            // Fjern den tilhørende række fra tabellen
            newRow.remove();
        });

        // Tilføj en addEventListener til info-knappen
        const infoButton = buttonCell.querySelector('.infoButton');
        infoButton.addEventListener('click', async function () {
            try {
                // Variabel til at holde den samlede ernæringsinformation
                let totalNutritionalInfo = {
                    totalEnergy: 0,
                    totalProtein: 0,
                    totalCarbohydrate: 0,
                    totalFiber: 0,
                    totalFat: 0
                };

                let totalWeight = 0; // Variabel til at holde den samlede vægt

                // For hver ingrediens i måltidet, hent detaljerne og opdater totalen
                await Promise.all(ingredients.map(async ingredient => {
                    const sortKeyDetails = await sortKeyFoodDetails(ingredient.foodID);
                    totalNutritionalInfo.totalEnergy += sortKeyDetails.kcal;
                    totalNutritionalInfo.totalProtein += sortKeyDetails.protein;
                    totalNutritionalInfo.totalCarbohydrate += sortKeyDetails.carbohydrates;
                    totalNutritionalInfo.totalFiber += sortKeyDetails.fiber;
                    totalNutritionalInfo.totalFat += sortKeyDetails.fat;

                    totalWeight += ingredient.weight; // Læg vægten af ingrediensen til den samlede vægt

                }));

                // Opret en besked med ingredienser og ernæringsoplysninger
                let message = `Ingredients in ${mealName}:\n`;
                ingredients.forEach(ingredient => {
                    message += `${ingredient.foodName} ${ingredient.weight} g\n`;
                });

                message += `\nTotal Weight: ${totalWeight} g\n`;


                message += `\nTotal nutritional information:\n`;
                message += `Total Energy: ${totalNutritionalInfo.totalEnergy} kcal\n`;
                message += `Total Protein: ${totalNutritionalInfo.totalProtein} g\n`;
                message += `Total Carbohydrate: ${totalNutritionalInfo.totalCarbohydrate} g\n`;
                message += `Total Fiber: ${totalNutritionalInfo.totalFiber} g\n`;
                message += `Total Fat: ${totalNutritionalInfo.totalFat} g\n`;

                // Vis en besked med ingredienser og ernæringsoplysninger
                alert(message);
            } catch (error) {
                // Håndter fejl, hvis der opstår problemer med hentning af ernæringsoplysninger
                console.error('Error fetching nutritional details:', error);
                alert('An error occurred while fetching nutritional details. Please try again later.');
            }
        });

    }));
}


// Vent med at udføre koden, indtil dokumentet er fuldt indlæst
document.addEventListener('DOMContentLoaded', function () {
    // Henter referencen til addingredient og dropdown container der er i html
    const addIngredientButton = document.getElementById("addIngredientButton");
    const dropdownContainer = document.getElementById("dropdownContainer");

    // Funktion til at indlæse data i en dropdown
    function loadIntoDropdown(dropdown) {
        try {
            // Hent data fra Local Storage
            const data = JSON.parse(localStorage.getItem('foodInspector'));
            // Ryd dropdown'en
            dropdown.innerHTML = "";

            // Der opretten en placeholder til dropdown med teksten: "Choose a food item"
            const placeholderOption = document.createElement("option");
            placeholderOption.text = "Choose a food item";
            placeholderOption.disabled = true;
            placeholderOption.selected = true;
            dropdown.appendChild(placeholderOption);

            // Tilføj hvert element fra data til dropdown'en som en option
            data.forEach(food => {
                const option = document.createElement("option");
                option.text = food.foodName;
                option.value = food.foodID;
                dropdown.appendChild(option);
            });

            // Fejlhåndtering, hvis der opstår en fejl under indlæsningen af data fra Local Storage
        } catch (error) {
            console.error('Error loading food items from localStorage:', error);
        }
    }

    // Functionen der skal oprette en ny dropdrow (Skal bruges til addIngredientButton)
    function createNewDropdown() {
        const newDropdown = document.createElement("select");
        newDropdown.className = "dropdown"; // Tilføj klassenavn til den nye dropdown

        // Indlæs data i den nye dropdown
        loadIntoDropdown(newDropdown);

        // Tilføj den nye dropdown til dropdown-containeren
        dropdownContainer.appendChild(newDropdown);
    }

    // Henter referencen til addIngredientButton i html
    addIngredientButton.addEventListener('click', function () {
        createNewDropdown(); // Kald funktionen til at oprette en ny dropdown, når knappen klikkes
    });
});


// Vent med at udføre koden, indtil dokumentet er fuldt indlæst
document.addEventListener('DOMContentLoaded', async function () {
    // Kald updateTableFromLocalStorage() for at vise data fra local storage, når siden loader
    updateTableFromLocalStorage();

    // Få reference til knappen til at tilføje måltider
    const addMealButton = document.getElementById('addMealButton');
    let mealCounter = 1; // Startværdi for tælleren

    // Tilføj en eventlytter til knappen til at tilføje måltider
    addMealButton.addEventListener('click', async function () {
        // Inkrementer mealCounter for næste måltid
        mealCounter++;

        // Hent værdien fra inputfeltet med datoen
        const inputDate1 = document.getElementById('inputDate').value;
        // Omformater datoværdien til formatet "DD-MM-ÅÅÅÅ"
        const formattedDate = inputDate1.split('-').reverse().join('-');

        // Hent værdien fra inputfeltet med måltidets navn
        let mealNameInput = document.getElementById('mealNameInput').value;

        // Hent antallet af dropdowns, som repræsenterer antallet af ingredienser
        const dropdowns = document.querySelectorAll('.dropdown');
        const ingredients = [];

        // Gennemgå alle dropdown-menuer og tilføj valgte ingredienser til ingredienser-arrayet
        dropdowns.forEach(dropdown => {
            // Kontrollerer om dropdown-menuen har en valgt værdi
            if (dropdown.value) {
                // Hent den valgte option fra dropdown-menuen
                const selectedOption = dropdown.options[dropdown.selectedIndex];
                // Hent værdien (foodID) og teksten (foodName) fra den valgte option
                const foodID = selectedOption.value;
                const foodName = selectedOption.text;

                // Bed brugeren om at indtaste vægten for ingrediensen i gram ved hjælp af en prompt-besked
                const weight = parseFloat(prompt(`Enter the weight for ${foodName} (in grams):`));

                // Kontrollerer om indtastet vægt er gyldig (er et tal og større end 0)
                if (!isNaN(weight) && weight > 0) {
                    // Hvis vægten er gyldig, tilføj ingrediensen til ingredienser-arrayet
                    ingredients.push({
                        foodID: foodID,
                        foodName: foodName,
                        weight: weight
                    });
                } else {
                    // Hvis vægten ikke er gyldig, vis en fejlbesked med en alert
                    alert('Invalid weight. Please enter a valid number.');
                }
            }
        });


        // Beregn det samlede antal kalorier fra alle ingredienserne i måltidet
        let totalEnergy = 0;
        let totalProtein = 0;
        let totalCarbohydrate = 0;
        let totalFiber = 0;
        let totalFat = 0;

        for (const ingredient of ingredients) {
            // Hent sortkey-detaljerne asynkront og vent på, at de er klar
            const sortKeyDetails = await sortKeyFoodDetails(ingredient.foodID);

            // Beregn sortkey-detaljerne baseret på vægten af ingrediensen
            const weightFactor = ingredient.weight / 100;
            const weightedSortKeyDetails = Object.fromEntries(
                Object.entries(sortKeyDetails).map(([key, value]) => [key, value * weightFactor])
            );

            // Tilføj værdierne fra hver ingrediens til de samlede værdier. Math.ceil runder op. 
            totalEnergy += Math.ceil(weightedSortKeyDetails.SortKey1030);
            totalProtein += Math.ceil(weightedSortKeyDetails.SortKey1110);
            totalCarbohydrate += Math.ceil(weightedSortKeyDetails.SortKey1220);
            totalFiber += Math.ceil(weightedSortKeyDetails.SortKey1240);
            totalFat += Math.ceil(weightedSortKeyDetails.SortKey1310);

        }

        // Beregn den samlede vægt af ingredienserne. Der kører et forloop hvor hver ingrediens vægt lægges til variablen totalWeight
        let totalWeight = 0;
        ingredients.forEach(ingredient => {
            totalWeight += ingredient.weight;
        });

        // Beregn det gennemsnitlige kalorier pr. 100 gram af et måltid og rund det op til det nærmeste hele tal
        let averageEnergyDensity = Math.ceil((totalEnergy / totalWeight) * 100);

        // Opret et nyt måltid objekt baseret på brugerinput og ingredienser, og tilføj det til local storage
        const newMeal = {
            mealcounter: mealCounter,
            mealName: mealNameInput,
            totalKcal: averageEnergyDensity,
            date: formattedDate,
            numIngredients: ingredients.length,
            timesEaten: 1,
            ingredients: ingredients,
            totalSortkeyDetails: {
                kcal: totalEnergy,
                protein: totalProtein,
                carbohydrates: totalCarbohydrate,
                fiber: totalFiber,
                fat: totalFat
            },
            totalWeight: totalWeight
        };

        // Hent eksisterende måltider fra local storage
        let existingMeals = JSON.parse(localStorage.getItem('mealcreator')) || [];

        // Tilføj det nye måltid til listen
        existingMeals.push(newMeal);

        // Opdater local storage med den opdaterede liste over måltider
        localStorage.setItem('mealcreator', JSON.stringify(existingMeals));

        // Opdater tabellen for at vise det nye måltid
        updateTableFromLocalStorage();

        // Nulstil inputdataene og tøm dropdown-menuerne
        resetInputData();
    });
});


//Funktionen der restetter inputfelter i den gråboks, når et måltid er oprettet, så man er klar til at oprette et nyt måltid
function resetInputData() {
    // Nulstil inputfelter
    document.getElementById("mealNameInput").value = ''; // Nulstil måltidsnavn-inputfeltet
    document.getElementById("inputDate").value = ''; // Nulstil datofeltet

    // Nulstil dropdown-menuer
    const dropdowns = document.querySelectorAll('.dropdown select');
    dropdowns.forEach(dropdown => {
        dropdown.selectedIndex = 0; // Sæt valget til det første element (placeholder)
    });

    // Tøm dropdownContainer
    const dropdownContainer = document.getElementById('dropdownContainer');
    dropdownContainer.innerHTML = ''; // Fjern alle dropdown-menuer
}

//Apikald 
//Funktion der hender detaljer om fødevarer med deres foodID
async function sortKeyFoodDetails(foodID) {

    // De sortkeys jeg vil have vist data for
    let sortKeys = [1030, 1110, 1220, 1240, 1310];

    //Tomt objekt til at gemme fødevaredetaljerne i 
    let details = {};

    // Itererer gennem de ønskede sortKeys
    for (let sortKey of sortKeys) {
        let url = `https://nutrimonapi.azurewebsites.net/api/FoodCompSpecs/ByItem/${foodID}/BySortKey/${sortKey}`;
        //Henter data fra apiet med fetch
        try {
            let response = await fetch(url, {
                method: "GET",
                //Mit studie nr, der sikrer at jeg har adgang til datasættet
                headers: {
                    "X-API-Key": "171209",
                }
            });

            //Hvis svaret ikke er ok, vises en fejl status 
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            //Konventerer til json format
            let data = await response.json();

            //Hvis dataen er defineret, hvis arrayet har mindst et element og hvis det første element indeholder resVal, så tilføjes detaljerne til detail objektet. 
            if (data && data.length > 0 && data[0].resVal) {
                details[`SortKey${sortKey}`] = Math.round(parseFloat(data[0].resVal)); //Afrunder til nærmeste heltal og konventerer til streng 
            } else {
                details[`SortKey${sortKey}`] = 'N/A'; //Hvis ikke detaljerne findes, sættes værdien til N/A
            }

            //Hvis der opstår fejl undervejs, sættes værdien til error 
        } catch (error) {
            console.error(`Error fetching details for sort key ${sortKey}:`, error);
            details[`SortKey${sortKey}`] = 'Error';
        }
    }

    return details;
}