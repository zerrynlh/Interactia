document.addEventListener('DOMContentLoaded', function() {

    getArticles();

})

//Fetches business related and tourism articles, code inspired from my S2S Weather project
function getArticles() {

    //Random selection of article number
    let busiNum;
    let tourNum;

    //Fetches business news
    fetch('https://newsdata.io/api/1/news?apikey=pub_299742dd85b76e3663e0228ccb8ac0cbf2a86&category=business&language=en')
    .then((response) => {
        //Checks for valid response
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        return response.json();
    })
    .then(json => {
        
        //Gets length of JSON results
        let busiLength = json.results.length;

        /*Recursive function to choose a random index that is less than the length of the results array in
        the JSON response*/
        function busiRandom() {

            busiNum = Math.floor(Math.random() * 50);
            if (busiNum >= busiLength) {
                return busiRandom();
            }

            //Chooses random business article and checks that an image exists
            let busiArticle = json.results[busiNum];

            if (busiArticle.image_url === null) {
                return busiRandom();
                }
                return busiArticle;
        }

        //Function called and business news article displayed
        let chosenBusi = busiRandom();
        let busiDisplay = document.getElementById("busi");
        busiDisplay.innerHTML = chosenBusi.title;

        //Image from article is displayed
        let busiImage = document.getElementById("busiimage");
        busiImage.src = chosenBusi.image_url;
        console.log(busiImage.src)

        //Updates href to have appropriate link
        let busiLink = document.getElementById("busilink")
        busiLink.href = chosenBusi.link;

    }).catch(error => {
        console.error('Error fetching business news:', error);
    });

    //Fetches tourism article
    fetch('https://newsdata.io/api/1/news?apikey=pub_299742dd85b76e3663e0228ccb8ac0cbf2a86&category=tourism&language=en')
    .then((response) => {
        //Checks for valid response
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        return response.json();
    })
    .then(json => {
        
        //Gets length of JSON results
        let tourLength = json.results.length;

        /*Recursive function to choose a random index that is less than the length of the results array in
        the JSON response*/
        function tourRandom() {

            tourNum = Math.floor(Math.random() * 50);
            if (tourNum >= tourLength) {
                return tourRandom();
            }

            //Chooses random tourism article and checks that an image exists
            let tourArticle = json.results[tourNum];

            if (tourArticle.image_url === null) {
                return tourRandom();
                }
                return tourArticle;
        }

        //Function called and tourism news article displayed
        let chosenTour = tourRandom();
        let tourDisplay = document.getElementById("tour");
        tourDisplay.innerHTML = chosenTour.title;

        //Image from article is displayed
        let tourImage = document.getElementById("tourimage");
        tourImage.src = chosenTour.image_url;
        console.log(tourImage.src)

        //Updates href to have appropriate link
        let tourLink = document.getElementById("tourlink")
        tourLink.href = chosenTour.link;
        
    }).catch(error => {
        console.error('Error fetching tourism news:', error);
    });
};