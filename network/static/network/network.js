document.addEventListener('DOMContentLoaded', function() {

    getArticles();

    let currentPage = 1;

    //Hide profile initially
    document.querySelector('#profilediv').style.display = 'none';

    //Load all posts by default
    loadPosts('all', page = 1);

    const thePostForm = document.querySelector('#postform');

    //Selection of following posts button and all posts button
    const allPostsBtn = document.querySelector('#allposts');
    const flwBtn = document.querySelector('#flwposts');
    allPostsBtn.addEventListener('click', function() {
        currentPage = 1;
        loadPosts('all', currentPage);
    })
    flwBtn.addEventListener('click', function() { 
        currentPage = 1;
        loadPosts('following', currentPage);
    })

    const theUser = document.querySelector('#theusername').innerHTML;
    const profileBtn = document.querySelector('#profilebtn');
    profileBtn.addEventListener('click', function() {
        currentPage = 1;
        getProfile(theUser, currentPage);
    })

    let prevBtn = document.querySelector('#prevpage');
    let nextBtn = document.querySelector('#nextpage');

    //Increments page count upon click on next button
    nextBtn.addEventListener('click', function() {
        currentPage++;
        const currentView = history.state.view;
        if (currentView === 'profile') {
            let viewUser = history.state.username;
            getProfile(viewUser, currentPage);
        }
        else {
            loadPosts(`${currentView}`, currentPage);
        }

        document.querySelector('#pagenum').innerHTML = currentPage;
    })

    //Decrements page count upon click of previous button
    prevBtn.addEventListener('click', function() {
        currentPage--;
        const currentView = history.state.view;
        if (currentView === 'profile') {
            let viewUser = history.state.username;
            getProfile(viewUser, currentPage);
        }
        else {
            loadPosts(`${currentView}`, currentPage);
        }

        document.querySelector('#pagenum').innerHTML = currentPage;
    })

    thePostForm.addEventListener('submit', makePost);
    
    //Handles back and forward clicking of browser
    window.addEventListener('popstate', function(event){
        const newState = event.state;

        if (newState && newState.view) {
            switch(newState.view) {
                case 'all':
                    loadPosts('all', newState.page);
                    break;
                case 'following':
                    loadPosts('following', currentPage);
                    break;
                case 'profile':
                    getProfile(newState.username, currentPage);
            }
        }
    })
})


function loadPosts(setting, page) {

    document.querySelector('#flwbtn').style.display = 'none';

    fetch(`/theposts/${setting}?page=${page}`, {
        method: 'GET',
        headers: {
            'Content-Type' : 'application/json'
        },
    })
    .then(response => response.json())
    .then(json => {

        if (json.postlength > 10) {
            document.querySelector('#pagebtns').style.display = 'inherit';
        }
        else if (json.postlength <= 10) {
            document.querySelector('#pagebtns').style.display = 'none';
        }

        //Handles disabling and enabling of prev and next buttons
        if (page === 1) {
            document.querySelector('#prevpage').disabled = true;
            document.querySelector('#prevpage').style.color = '#C2C2C2';
        }
        else {
            document.querySelector('#prevpage').disabled = false;
            document.querySelector('#prevpage').style.color = '#6C1891';
        }

        if (page === (Math.ceil(json.postlength / 10))) {
            document.querySelector('#nextpage').disabled = true;
            document.querySelector('#nextpage').style.color = '#C2C2C2';
        }
        else {
            document.querySelector('#nextpage').disabled = false;
            document.querySelector('#nextpage').style.color = '#6C1891';
        }

        document.querySelector('#pagenum').innerHTML = page;

        switch(setting) {
            case 'all':

                history.pushState({view: 'all', page: `${page}`}, "", 'home');

                document.querySelector('#flwpostsdiv').style.display = 'none';
                document.querySelector('#profilediv').style.display = 'none';
                document.querySelector('#postformdiv').style.display = 'block';

                document.querySelector('#flwpostsdiv').innerHTML = '';

                const allDiv = document.querySelector('#allpostsdiv');
                allDiv.innerHTML = '';
                allDiv.style.display = 'block';

                document.querySelector('#header3').innerHTML = 'Home';

                json.theposts.forEach((post) => {

                    renderPost(post, allDiv);
                })
                break;

            case 'following':

                history.pushState({view: 'following'}, "", 'following');

                document.querySelector('#allpostsdiv').style.display = 'none';
                document.querySelector('#profilediv').style.display = 'none';
                document.querySelector('#postformdiv').style.display = 'block';

                document.querySelector('#allpostsdiv').innerHTML = '';

                const flwDiv = document.querySelector('#flwpostsdiv');
                flwDiv.innerHTML = '';
                flwDiv.style.display = 'block';

                document.querySelector('#header3').innerHTML = 'Following';

                json.theposts.forEach((post) => {

                    renderPost(post, flwDiv);
                })
        }
    })
    .catch(error => {
        console.log('Error loading posts', error);
    })
}

function makePost(event) {

    event.preventDefault();
    //Collect text from user's submission
    let theMessage = document.querySelector('#id_thepost').value;

    const theToken = document.getElementsByName('csrfmiddlewaretoken')[0].value;

    fetch('/makepost', {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json',
            'X-CSRFToken': theToken
        },
        body: JSON.stringify({
            thetext: theMessage,
        })
    })
    .then(response => response.json())
    .then(json => {

        let newPost = document.createElement('div');
        newPost.className = 'slide-in';
        newPost.innerHTML = `
        <div id="thispost-${json.newpost.id}">
            <div class="row">
                <div class="col text-start">
                    <div class="d-flex align-items-center">
                        <div style="width: 3vh; height: 3vh; font-size: 1.4vh;" class="circle">${json.newpost.user[0].toUpperCase()}${json.newpost.user[json.newpost.user.length - 1].toUpperCase()}</div>
                        <button class="mt-1" onclick="getProfile('${json.newpost.user}')"><h6> ${json.newpost.user} </h6></button>
                    </div>
                </div>
                <div class="col text-end">
                    ${json.newpost.time}<br>
                </div>
            </div>
        </div>
        <div id="postcontent-${json.newpost.id}">${json.newpost.content}</div>
        <div class="d-flex align-items-center">
            <div class="col">
                <button class="mt-2" onclick="updateLikes(${json.newpost.id}, ${json.newpost.likes.length})" id="likebutton-${json.newpost.id}"><i class="bi bi-heart"></i> ${json.newpost.likes.length}</button>
            </div>
            <div class="col d-flex justify-content-end">
                <button onclick="editPost(${json.newpost.id})" id="editbutton-${json.newpost.id}" style="display: block;">Edit <i class="bi bi-pencil-square"></i></button>
            </div>
        </div>
        `

        newPost.style.backgroundColor = '#EBE4F0';
        newPost.style.borderRadius = '2px';
        newPost.style.padding = '10px';
        newPost.style.border = '1px solid #D9CCE3';
        newPost.style.marginBottom = '10px';

        let allDiv = document.querySelector('#allpostsdiv');
        let firstPost = allDiv.firstChild;

        allDiv.insertBefore(newPost, firstPost);
        document.querySelector('.slide-in').style.animationPlayState = 'running';
    })
    .catch(error => {
        console.log('Error making post', error);
    })

    document.querySelector('#id_thepost').value = '';
}

function updateLikes(thePostId, prevLikes) {

    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    fetch('updatelikes', {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json',
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({
            postid: thePostId
        })
    })
    .then(response => response.json())
    .then(apost => {
        const postLikes = document.querySelector(`#likebutton-${thePostId}`)

        //Sets new values for the parameters of the updateLikes function for the selected button
        postLikes.onclick = function() {
            updateLikes(thePostId, apost[0].likes.length)
        }

        if (prevLikes < apost[0].likes.length) {
            postLikes.innerHTML = `<i class="bi bi-heart-fill" style="color: red"></i> ${apost[0].likes.length}`;
        }
        else if (prevLikes > apost[0].likes.length) {
            postLikes.innerHTML = `<i class="bi bi-heart"></i> ${apost[0].likes.length}`;
        }
    })
    .catch(error => {
        console.log('Error updating likes', error);
    })
}

function getProfile(thisUser, page) {

    if (page === undefined) {
        page = 1;
    }

    fetch(`profile/${thisUser}?page=${page}`, {
        method: 'GET',
        headers: {
            'Content-Type' : 'application/json'
        }
    })
    .then(response => response.json())
    .then(json => {

        if (json.posts > 10) {
            document.querySelector('#pagebtns').style.display = 'inherit';
        }
        else if (json.posts <= 10) {
            document.querySelector('#pagebtns').style.display = 'none';
        }

            //Handles disabling and enabling of prev and next buttons
        if (page === 1) {
            document.querySelector('#prevpage').disabled = true;
            document.querySelector('#prevpage').style.color = '#C2C2C2';
        }
        else {
            document.querySelector('#prevpage').disabled = false;
            document.querySelector('#prevpage').style.color = '#6C1891';
        }

        if (page === (Math.ceil(json.posts / 10))) {
            document.querySelector('#nextpage').disabled = true;
            document.querySelector('#nextpage').style.color = '#C2C2C2';
        }
        else {
            document.querySelector('#nextpage').disabled = false;
            document.querySelector('#nextpage').style.color = '#6C1891';
        }

        document.querySelector('#pagenum').innerHTML = page;

        document.querySelector('#flwpostsdiv').innerHTML = '';
        document.querySelector('#allpostsdiv').innerHTML = '';

        const prfUser = document.querySelector('#theusername').innerHTML;

        const flwUserBtn = document.querySelector('#flwbtn');

        if (prfUser != json.profile.user) {
            flwUserBtn.style.display = 'block';
        }
        else {
            flwUserBtn.style.display = 'none';
        }

        flwUserBtn.onclick = function() {
            followUnfollow(thisUser)
        }

        //Checks if user already follows the profile
        if (json.profile.followers.includes(prfUser)) {
            flwUserBtn.innerHTML = 'Unfollow';
        }
        else {
            flwUserBtn.innerHTML = 'Follow'
        }

        document.querySelector('#flwpostsdiv').style.display = 'none';
        document.querySelector('#allpostsdiv').style.display = 'none';
        document.querySelector('#postformdiv').style.display = 'none';

        const theProfile = document.querySelector('#profilediv');
        theProfile.style.display = 'block';

        //Sets text for profile "picture"
        document.querySelector('#circlediv').innerHTML = `${thisUser[0].toUpperCase()}${thisUser[thisUser.length - 1].toUpperCase()}`;

        if (prfUser === thisUser) {
            document.querySelector('#header3').innerHTML = 'Your Profile';
        }
        else {
            document.querySelector('#header3').innerHTML = `${thisUser}'s Profile`;
        }
        
        let accountBanner = document.querySelector('#accountinfo');

        accountBanner.innerHTML = `
        <div class="container py-3" style="background-color: #39363B; color: white; border-radius: 2px;">
            <div class="row">
                <div class="col">
                    Followers: ${json.profile.followers.length}
                </div>
                <div class="col">
                    Following: ${json.profile.following.length}
                </div>
                <div class="col">
                    Posts: ${json.posts}
                </div>
            </div>
            </div>
        `

        const userPosts = document.querySelector('#userposts');
        userPosts.innerHTML = '';

        json.theseposts.forEach((theseposts) => {

            renderPost(theseposts, userPosts);
        })

        history.pushState({view: `profile`, username: `${thisUser}`, page: `${page}`}, "", `${thisUser}`);
    })
    .catch(error => {
        console.log('Error fetching profile', error);
    })
}

function renderPost(apost, thisDiv) {

    let aUser = document.querySelector('#theusername').innerHTML;

    //Checks if user is currently listed in the likes of the post
    let hasLiked = false;

    if (apost.likes.includes(aUser)) {
        hasLiked = true;
    }

    //Sets display property of edit button
    const isAuthor = aUser === apost.user;
    const btnDisplay = isAuthor ? 'block' : 'none';

    let aDiv = document.createElement('div');

    //Displays empty heart if user hasn't liked the post. Otherwise, displays empty heart
    if (!hasLiked) {
        aDiv.innerHTML = `
        <div id="thispost-${apost.id}">
            <div class="row">
                <div class="col text-start">
                    <div class="d-flex align-items-center">
                        <div style="width: 3vh; height: 3vh; font-size: 1.4vh;" class="circle">${apost.user[0].toUpperCase()}${apost.user[apost.user.length - 1].toUpperCase()}</div>
                        <button class="mt-1" onclick="getProfile('${apost.user}')"><h6> ${apost.user} </h6></button>
                    </div>
                </div>
                <div class="col text-end">
                    ${apost.time}<br>
                </div>
            </div>
        </div>
        <div id="postcontent-${apost.id}">${apost.content}</div>
        <div class="d-flex align-items-center">
            <div class="col">
                <button class="mt-2" onclick="updateLikes(${apost.id}, ${apost.likes.length})" id="likebutton-${apost.id}"><i class="bi bi-heart"></i> ${apost.likes.length}</button>
            </div>
            <div class="col d-flex justify-content-end">
                <button onclick="editPost(${apost.id})" id="editbutton-${apost.id}" style="display: ${btnDisplay}">Edit <i class="bi bi-pencil-square"></i></button>
            </div>
        </div>
        `
    }
    else {
        aDiv.innerHTML = `
        <div id="thispost-${apost.id}">
            <div class="row">
                <div class="col text-start">
                    <div class="d-flex align-items-center">
                        <div style="width: 3vh; height: 3vh; font-size: 1.4vh" class="circle">${apost.user[0].toUpperCase()}${apost.user[apost.user.length - 1].toUpperCase()}</div>
                        <button class="mt-1" onclick="getProfile('${apost.user}')"><h6> ${apost.user} </h6></button>
                    </div>
                </div>
                <div class="col text-end">
                    ${apost.time}<br>
                </div>
            </div>
        </div>
        <div id="postcontent-${apost.id}">${apost.content}</div>
        <div class="d-flex align-items-center">
            <div class="col">
                <button class="mt-2" onclick="updateLikes(${apost.id}, ${apost.likes.length})" id="likebutton-${apost.id}"><i class="bi bi-heart-fill" style="color: red;"></i> ${apost.likes.length}</button>
            </div>
            <div class="col d-flex justify-content-end">
                <button onclick="editPost(${apost.id})" id="editbutton-${apost.id}" style="display: ${btnDisplay}">Edit <i class="bi bi-pencil-square"></i></button>
            </div>
        </div>
        `
    }

    aDiv.style.backgroundColor = '#EBE4F0';
    aDiv.style.borderRadius = '2px';
    aDiv.style.padding = '10px';
    aDiv.style.border = '1px solid #D9CCE3';
    aDiv.style.marginBottom = '10px';

    thisDiv.appendChild(aDiv);
}

function followUnfollow(someUser) {

    let aToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    fetch(`follow/${someUser}`, {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json',
            'X-CSRFToken': aToken
        }
    })
    .then(response => response.json())
    .then((json) => {
        console.log(json.message)
        //Gets profile again after follow action
        if (history.state.view === 'profile') {
            getProfile(someUser, history.state.page)
        }
    })
    .catch(error => {
        console.log('Error following/unfollowing', error);
    })
}

function editPost(postid) {

    let aToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    //Changes edit button to a save button once clicked
    let theContentDiv = document.querySelector(`#postcontent-${postid}`);
    let theContent = theContentDiv.innerHTML;
    let editBtn = document.querySelector(`#editbutton-${postid}`);

    let saveBtn = document.createElement('button');
    saveBtn.innerHTML = `Save <i class="bi bi-box-arrow-down"></i>`;
    editBtn.replaceWith(saveBtn);

    //Replaces the content field with a textarea that populates the with text from the original post
    const editField = document.createElement('textarea');
    editField.id = 'editarea';
    theContentDiv.replaceWith(editField);
    editField.className = 'form-control';
    editField.style.marginTop = '2px';
    editField.style.marginBottom = '2px';
    editField.value = theContent;

    saveBtn.addEventListener('click', function() {
        
        let newContent = editField.value

        fetch(`/editpost/${postid}`, {
            method: 'PUT',
            headers: {
                'Content-Type' : 'application/json',
                'X-CSRFToken': aToken
            },
            body: JSON.stringify({
                thetext: newContent,
            })
        })
        .then((response) => {
            if (response.ok) {
                saveBtn.replaceWith(editBtn);
                theContentDiv.innerHTML = newContent;
                editField.replaceWith(theContentDiv);
            }
        })
        .catch(error => {
            console.log('Error editing post', error);
        })
    }) 
}

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

        //Updates href to have appropriate link
        let tourLink = document.getElementById("tourlink")
        tourLink.href = chosenTour.link;
        
    }).catch(error => {
        console.error('Error fetching tourism news:', error);
    });
};