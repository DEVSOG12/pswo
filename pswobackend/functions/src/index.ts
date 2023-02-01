import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import fetch from "node-fetch";
const jsdom = require("jsdom")



  // Every 4 hours
export const checkRecord = functions.pubsub.schedule("every 4 hours").onRun(async (context) => {


    const url = "https://collegeofwooster.trufflestg.com/view-cart"
    var cookie =
    "PHPSESSID=soof8p6t3igt5t6t918l5qat1b; XSRF-TOKEN=eyJpdiI6IlVLVTBMejhnemE1V21YcmhhRHZmMlE9PSIsInZhbHVlIjoidWQ0QUhtNW9FOFlBSkhnTG5uNGJFaTBFL1ZaQUJ3NzZhRWk1V000MEttTVhwcVhwVUVlbit5QzlPaW15VXhnM0o5d1pBYVN4b0ZDZFluUUkvSGV6V2JXQ3dhOUN0OGh0UENCSXAzMEtqVXhDRmRHNkhKNWxDSkxsekxIM0NLMGYiLCJtYWMiOiI5ODZkNDVhMTQ1MmM4ZjM5ODZhNjg1OTJiNWFkMTBkNjFjMjRkYjUyYmM4ZmFmMWZiODFlYzViODczMGM0NTE3IiwidGFnIjoiIn0%3D; restaurantpos_session=eyJpdiI6IklhT0ZSMVpQZTM4dlpPUW1XSU5LeEE9PSIsInZhbHVlIjoiaTdTenMvaSs1WEYyaFQ5bjJJb1VBTHlrQnVPbmVJbWxsekE0TUw2QmNPVkdpKzBCN0xSMWR4ZWQ2UGFENE5hYXc0ZTVDbWlLNkNrU3gvdmF3N2ltdWJ2dDM1a3h6RVBhanQ2ak9LaFdxUDRhZFBGWFR1cVJYQStzNkU3cHYzTDYiLCJtYWMiOiJiZmY3YzBmNDg0ZWU0Mjc3OWQxYmJjMWI4M2IwZDg1NjAzYWFmMjQ1YTg5ZTZlMjMxZTEwMjlmYTY3OTVjN2NjIiwidGFnIjoiIn0%3D";
    cookie = "PHPSESSID=soof8p6t3igt5t6t918l5qat1b; XSRF-TOKEN=eyJpdiI6IlN6SlZFellaanYxbUlNanJQRE9vNnc9PSIsInZhbHVlIjoiUUd5TWNiS1FkaHhQY09mL2NKTUVkdGl6M1g1TmZSeWlWeEF5NFd2NXo2TWJrclBNY2M1Zi92N1R2eE1VQkticXlSQmpmbTNWQ0E2c2FGYmp4cXFyNlYzR3d2NmdPWWQzV0tUcy80TXVqYmFZZUVVeHh2SXNzaUNhMUE1eVRDRjYiLCJtYWMiOiJlNTliNWIwNjFlNGUxZWZjNzMwYTcwNGU0YmUxYzU1NmJlMTRlMGJlNDZiZmY3YTE4NDlkNTM2NWVjYTRjM2NlIiwidGFnIjoiIn0=; restaurantpos_session=eyJpdiI6IkV0TTZOS1ZIMWNGRlNyeXpQeEdSR2c9PSIsInZhbHVlIjoia2tTSUwrK1dVLzRyR1Q3OEdjM0tzYnUwNGFjalpteFhRQjFYb1g5elFsYVN2YlZVY2p5S3p3d3VLYzFobUtGcHBBNnhxZk1GN3d4ZDMwQW9ZcWlMZFA1ODJDMVBocyt1bDg3Vk9FUXE2amU1T0lpMXlkK1lUSmdHTHVPNXBIeW8iLCJtYWMiOiI0MDE5NTFjZmIzODI5ODljY2QzOTdiMmEyOTcwNGM1NDg4YmEyMjM0M2VhOTJiOTIxYzM1NmYzZjdjYzM1MTZlIiwidGFnIjoiIn0=";

    const res = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            "Cookie": cookie,
        },
    });

    const data = await res.text();

    // Extract p class="mt-2 pt-3 from response
   // define parser
   const { JSDOM } = jsdom
    global.DOMParser = new JSDOM().window.DOMParser

// parse the html


    const document = new JSDOM(data);

    const p = document.window.document.getElementsByClassName("mt-2 pt-3");
 // Get all element with tag name "p"
    const pa = document.window.document.getElementsByTagName("p");


    var plan = [];
    for (var i = 0; i < p.length; i++) {
        //  only last 3 characters
        var plan_name = p[i].textContent!.slice(-3);
        plan.push(plan_name);
    }
    
    // Check in all pa tags if there is a "Exempt" text
    for (var i = 0; i < pa.length; i++) {
        console.log(pa[i].textContent);
       // check if it starts with "Tax exempt"
        if (pa[i].textContent!.startsWith("Tax exempt")) {
            plan.push(pa[i].textContent);
        }

    }


    // initialize firebase
    admin.initializeApp();



    // Add to firestore if data is empty or has changed
    const db = admin.firestore();
    const docRef = db.collection("plans").doc("plan");

    const doc = await docRef.get();


    if (!doc.exists) {
        var milliseconds = new Date().getTime();

        console.log("No such document!");
        docRef.set({
            [milliseconds] : plan
        });
    } else {
        console.log("Document data:", doc.data());

        // Check if last plan is the same as the current plan doc.data() is a Map whose keys is milliseconds and value is plan, look for the latest time and check if the plan is the same

        var last_plan = doc.data()![Object.keys(doc.data()!).sort().pop()!];
        console.log(last_plan);
        
        if (last_plan[1] != plan[1]  || last_plan[2] != plan[2]) {
            var milliseconds = new Date().getTime();

            console.log("Change");
            docRef.update({
                [milliseconds] : plan
            });
        }
        else{
            console.log("No change");
        }
    }


});

// Check the lastest plan req
export const checkLastestPlan = functions.https.onRequest(async (req, res) => {

    // initialize firebase
    admin.initializeApp();

    // Add to firestore if data is empty or has changed
    const db = admin.firestore();
    const docRef = db.collection("plans").doc("plan");

    const doc = await docRef.get();

    if (!doc.exists) {
        console.log("No such document!");
        res.send("No such document!");
    } else {
        console.log("Document data:", doc.data());

        // Check if last plan is the same as the current plan doc.data() is a Map whose keys is milliseconds and value is plan, look for the latest time and check if the plan is the same

        var last_plan = doc.data()![Object.keys(doc.data()!).sort().pop()!];
        console.log(last_plan);
        res.send({[Object.keys(doc.data()!).sort().pop()!] : last_plan});
    }

});
