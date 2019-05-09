# CiscoCEDeviceCallConferenceMacro

This macro simplifies the joining into video conferences from various services from a RoomKit room device or any other Cisco Device running
CE 9.6 and later with the ability to run macros and handle TextInput forms. 

To try it, first create two Panels without any pages (so they are just top level action buttons) in the InRoom conntrol editor for the device: one with the PanelID 'speed_dial' and the other with PanelID 'call_bjn'. Alternatively, you could import those panel buttons from the 
roomcontrolconfig_conferenceButtons.xml file provided.

Then load the Javascript code included in the the CallZoomBJNMacroWHostPin.js file into a new Macro in the Macro editor of your Cisco room video device and enable it. 

Once either button is pressed, it will call a cloud based conferencing service. Once the call is connected, it will prompt for the conference ID using a TextInput form on the Touch10 device (mains screen if a Cisco DX80) and , if the conferencing service requires it, it will also prompt for a PIN. Once it is done collecting the Conference ID and Host PIN (if relevant) it will dial them so that the user can join the conference. If an error is made in entering either ID, the user can press the panel button for the relevant service again and it will detect that it is already in the call and prompt for the IDs again. 

