/**
 * @license
 * Copyright (c) 2019 Cisco and/or its affiliates.
 *
 * This software is licensed to you under the terms of the Cisco Sample
 * Code License, Version 1.1 (the "License"). You may obtain a copy of the
 * License at
 *
 *                https://developer.cisco.com/docs/licenses
 *
 * All use of the material herein must be in accordance with the terms of
 * the License. All rights not expressly granted by the License are
 * reserved. Unless required by applicable law or agreed to separately in
 * writing, software distributed under the License is distributed on an "AS
 * IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied.
 */
const xapi = require('xapi');

const BTN_ZOOM_WIDGET = 'call_zoom';
const BTN_BJN_WIDGET = 'call_bjn';
const BTN_POLY_WIDGET = 'call_poly';
const BTN_PHONE_WIDGET = 'call_phone';
const ZOOMSPEED_DIAL_NUMBER = 'meeting@zoomcrc.com';
const BJNSPEED_DIAL_NUMBER = 'meet@bjn.vc';
const PLYSPEED_DIAL_NUMBER = '242539444@t.plcm.vc';

const KEYBOARD_TYPES = {
    NUMERIC     :   'Numeric'
  , SINGLELINE  :   'SingleLine'
  , PASSWORD    :   'Password'
  , PIN         :   'PIN'
}
const CALL_TYPES = {
    AUDIO     :   'Audio'
  , VIDEO     :   'Video'
}

const DIALPAD_ID = 'conferencedialpad';
const DIALHOSTPIN_ID = 'conferencepin';
const PHONECALLDIALPAD_ID = 'phonedialpad';


// to keep track of specific conference calls
var isInZoomCall=0;
var isInBJNCall = 0;
var isInPhoneCall = 0;
var isInPolyCall=0;

var confIDBlueJeans='';
var fixedStringToDial='';

// to add delays when or if needed. Could be helpful if you want uesrs to see the Zoom or BJN main welcome screen a couple of seconds before 
// putting up the form to enter conference ID
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// clear status of conference calls so that dialing into bridge or just putting up
// conference ID input form works well. 
xapi.event.on('CallDisconnect', (event) => {
    if(isInZoomCall)
        {isInZoomCall = 0};
    if(isInBJNCall)
        {isInBJNCall = 0};
    if(isInPolyCall)
        {isInPolyCall = 0};
    isInPhoneCall=0;
    });

function showDialPad(text, template){

    xapi.command("UserInterface Message TextInput Display", {
          InputType: KEYBOARD_TYPES.NUMERIC
        , Placeholder: template
        , Title: "Conference ID"
        , Text: text
        , SubmitText: "Submit" 
        , FeedbackId: DIALPAD_ID
    }).catch((error) => { console.error(error); });
}

function showDialPadPINEntry(text, template){

    xapi.command("UserInterface Message TextInput Display", {
          InputType: KEYBOARD_TYPES.PIN
        , Placeholder: template
        , Title: "Enter Host pin"
        , Text: text
        , SubmitText: "Submit" 
        , FeedbackId: DIALHOSTPIN_ID
    }).catch((error) => { console.error(error); });
}

function showDialPadPhoneCall(text, template){

    xapi.command("UserInterface Message TextInput Display", {
          InputType: KEYBOARD_TYPES.NUMERIC
        , Placeholder: template
        , Title: "Number to Dial"
        , Text: text
        , SubmitText: "Submit" 
        , FeedbackId: PHONECALLDIALPAD_ID
    }).catch((error) => { console.error(error); });
}

function invokePolyConferenceIDInput()
{
    xapi.command('UserInterface Message TextLine Display', { Text: 'Please wait for the system to connect, and then enter the Poly conference ID:', X:1, Y:1, Duration:10});
    showDialPad("Please enter the Poly conference ID:","XXXXXXX#" );
}

function invokeZoomConferenceIDInput()
{
    xapi.command('UserInterface Message TextLine Display', { Text: 'Please wait for the system to connect, and then enter the Zoom conference ID:', X:1, Y:1, Duration:10});
    showDialPad("Please enter the Zoom conference ID:","#XXXXXXX#" );
}

function invokeBJNConferenceIDInput()
{
    xapi.command('UserInterface Message TextLine Display', { Text: 'Please wait for the system to connect, and then enter the BlueJeans conference ID:', X:1, Y:1, Duration:10});
    showDialPad("Please enter the BlueJeans conference ID:","XXXXXXX#" );
}

function invokePhoneCallNumberInput()
{
    xapi.command('UserInterface Message TextLine Display', { Text: 'Please provide the phone number you wish to dial:', X:1, Y:1, Duration:10});
    showDialPadPhoneCall("Please enter the phone number (with area code):","XXXXXXXXXX" );
}


// handle requests to dial into conferences. If already in a conference call, assume they entered the wrong 
// conference ID and let them try again
xapi.event.on('UserInterface Extensions Panel Clicked', (event) => {
    // first let's check to see if we are in a Zoom or BJN call
    // we cannot just trust keeping track of it in variable due to calls getting stuck at times
    xapi.status.get('Call')
    .then(call => {
      console.log('Detected a connected call: ');
      console.log(call[0].CallbackNumber);
      if (call[0].CallbackNumber.includes(ZOOMSPEED_DIAL_NUMBER)) {
        isInZoomCall=1;
        isInBJNCall=0;
        isInPolyCall=0;

        console.log('Detected a Zoom call');

      } else if (call[0].CallbackNumber.includes(BJNSPEED_DIAL_NUMBER)) {
        isInBJNCall=1;
        isInZoomCall=0;
        isInPolyCall=0;
        console.log('Detected a BJN call');
      }
      else if (call[0].CallbackNumber.includes(PLYSPEED_DIAL_NUMBER)) {
        isInZoomCall=0;
        isInBJNCall=0;
        isInPolyCall=1;
        console.log('Detected a Poly call');

      }
      else {
        isInZoomCall=0;
        isInBJNCall=0;
        isInPolyCall=0;
      }
    });

    //Now put up a conference ID prompt Panel or just dial the number accordingly
    if(event.PanelId == BTN_ZOOM_WIDGET){
        if(isInZoomCall)
        {
            invokeZoomConferenceIDInput();
        }
        else if (!isInBJNCall && !isInPolyCall)
        {
            xapi.command("dial", {Number: ZOOMSPEED_DIAL_NUMBER});
            isInZoomCall=1;
        }
    }
    if(event.PanelId == BTN_BJN_WIDGET){
        if(isInBJNCall)
        {
            invokeBJNConferenceIDInput();
        }
        else if (!isInZoomCall && !isInPolyCall)
        {
        xapi.command("dial", {Number: BJNSPEED_DIAL_NUMBER});
        isInBJNCall = 1;
        }
    }
    if(event.PanelId == BTN_POLY_WIDGET){
        if(isInPolyCall)
        {
            invokePolyConferenceIDInput();
        }
        else if (!isInBJNCall && !isInZoomCall)
        {
            xapi.command("dial", {Number: PLYSPEED_DIAL_NUMBER});
            isInPolyCall=1;
        }
    }
    if(event.PanelId == BTN_PHONE_WIDGET){
            if(!isInBJNCall && !isInZoomCall && (!isInPolyCall && !isInPhoneCall))
            {
                invokePhoneCallNumberInput();
            }
   }
});

// catch event triggered when user filled out text form with conference ID
xapi.event.on('UserInterface Message TextInput Response', (event) => {
    switch(event.FeedbackId){
        case DIALPAD_ID:
        // first lets check to see if we are in a Zoom or BJN call
        // to determine if we have to prompt for a host PIN (BJN needs it)
            xapi.status.get('Call')
                .then(call => {
                console.log('Detected a connected call: ');
                console.log(call[0].CallbackNumber);
                if (call[0].CallbackNumber.includes(ZOOMSPEED_DIAL_NUMBER)) {
                    // for Zoom, just dial the Conference ID
                    console.log('dialing Zoom conference ID');
                    console.log('original string: ',event.Text);
                    // fix the string to dial if not properly formatted. In the case of Zoom conference ID, needs to have # at the beginning and end
                    fixedStringToDial=event.Text;
                    if (fixedStringToDial.length>0)
                    {
                        if (fixedStringToDial.charAt(0)!='#') {fixedStringToDial='#'+fixedStringToDial};
                        if (fixedStringToDial.charAt(fixedStringToDial.length-1)!='#') {fixedStringToDial=fixedStringToDial+'#'};
                    }  
                    console.log('dialing: ',fixedStringToDial);
                    xapi.command('Call DTMFSend', { DTMFString: fixedStringToDial});
                }
                else if (call[0].CallbackNumber.includes(PLYSPEED_DIAL_NUMBER)) {
                    // for Zoom, just dial the Conference ID
                    console.log('dialing Poly conference ID');
                    console.log('original string: ',event.Text);
                    // fix the string to dial if not properly formatted. In the case of Poly conference ID, needs to have # at the end
                    fixedStringToDial=event.Text;
                    if (fixedStringToDial.length>0)
                    {
                        if (fixedStringToDial.charAt(fixedStringToDial.length-1)!='#') {fixedStringToDial=fixedStringToDial+'#'};
                    }  
                    console.log('dialing: ',fixedStringToDial);
                    xapi.command('Call DTMFSend', { DTMFString: fixedStringToDial});
                }
                else if (call[0].CallbackNumber.includes(BJNSPEED_DIAL_NUMBER)) 
                {
                    // for BlueJeans, you have to also prompt the Host PIN, then dial the whole thing later
                    // but first, save away the conference ID entered
                    console.log('saving BLN conference ID');
                    confIDBlueJeans=event.Text;
                    console.log('Prompting Host PIN text input...');
                    xapi.command('UserInterface Message TextLine Display', { Text: 'Please enter the Host PIN followed by "#", or just "#" if you are a participant:', X:1, Y:1, Duration:10});
                    sleep(200).then(() => {
                        showDialPadPINEntry('Host PIN:', 'XXXXXXXX#');
                    });
                    console.log('Done prompting Host PIN text input...');


                }

            });

            break;

            case DIALHOSTPIN_ID:
            // if we get this it is only because it was a BJN call, so just dial the conference ID and the HOST PIN
                console.log('dialing BJN conference ID and Host PIN');
                console.log('dialing first conf ID: ',confIDBlueJeans);
                console.log('original string: ',confIDBlueJeans);
                // fix the string to dial if not properly formatted. In the case of BJN conference ID, needs to have # at the end
                fixedStringToDial=confIDBlueJeans;
                if (fixedStringToDial.length>0)
                {
                    if (fixedStringToDial.charAt(fixedStringToDial.length-1)!='#') {fixedStringToDial=fixedStringToDial+'#'};
                }  
                console.log('dialing: ',fixedStringToDial);
                xapi.command('Call DTMFSend', { DTMFString: fixedStringToDial});
                sleep(3000).then(() => {
                    console.log('dialing PIN after 3 secs: ',event.Text);
                    console.log('original string: ',event.Text);
                    // fix the string to dial for BJN PIN if not properly formatted. Needs to have # at the end
                    fixedStringToDial=event.Text;
                    if (fixedStringToDial.length>0)
                    {
                        if (fixedStringToDial.charAt(fixedStringToDial.length-1)!='#') {fixedStringToDial=fixedStringToDial+'#'};
                    }  
                    console.log('dialing: ',fixedStringToDial);
                    xapi.command('Call DTMFSend', { DTMFString: fixedStringToDial});
                    });

            break;

            case PHONECALLDIALPAD_ID:
                // just dial a phone number
                console.log("Dialing a phone number. Entered: ",event.Text);
                fixedStringToDial=event.Text;
                // if 10 digits, assume North America dialing plan and prefix with +1, otherwise just let them dial whatever they entered
                if (fixedStringToDial.length==10) 
                {
                    console.log('NA dial plan, fixing string...');
                    fixedStringToDial='+1'+fixedStringToDial;
                }
                console.log("Actual number to dial: ",fixedStringToDial);
                xapi.command("dial", {Number: fixedStringToDial});
                isInPhoneCall=1;

            break;

    }
});

// once a call connects, invoke this handler to determine if a conference ID should be prompted for. 
xapi.status.on('Call RemoteNumber', (remoteNumber) => {
  
/*
  // Trying to invoke Keypad not to use the form. Does not work, it does press the keys, but it does not bring up the keypad
    console.log('trying to invoke Keypad....');
    sleep(1000);
    xapi.command('UserInterface OSD Key Click', {Key:'Square'});
*/

	if(remoteNumber.includes(ZOOMSPEED_DIAL_NUMBER)){
        invokeZoomConferenceIDInput();
    	}
    else if(remoteNumber.includes(PLYSPEED_DIAL_NUMBER) ){
            invokePolyConferenceIDInput();
        }
	else if(remoteNumber.includes(BJNSPEED_DIAL_NUMBER) ){
        invokeBJNConferenceIDInput();
    	}
	
    });