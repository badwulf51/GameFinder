// Lambda Function code for Alexa.

// Imported used
const Alexa = require("ask-sdk");
const https = require("https");
const http = require("http");

// Name used to initiate the application
const invocationName = "game finder";

// Session Attributes 
//   Alexa will track attributes for you, by default only during the lifespan of your session.
//   The history[] array will track previous request(s), used for contextual Help/Yes/No handling.
//   Set up DynamoDB persistence to have the skill save and reload these attributes between skill sessions.
function getMemoryAttributes() {
    const memoryAttributes = {
        "history": [],

        "launchCount": 0,
        "lastUseTimestamp": 0,

        "lastSpeechOutput": {},
    };
    return memoryAttributes;
};

// Remember only latest 20 intents 
const maxHistorySize = 20;

// 1. Intent Handlers =============================================
// Fallback intent works is called when Alexa is unable to hear what action the user wanted to call
const AMAZON_FallbackIntent_Handler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let previousSpeech = getPreviousSpeechOutput(sessionAttributes);

        return responseBuilder
            .speak('Sorry I didnt catch what you said, ' + stripSpeak(previousSpeech.outputSpeech))
            .reprompt(stripSpeak(previousSpeech.reprompt))
            .getResponse();
    },
};

// Cancel current actions intent. 'Alexa stop'
const AMAZON_CancelIntent_Handler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.CancelIntent';
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();


        let say = 'Okay, talk to you later! ';

        return responseBuilder
            .speak(say)
            .withShouldEndSession(true)
            .getResponse();
    },
};

// Help intent used to tell the user actions they can take
const AMAZON_HelpIntent_Handler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let history = sessionAttributes['history'];
        let intents = getCustomIntents();
        let sampleIntent = randomElement(intents);

        let say = 'You asked for help. ';

        let previousIntent = getPreviousIntent(sessionAttributes);
        if (previousIntent && !handlerInput.requestEnvelope.session.new) {
            say += 'Your last intent was ' + previousIntent + '. ';
        }
        // say +=  'I understand  ' + intents.length + ' intents, '

        say += ' Here something you can ask me, ' + getSampleUtterance(sampleIntent);

        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

// Exit intent used to exit the skill
const AMAZON_StopIntent_Handler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.StopIntent';
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();


        let say = 'Okay, talk to you later! ';

        return responseBuilder
            .speak(say)
            .withShouldEndSession(true)
            .getResponse();
    },
};

// Move the intent to the 'homepage'. Is used to ask the user what intent they want to call
const AMAZON_NavigateHomeIntent_Handler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.NavigateHomeIntent';
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from AMAZON.NavigateHomeIntent. ';


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

// Launch skill intent
const LaunchRequest_Handler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const responseBuilder = handlerInput.responseBuilder;

        let say = 'hello' + ' and welcome to ' + invocationName + ' ! Say help to hear some options.';

        let skillTitle = capitalize(invocationName);


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .withStandardCard('Welcome!',
            'Hello!\nThis is a card for your skill, ' + skillTitle,
            welcomeCardImg.smallImageUrl, welcomeCardImg.largeImageUrl)
            .getResponse();
    },
};

// End skill intent. Called when a given action is successful
const SessionEndedHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
        return handlerInput.responseBuilder.getResponse();
    }
};

// Find a game/location intent. Called by saying 'What is {game OR location}' and alexa will give information about said game/location
const FindGameIntent_Handler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'FindGameIntent';
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        // delegate to Alexa to collect all the required slots 
        const currentIntent = request.intent;
        if (request.dialogState && request.dialogState !== 'COMPLETED') {
            return handlerInput.responseBuilder
                .addDelegateDirective(currentIntent)
                .getResponse();

        }

        // For server side testing
        console.log("Inside  : " + request.intent.name);

        // Variable for what alexa will say to the user
        let say = '';

        // Gets slot values
        let slotValues = getSlotValues(request.intent.slots);

        // Check that the slot 'game' is not null and not empty
        if (slotValues.game.heardAs && slotValues.game.heardAs !== '') {

            // Base query
            var query = '/api/search/?api_key=229e0d62353bdc198fed73d614e8e087bd9966f8&format=json&query=';

            // Query plus the game slot formatted to replace spaces with '+' so the API understands the string
            query += slotValues.game.heardAs.split(' ').join('+')

            // Output the entire query for server testing
            console.log("www.giantbomb.com" + query);

            // Promise callback.
            // The promise callback is used to to make the asynchronous http request into synchronous request
            // Without the promise request the callback would be skipped and by the time Alexa has gotten the 
            // API data Alexa will have run the return statement at the end which is only used for errors.
            return new Promise((resolve) => {
                httpGet(query, (theResult) => {
                    // JSON object result of the request to the API
                    var json = JSON.parse(theResult);

                    // Request data from the api
                    console.log("Received : " + json);

                    // Check if the request has any data
                    if (json.number_of_total_results > 0) {
                        // If deck is not null and not emtpy
                        if (json.results[0].deck && json.results[0].deck != '') {
                            // Add deck (Description) to say string
                            say += json.results[0].deck;

                            // Prompt alexa to say and show something
                            resolve(handlerInput.responseBuilder
                                .speak(say)
                                .withStandardCard(slotValues.game.heardAs,
                                say,
                                json.results[0].image.small_url,
                                json.results[0].image.medium_url)
                                .getResponse());

                        } else {
                            say += "Couldn't find any details about " + slotValues.game.heardAs;

                            // Prompt alexa to say and show something
                            resolve(handlerInput.responseBuilder
                                .speak('Try again, ' + say + ". Or say exit to quit.")
                                .reprompt('Try again, ' + say)
                                .withStandardCard(slotValues.game.heardAs,
                                'Try again, ' + say + '. Or say exit to quit.',
                                'https://imgur.com/nBF0w5g.png',
                                'https://imgur.com/DUV58Zp.png')
                                .getResponse());
                        }
                    } else {
                        say += "couldn't find any details about " + slotValues.game.heardAs;

                        // Prompt alexa to say and show something
                        resolve(handlerInput.responseBuilder
                            .speak('Try again, ' + say + ". Or say exit to quit.")
                            .reprompt('Try again, ' + say)
                            .withStandardCard(slotValues.game.heardAs,
                            'Try again, ' + say + '. Or say exit to quit.',
                            'https://imgur.com/nBF0w5g.png',
                            'https://imgur.com/DUV58Zp.png')
                            .getResponse());
                    }
                });
            });
        } else {
            say += 'slot game is empty';
        }

        // Prompt alexa to say and show something
        return handlerInput.responseBuilder
            .speak('Try again, ' + say + ". Or say exit to quit.")
            .reprompt('Try again, ' + say)
            .withStandardCard('What is?',
            'Try again, ' + say + '. Or say exit to quit.',
            'https://imgur.com/nBF0w5g',
            'https://imgur.com/DUV58Zp.png')
            .getResponse();
    },
};

// Find a person intent. Called by saying 'who is {person}' and alexa will then give information about the character or person
const FindPersonIntent_Handler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'FindPersonIntent';
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        // Delegate to Alexa to collect all the required slots 
        const currentIntent = request.intent;
        if (request.dialogState && request.dialogState !== 'COMPLETED') {
            return handlerInput.responseBuilder
                .addDelegateDirective(currentIntent)
                .getResponse();

        }

        // For server side testing
        console.log("Inside  : " + request.intent.name);

        // Variable for what alexa will say to the user
        let say = '';

        // Gets slot values
        let slotValues = getSlotValues(request.intent.slots);

        // Check that the slot 'person' is not null and not empty
        if (slotValues.person.heardAs && slotValues.person.heardAs !== '') {

            // Base query
            var query = '/api/search/?api_key=229e0d62353bdc198fed73d614e8e087bd9966f8&format=json&query=';

            // Query plus the game slot formatted to replace spaces with '+' so the API understands the string
            query += slotValues.person.heardAs.split(' ').join('+')

            // Output the entire query for server testing
            console.log("www.giantbomb.com" + query);

            // Promise callback.
            // The promise callback is used to to make the asynchronous http request into synchronous request
            // Without the promise request the callback would be skipped and by the time Alexa has gotten the 
            // API data Alexa will have run the return statement at the end which is only used for errors.
            return new Promise((resolve) => {
                httpGet(query, (theResult) => {
                    // JSON object result of the request to the API
                    var json = JSON.parse(theResult);

                    // Request data from the api
                    console.log("Received : " + json);

                    // Check if the request has any data
                    if (json.number_of_total_results > 0) {
                        // If deck is not null and not emtpy
                        if (json.results[0].deck && json.results[0].deck != '') {
                            // Add deck (Description) to say string
                            say += json.results[0].deck;

                            // Check if theres data for first_appeared_in_game (First game character appeared in)
                            if (json.results[0].first_appeared_in_game.name != null) {
                                // Add first_appeared_in_game to say string
                                say += " First game appeared in was " + json.results[0].first_appeared_in_game.name;
                            }

                            // Prompt alexa to say and show something
                            resolve(handlerInput.responseBuilder
                                .speak(say)
                                .withStandardCard(slotValues.person.heardAs,
                                say,
                                json.results[0].image.small_url,
                                json.results[0].image.medium_url)
                                .getResponse());

                        } else {
                            say += "couldn't find any details about " + slotValues.person.heardAs;

                            // Prompt alexa to say and show something
                            resolve(handlerInput.responseBuilder
                                .speak('Try again, ' + say + ". Or say exit to quit.")
                                .reprompt('try again, ' + say)
                                .withStandardCard(slotValues.person.heardAs,
                                'Try again, ' + say + '. Or say exit to quit.',
                                'https://imgur.com/nBF0w5g.png',
                                'https://imgur.com/DUV58Zp.png')
                                .getResponse());
                        }
                    } else {
                        say += "couldn't find any details about " + slotValues.person.heardAs;

                        // Prompt alexa to say and show something
                        resolve(handlerInput.responseBuilder
                            .speak('Try again, ' + say + ". Or say exit to quit.")
                            .reprompt('Try again, ' + say)
                            .withStandardCard(slotValues.person.heardAs,
                            'Try again, ' + say + '. Or say exit to quit.',
                            'https://imgur.com/nBF0w5g.png',
                            'https://imgur.com/DUV58Zp.png')
                            .getResponse());
                    }
                });
            });
        } else {
            say += 'slot person is empty';
        }

        // Prompt alexa to say and show something
        return handlerInput.responseBuilder
            .speak('Try again, ' + say + ". Or say exit to quit.")
            .reprompt('Try again, ' + say)
            .withStandardCard('Who is?',
            'Try again, ' + say + '. Or say exit to quit.',
            'https://imgur.com/nBF0w5g.png',
            'https://imgur.com/DUV58Zp.png')
            .getResponse();
    },
};

// Fallback intent works like a typical try-catch statment where it runs when anything unexprected happends
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const request = handlerInput.requestEnvelope.request;

        console.log(`Error handled: ${error.message}`);
        // console.log(`Original Request was: ${JSON.stringify(request, null, 2)}`);

        return handlerInput.responseBuilder
            .speak(`Sorry, your skill got this error.  ${error.message} `)
            .reprompt(`Sorry, your skill got this error.  ${error.message} `)
            .getResponse();
    }
};

// 2. Constants ===========================================================================
// Here you can define static data, to be used elsewhere in your code.  For example: 
//    const myString = "Hello World";
//    const myArray  = [ "orange", "grape", "strawberry" ];
//    const myObject = { "city": "Boston",  "state":"Massachusetts" };

// TODO replace with your Skill ID (OPTIONAL).
const APP_ID = undefined;  // Removed for GitHub deployment

// Welcome card images
const welcomeCardImg = {
    smallImageUrl: "https://s3.amazonaws.com/skill-images-789/cards/card_plane720_480.png",
    largeImageUrl: "https://s3.amazonaws.com/skill-images-789/cards/card_plane1200_800.png"
};

// Display image 1 settings
const DisplayImg1 = {
    title: 'Jet Plane',
    url: 'https://s3.amazonaws.com/skill-images-789/display/plane340_340.png'
};

// Display image 2 settings
const DisplayImg2 = {
    title: 'Starry Sky',
    url: 'https://s3.amazonaws.com/skill-images-789/display/background1024_600.png'

};

// 3.  Helper Functions ===================================================================
function capitalize(myString) {
    return myString.replace(/(?:^|\s)\S/g, function (a) { return a.toUpperCase(); });
}

function randomElement(myArray) {
    return (myArray[Math.floor(Math.random() * myArray.length)]);
}

function stripSpeak(str) {
    return (str.replace('<speak>', '').replace('</speak>', ''));
}

function getSlotValues(filledSlots) {
    const slotValues = {};

    Object.keys(filledSlots).forEach((item) => {
        const name = filledSlots[item].name;

        if (filledSlots[item] &&
            filledSlots[item].resolutions &&
            filledSlots[item].resolutions.resolutionsPerAuthority[0] &&
            filledSlots[item].resolutions.resolutionsPerAuthority[0].status &&
            filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
            switch (filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
                case 'ER_SUCCESS_MATCH':
                    slotValues[name] = {
                        heardAs: filledSlots[item].value,
                        resolved: filledSlots[item].resolutions.resolutionsPerAuthority[0].values[0].value.name,
                        ERstatus: 'ER_SUCCESS_MATCH'
                    };
                    break;
                case 'ER_SUCCESS_NO_MATCH':
                    slotValues[name] = {
                        heardAs: filledSlots[item].value,
                        resolved: '',
                        ERstatus: 'ER_SUCCESS_NO_MATCH'
                    };
                    break;
                default:
                    break;
            }
        } else {
            slotValues[name] = {
                heardAs: filledSlots[item].value || '', // may be null 
                resolved: '',
                ERstatus: ''
            };
        }
    }, this);

    return slotValues;
}

function getExampleSlotValues(intentName, slotName) {

    let examples = [];
    let slotType = '';
    let slotValuesFull = [];

    let intents = model.interactionModel.languageModel.intents;
    for (let i = 0; i < intents.length; i++) {
        if (intents[i].name == intentName) {
            let slots = intents[i].slots;
            for (let j = 0; j < slots.length; j++) {
                if (slots[j].name === slotName) {
                    slotType = slots[j].type;

                }
            }
        }

    }
    let types = model.interactionModel.languageModel.types;
    for (let i = 0; i < types.length; i++) {
        if (types[i].name === slotType) {
            slotValuesFull = types[i].values;
        }
    }

    slotValuesFull = shuffleArray(slotValuesFull);

    examples.push(slotValuesFull[0].name.value);
    examples.push(slotValuesFull[1].name.value);
    if (slotValuesFull.length > 2) {
        examples.push(slotValuesFull[2].name.value);
    }


    return examples;
}

function sayArray(myData, penultimateWord = 'and') {
    let result = '';

    myData.forEach(function (element, index, arr) {

        if (index === 0) {
            result = element;
        } else if (index === myData.length - 1) {
            result += ` ${penultimateWord} ${element}`;
        } else {
            result += `, ${element}`;
        }
    });
    return result;
}

// Function used to get the JSON data from the API
// query - is the url path and query of the request
// callback - the returned data
function httpGet(query, callback) {
    // These are teh options ued to call the API
    // The entire URL is contained here along with a custom header
    // Custom header is required by the API 
    // https://www.giantbomb.com/forums/api-developers-3017/quick-start-guide-to-using-the-api-1427959/
    const options = {
        hostname: 'www.giantbomb.com',
        path: query + '&limit=1',
        headers: { 'User-Agent': 'Alexa Project Bot GMIT' },
        method: 'GET'
    };

    // This makes a request to the API using the options above
    var req = https.request(options, res => {
        res.setEncoding('utf8');
        var responseString = "";

        // Accept incoming data asynchronously
        res.on('data', chunk => {
            responseString = responseString + chunk;
        });

        // Return the data when streaming is complete
        res.on('end', () => {
            callback(responseString);
        });

    });
    // End connection
    req.end();
}

// Returns true if the skill is running on a device with a display (Echo Show, Echo Spot, etc.) 
// Enable your skill for display as shown here: https://alexa.design/enabledisplay 
function supportsDisplay(handlerInput) {
    const hasDisplay =
        handlerInput.requestEnvelope.context &&
        handlerInput.requestEnvelope.context.System &&
        handlerInput.requestEnvelope.context.System.device &&
        handlerInput.requestEnvelope.context.System.device.supportedInterfaces &&
        handlerInput.requestEnvelope.context.System.device.supportedInterfaces.Display;

    return hasDisplay;
}

// Returns a list of the custom intents intents 
function getCustomIntents() {
    const modelIntents = model.interactionModel.languageModel.intents;

    let customIntents = [];

    for (let i = 0; i < modelIntents.length; i++) {

        if (modelIntents[i].name.substring(0, 7) != "AMAZON." && modelIntents[i].name !== "LaunchRequest") {
            customIntents.push(modelIntents[i]);
        }
    }
    return customIntents;
}

// Sample utterance the user can use
function getSampleUtterance(intent) {
    return randomElement(intent.samples);
}

// Gets the previously used intent
function getPreviousIntent(attrs) {
    if (attrs.history && attrs.history.length > 1) {
        return attrs.history[attrs.history.length - 2].IntentRequest;

    } else {
        return false;
    }
}

// Gets previous output from Alexa 
function getPreviousSpeechOutput(attrs) {
    if (attrs.lastSpeechOutput && attrs.history.length > 1) {
        return attrs.lastSpeechOutput;

    } else {
        return false;
    }
}

// Time between calculator
function timeDelta(t1, t2) {

    const dt1 = new Date(t1);
    const dt2 = new Date(t2);
    const timeSpanMS = dt2.getTime() - dt1.getTime();
    const span = {
        "timeSpanMIN": Math.floor(timeSpanMS / (1000 * 60)),
        "timeSpanHR": Math.floor(timeSpanMS / (1000 * 60 * 60)),
        "timeSpanDAY": Math.floor(timeSpanMS / (1000 * 60 * 60 * 24)),
        "timeSpanDesc": ""
    };


    if (span.timeSpanHR < 2) {
        span.timeSpanDesc = span.timeSpanMIN + " minutes";
    } else if (span.timeSpanDAY < 2) {
        span.timeSpanDesc = span.timeSpanHR + " hours";
    } else {
        span.timeSpanDesc = span.timeSpanDAY + " days";
    }


    return span;

}

// Initiate memory attributes
const InitMemoryAttributesInterceptor = {
    process(handlerInput) {
        let sessionAttributes = {};
        if (handlerInput.requestEnvelope.session['new']) {

            sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

            let memoryAttributes = getMemoryAttributes();

            if (Object.keys(sessionAttributes).length === 0) {

                Object.keys(memoryAttributes).forEach(function (key) {  // initialize all attributes from global list 

                    sessionAttributes[key] = memoryAttributes[key];

                });

            }
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes);


        }
    }
};

// History requester
const RequestHistoryInterceptor = {
    process(handlerInput) {

        const thisRequest = handlerInput.requestEnvelope.request;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let history = sessionAttributes['history'] || [];

        let IntentRequest = {};
        if (thisRequest.type === 'IntentRequest') {

            let slots = [];

            IntentRequest = {
                'IntentRequest': thisRequest.intent.name
            };

            if (thisRequest.intent.slots) {

                for (let slot in thisRequest.intent.slots) {
                    let slotObj = {};
                    slotObj[slot] = thisRequest.intent.slots[slot].value;
                    slots.push(slotObj);
                }

                IntentRequest = {
                    'IntentRequest': thisRequest.intent.name,
                    'slots': slots
                };

            }

        } else {
            IntentRequest = { 'IntentRequest': thisRequest.type };
        }
        if (history.length > maxHistorySize - 1) {
            history.shift();
        }
        history.push(IntentRequest);

        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    }

};

const RequestPersistenceInterceptor = {
    process(handlerInput) {

        if (handlerInput.requestEnvelope.session['new']) {

            return new Promise((resolve, reject) => {

                handlerInput.attributesManager.getPersistentAttributes()

                    .then((sessionAttributes) => {
                        sessionAttributes = sessionAttributes || {};


                        sessionAttributes['launchCount'] += 1;

                        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

                        handlerInput.attributesManager.savePersistentAttributes()
                            .then(() => {
                                resolve();
                            })
                            .catch((err) => {
                                reject(err);
                            });
                    });

            });

        } // end session['new'] 
    }
};

const ResponseRecordSpeechOutputInterceptor = {
    process(handlerInput, responseOutput) {

        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        let lastSpeechOutput = {
            "outputSpeech": responseOutput.outputSpeech.ssml,
            "reprompt": responseOutput.reprompt.outputSpeech.ssml
        };

        sessionAttributes['lastSpeechOutput'] = lastSpeechOutput;

        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    }
};

const ResponsePersistenceInterceptor = {
    process(handlerInput, responseOutput) {

        const ses = (typeof responseOutput.shouldEndSession == "undefined" ? true : responseOutput.shouldEndSession);

        if (ses || handlerInput.requestEnvelope.request.type == 'SessionEndedRequest') { // skill was stopped or timed out 

            let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

            sessionAttributes['lastUseTimestamp'] = new Date(handlerInput.requestEnvelope.request.timestamp).getTime();

            handlerInput.attributesManager.setPersistentAttributes(sessionAttributes);

            return new Promise((resolve, reject) => {
                handlerInput.attributesManager.savePersistentAttributes()
                    .then(() => {
                        resolve();
                    })
                    .catch((err) => {
                        reject(err);
                    });

            });

        }

    }
};

function shuffleArray(array) {  // Fisher Yates shuffle! 

    let currentIndex = array.length, temporaryValue, randomIndex;

    while (0 !== currentIndex) {

        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

// 4. Exports handler function and setup ===================================================
const skillBuilder = Alexa.SkillBuilders.standard();
exports.handler = skillBuilder
    .addRequestHandlers(
    AMAZON_FallbackIntent_Handler,
    AMAZON_CancelIntent_Handler,
    AMAZON_HelpIntent_Handler,
    AMAZON_StopIntent_Handler,
    AMAZON_NavigateHomeIntent_Handler,
    FindGameIntent_Handler,
    FindPersonIntent_Handler,
    LaunchRequest_Handler,
    SessionEndedHandler
    )
    .addErrorHandlers(ErrorHandler)
    .addRequestInterceptors(InitMemoryAttributesInterceptor)
    .addRequestInterceptors(RequestHistoryInterceptor)

    .lambda();
// End of Skill code -------------------------------------------------------------

// Static Language Model for reference
const model = {
    "interactionModel": {
        "languageModel": {
            "invocationName": "game finder",
            "intents": [
                {
                    "name": "AMAZON.FallbackIntent",
                    "samples": []
                },
                {
                    "name": "AMAZON.CancelIntent",
                    "samples": []
                },
                {
                    "name": "AMAZON.HelpIntent",
                    "samples": []
                },
                {
                    "name": "AMAZON.StopIntent",
                    "samples": []
                },
                {
                    "name": "AMAZON.NavigateHomeIntent",
                    "samples": []
                },
                {
                    "name": "FindGameIntent",
                    "slots": [
                        {
                            "name": "game",
                            "type": "AMAZON.VideoGame"
                        }
                    ],
                    "samples": [
                        "what is {game}"
                    ]
                },
                {
                    "name": "FindPersonIntent",
                    "slots": [
                        {
                            "name": "person",
                            "type": "AMAZON.Person"
                        }
                    ],
                    "samples": [
                        "who is {person}"
                    ]
                },
                {
                    "name": "LaunchRequest"
                }
            ],
            "types": []
        },
        "dialog": {
            "intents": [
                {
                    "name": "FindGameIntent",
                    "confirmationRequired": false,
                    "prompts": {},
                    "slots": [
                        {
                            "name": "game",
                            "type": "AMAZON.VideoGame",
                            "confirmationRequired": false,
                            "elicitationRequired": true,
                            "prompts": {
                                "elicitation": ""
                            }
                        }
                    ]
                },
                {
                    "name": "FindPersonIntent",
                    "confirmationRequired": false,
                    "prompts": {},
                    "slots": [
                        {
                            "name": "person",
                            "type": "AMAZON.Person",
                            "confirmationRequired": false,
                            "elicitationRequired": true,
                            "prompts": {
                                "elicitation": ""
                            }
                        }
                    ]
                }
            ],
            "delegationStrategy": "ALWAYS"
        }
    }
};
