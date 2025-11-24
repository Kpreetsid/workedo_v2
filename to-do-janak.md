Hi @Waleed these are bugs and changes

Session Management (High Priority)

Register Page:

1. During OTP verification for a new user, it shows “Account already exists” even though the account is new.
This is coming from backend, I am just showing the message. All messages are dynamic.



Profile Section

1. After updating profile details, the contact number shows empty.



Work Order

1. The work order details for “Assigned to Me”, “Created by Me”, and “Open for All” are not displaying correctly.


2. While creating a work order, change the field name “Message” to “Description” as per the UI.


3. While selecting a location, change the selection to a checkbox as per the provided UI. The edit option is not required there.


4. While selecting assets, use a checkbox selection similar to the provided UI.


5. In the work order, Nature of Work, Priority, and Estimated Duration should not be mandatory fields.


6. Photo upload is not working while creating a work order.


7. Completed work order details are not displaying correctly.



Location

1. While creating a location, the description should not be a required field. You have not marked it with *, but it is still showing a validation warning.


2. User assignment while creating a location should be a required field.


3. Attachments should not be a required field, but currently it is marked with *.


4. Implement parent-child location hierarchy as per the provided UI.


5. When clicking the menu icon copy location  there should be copy of location should be created

Parts

1. Update according to the new UI.


Preventive Maintenance

1. Update according to the new UI.



Asset

1. Update according to the new UI.


2. Under Asset → Sensor → Endpoint, the name is incorrect.



Work Request

1. Update according to the new UI