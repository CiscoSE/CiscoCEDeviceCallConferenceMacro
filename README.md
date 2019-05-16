# Cisco CE Device Call Conference Macro

This macro simplifies the joining into video conferences from various services from a **Cisco Webex RoomKit** room device or any other [Cisco Collaboration Room Endpoint](https://www.cisco.com/c/en/us/products/collaboration-endpoints/collaboration-room-endpoints/index.html) running CE 9.6 and later with the ability to run macros and handle TextInput forms. 

To try it, first create two Panels without any pages (so they are just top level action buttons) in the InRoom conntrol editor for the device: one with the PanelID 'speed_dial' and the other with PanelID 'call_bjn'. Alternatively, you could import those panel buttons from the **roomcontrolconfig_conferenceButtons.xml** file provided.

Then load the Javascript code included in the the **CallZoomBJNMacroWHostPin.js** file into a new Macro in the Macro editor of your Cisco room video device and enable it. 

Once either button is pressed, it will call a cloud based conferencing service. Once the call is connected, it will prompt for the conference ID using a TextInput form on the Touch10 device (mains screen if a Cisco DX80) and , if the conferencing service requires it, it will also prompt for a PIN. Once it is done collecting the Conference ID and Host PIN (if relevant) it will dial them so that the user can join the conference. If an error is made in entering either ID, the user can press the panel button for the relevant service again and it will detect that it is already in the call and prompt for the IDs again. 

A "Call Phone" Button is also provided in the template and handled in the Macro code to prompt for and then dial a numeric number provided. If it is 10 digits, the Macro will pre-pend "+1" to it since it will assum North America PSTN dial plan. The video endpoint must be registred to a solution that supports PSTN Calling for that button to work. 

More information on how to invoke the Macro editor and customized the User Interface of a Cisco Collaboration Room Endpoint can be found in this [CE Customization User Interface Extensions and Macros, CE9.6](https://www.cisco.com/c/dam/en/us/td/docs/telepresence/endpoint/ce96/sx-mx-dx-room-kit-customization-guide-ce96.pdf) guide. 

