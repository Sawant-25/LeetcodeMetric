document.addEventListener("DOMContentLoaded", function(){

    const searchbutton=document.getElementById("search-btn");
    const usernameInput=document.getElementById("user-input");
    const statsContainer=document.querySelector(".stats-container");
    const easyProgressCircle=document.querySelector(".easy-progress");
    const mediumProgressCircle=document.querySelector(".medium-progress");
    const hardProgressCircle=document.querySelector(".hard-progress");
    const easyLabel=document.querySelector("#easy-label");
    const mediumLabel=document.querySelector("#medium-label");
    const hardLabel=document.querySelector("#hard-label");
    const cardStatsContainer=document.querySelector(".stats-card");

    // to validate username entered by the user, it returns true or false based on a regex.
    function validateUsername(username){
        if(username.trim()=== ""){
            alert("Username should not be empty!");
            return false;
        }
        const regex=/^[a-zA-Z0-9_-]{1,15}$/;
        const isMatching=regex.test(username);
        if(!isMatching){
            alert("Invalid Username");
        }
        return isMatching;

    }


    // if username is valid then fetch data for that username using API call
    async function fetchUserDetails(username){
        // const url=`https://leetcode.com/graphql`;
        try {
            searchbutton.textContent="Searching..";
            searchbutton.disabled=true;
            // const response =await fetch(url);

            const proxyUrl='https://cors-anywhere.herokuapp.com/';
            const targetUrl = 'https://leetcode.com/graphql/';
 // we concatenated both url and send request to demo server 
 // then demo server will ignore firsturl and sends request to secondurl
 // Heroku shut down public access for cors-anywhere unless you visit their demo access link to temporarily enable it.
// If you open:
// https://cors-anywhere.herokuapp.com/corsdemo
// …and click "Request temporary access to the demo server",
// then your fetch will work — but only for a few minutes.
            const myHeaders = new Headers();
            myHeaders.append("content-type", "application/json");

             const graphql = JSON.stringify({
            query: "\n    query userSessionProgress($username: String!) {\n  allQuestionsCount {\n    difficulty\n    count\n  }\n  matchedUser(username: $username) {\n    submitStats {\n      acSubmissionNum {\n        difficulty\n        count\n        submissions\n      }\n      totalSubmissionNum {\n        difficulty\n        count\n        submissions\n      }\n    }\n  }\n}\n    ",
            variables: { "username": `${username}` }
        })
        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: graphql,
            redirect:"follow"
        };

        const response=await fetch(proxyUrl+targetUrl,requestOptions);
        console.log("Fetch status:", response.status);
            if(!response.ok){
                 const errorText = await response.text();
            console.error("API error response:", errorText);
                throw new Error("Unable to fetch the user details!");
            }
            const parsedData =await response.json();
            console.log("Fetched Data:",parsedData);

            displayUserData(parsedData);
        } catch(error){
            console.error("Error fetching or displaying data:", error);
            statsContainer.innerHTML="<p>No data found</P";
        }
        finally{
            searchbutton.textContent="Search";
            searchbutton.disabled=false;
        }


    }


    //The data we get as a response when we search for an username looks like-
    // To fetch what we want form that we write following logic
    //  {"data":{"allQuestionsCount":[{"difficulty":"All","count":3647},{"difficulty":"Easy","count":890},{"difficulty":"Medium","count":1897},{"difficulty":"Hard","count":860}],"matchedUser":{"submitStats":{"acSubmissionNum":[{"difficulty":"All","count":64,"submissions":80},{"difficulty":"Easy","count":31,"submissions":37},{"difficulty":"Medium","count":32,"submissions":42},{"difficulty":"Hard","count":1,"submissions":1}],"totalSubmissionNum":[{"difficulty":"All","count":64,"submissions":121},{"difficulty":"Easy","count":31,"submissions":49},{"difficulty":"Medium","count":32,"submissions":71},{"difficulty":"Hard","count":1,"submissions":1}]}}}}
    function displayUserData(parsedData){
        const totalQues=parsedData.data.allQuestionsCount[0].count;
        const totalEasyQues=parsedData.data.allQuestionsCount[1].count;
        const totalMedQues=parsedData.data.allQuestionsCount[2].count;
        const totalHardQues=parsedData.data.allQuestionsCount[3].count;

        const solvedTotalQues=parsedData.data.matchedUser.submitStats.acSubmissionNum[0].count;
        const solvedTotalEasyQues=parsedData.data.matchedUser.submitStats.acSubmissionNum[1].count;
        const solvedTotalMedQues=parsedData.data.matchedUser.submitStats.acSubmissionNum[2].count;
        const solvedTotalHardQues=parsedData.data.matchedUser.submitStats.acSubmissionNum[3].count;
         
        updateProgress(solvedTotalEasyQues,totalEasyQues,easyLabel,easyProgressCircle);
        updateProgress(solvedTotalMedQues,totalMedQues,mediumLabel,mediumProgressCircle);
        updateProgress(solvedTotalHardQues,totalHardQues,hardLabel,hardProgressCircle);
        

        const cardsData=[
            {
                label:"Overall Submissions",
                value:parsedData.data.matchedUser.submitStats.totalSubmissionNum[0].submissions
            },
            {
                label:"Overall Easy Submissions",
                value:parsedData.data.matchedUser.submitStats.totalSubmissionNum[1].submissions
            },
            {
                label:"Overall Medium Submissions",
                value:parsedData.data.matchedUser.submitStats.totalSubmissionNum[2].submissions
            },
            {
                label:"Overall Hard Submissions",
                value:parsedData.data.matchedUser.submitStats.totalSubmissionNum[3].submissions
            },
        ];

        console.log("Cards Data: ",cardsData);

        cardStatsContainer.innerHTML=cardsData.map(
            data=>
                `<div class="card">
                    <h4>${data.label}</h4>
                    <p>${data.value}</p>
                </div>`
            ).join("")
        
        // statsContainer.style.display="block";

    }


    function updateProgress(solved,total,label,circle){
        const progressDegree=(solved/total)*100;
        circle.style.setProperty("--progress-degree",`${progressDegree}%`);
        label.textContent=`${solved}/${total}`;
    }


    searchbutton.addEventListener("click",()=>{
        const username=usernameInput.value;
        if(validateUsername(username)){
            // clear previous user data
        easyLabel.textContent = "";
        mediumLabel.textContent = "";
        hardLabel.textContent = "";

        easyProgressCircle.style.setProperty("--progress-degree", "0%");
        mediumProgressCircle.style.setProperty("--progress-degree", "0%");
        hardProgressCircle.style.setProperty("--progress-degree", "0%");

        cardStatsContainer.innerHTML = "";

            // statsContainer.style.display="none";
            fetchUserDetails(username);
        }
    })


})