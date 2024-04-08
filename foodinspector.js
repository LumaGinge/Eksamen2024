//Jeg definerer mit api, altså hvor alt dataen skal hentes fra 
//Jeg bruger det endpoint der hedder FoodItems
const apiUrl = 'https://nutrimonapi.azurewebsites.net/api/FoodItems';

//Funktion til at hente data, som smider det ind i en tabel 
async function loadIntoTable(url, table) {
   

    //Henter data med fetch
    const response = await fetch(url, {
        method: 'GET',
        //Dette er mit studienr der bruges til at få adgang til datasættet. Uden denne apikey, ville den fejle og ingen data vil blive vist på siden
        headers: {
            "x-api-key": "171209"
        }
    });

    // Response, altså svaret fra apiet formateres til json format, så det bliver struktureret på en nem og overskuelig måde
    const data = await response.json();

    // Der skal KUN gemmes data for foodID og foodName i Local Storage
    //Jeg bruger et forloop til at sortere så det kun er foodID og foodName der bliver gemt i local storage
    const simplifiedData = [];
    for (let i = 0; i < data.length; i++) {
        const item = data[i];
        const simplifiedItem = {
            foodID: item.foodID,
            foodName: item.foodName
        };
        simplifiedData.push(simplifiedItem);
    }

    //Gemmer det data jeg ønsker i local storage
    localStorage.setItem('foodInspector', JSON.stringify(simplifiedData));

//Peger tilbage til den tabel jeg har lavet i HTML
 const tableHead = table.querySelector("thead");
 const tableBody = table.querySelector("tbody");

    //Laver en tabel der er tom fra starten af, som dataen kan puttes ind i 
    tableHead.innerHTML = "<tr></tr>";
    tableBody.innerHTML = "";

    //Udfylder header i tabel
    //Forløkke gennem alle keys i første datasæt (da alle datasæt har samme keys)
    for (const key in data[0]) {
        //Hvis key enten er foodID eller foodName
        if (key === 'foodID' || key === 'foodName') {
            //Så opret dem i headeren i tabellen, som overskrifter 
            const headerElement = document.createElement("th");
            //Sætter key, til at være overskriften i tabellen
            headerElement.textContent = key;
            tableHead.querySelector("tr").appendChild(headerElement);
        }
    }

    //Udfylder oplysninger i tabellen
    //Iterere gennet et for loop
    for (const food of data) {
        // Opret en ny tabelrække for hvert element i datasættet
        const foodRow = document.createElement("tr");

        // Tilføj kun foodID og foodName data til tabellen
        for (const key in food) {
            if (key === 'foodID' || key === 'foodName') {
                // Opret et nyt cellelement (<td>) til hver nøgle
                const cellElement = document.createElement("td");
                //Tilføjer værdierne fra den aktuelle key 
                cellElement.textContent = food[key];
                // Tilføjer celleelementet til den aktuelle tabelrække
                foodRow.appendChild(cellElement);
            }
        }

        // Tilføj knap "Details" til hver række
        //Laver en tabel celle ekstra, som detalis knappen kan være i
        const detailsCell = document.createElement("td");
        //Der oprettes en details knap 
        const detailsButton = document.createElement("button"); 
        detailsButton.textContent = "Details";
        //Tilføjer en klasse, så det er muligt at style i CSS
        detailsButton.classList.add("details-button");
        //Når man klikker, skal der køres funktionen show details. 
        detailsButton.onclick = () => showDetailsInPopup(food.foodID);
        //Herunder tilføjes knappen til alle rækker i tabellen
        detailsCell.appendChild(detailsButton);
        foodRow.appendChild(detailsCell);
        tableBody.appendChild(foodRow);
    }

}


//Kører funktionen med apiet og placerer det i tabellen
loadIntoTable(apiUrl, document.getElementById("foodTable"));

// Funktionen der skal køre når der trykkes på detail knappen
async function showDetailsInPopup(foodID) {
    //Jeg kalder på funktionen sortKeyFoodDetails, og venter på at den svarer
    let sortDetails = await sortKeyFoodDetails(foodID);
    //Hvis der er detaljer om fødevareren, så oprettes en besked streng med teksten: Details for samt værdien bliver sat ind
    if (sortDetails) {
        let detailsMessage = `Details for foodID nr. ${foodID}:\n\n`;

        //Jeg itererer gennem alle sortkeys i sortkeys objektet
        Object.keys(sortDetails).forEach(key => {
            //Alle steder hvor der står SortKey, vil blive erstattet med en tom streng
            let newKeyName = sortKeyNames[key.replace('SortKey', '')];
            //Der tilføjes beskedstrengen og de tilhørende værdier 
            detailsMessage += `${newKeyName}: ${sortDetails[key]}\n`;
        });
        //Der vises en popup besked med det udvalgte data
        alert(detailsMessage);
        //Hvis der ikke er nogle detaljer om det pågældende foodID, så udskrives nedenstående i konsollen. 
    } else {
        console.error('No details fetched for foodID:', foodID);
    }
}

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

            //Hvis dataen er defineret og hvis arrayet har mindst et element og hvis det første element indeholder resVal, så tilføjes detaljerne til detail objektet. 
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

//Jeg ændrer navnene på mine sortkeys, for at give nogle mere beskrivende navne til brugerne
let sortKeyNames = {
    1030: "Energy (kcal/100g)",
    1110: "Protein (g/100g)",
    1220: "Carbohydrate (g/100g)",
    1240: "Fiber (g/100g)",
    1310: "Fat (g/100g)"
};
