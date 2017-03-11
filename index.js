"use strict";

var express = require('express')
var bodyParser = require('body-parser');
var https = require('https');
var multer = require('multer'); // v1.0.5
var upload = multer(); // for parsing multipart/form-data
var app = express()
var fs = require('fs');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(express.static('public'));

app.get('/', function (req, res) {
    res.send("Hello World");
    console.log("Something recieved !!");
})

app.post('/', function (req, res) {

    var api_req = req.body.result;
    var action = api_req.action;
    var params = api_req.parameters;

    console.log('Got a API.ai POST request: ' + action);
    console.log(params);



    try {

        let response = createMessage("آسف، مش قادر أنفذ طلبك الآن !");
        switch (action) {
            case "searchForBook":
                response = searchForBook(params);
                break;
            case "requestForBooks":
                response = requestForBooks(params);
                break;
            case "makeBookOrder":
                response = makeBookOrder(params);
                break;
            case "getBooksSuggestions":
                response = getBooksSuggestions(params);
                break;
        }

        res.send(response);

    } catch (error) {
        console.log(error);
        res.send(createMessage("آسف، مش قادر أنفذ طلبك الآن !"));
    }
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
});

/*
* All Services
*/

function makeBookOrder(params) {
    let bookname = params.bookname;
    let email = params.email;
    let text = "وصل الطلب يا صديق، إن شاء الله في أقرب وقت رايح يصلك إيميل مني ومعاه مرفق نسخة الكترونية لكتاب" + " \'" + bookname + "\'" + ".. تمام ؟! :)";
    return createMessage(text);
}

function searchForBook(params) {
    let bookname = params.bookname;
    let list = filterBooksList(bookname);

    if (list.length > 0) {

        let message = createMessage("");
        message.data = createFacebookCards(Math.min(5, list.length));
        message.contextOut = ["ar_context_book_found"];

        let cardsList = message.data.facebook.attachment.payload.elements;
        cardsList.map((card, i) => {
            card.title = list[i];
            card.subtitle = "من مجموعتي الخاصة للكتب التاريخية";
            card.image_url = 'https://img.clipartfox.com/12a655303eb40afc457c0031f8f41144_free-open-book-clipart-public-open-book-clipart_527-298.jpeg';
            card.buttons = [
                createFacebookCardButton("اطلب الكتاب", "اطلب كتاب اسمه " + list[i])
            ];
        });

        return message;
    } else {

        return createMessage("مع الآسف، ما في شيء عندي اسمه هيك");
    }
}

function filterBooksList(query) {

    let list = JSON.parse(fs.readFileSync(__dirname + '/public/list_history.json', 'utf8'));
    list = list.concat(JSON.parse(fs.readFileSync(__dirname + '/public/list_adab.json', 'utf8')));
    list = list.concat(JSON.parse(fs.readFileSync(__dirname + '/public/list_fikr.json', 'utf8')));
    list = list.concat(JSON.parse(fs.readFileSync(__dirname + '/public/list_history.json', 'utf8')));
    list = list.concat(JSON.parse(fs.readFileSync(__dirname + '/public/list_philosophy.json', 'utf8')));
    list = list.concat(JSON.parse(fs.readFileSync(__dirname + '/public/list_psychology.json', 'utf8')));
    list = list.concat(JSON.parse(fs.readFileSync(__dirname + '/public/list_random.json', 'utf8')));

    return list.filter(item => {
        return item.indexOf(query) > -1;
    });
}

function randomBooksForSubject(subject) {

    let list;
    switch (subject) {
        case "فلسفة":
            list = JSON.parse(fs.readFileSync(__dirname + '/public/list_philosophy.json', 'utf8'));
            break;
        case "أدب":
        case "شعر":
        case "رواية":
            list = JSON.parse(fs.readFileSync(__dirname + '/public/list_adab.json', 'utf8'));
            break;
        case "فكري":
            list = JSON.parse(fs.readFileSync(__dirname + '/public/list_fikr.json', 'utf8'));
            break;
        case "تاريخ":
            list = JSON.parse(fs.readFileSync(__dirname + '/public/list_history.json', 'utf8'));
            break;
        default:
            list = JSON.parse(fs.readFileSync(__dirname + '/public/list_random.json', 'utf8'));
    }
    return list;
}


function requestForBooks(params) {

    let subject = params.ar_subjects;
    let message = createMessage("شوف هالقائمة اللي جبتلك اياها:");
    message.followupEvent = {
        name: "books_requested",
        data: {
            "ar_subjects": subject
        }
    };

    return message;
}

function getBooksSuggestions(params) {

    let subject = params.ar_subjects;
    let books = randomBooksForSubject(subject);

    let message = createMessage("شوف هالقائمة اللي جبتلك اياها:");
    message.data = createFacebookCards(5);

    let cardsList = message.data.facebook.attachment.payload.elements;
    cardsList.map((card, i) => {
        card.title = books[i];
        card.subtitle = "من مجموعتي الخاصة للكتب التاريخية";
        card.image_url = 'https://img.clipartfox.com/12a655303eb40afc457c0031f8f41144_free-open-book-clipart-public-open-book-clipart_527-298.jpeg';
        card.buttons = [
            createFacebookCardButton("اطلب الكتاب", "اطلب كتاب اسمه " + books[i])
        ];
    });

    return message;
}

function createMessage(text, context) {

    return {
        speech: text,
        displayText: text,
        data: null,
        contextOut: (context) ? [context] : null,
        source: "botchallenge_suhayb"
    }
}


function createFacebookCardButton(title, payload) {
    return {
        "type": "postback",
        "title": title,
        "payload": payload || title
    }
}
function createFacebookCards(cardsNum) {

    let count = (cardsNum > 10) ? 10 : cardsNum;
    let cards = [];
    for (var i = 0; i < count; i++) {
        cards.push({
            "title": "Card " + (i + 1),
            "image_url": null,
            "subtitle": null,
            "buttons": null
        });
    }

    return {
        "facebook": {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": cards
                }
            }
        }
    }
}

function createFacebookQuickReplies(replies) {

    let list = replies.map(reply => {
        return {
            "content_type": "text",
            "title": reply,
            "payload": null
        }
    });

    return {
        "facebook": {
            "text": "Pick a color:",
            "quick_replies": list
        }
    }
}